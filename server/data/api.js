'use strict';

var request = require('request'),
	memoize = require('memoizee');

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
		// TODO: memoize
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

let cache = memoize(get);

let character = (name) => {
	return new Promise((resolve, reject) => {
		cache(buildUrl('people', null, { search: name })).then((data) => {
			if (data.results.length) {
				resolve(data);
			} else {
				reject();
			}
		}).catch((err) => reject(err));
	});
};

let _getPageNum = (length, page, limit) => {
	if (page < 1) {
		page = 1;
	} 

	let target = ((page - 1)*limit);

	if (target > length) {
		target = length - limit;
	}

	return target;
};

let _sort = (key) => {
	return (a,b) => {
		// Sort by the key specified (unless that key doens't exist, in which case sort by name)
		let aVal = a[key] || a.name,
			bVal = b[key] || b.name;
		if (aVal < bVal) {
			return -1;
		} else if (aVal > bVal) {
			return 1;
		} else {
			return 0;
		}
	};
};

/*
	Keep fetching more results until the limit has been reached.  Doing this method does NOT mean that, when returning the sorted array, the sorted array is comprehensive of all results.  It simply means that we found X number of people, and then sorted those X number of people by the sort.  So, if you sort by "name", then not all "A" names will be on the first page, unless your limit >= total.  In short, we are slicing and then sorting, whereas a true "Google" like experience would be sort then slice.  But, since the instructions indicated that the results returned didn't matter, and rather than make more calls than are necessary (only to sort and splice later), this is a quick/lean method.
*/
let _continueToFetch = function _continueToFetch(endpoint, userPage, limit, sort, total, page, resolve) {
	cache(buildUrl(endpoint, null, { page })).then((data) => {
		let concated = total.concat(data.results),
			totalLength = concated.length;
		if (totalLength < (limit*userPage) && data.next) {
			_continueToFetch(endpoint, userPage, limit, sort, concated, page+1, resolve);
		} else {
			let startingIndex = _getPageNum(totalLength, userPage, limit);
			let results = concated.slice(startingIndex, startingIndex+limit).sort(_sort(sort));
			resolve(results);
		}
	});
};

/* 
	Why put limit + sort here, instead of in the transform?  Because these params
	deal with querying the data, not on presenting it.  If this was a DB query in the
	api, then we would have that logic here...
*/
let characters = (page = 1, limit = 10, sort = "name") => {
	return new Promise((resolve, reject) => {
		_continueToFetch('people', page, limit, sort, [], 1, resolve);
	});
};

let residents = () => {
	return new Promise((resolve, reject) => {
		_continueToFetch('planets', 1, 1000, 'name', [], 1, (planets) => {
			let promises = [];
			planets.forEach((planet) => {
				planet.residents.forEach((residentUrl, index) => {
					promises.push(url(residentUrl).then((person) => {
						planet.residents[index] = person.name;
					}));
				});
			});
			Promise.all(promises).then(() => {
				resolve(planets);
			}).catch((err) => reject(err));
		});
	});
};

let url = (url) => {
	return new Promise((resolve, reject) => {
		cache(url).then((data) => resolve(data)).catch((err) => reject(err));
	});
};

module.exports = {
	character,
	characters,
	residents,
	url
};

