'use strict';

var request = require('request');

let buildUrl = (path, param, query) => {
	let base = `http://swapi.co/api/${path}/`;
	if (param) {
		base += `${param}/`;
	}
	if (query) {
		let string = Object.keys(query).map((key) => `${key}=${query[key]}`);
		base += '?' + string.join('&');
	}
	return base;
};

let get = (url) => {
	return new Promise((resolve, reject) => {
		request(url, (error, response, body) => {
			console.log(response.request.href);
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
		get(buildUrl('people', null, { search: name })).then((data) => resolve(data)).catch((err) => reject(err));
	});
};

let url = (url) => {
	return new Promise((resolve, reject) => {
		get(url).then((data) => resolve(data)).catch((err) => reject(err));
	});
};

module.exports = {
	character,
	url
};

