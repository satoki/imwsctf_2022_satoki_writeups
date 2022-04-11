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