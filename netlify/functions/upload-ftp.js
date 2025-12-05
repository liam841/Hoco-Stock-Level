// Netlify Function: upload-ftp.js
// Handles upload of processed CSV to FileZilla Server via FTP/SFTP

let Client, nodemailer;
try {
  Client = require('ssh2-sftp-client');
  nodemailer = require('nodemailer');
} catch (requireError) {
  console.error('Failed to load required modules:', requireError);
  throw new Error('Missing required dependencies. Please ensure ssh2-sftp-client and nodemailer are installed.');
}

exports.handler = async (event) => {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
      },
      body: '',
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    // Parse JSON body (Netlify may send base64-encoded body)
    const isBase64 = event.isBase64Encoded;
    const rawBody = isBase64
      ? Buffer.from(event.body || '', 'base64').toString('utf8')
      : event.body || '';

    let data;
    try {
      data = JSON.parse(rawBody);
    } catch (e) {
      throw new Error('Invalid JSON body');
    }

    const csvContent = data.csv;
    const originalName = data.originalName || 'TestStock.csv';

    if (!csvContent) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({ error: 'Missing csv field in request body' }),
      };
    }

    // Get FTP/SFTP configuration from environment variables
    const ftpHost = process.env.FTP_HOST;
    const ftpPort = process.env.FTP_PORT || 21; // Default FTP port
    const ftpUser = process.env.FTP_USER;
    const ftpPassword = process.env.FTP_PASSWORD;
    const ftpRemotePath = process.env.FTP_REMOTE_PATH || '/';
    // Auto-detect protocol based on port: 21 = FTP, 22 = SFTP
    const portNum = Number(ftpPort);
    const ftpProtocol = process.env.FTP_PROTOCOL || (portNum === 22 ? 'sftp' : 'ftp');
    // FTPS support: enable TLS/SSL for FTP connections (FTPS)
    const ftpSecure = process.env.FTP_SECURE === 'true' || process.env.FTP_SECURE === '1';

    if (!ftpHost || !ftpUser || !ftpPassword) {
      throw new Error('FTP configuration incomplete. Check FTP_HOST, FTP_USER, and FTP_PASSWORD environment variables.');
    }

    // Always use a fixed filename so each upload replaces the last one
    const fileName = 'TestStockCSV.csv';
    const remoteFilePath = `${ftpRemotePath}/${fileName}`.replace(/\/+/g, '/'); // Clean up path

    // Upload file to FTP/SFTP server
    await uploadToFTP({
      host: ftpHost,
      port: Number(ftpPort),
      username: ftpUser,
      password: ftpPassword,
      protocol: ftpProtocol,
      secure: ftpSecure,
      remotePath: remoteFilePath,
      fileContent: csvContent,
    });

    // Try to send notification email (do not fail the upload if email fails)
    try {
      await sendNotificationEmail({
        fileName,
        remotePath: remoteFilePath,
      });
    } catch (notifyError) {
      console.error('Failed to send notification email:', notifyError);
    }

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        success: true,
        path: remoteFilePath,
        name: fileName,
      }),
    };
  } catch (error) {
    console.error('Error in upload-ftp function:', error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
      },
      body: JSON.stringify({
        error: 'Failed to upload file to FTP server',
        message: error.message,
      }),
    };
  }
};

/**
 * Upload file to FTP/SFTP server
 */
async function uploadToFTP({ host, port, username, password, protocol, secure, remotePath, fileContent }) {
  if (protocol === 'sftp') {
    // Use SFTP (more secure)
    if (!Client) {
      throw new Error('SFTP client library not loaded. Please ensure ssh2-sftp-client is installed.');
    }
    const sftp = new Client();
    
    if (!sftp) {
      throw new Error('Failed to initialize SFTP client.');
    }
    
    try {
      await sftp.connect({
        host,
        port,
        username,
        password,
      });

      // Ensure remote directory exists
      const lastSlashIndex = remotePath.lastIndexOf('/');
      if (lastSlashIndex > 0) {
        const remoteDir = remotePath.substring(0, lastSlashIndex);
        try {
          await sftp.mkdir(remoteDir, true); // true = recursive
        } catch (mkdirError) {
          // Directory might already exist, that's okay
          if (!mkdirError.message || !mkdirError.message.includes('already exists')) {
            throw mkdirError;
          }
        }
      }

      // Upload file (will overwrite if exists)
      const fileBuffer = Buffer.from(fileContent, 'utf8');
      await sftp.put(fileBuffer, remotePath);
      
      await sftp.end();
    } catch (error) {
      // Try to close connection, but don't fail if it doesn't work
      try {
        if (sftp && typeof sftp.end === 'function') {
          await sftp.end();
        }
      } catch (closeError) {
        // Ignore close errors
      }
      throw error;
    }
  } else {
    // Use FTP (less secure, but supported)
    let FTPClient;
    try {
      const ftpModule = require('basic-ftp');
      FTPClient = ftpModule.Client;
      if (!FTPClient) {
        throw new Error('basic-ftp Client not found in module');
      }
    } catch (requireError) {
      throw new Error(`Failed to load FTP library: ${requireError.message}`);
    }
    
    const ftpClient = new FTPClient();
    if (!ftpClient) {
      throw new Error('Failed to initialize FTP client.');
    }
    
    try {
      await ftpClient.access({
        host,
        port,
        user: username,
        password,
        secure: secure, // Enable explicit TLS/SSL (FTPS) - required for "AUTH TLS"
        secureOptions: secure ? {
          rejectUnauthorized: false // Allow self-signed certificates
        } : undefined
      });

      // Ensure remote directory exists
      const lastSlashIndex = remotePath.lastIndexOf('/');
      if (lastSlashIndex > 0) {
        const remoteDir = remotePath.substring(0, lastSlashIndex);
        try {
          await ftpClient.ensureDir(remoteDir);
        } catch (mkdirError) {
          // Directory might already exist, that's okay
          if (!mkdirError.message || !mkdirError.message.includes('already exists')) {
            throw mkdirError;
          }
        }
      }

      // Upload file (will overwrite if exists)
      const fileBuffer = Buffer.from(fileContent, 'utf8');
      const { Readable } = require('stream');
      const stream = Readable.from(fileBuffer);
      await ftpClient.uploadFrom(stream, remotePath);
      
      ftpClient.close();
    } catch (error) {
      // Try to close connection, but don't fail if it doesn't work
      try {
        if (ftpClient && typeof ftpClient.close === 'function') {
          ftpClient.close();
        }
      } catch (closeError) {
        // Ignore close errors
      }
      throw error;
    }
  }
}

/**
 * Send notification email when a file is uploaded.
 *
 * This uses Gmail SMTP via Nodemailer.
 */
async function sendNotificationEmail({ fileName, remotePath }) {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const to = process.env.EMAIL_TO;
  const from = process.env.EMAIL_FROM || user;

  if (!host || !port || !user || !pass || !to || !from) {
    console.warn(
      'Email notification not configured (missing SMTP_* or EMAIL_* env vars).',
    );
    return;
  }

  const subject = 'New TestStock CSV uploaded';
  const text =
    `A new TestStock CSV file has been uploaded.\n\n` +
    `File name: ${fileName}\n` +
    `Remote path: ${remotePath}\n` +
    `Time: ${new Date().toISOString()}\n`;

  const transporter = nodemailer.createTransport({
    host,
    port: Number(port),
    secure: Number(port) === 465,
    auth: {
      user,
      pass,
    },
  });

  await transporter.sendMail({
    from,
    to,
    subject,
    text,
  });
}

