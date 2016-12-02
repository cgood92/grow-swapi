'use strict';

var request = require('request');

let get = (path, query) => {
	return new Promise((resolve, reject) => {
		request(`http://swapi.co/api/${path}/?search=${query}`, (error, response, body) => {
			if (!error && response.statusCode == 200) {
				resolve(JSON.parse(body));
			} else {
				reject({ msg: `API call to '${response.request.href}' was not successful` });
			}
		});
	});
};

let character = (name) => {
	return new Promise((resolve, reject) => {
		get('people', name).then((data) => resolve(data)).catch((err) => reject(err));
	});
};

module.exports = {
	character
};

