import puppeteer from 'puppeteer';
import * as fs from "fs";

const CARDS = [
    [1009, 'Origin'],
    [1010, 'Whisk Away'],
    [1011, 'Unending Story'],
    [1012, 'Pitch Spell'],
    [1013, 'Spellbound Oracle'],
    [1014, 'Blitz Pitch'],

    [1015, 'Regrow from Ashes'],
    [1016, 'Shining Star Dragon'],
    [1017, 'Ether Remora'],
    [1018, 'Talisman of Earthen Desire'],
    [1019, 'Talisman of Heaven’s Grace'],
    [1020, 'Finanzblase'],
    [1021, 'Reinventing the Wheel'],
    [1022, 'Ventilator'],
    [1023, 'Space-time Compression/All Time as One'],
    [1024, 'Space-time Expansion'],
    [1025, 'Lightning Rod'],
    [1026, 'Master Thief'],
    [1027, 'Gifts Given'],
    [1028, 'Alchemic Protractor'],
    [1029, 'Philosopher’s Stoneshard'],
    [1030, 'Titan\'s Call'],
        [1031, 'MaRo'],
        [1032, 'Unheil Einnehmende Schlange'],
        [1033, 'Infinite Ouruboros'],
        [1034, 'Terracotta Printer'],
        [1035, 'Stolen Idol'],
        [1036, 'Quicken'],
        [1037, 'Niv-Mizzet, Parun'],
        [1038, 'Double-barreled Magic Wand'],
        [1039, 'Dualcast Wand'],
        [1040, 'Ragnaros, the Firelord'],
        [1041, 'Glimpse into the Future'],
        [1042, 'Feather, the Redeemed'],
        [1043, 'A Day\'s Work'],
            [1044, 'Feather, the Irredeemable'],
            [1045, 'Notreserve'],
            [1046, 'Resourceful Charm'],
            [1047, 'Spiritomb AR'],
            [1048, 'Darkness Grace'],
            [1049, 'Victini NVI'],
            [1050, 'Accumulate Support'],
            [1051, 'Emrakul, the Promised End'],
            [1052, 'Mass Offsprings'],
            [1053, 'Wrath of God'],
            [1054, 'Lasso Bumerang'],
            [1055, 'Ladder Climbing'],
            [1056, 'Walking the Stairs'],
            [1057, 'Porygon\'s Conversion'],
                [1058, 'Hamsterkäufe'],
                [1059, 'Back to Basics'],
                [1060, 'Doubling Down on the Basics'],
                [1061, 'Re-learn the Basics'],
                [1062, 'Equality'],
                [1063, 'Jeska, Thrice Reborn'],
                [1064, 'Immediate Impact'],
                [1065, 'Twin Sprout'],
                [1066, 'Quickdraw'],
                [1067, 'Forward Momentum'],
                [1068, 'Crystalline Ravine'],
                [1069, 'Instructor Fireheart'],
                [1070, 'Demonic Pact'],
                [1071, 'Autofill'],
                [1072, 'Coinlord'],
                [1073, 'Mother Dragon'],
                [1074, 'Air Elemental'],
                [1075, 'Proud Investor'],
                [1076, 'Boneyard'],
                [1077, 'Weave Reality'],
                [1078, 'Winds of Blessing'],
                [1079, 'Feuerwehr'],
                [1080, 'Burning to the Ground'],
                [1081, 'See the World Burn'],
                [1082, 'Catching Fire'],
                [1083, 'Up the Beanstalk'],
                [1084, 'Force of Will'],
                [1085, 'Fabricate Gold'],
                [1086, 'Go Shopping'],
                [1087, 'Read the Scriptures'],
                [1088, 'Refund'],
                [1089, 'Reiche Ernte'],
                [1090, 'Windy Partner'],
                [1091, 'Gandora, Dragon of Destruction'],
                [1092, 'Gandora-X, Dragon of Demolition'],
                [1093, 'Dryscale Deputy'],
                [1094, 'Slow Play'],
                [1095, 'Everburning Flame'],
                [1096, 'Gaslight Gatekeeper/Wheel of Fortune'],
                [1097, 'Miracle Salesman'],
                [1098, 'Holy Springwater'],
                [1099, 'Final Boss, Second Form'],
]

async function delay(minTime, maxTime = minTime) {
    return new Promise(function(resolve) {
        setTimeout(resolve, Math.random() * (maxTime - minTime) + minTime)
    });
}

const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
    args: [
        '--start-maximized',
        '--disable-web-security',
    ],
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

