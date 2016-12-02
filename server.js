'use strict';

// IMPORTS
let app = require('express')(),
	path = require('path'),
	api = require('./server/data/api'),
	transform = require('./server/data/transform');

app.set('views', path.join(__dirname, '/client/src'));
app.set('view engine', 'ejs');

app.get('/', (req, res, next) => {
	res.render('home');
});

app.get('/character/:name', (req, res, next) => {
		api.character(req.params.name).then((data) => {
			transform.character(data).then((data) => {
				res.locals.data = data;
				next();
			});
		}).catch((err) => next(err));
	},
	(req, res, next) => {
		res.render('character', res.locals.data);
		next();
	}
);

app.get('/characters', (req, res, next) => {
	let { page, limit, sort } =  req.query;
	api.characters(page, limit, sort).then((data) => {
		transform.characters(data).then((data) => {
			res.json(data);
			next();
		});
	}).catch((err) => next(err));
});

app.get('/planetresidents', (req, res, next) => {
	api.residents().then((data) => {
		transform.residents(data).then((data) => {
			res.json(data);
			next();
		});
	}).catch((err) => next(err));
});

app.use((err, req, res, next) => {
	var msg = err.msg || err.toString() || "There was an error...";
	res.status(err.status || 500).render('error', { msg });
	next();
});

module.exports = app;
