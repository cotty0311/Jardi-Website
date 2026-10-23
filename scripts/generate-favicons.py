"""Regenerate browser icons from the existing icon.png (requires Pillow)."""
from pathlib import Path
from PIL import Image, ImageOps

root = Path(__file__).resolve().parent.parent
source = Image.open(root / 'content/images/icon.png').convert('RGBA')
output = root / 'favicon'
output.mkdir(exist_ok=True)
for size in (16, 32):
    image = ImageOps.pad(source, (size, size), method=Image.Resampling.LANCZOS,
                         color=(0, 0, 0, 0))
    image.save(output / f'favicon-{size}x{size}.png', optimize=True)
ImageOps.pad(source, (180, 180), method=Image.Resampling.LANCZOS, color=(0, 0, 0, 0)).save(output / 'apple-touch-icon.png', optimize=True)
source.save(output / 'favicon.ico', format='ICO', sizes=[(16, 16), (32, 32)],
            bitmap_format='bmp')
print('Generated favicon.ico (16 + 32), favicon-16x16.png, favicon-32x32.png')
