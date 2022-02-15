// NPM modules
const rp = require('request-promise')
const robot = require("robotjs")
const delay = require('delay')
const unique = require('array-unique')
const jsdom = require('jsdom')
const { JSDOM } = jsdom

// Local modules
const commonWords = require('./common-words.js')


// Constants
const url = `https://en.wikipedia.org/wiki/Operation_Spectrum`; // Wikipedia page url
const startTimer = 10 // seconds
const waitForResponse = 1000 // milliseconds

let keywords = []
rp(url)
    .then(function(html) {
        const dom = new JSDOM(html);
        // let alllinks = dom.window.document.querySelectorAll('#content p a')
        let alllinks = dom.window.document.querySelectorAll('#content p a, #content ul li a')
        let heading = dom.window.document.querySelector('#firstHeading').textContent
        keywords.push(heading.replace(/[^a-zA-Z0-9]/g, "").toLowerCase())
        for (a of alllinks) {
            let linkname = a.innerHTML
            if (!contains(linkname, ["[", "<", "(", ")", "season"])) {
                let temp = linkname.replace(/[^a-zA-Z0-9]/g, "").toLowerCase()
                if (temp != '' && temp.length < 31 && temp.length > 4)
                    if (!commonWords.includes(temp))
                        keywords.push(temp)
            }
        }
        console.log(heading)
        unique(keywords)
        start()
    })
    .catch(function(err) {})

async function start() {
    console.log(`Total of ${keywords.length} keywords`)
    console.log("These are the keywords:")
    console.log(keywords)

    console.log(`Execution will start in ${startTimer}s, select the text box in browser window`)
    for (let i = 0; i <= startTimer; i++) {
        console.log(i)
        await delay(1000)
    }

    for (let i = 0; i < keywords.length; i++) {
        console.log(`Trying: ${keywords[i]}   [${i+1}/${keywords.length}]`)
        robot.typeString(keywords[i]);
        robot.keyTap("tab");
        robot.keyTap("enter")
        await delay(waitForResponse)
        robot.keyTap("enter")
        await delay(300)
        robot.keyTap("tab", "shift")
        await delay(500)
    }
}

function contains(target, pattern) {
    var value = 0;
    pattern.forEach(function(word) {
        value = value + target.includes(word);
    });
    return (value === 1)
}