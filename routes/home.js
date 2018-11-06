const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.render('index', {
    head: 'Home Page',
    message: 'To view spreadsheet, go to localhost:3000/spreadsheet'
  });
});

module.exports = router;