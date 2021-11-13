const browserObject = require('./browser');

const scraperObject = {
    hashBond: new Object(),
    async scraper(arg){
        const url = `https://app.${arg}.money/#/mints`;
        let browserInstance = browserObject.startBrowser();
        let browser = await browserInstance;
        let page = await browser.newPage();
        await page.setViewport({ width: 500, height: 300 });
        await page.setUserAgent(
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/72.0.3626.121 Safari/537.36'
            )
        console.log(`Navigating to ${url}...`);
        // Navigate to the selected page
        await page.goto(url);

        let hashBonds = await (async function(){
            // await page.reload({ waitUntil: ["networkidle0", "domcontentloaded"] });
            // Wait for the required DOM to be rendered
            await page.waitForSelector('.choose-bond-view');
            // Get the bondPrice to all the required books
            let prices = await page.evaluate(() => {
                // Make sure the book to be scraped is in stock
                const bondPrices = Array.from(document.querySelectorAll('.bond-name-title'), bond => bond.textContent);
                // bondPrices = bondPrices.filter(bondPrice => parseFloat(bondPrice.querySelector('.bond-name-title').textContent) > 9.0)
                // Extract the bondPrices from the data
                // bondPrices = bondPrices.map(el => el.querySelector('h3 > a').href)
                return bondPrices;
            });
            function notIsViewContract(value) {
                return value != 'View Contract' && value != 'View Analytics' && value != 'Price' && value != 'ROI' && value != 'Purchased'
            }
            prices = prices.filter(notIsViewContract);
            // console.log(prices);
            var hashBond = new Object();
            for(let i = 0; i < prices.length; i++ ) {
                if(i % 4 == 0) {
                    var prevKey = prices[i];
                    hashBond[prices[i]] = [];
                }
                else {
                    hashBond[prevKey].push(prices[i]);
                }
            }
            
            // console.log(hashBond);
            return hashBond;
        })();
        return hashBonds;
    }
    
}

module.exports = scraperObject;