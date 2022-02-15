// NPM modules
const express = require('express')
const { submit } = require('./submit')

// Local modules
const { getKeywords } = require('./get-keywords')

const app = express()
app.use(express.static('public'))
app.use(express.json())

// Constants
const port = 3000
const TOKEN =
	'Bearer eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiMTI1NjMiLCJuYW1lIjoiS2FtaWthemUgc3Rvcm0iLCJlbWFpbCI6ImthbWlrYXplc3Rvcm0zMTUyQGdtYWlsLmNvbSIsImlzUGFpZCI6IkZhbHNlIiwicGljdHVyZSI6Imh0dHBzOi8vbGgzLmdvb2dsZXVzZXJjb250ZW50LmNvbS9hLS9BT2gxNEdpNHduNnRMcXdDOC1LcHlZWkRmc1lRTE83OVJRcXlTVDdjZjV3Sj1zOTYtYyIsInJvbGUiOiJVc2VyIiwibmJmIjoxNjQ0NzAxMzc2LCJleHAiOjE2NDQ3MDIyNzYsImlhdCI6MTY0NDcwMTM3NiwiaXNzIjoiaHR0cDovL2V4Y2VsbWVjLm9yZy8ifQ.i5-ynNrm4pKd_JkQnxqFDFPnTZfZd2EROhFe4mj956KigMA0xuxCehIBZT2K5a1h8HQ4hVp__PcURBFfCsgfaA'

app.post('/submit', (req, res) => {
	let url = req.body.url
	let selector = req.body.selector
	getKeywords(url, selector, (kws, heading) => {
		keywords = kws
		res.json({ keywords: kws, heading: heading })
	})
})

app.post('/tryKeyword', (req, res) => {
	try {
		setTimeout(() => {
			console.log(`Trying: ${req.body.keyword}`)
			submit(req.body.keyword, TOKEN)
				.then(() => {
					console.log(`CORRECT ANSWER: ${req.body.keyword}`)
					res.json({ answer: 'correct' })
				})
				.catch(() => {
					res.json({ answer: 'wrong' })
				})
		}, parseInt(req.body.reqDelay))
	} catch {
		console.log('err')
	}
})

app.listen(port, () => {
	console.log(`Auto answerer listening at http://localhost:${port}`)
})
