const express = require("express");
const beautify = require("js-beautify");
const playwright = require("playwright");


var app = express();

function sanitize(text) {
    return String(text).replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
}

async function http_get(url) {
    const browser = await playwright.chromium.launch({headless: true});
    const context = await browser.newContext();
    const page = await context.newPage();

    let flag = "This source code is yummy !!!<br>";

    page.on("dialog", async dialog => {
        /* <script>alert('Satoki');</script> */
        if (dialog.type() === "alert") {
            flag = process.env.FLAG; // Congrats!
            console.log("[flag]: " + url);
        }
        await dialog.accept();
    });

    /* Can you execute JavaScript on view-source: ? */
    try {
        // First bite
        await page.goto("view-source:" + url, {timeout: 2000});
        flag += "<pre><code>" + sanitize(beautify.html(await page.content())) + "</code></pre>";
    } catch (error) {console.log("[error]: " + error);}
    await page.waitForTimeout(100);

    try {
        // Second bite
        await page.reload();
    } catch (error) {console.log("[error]: " + error);}
    await page.waitForTimeout(100);

    await browser.close();

    return flag;
}

app.get("/", async (req, res) => {

    let url = req.query["url"];
    if (!url) {
        url = "Undefind";
    }

    console.log("[log]: " + url);

    if (url.slice(0, 7) !== "http://" && url.slice(0, 8) !== "https://") {
        res.send("http:// or https:// !!!!!<br>?url=" + sanitize(url));
    } else {
        res.send(await http_get(url));
    }

});

app.listen(3000, () => {
    console.log("Listening on port 3000");
});