// Netlify Function: upload-ftp.js
// Handles upload of processed CSV to FileZilla Server via FTP/SFTP

let Client;
try {
  Client = require('ssh2-sftp-client');
} catch (requireError) {
  console.error('Failed to load required modules:', requireError);
  throw new Error('Missing required dependencies. Please ensure ssh2-sftp-client is installed.');
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

    // Try to send Slack notification (do not fail the upload if Slack fails)
    try {
      await sendSlackNotification({
        fileName,
        remotePath: remoteFilePath,
      });
    } catch (slackError) {
      console.error('Failed to send Slack notification:', slackError);
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
          await sftp.mkdir(remoteDir, true);
        } catch (mkdirError) {
          if (!mkdirError.message || !mkdirError.message.includes('already exists')) {
            throw mkdirError;
          }
        }
      }

      const fileBuffer = Buffer.from(fileContent, 'utf8');
      await sftp.put(fileBuffer, remotePath);
      await sftp.end();
    } catch (error) {
      try {
        await sftp.end();
      } catch {}
      throw error;
    }
  } else {
    // Use FTP
    const { Client: FTPClient } = require('basic-ftp');
    const ftpClient = new FTPClient();

    try {
      await ftpClient.access({
        host,
        port,
        user: username,
        password,
        secure,
        secureOptions: secure ? { rejectUnauthorized: false } : undefined,
      });

      const lastSlashIndex = remotePath.lastIndexOf('/');
      if (lastSlashIndex > 0) {
        const remoteDir = remotePath.substring(0, lastSlashIndex);
        await ftpClient.ensureDir(remoteDir);
      }

      const fileBuffer = Buffer.from(fileContent, 'utf8');
      const { Readable } = require('stream');
      await ftpClient.uploadFrom(Readable.from(fileBuffer), remotePath);
      ftpClient.close();
    } catch (error) {
      try {
        ftpClient.close();
      } catch {}
      throw error;
    }
  }
}

/**
 * Send Slack notification when a file is uploaded.
 */
async function sendSlackNotification({ fileName, remotePath }) {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL;
  const channel = process.env.SLACK_CHANNEL;
  const username = process.env.SLACK_USERNAME || 'Hoco Upload Bot';

  if (!webhookUrl) {
    console.warn('Slack notification not configured (missing SLACK_WEBHOOK_URL).');
    return;
  }

  const payload = {
    text: `Hoco Parts Stock Level uploaded.`,
    ...(channel ? { channel } : {}),
    ...(username ? { username } : {}),
  };

  const response = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => '');
    throw new Error(`Slack webhook responded ${response.status}: ${body}`);
  }
}
