var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
  //   res.json({
  //      status: 'SUCCESS',
  //      msg: 'helloWorld'
  //   });
  console("users.json");
});

module.exports = router;
