'use strict';

var api = require('./api');

let character = (raw) => {
	return new Promise((resolve, reject) => {
		let person = raw.results[0];
		if (person) {
			let fetches = [person.homeworld].concat(person.films).map((url) => {
				return api.url(url);
			});
			Promise.all(fetches).then((results) => {
				let home = results.shift(0).name;
				let filmTitles = results.map((film) => film.title);
				return resolve({
					name: person.name,
					birth: person.birth_year,
					gender: person.gender,
					home,
					films: filmTitles.join(', '),
					url: person.url
				});
			}).catch((err) => reject(err));
		} else {
			reject();
		}
	});
};

/* Why have these functions here, if they just return the raw data?  
   In case one day they would want to change something, such as swapping out URLs
   for the data they would contain, etc.
*/
let characters = (raw) => {
	return new Promise((resolve, reject) => {
		resolve(raw);
	});
};

let residents = (raw) => {
	return new Promise((resolve, reject) => {
		resolve(raw);
	});
};

module.exports = {
	character,
	characters,
	residents
};