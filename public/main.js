const urlInput = document.querySelector('#webpageUrl')
const wordslist = document.querySelector('#wordslist')
const selectAllButton = document.querySelector('#selectAllButton')
const deselectAllButton = document.querySelector('#deselectAllButton')
const addToQueueButton = document.querySelector('#addToQueueButton')
const wordCountPlaceholder = document.querySelector('#wordCount')
const queueUpdateStatus = document.querySelector('#queueUpdateStatus')
const preExeWaitSlider = document.querySelector('#preExeWaitSlider')
const reqDelaySlider = document.querySelector('#reqDelaySlider')
const reqDelayLabel = document.querySelector('#reqDelayLabel')
const preExeWaitLabel = document.querySelector('#preExeWaitLabel')
const sliderResetButton = document.querySelector('#slider-reset-button')
const playButton = document.querySelector('#play-button')
const stopButton = document.querySelector('#stop-button')
const pauseButton = document.querySelector('#pause-button')
const executionInfoContainer = document.querySelector('#execution-info-container')
const pageHeading = document.querySelector('#page-heading')
const resetButton = document.querySelector('#reset-button')
const selectorInput = document.querySelector('#selector')

let keywords = []
let queue = []
let queueUpdated = false
let stopSignal = false
let pasueSignal = false
let running = false

const extraDelay = 0

resetButton.onclick = () => {
	location.reload()
}

selectAllButton.onclick = () => {
	selectAll(keywords)
}
deselectAllButton.onclick = () => {
	deselectAll(keywords)
}
addToQueueButton.onclick = () => {
	addToQueue(keywords)
}

playButton.onclick = () => {
	if (running) return
	running = true
	let timerVal = preExeWaitSlider.value
	let preExeTimer = setInterval(() => {
		updateExeStatus(0, timerVal)
		if (timerVal == 0) {
			clearInterval(preExeTimer)
			play()
		}
		timerVal--
	}, 1000)
}
pauseButton.onclick = () => {
	pause()
}
stopButton.onclick = () => {
	stop()
}

window.onload = () => {
	preExeWaitSlider.value = 3
	reqDelaySlider.value = 700
	preExeWaitLabel.innerHTML = preExeWaitSlider.value
	reqDelayLabel.innerHTML = parseInt(reqDelaySlider.value) + extraDelay
	executionInfoContainer.style.display = 'none'
	preExeWaitSlider.oninput = () => {
		preExeWaitLabel.innerHTML = preExeWaitSlider.value
	}
	reqDelaySlider.oninput = () => {
		reqDelayLabel.innerHTML = parseInt(reqDelaySlider.value) + extraDelay
	}
	sliderResetButton.onclick = () => {
		preExeWaitSlider.value = 6
		reqDelaySlider.value = 700
		reqDelayLabel.innerHTML = parseInt(reqDelaySlider.value) + extraDelay
		preExeWaitLabel.innerHTML = preExeWaitSlider.value
	}
}

function submitUrl() {
	fetch('http://localhost:3000/submit', {
		method: 'POST',
		body: JSON.stringify({ url: `${urlInput.value}`, selector: `${selectorInput.value}` }),
		headers: {
			'Content-type': 'application/json; charset=UTF-8',
		},
	})
		.then(function (res) {
			if (res.ok) {
				return res.json()
			}
			return Promise.reject(res)
		})
		.then(function (data) {
			keywords = data.keywords
			wordslist.innerHTML = generateWordslistHTML(keywords)
			document.querySelectorAll('.keyword-checkbox').forEach(
				(el) =>
					(el.onchange = () => {
						setUpdateStatus('notupdated')
					})
			)
			setUpdateStatus('notupdated')
			pageHeading.innerHTML = data.heading
			wordCountPlaceholder.innerHTML = keywords.length
		})
		.catch(function (error) {
			console.warn('Something went wrong.', error)
		})
}

