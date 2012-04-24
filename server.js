var express = require('express');
var nodemailer = require("nodemailer");
var settings = require('./settings');
var util = require('util');

var app = express.createServer(express.logger());

var smtpTransport = nodemailer.createTransport("SMTP",{
  service: "Gmail",
  auth: {
    user: settings.smtp_user,
    pass: settings.smtp_pass
  }
});

function check_commit(req, res) {
  var forced;
  var payload;
  var mailOptions = {
    from: settings.smtp_user,
    to: settings.recipients
  };

  res.send('cool story, bro');
  console.log(req.body);

  if (req.body && req.body.payload) {
    payload = JSON.parse(req.body.payload);
    console.log(payload);
    if (payload.forced && payload.ref === "refs/heads/master") {
      console.log("OH SHIIIIIIIIIT user", payload.pusher.name, "has forced a push to master");
      console.log("compare at ", payload.compare);
      mailOptions.subject = util.format("%s: Push forced to master", payload.repository.name);
      mailOptions.text = util.format("User %s forced a push to master in %s. Head is now at %s from %s", payload.pusher.name, payload.repository.name, payload.head_commit.id, payload.head_commit.timestamp);

      // send mail with defined transport object
      smtpTransport.sendMail(mailOptions, function(error, response) {
        if(error){
          console.log(error);
        }else{
          console.log("Message sent:", response.message);
        }
      });
    }
    else {
      console.log("no forced push. user", payload.pusher.name, "is ok.");
    }
  }
}

app.use(express.bodyParser());
app.get('/', check_commit);
app.post('/', check_commit);

console.log('listening on port', settings.port);
app.listen(settings.port);
