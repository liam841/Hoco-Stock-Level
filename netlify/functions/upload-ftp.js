// Netlify Function: upload-ftp.js
// Handles upload of processed CSV to FileZilla Server via FTP/SFTP

const Client = require('ssh2-sftp-client');
const nodemailer = require('nodemailer');

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
    const ftpPort = process.env.FTP_PORT || 22; // Default SFTP port
    const ftpUser = process.env.FTP_USER;
    const ftpPassword = process.env.FTP_PASSWORD;
    const ftpRemotePath = process.env.FTP_REMOTE_PATH || '/';
    const ftpProtocol = process.env.FTP_PROTOCOL || 'sftp'; // 'sftp' or 'ftp'

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
async function uploadToFTP({ host, port, username, password, protocol, remotePath, fileContent }) {
  if (protocol === 'sftp') {
    // Use SFTP (more secure)
    const sftp = new Client();
    
    try {
      await sftp.connect({
        host,
        port,
        username,
        password,
      });

      // Ensure remote directory exists
      const remoteDir = remotePath.substring(0, remotePath.lastIndexOf('/'));
      if (remoteDir) {
        await sftp.mkdir(remoteDir, true); // true = recursive
      }

      // Upload file (will overwrite if exists)
      const fileBuffer = Buffer.from(fileContent, 'utf8');
      await sftp.put(fileBuffer, remotePath);
      
      await sftp.end();
    } catch (error) {
      await sftp.end().catch(() => {}); // Try to close connection
      throw error;
    }
  } else {
    // Use FTP (less secure, but supported)
    const { Client: FTPClient } = require('basic-ftp');
    const ftpClient = new FTPClient();
    
    try {
      await ftpClient.access({
        host,
        port,
        user: username,
        password,
      });

      // Ensure remote directory exists
      const remoteDir = remotePath.substring(0, remotePath.lastIndexOf('/'));
      if (remoteDir && remoteDir !== '/') {
        await ftpClient.ensureDir(remoteDir);
      }

      // Upload file (will overwrite if exists)
      const fileBuffer = Buffer.from(fileContent, 'utf8');
      const { Readable } = require('stream');
      const stream = Readable.from(fileBuffer);
      await ftpClient.uploadFrom(stream, remotePath);
      
      await ftpClient.close();
    } catch (error) {
      await ftpClient.close().catch(() => {}); // Try to close connection
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