async function dismissLoginOverlay2() {
    while (true) {
        const overlaySelector = ".Overlay__ModalBody-sc-1pt5jsh-1"
        const newCloseButtonSelector = ".IconButton__IconContainer-sc-145zyhb-2.htLZEn"
        const overlay = await page.waitForSelector(overlaySelector, { timeout: 0 })
        await delay(500);
        const closeButton = await overlay.waitForSelector(newCloseButtonSelector, { timeout: 0 })
        await closeButton.click()
        await delay(500);
    }
}

dismissModalWindow();
dismissLoginOverlay();

dismissLoginOverlay2();

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
    return `images/${id}.${fileEnding}`
    return `images/${id}-${style}-${iteration}.${fileEnding}`
}

const MAKE_PNG_FILE = false;
const MAKE_JPG_FILE = true;

async function singleGrab(id, prompt, style, iteration) {
    await clearTempCanvas();

    const PNG_PATH = getFilePath(id, style, iteration, 'png')
    const JPG_PATH = getFilePath(id, style, iteration, 'jpg')

    const pngExists = fs.existsSync(PNG_PATH)
    if (pngExists || fs.existsSync(JPG_PATH)) {
        console.log('already exists ' + pngExists ? PNG_PATH : JPG_PATH);
        return true
    }

    await ensurePrompt(prompt);
    await chooseStyle(style);
    await clickCreateButton()

    await delay(1000);

    const IMAGE_SELECTOR = 'img[src^="https://images.wombo.art/generated"]'
    await page.waitForSelector(IMAGE_SELECTOR, { timeout: 0 });

    await delay(5000);

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

            if (MAKE_PNG_FILE) {
                saveImage(dataUrlPNG, PNG_PATH)
            }
            if (MAKE_JPG_FILE) {
                saveImage(dataUrlJPEG, JPG_PATH)
            }

        }
    } catch (error) {
        console.warn('ERROR [FILE WRITE]', error);
    }
}



const styles = [
    "Dreamland v2",
    "Ink v3",
    "Dark Fantasy v3",
    "Baroque v3",
    "Horror v3",
    "Dreamland v3",
    "Monster v3",
    "Anime v2.1",
    "Realistic v2",
    "Figure v3",
    "Abstract v2",
    "Simple Design v2",
    "Anime v2",
    "Retro Sci-Fi v2",
    "Spectral",
    "Figure",
    "Realistic",
    "Comic",
    "Anime",
    "HDR",
    "Steampunk v2",
    "Nightly v2",
    "Horror Cut v2.1",
    "The Absurd v2",
    "Ink v2",
    "Dreamwave v2",
    "Horror Cut v2.0",
    "Mystical",
    "Dark Fantasy",
    "Vibrant",
    "Toasty",
    "The Bulio Cut",
    "The Cut",
    "Gloomy",
    "Expressionism v2",
    "Expressionism",
    "Festive",
    "Soft Touch",
    "Splatter",
    "Flora",
    "Abstract",
    "Diorama",
    "Vector",
    "Fantastical",
    "Cartoonist",
    "Bad Trip",
    "Isometric",
    "Retro-Futurism",
    "Analogue",
    "Paint",
    "Polygon",
    "Gouache",
    "Ink",
    "Line-Art",
    "Malevolent",
    "Surreal",
    "Unrealistic",
    "Throwback",
    "Street Art",
    // "No Style",
    "Ghibli",
    // "Melancholic",
    "Pandora",
    "Daydream",
    "Provenance",
    "Arcane",
    "Radioactive",
    "Love",
    "Death",
    "Surreal",
    "Transitory",
    "Robots",
    "Moonwalker",
    "Psychic",
    "Etching",
    "Pastel",
    "Baroque",
    // "Wuhtercuhler",
    // "HD",
    "Fantasy Art",
    "Steampunk",
    "Blacklight",
    "S.Dali",
    // "Rose Gold",
    "Psychedelic",
    // "Ukiyoe",
    "Synthwave"
]

CARDS.length
for (let index = 0; index < CARDS.length; index++) {
    const [id, prompt] = CARDS[index]
    // get random element of styles

    const randomIndex = Math.floor(Math.random() * styles.length);
    const style = styles[randomIndex];
    // for (let style of styles) {

    const iteration = 1;
        // for (let iteration of [1,2,3,4]) {
            console.log(`ID: ${id}, PROMPT: ${prompt}, STYLE: ${style}, ITERATION: ${iteration}`)
            const skipped = await singleGrab(id, prompt, style, iteration);
            if (skipped) {
                continue;

            }
            await delay(30000, 150000);
        // }
    // }
    // await delay(60000, 120000);
}

await delay(1000);
try {
    await browser.close();
} catch (error) {
    console.warn('ERROR [BROWSER CLOSE]');
}
