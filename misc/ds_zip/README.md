# ð§ DS_Zip

## åé¡æ
ç·å½ããæ»æãã§ããªãå¼·åãªãã¹ã¯ã¼ãã§å§ç¸®ãã¾ããã  
ã§ããã¡ãã¡ã»ã­ã¥ãªãã£zipã§ãã  
`DS_Store_Sample`ã¯.DS_Storeã®ãµã³ãã«ã§zipåã®ãã®ã¨ã¯ä¸é¨ç°ãªãã¾ãã  
ãã©ã°ã¯`flag{æå­å}`ã®å½¢å¼ã§ãã  
[problem.zip](files/problem.zip)ããããã[DS_Store_Sample](files/DS_Store_Sample)  

## é£æåº¦
**8å²è§£ãã**  

## ä½åã«ããã£ã¦
æåã«ãªã£ãã[macOSã®æå·åzipãã¡ã¤ã«ã¯ãã¹ã¯ã¼ãç¡ãã§è§£åã§ãã](https://blog.nflabs.jp/entry/2021/10/06/095121)ãããã®ã¾ã¾åºãã¾ããã  
.DS_Storeãå¥ã£ãç¹å®ã®æ§é ã®zipã¯æ¢ç¥å¹³ææ»æãæå¹ã§ããã¨ãããã®ã§ãã  
ããã ããªã®ã§8å²è§£ããã¨æã£ã¦ãã¾ãã  
ã¡ãªã¿ã«éå¸ããproblem.zipã®ãã¹ã¯ã¼ãã¯`b23c4ef034a1cb793bcf4ac296d11edb71903784b2c76d2ae0b7321b20790851`ã§ããã  

## è§£æ³
problem.zipãéå¸ããã¦ãããããã¹ã¯ã¼ããããã£ã¦ããããã ã  
```bash
$ zipinfo problem.zip
Archive:  problem.zip
Zip file size: 812 bytes, number of entries: 3
drwxr-xr-x  3.0 unx        0 bx stor 22-Mar-10 22:40 problem/
-rw-r--r--  3.0 unx     6148 BX defN 22-Mar-10 22:40 problem/.DS_Store
-rw-r--r--  3.0 unx       37 TX stor 22-Mar-10 22:38 problem/flag.txt
3 files, 6185 bytes uncompressed, 268 bytes compressed:  95.7%
```
ä¸­ã«ã¯æªãã.DS_Storeã¨flag.txtãè¦ããã  
flag.txtãåãåºãã°ããã®ã§ãæ¢ç¥å¹³ææ»æã®ã§ããzipcryptoã§ãããã¨ãç¥ã£ã¦ã  
[macOSã®æå·åzipãã¡ã¤ã«ã¯ãã¹ã¯ã¼ãç¡ãã§è§£åã§ãã](https://blog.nflabs.jp/entry/2021/10/06/095121)  
[macOSã®æå·åzipã®è©±ã®ç¶ã](https://blog.nflabs.jp/entry/2021/12/22/094845)  
ã®2ã¤ã®è¨äºéãã«è¡ãã°ããã  
ã¾ãã¯éå¸ããã`DS_Store_Sample`ãç¨ãã¦zipåã®.DS_Storeãçæããã  
2ã¤ç®ã®è¨äºã®éããCRC32å¤ããXYåº§æ¨ãå²ãåºãã  
```bash
$ zipinfo -v problem.zip problem/.DS_Store | grep CRC
  32-bit CRC value (hex):                         cd51aa2e
```
`cd51aa2e`ã®ããã ã  
åº§æ¨ãå²ãåºãã¹ã¯ãªããxy_zip.pyã¯è¨äºããå¼ç¨ããä»¥ä¸ã®ããã«ãªãã  
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
ä»¥ä¸ã®ããã«å®è¡ããã  
```bash
$ python xy_zip.py DS_Store_Sample cd51aa2e
Found: x=0x9c y=0x4b
```
XYåº§æ¨ãããã£ãã®ã§`DS_Store_Sample`ããã¤ããªã¨ãã£ã¿ãªã©ã§ç·¨éããã  
ç·¨éå¾ã®ãã¡ã¤ã«ã`DS_Store_Sample_9c_4b`ã¨ããã  
```bash
$ mkdir problem
$ cp DS_Store_Sample_9c_4b problem
$ zip plain.zip problem/*
  adding: problem/DS_Store_Sample_9c_4b (deflated 96%)
```
`plain.zip`ã¨ãã¦åºãã¦ãä»¥ä¸ã®ããã«bkcrackã§æ°ããªãã¹ã¯ã¼ããè¨­å®ãããzipãçæããã  
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
ãã¹ã¯ã¼ãã`ok`ã§ãã`ok.zip`ãçæãããã®ã§è§£åããã  
```bash
$ unzip -P ok ok.zip
Archive:  ok.zip
  inflating: problem/.DS_Store
 extracting: problem/flag.txt
$ cat problem/flag.txt
flag{Beware_of_invisible_assassins!}
```
flagãå¾ãããã  

## flag{Beware_of_invisible_assassins!}