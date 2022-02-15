const rp = require('request-promise')
const unique = require('array-unique')
const jsdom = require('jsdom')
const { JSDOM } = jsdom
const replaceSpecialCharacters = require('replace-special-characters')

const commonWords = require('./common-words.js')

async function getKeywords(url, selector, callback) {
	let keywords = []
	rp(url)
		.then(function (html) {
			const dom = new JSDOM(html)
			let s = selector || 'p a'
			let alllinks = dom.window.document.querySelectorAll(s)
			let heading = dom.window.document.querySelector('h1').textContent
			keywords.push(
				replaceSpecialCharacters(heading)
					.replace(/[^a-zA-Z0-9]/g, '')
					.toLowerCase()
			)
			for (a of alllinks) {
				let linkname = a.innerHTML
				if (!contains(linkname, ['[', '<', '(', ')', 'season'])) {
					let temp = replaceSpecialCharacters(linkname)
						.replace(/[^a-zA-Z0-9]/g, '')
						.toLowerCase()
					if (temp != '' && temp.length < 31 && temp.length > 4)
						if (!commonWords.includes(temp)) keywords.push(temp)
				}
			}
			unique(keywords)
			callback(keywords, heading)
		})
		.catch(function (err) {})
}

function contains(target, pattern) {
	var value = 0
	pattern.forEach(function (word) {
		value = value + target.includes(word)
	})
	return value === 1
}

module.exports = { getKeywords }
