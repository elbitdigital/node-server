var nodemailer = require('nodemailer');
var express = require('express');
var app = express();

app.get('/', function (req, res) {
	res.send('Hello World');
});

app.get('/enviarGet', function (req, res) {

	var transporter = nodemailer.createTransport({
		// transporter config
	});

	var mailOptions = {
		from: 'Mailman <mailman@service.elbit.com.br>', // sender address
		to: 'cristiano@elbit.com.br', // list of receivers
		subject: 'Email Example', // Subject line
		html: '<b>Nome:</b> Loco memo mandas as msg tudo' // You can choose to send an HTML body instead
	};

	transporter.sendMail(mailOptions, function (error, info) {
		if (error) {
			console.log(error);
			res.send(error);
			//res.json({yo: 'error'});
		} else {
			console.log('Message sent: ' + info.response);
			res.send('Message sent: ' + info.response);
			//res.json({yo: info.response});
		}
	});

});

app.listen(3000);