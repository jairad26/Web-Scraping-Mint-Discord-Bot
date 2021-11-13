require('dotenv').config();
const browserObject = require('./browser');
const scraperController = require('./pageController');
const http = require('http');


http.createServer((req, res) => {
res.writeHead(200, {
    'Content-type': 'text/plain'
});
    res.write('Hey');
    res.end();
}).listen(4000);




//Start the browser and create a browser instance
let browserInstance = browserObject.startBrowser();

// Pass the browser instance to the scraper controller
scraperController(browserInstance)

