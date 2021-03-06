const fs = require('fs');
const readline = require('readline');
const { google } = require('googleapis');
const express = require('express');
const router = express.Router();

// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly'];
const TOKEN_PATH = 'token.json';
const sheetID = '1VOcXTk6F52k4k9HxhfJafP9X8WOJGfUuvem1jVBPP9M';

router.get('/', (req, res) => {
  // Load client secrets from a local file.
  fs.readFile('credentials.json', (err, content) => {
    if (err) return console.log('Error loading client secret file:', err);
    authorize(JSON.parse(content), listInHTMLTable);
  });

  const authorize = (credentials, callback) => {
    const { client_secret, client_id, redirect_uris } = credentials.installed;  
    const oAuth2Client = new google.auth.OAuth2( client_id, client_secret, redirect_uris[0] );
    // Check if we have previously stored a token.
    fs.readFile(TOKEN_PATH, (err, token) => {
      if (err) return getNewToken(oAuth2Client, callback);
      oAuth2Client.setCredentials(JSON.parse(token));
      callback(oAuth2Client, renderTable);
    });
  }

  const getNewToken = (oAuth2Client, callback) => {
    const authUrl = oAuth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: SCOPES,
    });
    console.log('Authorize this app by visiting this url:', authUrl);
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    rl.question('Enter the code from that page here: ', (code) => {
      rl.close();
      oAuth2Client.getToken(code, (err, token) => {
        if (err) return console.error('Error while trying to retrieve access token', err);
        oAuth2Client.setCredentials(token);
        // Store the token to disk for later program executions
        fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
          if (err) console.error(err);
          console.log('Token stored to', TOKEN_PATH);
        });
        callback(oAuth2Client);
      });
    });
  }

  const listInHTMLTable = (auth, callback) => {
    console.log('Getting info from Google Sheet...');
    const sheets = google.sheets({version: 'v4', auth});
    sheets.spreadsheets.values.get({
      spreadsheetId: sheetID,
      range: 'Sheet1'
    }, (err, res) => {
      if (err) return console.log('The API returned an error: ' + err);
      const rows = res.data.values;
      if (rows.length) {
        callback(rows);
      } else {
        throw new Error('No rows in given spreadsheet')
      }
    });
  }

  function renderTable(rows) {
    console.log('Success! Table created.');
    res.render('spreadsheet', {
      head: 'GAPI Generated Spreadsheet Below...',
      rows: rows
    });
  }
});

module.exports = router;