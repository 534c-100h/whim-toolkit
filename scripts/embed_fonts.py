#!/usr/bin/env python3
"""把 fonts/ 下的字体文件以 base64 写入 index.html 的 FONT_B64 常量。

替换 index.html 后字体内嵌数据与 fonts/ 保持一致；内容未变时重复执行无副作用。
"""
import base64
import pathlib
import re

ROOT = pathlib.Path(__file__).resolve().parents[1]

FONTS = {
    'pigpenTtf':   'fonts/PigpenCipher.ttf',
    'asciiTtf':    'fonts/VerticalASCII-Regular.ttf',
    'asciiWoff':   'fonts/VerticalASCII-Regular.woff',
    'roundedTtf':  'fonts/VerticalASCIIRounded-Regular.ttf',
    'roundedWoff': 'fonts/VerticalASCIIRounded-Regular.woff',
}


def main():
    target = ROOT / 'index.html'
    html = target.read_text(encoding='utf-8')
    for key, rel in FONTS.items():
        path = ROOT / rel
        if not path.is_file():
            raise SystemExit(f'缺少字体文件：{path}')
        b64 = base64.b64encode(path.read_bytes()).decode('ascii')
        html, n = re.subn(rf"({re.escape(key)}: ')[^']*(')", rf'\g<1>{b64}\g<2>', html)
        if n != 1:
            raise SystemExit(f'FONT_B64.{key} 匹配到 {n} 处（应为 1），中止')
    target.write_text(html, encoding='utf-8')
    print(f'已把 {len(FONTS)} 个字体文件写入 {target}')


if __name__ == '__main__':
    main()
