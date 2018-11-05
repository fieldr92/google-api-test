const fs = require('fs');
const readline = require('readline');
const { google } = require('googleapis');
const path = require('path');
const pug = require('pug');
const express = require('express');

// Express set up
const app = express();

app.use(express.static(path.join(__dirname)));
app.set('view engine', 'pug');

app.get('/', (req, res) => {
  res.render('index', { title:'GAPI Test', message: 'GAPI TEST 1'});
});

app.get('/spreadsheet', (req, res) => {
  res.render('index', { title:'GAPI Test', message: 'Hello World2'});
});

// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly'];
const TOKEN_PATH = 'token.json';
const sheetID = '1VOcXTk6F52k4k9HxhfJafP9X8WOJGfUuvem1jVBPP9M';

// Load client secrets from a local file.
fs.readFile('credentials.json', (err, content) => {
  if (err) return console.log('Error loading client secret file:', err);
  // Authorize a client with credentials, then call the Google Sheets API.
  authorize(JSON.parse(content), listInConsole);
})

// Create an OAuth2 client with the given credentials, and then execute the
// given callback function.
// @param {Object} credentials The authorization client credentials.
// @param {function} callback The callback to call with the authorized client.

const authorize = (credentials, callback) => {
  const { client_secret, client_id, redirect_uris } = credentials.installed;  
  const oAuth2Client = new google.auth.OAuth2( client_id, client_secret, redirect_uris[0] );
  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, (err, token) => {
    if (err) return getNewToken(oAuth2Client, callback);
    oAuth2Client.setCredentials(JSON.parse(token));
    callback(oAuth2Client);
  });
}

// Get and store new token after prompting for user authorization, and then
// execute the given callback with the authorized OAuth2 client.
// @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
// @param {getEventsCallback} callback The callback for the authorized client.

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

// Prints the names and majors of students in a sample spreadsheet:
// @see https://docs.google.com/spreadsheets/d/1VOcXTk6F52k4k9HxhfJafP9X8WOJGfUuvem1jVBPP9M/edit
// @param {google.auth.OAuth2} auth The authenticated Google OAuth client.

const listInConsole = auth => {
  const sheets = google.sheets({version: 'v4', auth});
  sheets.spreadsheets.values.get({
    spreadsheetId: sheetID,
    range: 'Sheet1',
  }, (err, res) => {
    if (err) return console.log('The API returned an error: ' + err);
    const row = res.data.values;
    if (row.length) {
      console.log('-----');
      console.log('Success LIST.');
      row.map((row, i) => {
        if (i > 0) {
          console.log(`${row[0]}, ${row[3]}`);
        }
      });
    } else {
      console.log('No data found.');
    }
  });
}

function listInHTMLTable(auth) {
  sheets.spreadsheets.values.get({
    spreadsheetId: sheetID,
    range: 'Sheet1'
  }, (err, res) => {
    if (err) return console.log('The API returned an error: ' + err);
    const rows = res.data.values;
    if (rows.length) {
      console.log('-----');
      console.log('Success SHOW.');
      return 
    }
    return rows;
  });
}

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on port ${port}`));