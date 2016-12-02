'use strict';

// IMPORTS
let app = require('express')(),
	path = require('path'),
	api = require('./server/data/api'),
	transform = require('./server/data/transform');

app.set('views', path.join(__dirname, '/client/src'));
app.set('view engine', 'ejs');

app.get('/', (req, res, next) => {
		api.character('luke').then((data) => {
			transform.character(data).then((data) => {
				res.locals.data = data;
				next();
			});
		}).catch((err) => next(err));
	},
	(req, res, next) => {
		res.render('character', res.locals.data);
		next();
	});

app.use((err, req, res, next) => {
	var msg = err.msg || err.toString() || "There was an error...";
	res.status(err.status || 500).render('error', { msg });
	next();
});

module.exports = app;
