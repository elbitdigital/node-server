var nodemailer = require('nodemailer');
var express = require('express');

var router = express.Router();
router.get('/sayHello', handleSayHello);

function handleSayHello(req, res) {

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
			//res.json({yo: 'error'});
		} else {
			console.log('Message sent: ' + info.response);
			//res.json({yo: info.response});
		}
	});

}

var http = require('http');
http.createServer(function (req, res) {
	res.writeHead(200, {'Content-Type': 'text/html'});
	res.end('Hello World\n <a href="127.0.0.1/sayHello">clica aqui</a>');
}).listen(8080, '127.0.0.1');

console.log('Server running at http://127.0.0.1:8080/');


