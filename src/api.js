const puppeteer = require("puppeteer");
const qrcode = require("qrcode-terminal");
const { from, merge } = require('rxjs');
const { take } = require('rxjs/operators');
const path = require('path');
const rimraf = require("rimraf");

let browser = null;
let page = null;
let counter = { fails: 0, success: 0 };
const tmpPath = path.resolve(__dirname, '../tmp');

/**
 * Initialize browser, page and setup page desktop mode
 */
async function start({ showBrowser = false, qrCodeData = false, session = true } = {}) {
    if (!session) {
        deleteSession();
    }

    const args = {
        headless: !showBrowser,
        userDataDir: tmpPath,
        args: ["--no-sandbox"]
    };

    try {
        browser = await puppeteer.launch(args);
        page = await browser.newPage();

        // Prevent dialog blocking page and just accept it (necessary when a message is sent too fast)
        page.on("dialog", async dialog => { await dialog.accept(); });

        // Fix the Chrome headless mode issues
        await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36");
        page.setDefaultTimeout(60000);

        await page.goto("https://web.whatsapp.com");

        if (session && await isAuthenticated()) {
            return;
        } else {
            if (qrCodeData) {
                console.log('Getting QRCode data...');
                console.log('Note: You should use wbm.waitQRCode() inside wbm.start() to avoid errors.');
                return await getQRCodeData();
            } else {
                await generateQRCode();
            }
        }
    } catch (err) {
        deleteSession();
        throw err;
    }
}

/**
 * Check if user is authenticated by either needing to scan QR code or being inside the chat
 */
async function isAuthenticated() {
    console.log('Authenticating...');
    return merge(needsToScan(), isInsideChat())
        .pipe(take(1))
        .toPromise();
}

function needsToScan() {
    return from(
        page.waitForSelector('body > div > div > .landing-wrapper', { timeout: 0 })
            .then(() => false)
    );
}

function isInsideChat() {
    return from(
        page.waitForFunction(`document.getElementsByClassName('two')[0]`, { timeout: 0 })
            .then(() => true)
    );
}

/**
 * Delete session directory
 */
function deleteSession() {
    rimraf.sync(tmpPath);
}

/**
 * Retrieve QR Code data from the page
 */
async function getQRCodeData() {
    await page.waitForSelector("div[data-ref]", { timeout: 60000 });
    const qrcodeData = await page.evaluate(() => {
        let qrcodeDiv = document.querySelector("div[data-ref]");
        return qrcodeDiv.getAttribute("data-ref");
    });
    return qrcodeData;
}

/**
 * Generate QR Code and display it in the terminal
 */
async function generateQRCode() {
    try {
        console.log("Generating QRCode...");
        const qrcodeData = await getQRCodeData();
        qrcode.generate(qrcodeData, { small: true });
        console.log("QRCode generated! Scan it using Whatsapp App.");
    } catch (err) {
        throw await QRCodeException("QR Code can't be generated (maybe your connection is too slow).");
    }
    await waitQRCode();
}

/**
 * Wait for QR Code to be hidden, indicating it has been scanned
 */
async function waitQRCode() {
    try {
        await page.waitForSelector("div[data-ref]", { timeout: 30000, hidden: true });
    } catch (err) {
        throw await QRCodeException("Don't be late to scan the QR Code.");
    }
}

/**
 * Close browser and show an error message
 */
async function QRCodeException(msg) {
    await browser.close();
    return `QRCodeException: ${msg}`;
}

/**
 * Send a message to a specified phone number
 */
async function sendTo(phoneOrContact, message) {
    let phone = phoneOrContact;
    if (typeof phoneOrContact === "object") {
        phone = phoneOrContact.phone;
        message = generateCustomMessage(phoneOrContact, message);
    }

    try {
        process.stdout.write("Sending Message...\r");
        await page.goto(`https://web.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(message)}`);
        await page.waitForSelector("div#startup", { hidden: true, timeout: 60000 });
        await page.waitForSelector('#main > footer > div.vR1LG._3wXwX.copyable-area > div._2A8P4 > div > div._2_1wd.copyable-text.selectable-text', { timeout: 1000 });
        await page.keyboard.press("Enter");
        await page.waitFor(2000);
        process.stdout.clearLine();
        process.stdout.cursorTo(0);
        console.log(`${phone} Sent`);
        counter.success++;
    } catch (err) {
        process.stdout.clearLine();
        process.stdout.cursorTo(0);
        console.log(`${phone} Failed`);
        counter.fails++;
    }
}

/**
 * Send the same message to multiple phone numbers
 */
async function send(phoneOrContacts, message) {
    for (let phoneOrContact of phoneOrContacts) {
        await sendTo(phoneOrContact, message);
    }
}

/**
 * Generate a custom message by replacing placeholders with contact properties
 */
function generateCustomMessage(contact, messagePrototype) {
    let message = messagePrototype;
    for (let property in contact) {
        message = message.replace(new RegExp(`{{${property}}}`, "g"), contact[property]);
    }
    return message;
}

/**
 * Close the browser and display the results of the message sending
 */
async function end() {
    await browser.close();
    console.log(`Result: ${counter.success} sent, ${counter.fails} failed`);
}

module.exports = {
    start,
    send,
    sendTo,
    end,
    waitQRCode
};
