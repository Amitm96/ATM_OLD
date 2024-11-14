const puppeteer = require('puppeteer');
const date = require('date-and-time');
//const robot = require("robotjs");
const robot = require('node-key-sender');

const vision = require('./vision');

const delay = (ms) =>
    new Promise((resolve) => setTimeout(resolve, ms));
const html = async (page, handle) => page.evaluate(el => el.innerHTML, handle);
const text = async (page, handle) => page.evaluate(el => el.innerText, handle);

async function timeMe(num, txt) {
    let now = new Date();
    let time = date.format(now, 'dddd MM/DD/YYYY HH:mm:ss, ');
    console.log(time, txt);
}

process.on("unhandledRejection", async (reason, p) => {
    console.error("Unhandled Rejection at: Promise (new page)", p, "reason:", reason);
    //browser && browser.close();
    //await delay(5000);
    //process.exit(1);
});

//Globals
let browser;
let page;
let loginCaptcha;

async function createPage() {
    const pages = await browser.pages();

    page = pages[0];
    page.on('dialog', async dialog => {
        console.log("the dialog message is", dialog.message());
        console.log("the dialog type is", dialog.type());
        try {
            await dialog.accept();
        } catch (ex) {
            console.error(ex);
        }
        timeMe(1, 'Dismiss Dialog...');
    });

    page.on('response', async response => {
        const url = response.url();
        const type = response.request().resourceType();

        if (type === 'image' && url.toLowerCase().includes('cap_img.jsp')) {
            if (loginCaptcha) {
                return;
            }
            const file = await response.buffer();
            loginCaptcha = vision(file);
        }
    });

    page.setDefaultTimeout(300000);
    page.setDefaultNavigationTimeout(600000);
}


async function createBrowser() {
    if (!browser) {
        try {
            browser = await puppeteer.connect({
                headless: false,
                //executablePath: "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
                browserURL: 'http://localhost:9222',
                defaultViewport: {
                    width: 1366,
                    height: 768,
                },
            });
        } catch (ex) {
            console.error(ex);
            browser = await puppeteer.launch({
                headless: false,
                executablePath: process.platform == 'win32' ? 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe' : '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
                defaultViewport: {
                    width: 1476,
                    height: 830,
                },
                timeout: 0,
                args: [
                    '--kiosk-printing',
                    '--disable-background-timer-throttling',
                    '--enable-print-preview',
                    '--incognito',
                ],
            });
        }
    }

    browser.on('disconnected', (e) => {
        console.log('browser disconnected, trying to connect after 1min');
        browser = null;
        page = null;
        setTimeout(async () => {
            await createBrowser();
            await createPage();
        }, 10000);
    });
}

async function init() {
    await createBrowser();
    await createPage();
};


exports.vehicleDetails = async function () {
    loginCaptcha = null;
    await page.goto('https://vahan.nic.in/nrservices/faces/user/searchstatus.xhtml', { waitUntil: ['networkidle2'] });
    const nameSel = '#regn_no1_exact';
    const captchaSel = '#txt_ALPHA_NUMERIC';

    while (!loginCaptcha) {
        console.log('sleeping for 5s');
        await delay(5000);
    }

    let success = false;

    while (!success) {
        let captchaValue = await loginCaptcha;
        loginCaptcha = null;
        console.log('loginCaptcha', captchaValue);

        await page.$eval(nameSel, (el) => el.value = 'OD35E3434');
        await page.type(captchaSel, captchaValue);
        await page.click('button[type="submit"]');
        try {
            await page.waitForSelector('table', { timeout: 10000 });
            success = true;
        } catch (ex) {
            console.error(ex);
        }
    }

    const result = await page.$eval('table', (table) => {
        // const tds = table.querySelectorAll('td');
        // const result = {};
        // for (let i = 0; i < tds.length;) {
        //     if ((i + 1) < tds.length) {
        //         result[tds[i].innerText] = result[tds[i + 1]].innerText;
        //     }
        //     else {
        //         const arr = tds[i].innerText.split(':');
        //         result[arr[0]] = arr[1];
        //     }
        //     i += 2;
        // }
        return table.innerText;
    });

    console.log('result', result);
}


if (require.main == module) {
    (async function () {
        await init();
        exports.vehicleDetails();
    })();
}