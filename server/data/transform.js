'use strict';

let character = (raw) => {
	return {
		name: raw.name,
		birth: raw.birth_year,
		gender: raw.gender,
		home: raw.homeworld,
		films: raw.films,
		url: raw.url
	};
};

module.exports = {
	character
};