function generateWordslistHTML(words) {
	let html = ''
	for (w of words) {
		html += `<li><input class="keyword-checkbox" id="${w}" checked type="checkbox">${w}</li>`
	}
	return html
}

function selectAll(ids) {
	for (id of ids) {
		document.getElementById(`${id}`).checked = true
	}
	setUpdateStatus('notupdated')
}

function deselectAll(ids) {
	for (id of ids) {
		document.getElementById(`${id}`).checked = false
	}
	setUpdateStatus('notupdated')
}

function addToQueue(keywords) {
	if (running) return
	queue = []
	for (k of keywords) {
		if (document.getElementById(`${k}`).checked)
			queue.push({
				keyword: k,
				status: 'pending',
			})
	}
	generateQueueTable(queue)
	setUpdateStatus('updated')
}

function setUpdateStatus(status) {
	if (status == 'notupdated') {
		queueUpdateStatus.innerHTML = 'Not Updated'
		queueUpdateStatus.classList = ['red']
		queueUpdated = false
	} else if (status == 'updated') {
		queueUpdateStatus.innerHTML = 'Updated'
		queueUpdateStatus.classList = ['green']
		queueUpdated = true
	}
}

function generateQueueTable(queue) {
	let html = `<tr><th>Sl no</th><th>Word</th><th>Status</th></tr>`
	let i = 0
	for (q of queue) {
		i++
		html += `<tr><td>${i}</td><td>${q.keyword}</td><td class="${q.status}">${q.status}</td></tr>`
	}
	document.querySelector('table').innerHTML = html
}

async function play() {
	let tryCount = 0
	updateExeStatus(tryCount, 0)
	for (let q of queue) {
		if (stopSignal || pasueSignal) {
			stopSignal = false
			pasueSignal = false
			running = false
			return
		}
		if (q.status == 'pending') {
			q.status = 'trying'
			generateQueueTable(queue)
			let success = await tryKeyword(q.keyword)
			if (success) {
				stopSignal = true
				alert(`CORRECT ANSWER: ${q.keyword}`)
			}
			if (!stopSignal) {
				q.status = 'tried'
				generateQueueTable(queue)
			}
		}
		tryCount++
		if (!stopSignal) updateExeStatus(tryCount, 0)
	}
	running = false
}

function pause() {
	if (running) pasueSignal = true
}

function stop() {
	executionInfoContainer.style.display = 'none'
	if (running) stopSignal = true
	for (q of queue) q.status = 'pending'
	generateQueueTable(queue)
}

function updateExeStatus(triesDone, timerVal) {
	executionInfoContainer.style.display = 'block'
	document.getElementById('exe-timer').innerHTML = timerVal
	//let secondsRemaining = (queue.length - triesDone) * ((reqDelaySlider.value + extraDelay) / 1000)
	//document.getElementById("time-remaining").innerHTML = sec2time(secondsRemaining)
	document.getElementById('tried-count').innerHTML = `${triesDone}/${queue.length}`
}

async function tryKeyword(keyword, callback) {
	return await fetch('http://localhost:3000/tryKeyword', {
		method: 'POST',
		body: JSON.stringify({
			keyword: keyword,
			reqDelay: reqDelaySlider.value,
		}),
		headers: { 'Content-type': 'application/json; charset=UTF-8' },
	})
		.then((res) => res.json())
		.then((data) => {
			return data.answer === 'correct'
		})
		.catch(console.error)
}

function sec2time(timeInSeconds) {
	var pad = function (num, size) {
			return ('000' + num).slice(size * -1)
		},
		time = parseFloat(timeInSeconds).toFixed(3),
		hours = Math.floor(time / 60 / 60),
		minutes = Math.floor(time / 60) % 60,
		seconds = Math.floor(time - minutes * 60),
		milliseconds = time.slice(-3)

	return pad(hours, 2) + 'h ' + pad(minutes, 2) + 'm ' + pad(seconds, 2) + 's'
}
