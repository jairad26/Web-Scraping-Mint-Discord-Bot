const puppeteer = require('puppeteer');


async function startBrowser(){
    let browser;
    try {
        console.log("Opening the browser......");
        browser = await puppeteer.launch({
            headless: true,
            args: [
                '--user-agent=Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.132 Safari/537.36',
                "--disable-setuid-sandbox",
                '--window-size=1920,1080',
            ],
            // defaultViewport: {
            //     width:1920,
            //     height:1080
            //   },
            'defaultViewport' : { 'width' : 500, 'height' : 300 },
            'ignoreHTTPSErrors': true
        });
    } catch (err) {
        console.log("Could not create a browser instance => : ", err);
    }
    return browser;
}

module.exports = {
    startBrowser
};