import puppeteer from 'puppeteer';
import * as fs from "fs";

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
        // Button-sc-1fhcnov-2.kiWTtt.IconButton__StyledButton-sc-145zyhb-0.fDstFR.Overlay__X-sc-1pt5jsh-3.FkQre
        // const sModalWindowCloseButton = 'button.Button-sc-1fhcnov-2.kiWTtt.IconButton__StyledButton-sc-145zyhb-0.fDstFR.Overlay__X-sc-1pt5jsh-3.FkQre'
        const mwClose = await page.waitForSelector('.FkQre', { timeout: 0 });
        await delay(500);
        await mwClose.click();
        console.log('modal window closed');
    }
}

const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
    args: ['--start-maximized']
});
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

createButton: {
    await delay(500);
    const buttons = await page.$$('button');
    for await (let button of buttons) {
        const propertyHandle = await button.getProperty('textContent');
        const textContent = await propertyHandle.jsonValue();

        if (textContent !== 'Create') {
            continue;
        }

        console.log('create')
        await button.click();

        break createButton;
    }
    console.log('no create button');
}

console.log('Creating...');

const IMAGE_SELECTOR = 'img[src^="https://images.wombo.art/generated"]'
const img = await page.waitForSelector(IMAGE_SELECTOR, { timeout: 0 });
const src = await img.getProperty('src');
const srcText = await src.jsonValue();

console.log('image url', srcText);

await delay(500);

const getDataUrlThroughCanvas = async (selector) => {
    // Create a new image element with unconstrained size.
    const originalImage = document.querySelector(selector);
    originalImage.style.border = '3px solid red';
    const image = document.createElement('img');
    image.src = originalImage.src;

    // Ensure the image is loaded.
    await new Promise((resolve) => {
        if (image.complete || (image.width) > 0) resolve();
        image.addEventListener('load', () => resolve());
    });

    // Create a canvas and context to draw onto.
    const canvas = document.createElement('canvas');
    canvas.id = 'scrape-canvas';
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.zIndex = '1000';
    canvas.style.border = '3px solid green';
    const context = canvas.getContext('2d');
    canvas.width = image.width;
    canvas.height = image.height;

    context.drawImage(image, 0, 0);
    document.body.prepend(canvas)
    try {
        return { dataUrl: canvas.toDataURL('image/png') };
    } catch (error) {
        return { error };
    }
};

try {
    const { dataUrl, error } = await page.evaluate(getDataUrlThroughCanvas, IMAGE_SELECTOR);
    if (error) {
        console.warn('ERROR [DATA URL]', error);
    } else {
        await delay(5000);
        const img = await page.waitForSelector('#scrape-canvas', { timeout: 0 });
        await img.screenshot({
            path: 'logo-screenshot.jpg',
            omitBackground: true,
            type: 'jpeg',
        });

        // console.log('returned data url', dataUrl.slice(0, 100));
        // const imageData = Buffer.from(dataUrl.split(',')[1], 'base64');
        // const outputPath = 'logo.png';
        // fs.writeFileSync(outputPath, imageData);
        // console.log('fileWritten');
    }
    // const parseDataUrl = (dataUrl) => {
    //     const parts = dataUrl.split(',');
    //     const imageData = Buffer.from(parts[1], 'base64');
    //     const outputPath = 'logo.png';
    //     fs.writeFileSync(outputPath, imageData);
    //     console.log('Image saved to ' + outputPath);
    //
    //     // const matches = dataUrl.match(/^data:(.+);base64,(.+)$/);
    //     // if (matches.length !== 3) {
    //     //     throw new Error('Could not parse data URL.');
    //     // }
    //     // return { mime: matches[1], buffer: Buffer.from(matches[2], 'base64') };
    // };
    // // const { buffer } = parseDataUrl(dataUrl);


} catch (error) {
    console.warn('ERROR [FILE WRITE]', error);
}

// const response = await fetch(srcText);
// const buffer = await response.text();
// fs.writeFile('image.jpg', buffer,  'base64', function (err) {
//     if (err) throw err;
//     console.log('Saved!');
// });
//
// await img.screenshot({
//     path: 'logo-screenshot.jpg',
//     omitBackground: true,
//     type: 'jpeg',
// });
await delay(1000);
try {
    await browser.close();
} catch (error) {
    console.warn('ERROR [BROWSER CLOSE]');
}
