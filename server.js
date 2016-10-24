var nodemailer = require('nodemailer');
var express = require('express');
var bodyParser = require('body-parser');
var transporterConfig = require('./production.js');

/* CONSTANTS DECLARATION */

/* CONSTANT WITH TESTERS MAIL - SEPARATE MULTIPLE WITH COMMA */
const TESTER_EMAIL = 'cristiano@elbit.com.br';
//const TESTER_EMAIL = 'cristiano@elbit.com.br, another@mail.com, example@example.com';

/* END - CONSTANTS DECLARATION */

var app = express();
var port = process.env.PORT || 8080;

//handle post params as express does not include it native anymore
//body-parser act as a middleware to parse post requests
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

//middleware to set headers for all requests as json and cors related
app.use(function (req, res, next) {
	res.header("Content-Type", 'application/json'); //set all routes to content-type application/json
	res.header("Access-Control-Allow-Origin", "*"); //enable cors
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
	res.header('Access-Control-Allow-Credentials', true);
	res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');

	//OPTIONS handle?

	next();
});


app.get('/', function (req, res) {
	res.send('');
	res.redirect(302, '~site da elbit~'); //(default, 302) found, but redirect to this one instead
});

/*===== GENERIC CODE - ALL SERVICES USES THEN - CHANGE ONLY ON EMERGENCY =====*/

var config = new transporterConfig(); //production variables, for more info see production.js

/* GENERAL TRANSPORTER VARIABLE - SERVER CONFIGURATION */
var transporter = nodemailer.createTransport({
	host: config.getHost(),
	port: config.getPort(),
	auth: {
		user: config.getUser(),
		pass: config.getPass()
	}
});

/**
 * Send email to receiver
 * @param res current route response
 * @param mailOptions where/who to send to
 * @param htmlBody what there is to send
 */
function sendEmail(res, mailOptions, htmlBody) {

	transporter.sendMail(mailOptions, function (error, info) {

		if (error) {
			console.log(error);
			res.status(500).send({'error': error});
		} else {
			console.log('Message sent: ' + info.response);
			res.send({'success': info.response, 'body': htmlBody});
		}

	});

}

/**
 * Receive request type as param and return generic json body
 * returns: type => request type ; params => list of "supported" fields on form all forms ; literal => fields names
 * @param {string} request_type as get or post (only for info display)
 * @returns {{type: *, params: {cName: string, cPhone: string, cEmail: string, cAddress: string, cCity: string, cMessage: string}, literal: {cName: string, cPhone: string, cEmail: string, cAddress: string, cCity: string, cMessage: string}}}
 */
function genericJsonBody(request_type) {

	return {
		type: request_type,
		params: {
			cName: '',
			cPhone: '',
			cEmail: '',
			cAddress: '',
			cCity: '',
			cMessage: ''
		},
		literal: {
			cName: 'Nome',
			cPhone: 'Telefone',
			cEmail: 'Email',
			cAddress: 'Endereço',
			cCity: 'Cidade',
			cMessage: 'Mensagem'
		}
	};

}

/*===== END - GENERIC CODE =====*/

/* <!-- */
/* DEVELOPMENT ROUTES */

app.get('/form', function (req, res) {
	res.header('Content-Type', 'text/html');
	res.sendfile("form.html");
});

app.get('/venus/get', function (req, res) {

	if (Object.keys(req.query).length === 0) {

		res.send({response: 'Não há nenhum parâmetro'});

	} else {

		var htmlBody = "GET:<br><br>";
		var jsonBody = {
			type: 'get',
			params: {}
		};

		var params = req.query;

		for (var query in params) {

			//if (params.hasOwnProperty(query)) {

				htmlBody += query + ': <b>' + params[query] + '</b><br>';
				jsonBody.params[query] = params[query];

			//}

		}

		res.send(jsonBody);
		//res.send(htmlBody);

	}
});

app.post('/venus/post', function (req, res) {

	if (Object.keys(req.body).length === 0) {

		res.send({response: 'POST vazio'});

	} else {

		var htmlBody = "POST:<br><br>";
		var jsonBody = {
			type: 'post',
			params: {}
		};

		var params = req.body;

		for (var query in params) {

			//if (params.hasOwnProperty(query)) {

				htmlBody += query + ': <b>' + params[query] + '</b><br>';
				jsonBody.params[query] = params[query];

			//}

		}

		res.send(jsonBody);
		//res.send(htmlBody);

	}

});

/* END - DEVELOPMENT ROUTES */
/* --> */

/* <!-- */
/* SERVICE CHECK ROUTES */

