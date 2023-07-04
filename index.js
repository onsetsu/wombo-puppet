import puppeteer from 'puppeteer';

async function delay(time) {
    return new Promise(function(resolve) {
        setTimeout(resolve, time)
    });
}

async function dismissModalWindow(page) {
    while (true) {
        const sModalWindow = '#modal-root'
        const modalWindow = await page.waitForSelector(sModalWindow, { timeout: 0 });
        const buttons = await page.$$(`${sModalWindow} button`)
        console.log('buttons', buttons, ...buttons);
        // Button-sc-1fhcnov-2.kiWTtt.IconButton__StyledButton-sc-145zyhb-0.fDstFR.Overlay__X-sc-1pt5jsh-3.FkQre
        // const sModalWindowCloseButton = 'button.Button-sc-1fhcnov-2.kiWTtt.IconButton__StyledButton-sc-145zyhb-0.fDstFR.Overlay__X-sc-1pt5jsh-3.FkQre'
        const mwClose = await page.waitForSelector('.FkQre', { timeout: 0 });
        await delay(500);
        await mwClose.click();
    }
}

const browser = await puppeteer.launch({headless: false});

const page = await browser.newPage();
await page.setViewport({width: 1080, height: 824});
await page.goto('https://dream.ai/create');

dismissModalWindow(page);

await delay(1000);
const PROMPT_SELECTOR = 'input[label="Enter prompt"]';
await page.click(PROMPT_SELECTOR);
await delay(1000);
await page.type(PROMPT_SELECTOR, 'Mass Reproduction', {delay: 200});

await delay(500);

const ART_STYLE_SELECTOR = 'div.ArtStyles__ArtStyleThumbnail-sc-1xc47b6-3';
const targetText = 'animev2';
const styleDivs = await page.$$(ART_STYLE_SELECTOR)
for await (let div of styleDivs) {
    const styleToSelect = await div.$(`img[src*="${targetText}"]`)

    if (!styleToSelect) {
        continue;
    }
console.log('select')
    // await delay(1000);
    await div.click();

    break;
}


await delay(5000);
console.log('modalWindow', modalWindow);
await browser.close();
