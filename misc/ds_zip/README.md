# 🧊 DS_Zip

## 問題文
総当たり攻撃ができない強力なパスワードで圧縮しました。  
でもダメダメセキュリティzipです。  
`DS_Store_Sample`は.DS_Storeのサンプルでzip内のものとは一部異なります。  
フラグは`flag{文字列}`の形式です。  
[problem.zip](files/problem.zip)　　　　　[DS_Store_Sample](files/DS_Store_Sample)  

## 難易度
**8割解ける**  

## 作問にあたって
有名になった「[macOSの暗号化zipファイルはパスワード無しで解凍できる](https://blog.nflabs.jp/entry/2021/10/06/095121)」をそのまま出しました。  
.DS_Storeが入った特定の構造のzipは既知平文攻撃が有効であるというものです。  
やるだけなので8割解けると思っています。  
ちなみに配布したproblem.zipのパスワードは`b23c4ef034a1cb793bcf4ac296d11edb71903784b2c76d2ae0b7321b20790851`でした。  

## 解法
problem.zipが配布されているが、パスワードがかかっているようだ。  
```bash
$ zipinfo problem.zip
Archive:  problem.zip
Zip file size: 812 bytes, number of entries: 3
drwxr-xr-x  3.0 unx        0 bx stor 22-Mar-10 22:40 problem/
-rw-r--r--  3.0 unx     6148 BX defN 22-Mar-10 22:40 problem/.DS_Store
-rw-r--r--  3.0 unx       37 TX stor 22-Mar-10 22:38 problem/flag.txt
3 files, 6185 bytes uncompressed, 268 bytes compressed:  95.7%
```
中には怪しい.DS_Storeとflag.txtが見える。  
flag.txtを取り出せばよいので、既知平文攻撃のできるzipcryptoであることを祈って、  
[macOSの暗号化zipファイルはパスワード無しで解凍できる](https://blog.nflabs.jp/entry/2021/10/06/095121)  
[macOSの暗号化zipの話の続き](https://blog.nflabs.jp/entry/2021/12/22/094845)  
の2つの記事通りに行えばよい。  
まずは配布された`DS_Store_Sample`を用いてzip内の.DS_Storeを生成する。  
2つ目の記事の通り、CRC32値からXY座標を割り出す。  
```bash
$ zipinfo -v problem.zip problem/.DS_Store | grep CRC
  32-bit CRC value (hex):                         cd51aa2e
```
`cd51aa2e`のようだ。  
座標を割り出すスクリプトxy_zip.pyは記事から引用し、以下のようになる。  
```python
# ref. https://blog.nflabs.jp/entry/2021/12/22/094845
import sys
import struct
import binascii

CHECK_BIT_NUM = 8

def calc_crc32(check):
    crc32 = (binascii.crc32(check) & 0xFFFFFFFF)
    return "%08x" % crc32

def find_pos(data, crc32):
    beacon = b"Ilocblob\x00\x00\x00\x10"
    split_data = data.split(beacon)
    first_block = split_data[0] + beacon
    last_block = split_data[1][8:]
    for y in range(2**CHECK_BIT_NUM):
        for x in range(2**CHECK_BIT_NUM):
            check_str = b"".join([first_block, struct.pack(">I", x), struct.pack(">I", y) + last_block])
            if crc32 == calc_crc32(check_str):
                print(f"Found: x={hex(x)} y={hex(y)}")

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print(f"Usage: {sys.argv[0]} ds_store_file crc32")
        exit()
    with open(sys.argv[1], "rb") as f:
        s = f.read()
        find_pos(s, sys.argv[2])
```
以下のように実行する。  
```bash
$ python xy_zip.py DS_Store_Sample cd51aa2e
Found: x=0x9c y=0x4b
```
XY座標がわかったので`DS_Store_Sample`をバイナリエディタなどで編集する。  
編集後のファイルを`DS_Store_Sample_9c_4b`とする。  
```bash
$ mkdir problem
$ cp DS_Store_Sample_9c_4b problem
$ zip plain.zip problem/*
  adding: problem/DS_Store_Sample_9c_4b (deflated 96%)
```
`plain.zip`として固めて、以下のようにbkcrackで新たなパスワードが設定されたzipを生成する。  
```bash
$ wget https://github.com/kimci86/bkcrack/releases/download/v1.3.5/bkcrack-1.3.5-Linux.tar.gz
$ tar -zxvf bkcrack-1.3.5-Linux.tar.gz
~~~
$ ./bkcrack-1.3.5-Linux/bkcrack -C problem.zip -c problem/.DS_Store -P plain.zip -p problem/DS_Store_Sample_9c_4b -U ok.zip ok
bkcrack 1.3.5 - 0000-00-00
[00:00:00] Z reduction using 223 bytes of known plaintext
100.0 % (223 / 223)
[00:00:00] Attack on 38213 Z values at index 8
Keys: 0281a98d 63604745 7610ef8f
36.8 % (14046 / 38213)
[00:00:00] Keys
0281a98d 63604745 7610ef8f
[00:00:00] Writing unlocked archive ok.zip with password "ok"
100.0 % (2 / 2)
Wrote unlocked archive.
```
パスワードが`ok`である`ok.zip`が生成されるので解凍する。  
```bash
$ unzip -P ok ok.zip
Archive:  ok.zip
  inflating: problem/.DS_Store
 extracting: problem/flag.txt
$ cat problem/flag.txt
flag{Beware_of_invisible_assassins!}
```
flagが得られた。  

## flag{Beware_of_invisible_assassins!}