const express = require('express');
const path = require('path');
const ejs = require('ejs');
const home = require('./routes/home');
const spreadsheet = require('./routes/spreadsheet');
const signIn = require('./routes/signIn');

// Express set up
const app = express();

app.use(express.static(path.join(__dirname + '/public')));
app.set('view engine', 'ejs');
app.set('views', './views');

app.use('/', home);
app.use('/spreadsheet', spreadsheet);
app.use('/signIn', signIn);

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on port ${port}`));