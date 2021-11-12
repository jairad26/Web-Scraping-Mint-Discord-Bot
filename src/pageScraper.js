const client = require('./bot')

const scraperObject = {
    url: 'https://app.wonderland.money/#/mints',
    async scraper(browser){
        let page = await browser.newPage();
        await page.setViewport({ width: 500, height: 300 });
        await page.setUserAgent(
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/72.0.3626.121 Safari/537.36'
            )
        console.log(`Navigating to ${this.url}...`);
        // Navigate to the selected page
        await page.goto(this.url);

        (async function(){
            await page.reload({ waitUntil: ["networkidle0", "domcontentloaded"] });
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
            // console.log(prices)
            await page.hover('#root > div > div.jss5.jss6 > header > div > div.dapp-topbar-slider-btn');
            await page.click('#root > div > div.jss5.jss6 > header > div > div.dapp-topbar-slider-btn');
            await page.waitForSelector('.dapp-sidebar');
            await page.hover('body > div.MuiDrawer-root.MuiDrawer-modal > div.MuiPaper-root.MuiDrawer-paper.jss14.MuiDrawer-paperAnchorLeft.MuiPaper-elevation16 > div > div.dapp-menu-links > div > a:nth-child(1)');
            await page.click('body > div.MuiDrawer-root.MuiDrawer-modal > div.MuiPaper-root.MuiDrawer-paper.jss14.MuiDrawer-paperAnchorLeft.MuiPaper-elevation16 > div > div.dapp-menu-links > div > a:nth-child(1)');
            await page.waitForSelector('.dashboard-view');
            let apy = await page.evaluate(() => {
                // Make sure the book to be scraped is in stock
                const staking = Array.from(document.querySelectorAll('#root > div > div.jss2.jss3 > div.dashboard-view > div > div > div:nth-child(4) > div > p.card-value'), apy => apy.textContent)
                // bondPrices = bondPrices.filter(bondPrice => parseFloat(bondPrice.querySelector('.bond-name-title').textContent) > 9.0)
                // Extract the bondPrices from the data
                // bondPrices = bondPrices.map(el => el.querySelector('h3 > a').href)
                return staking;
            });
            // let value = await page.evaluate(() => {
            //     // Make sure the book to be scraped is in stock
            //     const price = Array.from(document.querySelectorAll('#root > div > div.jss2.jss3 > div.dashboard-view > div > div > div:nth-child(1) > div > p.card-value'), apy => apy.textContent)
            //     // bondPrices = bondPrices.filter(bondPrice => parseFloat(bondPrice.querySelector('.bond-name-title').textContent) > 9.0)
            //     // Extract the bondPrices from the data
            //     // bondPrices = bondPrices.map(el => el.querySelector('h3 > a').href)
            //     return price;
            // });
            const apyFloatPercent = parseFloat(apy[0].slice(0,-1).replace(",",""));
            const apyFloatDec = apyFloatPercent/100.0;
            const epochRewardYield = Math.pow((1.0+apyFloatDec),((1.0/3.0)/365.0))-1.0;
            console.log(epochRewardYield);
            const fiveDayAPRPercent = (1.0*Math.pow((1.0+epochRewardYield),3.0*5.0)-1.0)*100.0;
            console.log(fiveDayAPRPercent);
            console.log(Math.trunc(fiveDayAPRPercent));
            
            function notIsViewContract(value) {
                return value != 'View Contract' && value != 'View Analytics' && value != 'Price' && value != 'ROI' && value != 'Purchased'
            }
            prices = prices.filter(notIsViewContract);
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
            
            console.log(hashBond);
            const channel = client.channels.cache.find(c => c.name === 'general');
            for(var i in hashBond) {
                if(parseFloat(hashBond[i][1].slice(0,-1)) < Math.trunc(fiveDayAPRPercent)) {
                    delete hashBond[i];
                }
            }

            console.log(hashBond);
            if(Object.keys(hashBond).length != 0) {
                message = `\`\`\`\Wonderland has ${Object.keys(hashBond).length} mint(s) over ${Math.trunc(fiveDayAPRPercent)}%\n`;
                for(var i in hashBond) {
                    claimAndStakeEpoch = parseFloat(hashBond[i][1].split(0,-1)) + (((1+epochRewardYield)*(1-Math.pow((1+epochRewardYield),15))/(1-(1+epochRewardYield))/15)-1)*100.0
                    claimAndStakeDaily = parseFloat(hashBond[i][1].split(0,-1)) + ((((1+epochRewardYield))*(1-Math.pow((1+epochRewardYield),15))/(1-Math.pow((1+epochRewardYield),3)))/5 -1)*100.0

                    message += `${i}:\nDiscount Price: ${hashBond[i][0]}\nBond ROI %: ${hashBond[i][1]}\nClaim & Stake Every Epoch: ${claimAndStakeEpoch.toFixed(2)}%\nClaim & Stake Every Day: ${claimAndStakeDaily.toFixed(2)}%\n\n\n`;
                }
                message += `\`\`\``;
                channel.send(message);
            }

            await page.goBack();
            await page.waitForSelector('.choose-bond-view');
            setTimeout(arguments.callee, 60000);
        })();

    }
}

module.exports = scraperObject;