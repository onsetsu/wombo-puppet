import puppeteer from 'puppeteer';
import * as fs from "fs";

const CARDS = [
    [1,'Ascension'],
    [2,'Fire'],
    [3,'Water'],
    [4,'Earth'],
    [5,'Wind'],
    [6,'Immer besser'],
    [7,'Rathaus'],
    [8,'Bumerang'],
    [9,'Meteor Impact'],
    [10,'Rush Recklessly'],
]

async function delay(minTime, maxTime = minTime) {
    return new Promise(function(resolve) {
        setTimeout(resolve, Math.random() * (maxTime - minTime) + minTime)
    });
}

const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
    args: ['--start-maximized'],
    protocolTimeout: 0,
});

const page = await browser.newPage();
// await page.setViewport({width: 1080, height: 824});
await page.goto('https://dream.ai/create', {
    waitUntil: "domcontentloaded",
});
await page.waitForNetworkIdle({ idleTime: 500 })

async function dismissModalWindow() {
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

async function dismissLoginOverlay() {
    while (true) {
        const LOGIN_SELECTOR = '.Modal__Container-sc-23q3re-0'
        const BACKGROUND_OVERLAY_SELECTOR = '._app__BackgroundOverlay-sc-qouf4b-2'
        const BLUR_SELECTOR = '#blur-overlay'

        await page.waitForSelector(LOGIN_SELECTOR, { timeout: 0 })
        // await page.waitForSelector(BACKGROUND_OVERLAY_SELECTOR, { timeout: 0 })
        await page.waitForSelector(BLUR_SELECTOR, { timeout: 0 })

        await page.evaluate(async (LOGIN_SELECTOR, BACKGROUND_OVERLAY_SELECTOR, BLUR_SELECTOR) => {
            const loginContainer = document.querySelector(LOGIN_SELECTOR)
            const loginBackgroundOverlay = document.querySelector(BACKGROUND_OVERLAY_SELECTOR)
            const blur = document.querySelector(BLUR_SELECTOR)

            loginContainer.remove()
            // loginBackgroundOverlay.remove()
            blur.replaceWith(blur.children[0])
        }, LOGIN_SELECTOR, BACKGROUND_OVERLAY_SELECTOR, BLUR_SELECTOR)

        await delay(500);
    }
}

dismissModalWindow();
dismissLoginOverlay();

async function clearTempCanvas() {
    await page.evaluate((selector) => {
        document.querySelector(selector)?.remove?.();
    }, '#scrape-canvas');
}

async function ensurePrompt(prompt, tries = 3) {
    await delay(500);
    const PROMPT_SELECTOR = 'input[label="Enter prompt"]';
    await page.click(PROMPT_SELECTOR);
    await delay(200);
    await page.keyboard.down('Control');
    await page.keyboard.press('KeyA');
    await page.keyboard.up('Control');
    await page.type(PROMPT_SELECTOR, prompt, {delay: 200});

    // check prompt
    const input = await page.$(PROMPT_SELECTOR)
    const value = await input.getProperty('value')
    const valueText = await value.jsonValue()
    if (valueText !== prompt) {
        if (tries > 0) {
            await ensurePrompt(prompt, tries - 1);
        } else {
            throw new Error('Prompt not set correctly')
        }
    }
}

async function chooseStyle(style, tries = 3) {
    await delay(500);

    async function isStyle(artStyleDiv, style) {
        const innerDivs = await artStyleDiv.$$('div')
        for await (let innerDiv of innerDivs) {
            const content = await innerDiv.getProperty('innerText')
            const contentText = await content.jsonValue()
            // console.log('check style ' + style + ' ' + contentText)
            if (contentText === style) {
                return true
            }
        }
        return false
    }

    const ART_STYLE_SELECTOR = 'div.ArtStyles__ArtStyleContainer-sc-1xc47b6-1';
    const styleDivs = await page.$$(ART_STYLE_SELECTOR)
    for await (let div of styleDivs) {
        if (!await isStyle(div, style)) {
            continue;
        }
        // console.log('found style ' + style)

        const selected = await div.$('.selected')
        if (!selected) {
            console.log('select ' + style)
            const clickableDiv = await div.$('div.ArtStyles__ArtStyleThumbnail-sc-1xc47b6-3')
            await clickableDiv.click();
        }

        break;
    }
}

async function clickCreateButton() {
    await delay(1000);
    const buttons = await page.$$('button');
    for await (let button of buttons) {
        const propertyHandle = await button.getProperty('textContent');
        const textContent = await propertyHandle.jsonValue();

        if (textContent !== 'Create') {
            continue;
        }

        const propertyDisabled = await button.getProperty('disabled');
        const disabled = await propertyDisabled.jsonValue();
        if (disabled) {
            throw new Error('Create button disabled')
        }

        await button.click();
        console.log('Creating...');

        return
    }
    console.log('no create button');
}

function getFilePath(id, style, iteration, fileEnding) {
    return `images/${id}-${style}-${iteration}.${fileEnding}`
}

async function singleGrab(id, prompt, style, iteration) {
    await clearTempCanvas();

    const PNG_PATH = getFilePath(id, style, iteration, 'png')
    if (fs.existsSync(PNG_PATH)) {
        console.log('already exists ' + PNG_PATH);
        return true
    }

    await ensurePrompt(prompt);
    await chooseStyle(style);
    await clickCreateButton()

    await delay(1000);

    const IMAGE_SELECTOR = 'img[src^="https://images.wombo.art/generated"]'
    await page.waitForSelector(IMAGE_SELECTOR, { timeout: 0 });

    await delay(500);

    const getDataUrlThroughCanvas = async (selector) => {
        const originalImage = document.querySelector(selector);
        originalImage.style.border = '3px solid red';
        const image = document.createElement('img');
        image.src = originalImage.src;
        image.crossOrigin = '*';

        // Ensure the image is loaded.
        await new Promise((resolve) => {
            if (image.complete || (image.width) > 0) resolve();
            image.addEventListener('load', () => resolve());
        });

        await new Promise(resolve => setTimeout(resolve, 1000));

        // Create a canvas and context to draw onto.
        const canvas = document.createElement('canvas');
        canvas.crossOrigin = '*';
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
            return {
                dataUrlPNG: canvas.toDataURL('image/png'),
                dataUrlJPEG: canvas.toDataURL('image/jpeg', 0.8),
            }
        } catch (error) {
            return { error };
        }
    };

    try {
        const { dataUrlJPEG, dataUrlPNG, error } = await page.evaluate(getDataUrlThroughCanvas, IMAGE_SELECTOR);
        if (error) {
            console.warn('ERROR [DATA URL]', error);
        } else {
            // await delay(5000);
            // const img = await page.waitForSelector('#scrape-canvas', { timeout: 0 });
            // await img.screenshot({
            //     path: `images/${id}-screenshot.jpg`,
            //     omitBackground: true,
            //     type: 'jpeg',
            // });

            function saveImage(dataUrl, outputPath) {
                const imageData = Buffer.from(dataUrl.split(',')[1], 'base64');
                fs.writeFileSync(outputPath, imageData);
            }

            saveImage(dataUrlJPEG, getFilePath(id, style, iteration, 'jpg'))
            saveImage(dataUrlPNG, PNG_PATH)

        }
    } catch (error) {
        console.warn('ERROR [FILE WRITE]', error);
    }
}



const styles = [
    'Anime v2',
    'Retro Sci-Fi v2',
    'Fantastical',
    'Simple Design v2',
    'Steampunk v2',
    'Gloomy',
]
CARDS.length
for (let index = 3; index < 6; index++) {
    const [id, prompt] = CARDS[index]
    for (let style of styles) {

        for (let iteration of [1,2]) {
            console.log(`ID: ${id}, PROMPT: ${prompt}, STYLE: ${style}, ITERATION: ${iteration}`)
            const skipped = await singleGrab(id, prompt, style, iteration);
            if (skipped) {
                continue;

            }
            await delay(20000, 40000);
        }
    }
    await delay(60000, 120000);
}

await delay(1000);
try {
    await browser.close();
} catch (error) {
    console.warn('ERROR [BROWSER CLOSE]');
}
