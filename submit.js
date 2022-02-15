const axios = require('axios')

function submit(answer, token) {
	return new Promise((resolve, reject) => {
		axios
			.post(
				'https://excelplay-backend-kryptos-7lwulr4nvq-el.a.run.app/api/submit',
				{ answer: answer },
				{
					headers: {
						authorization: token,
					},
				}
			)
			.then((res) => {
				if (res.data.answer === 'wrong') reject()
				else resolve()
			})
			.catch((err) => {
				console.error(err)
				reject()
			})
	})
}

module.exports = { submit }