app.get('/mailman/check/send', function (req, res) {

	if (Object.keys(req.query).length === 0) {

		res.send({response: 'Não há nenhum parâmetro'});

	} else {

		var htmlBody = 'Development request para testar formulário de contato<br><br><b><i>Variáveis recebidas:</i></b><br>';

		var params = req.query;

		for (var query in params) {

			//if (params.hasOwnProperty(query)) {
				htmlBody += query + ': <b>' + params[query] + '</b><br>';
			//}

		}

		htmlBody += 'Cache-control count: <b>' + new Date().getTime() + '</b>';

		var mailOptions = {
			from: '"Mailman" <mailman@service.elbit.com.br>',
			to: TESTER_EMAIL,
			subject: 'Contato - Formulário',
			html: htmlBody
		};

		sendEmail(res, mailOptions, htmlBody);

	}

});

app.get('/mailman/check/scoped', function (req, res) {

	if (Object.keys(req.query).length === 0) {

		res.send({response: 'Não há nenhum parâmetro'});

	} else {

		var htmlBody = 'Development request<br><br><b><i>Variáveis recebidas (escopo):</i></b><br>';
		var jsonBody = genericJsonBody('get');

		var params = req.query;

		for (var query in params) {

			if (jsonBody.params[query] === '') {
				jsonBody.params[query] = params[query];
				htmlBody += jsonBody.literal[query] + ": <b>" + jsonBody.params[query] + "</b><br>";
			}

		}

		htmlBody += 'Cache-control count: <b>' + new Date().getTime() + '</b>';

		var mailOptions = {
			from: '"Mailman" <mailman@service.elbit.com.br>',
			to: TESTER_EMAIL,
			subject: 'Contato - Formulário',
			html: htmlBody
		};

		sendEmail(res, mailOptions, htmlBody);

	}

});

app.get('/mailman/check/valid', function (req, res) {

	res.status(200).send({response: 'WORKING'});

});

app.get('/mailman/check/invalid', function (req, res) {

	res.status(500).send({error: 'CHECKING INVALID'});

});

/* END - SERVICE CHECK ROUTES */
/* --> */

/* SERVICE ROUTES */
/* CITODON */


/**
 * Post route handle, to port it to get route, modify:
 *      app.get('')
 *      Object.keys(req.query) //and change error message
 *      var jsonBody = genericJsonBody('get')
 *      var params = req.query;
 */
app.post('/mailman/citodon', function (req, res) {

	if (Object.keys(req.body).length === 0) {

		res.send({response: 'POST vazio (¿)'});

	} else {

		var htmlBody = "Foi realizado um pedido de contato pelo site!<br/>";
		var textBody = "Foi realizado um pedido de contato pelo site! ";
		var jsonBody = genericJsonBody('post');

		var params = req.body;

		for (var query in params) {

			//there is no hasOwnProperty on req.body (throws error)
			//if (params.hasOwnProperty(query)) {}

			//is it on the generic object?
			if (jsonBody.params[query] === '') {
				jsonBody.params[query] = params[query];
				htmlBody += jsonBody.literal[query] + ": <b>" + jsonBody.params[query] + "</b><br>";
				textBody += jsonBody.literal[query] + ": " + jsonBody.params[query] + ", ";
			}

		}

		var mailOptions = {
			from: '"Mailman" <mailman@service.elbit.com.br>',
			// to: 'contato@citodon.com.br',
			to: TESTER_EMAIL,
			bcc: 'cristiano@elbit.com.br, joseeduardobarros@gmail.com',
			replyTo: jsonBody.params.cEmail, //if not defined, will be empty anyways
			subject: 'Requisição de contato - Citodon',
			text: textBody,
			html: htmlBody
		};

		//sendEmail(res, mailOptions, htmlBody);

		// res.send({'html': htmlBody, 'json': jsonBody});
		 res.send(jsonBody);

	}

});

app.get('/mailman/citodon', function (req, res) {

	if (Object.keys(req.query).length === 0) {

		res.send({response: 'Nenhum parâmetro especifiado'});

	} else {

		var htmlBody = "Foi realizado um pedido de contato pelo site!<br/>";
		var textBody = "Foi realizado um pedido de contato pelo site! ";
		var jsonBody = genericJsonBody('get');

		var params = req.query;

		for (var query in params) {

			if (jsonBody.params[query] === '') {
				jsonBody.params[query] = params[query];
				htmlBody += jsonBody.literal[query] + ": <b>" + jsonBody.params[query] + "</b><br>";
				textBody += jsonBody.literal[query] + ": " + jsonBody.params[query] + ", ";
			}

		}

		var mailOptions = {
			from: '"Mailman" <mailman@service.elbit.com.br>',
			// to: 'contato@citodon.com.br',
			to: TESTER_EMAIL,
			bcc: 'cristiano@elbit.com.br, joseeduardobarros@gmail.com',
			replyTo: jsonBody.params.cEmail,
			subject: 'Requisição de contato - Citodon',
			text: textBody,
			html: htmlBody
		};

		sendEmail(res, mailOptions, htmlBody);

		// res.send({'html': htmlBody, 'json': jsonBody});
		// res.send(jsonBody);

	}

});

/* NODE SERVER START */
app.listen(port, function () {
	console.log('Servidor iniciado na porta: ' + port);
});
