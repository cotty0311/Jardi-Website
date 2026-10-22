"""Run after editing images: python3 scripts/optimize-images.py (requires Pillow)."""
from pathlib import Path
from hashlib import sha256
import json
from PIL import Image, ImageOps

root = Path(__file__).resolve().parent.parent
images = root / 'content/images'
manifest = {}
for source in sorted(images.rglob('*')):
    if source.suffix.lower() not in ('.png', '.jpg', '.jpeg'):
        continue
    image = ImageOps.exif_transpose(Image.open(source))
    limit = 1600 if 'screenshot' in source.parts else 600
    image.thumbnail((limit, limit), Image.Resampling.LANCZOS)
    image.save(source.with_suffix('.webp'), 'WEBP', quality=88, method=6)
    manifest[str(source.relative_to(images))] = sha256(source.read_bytes()).hexdigest()
(images / 'optimized.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + '\n')
print(f'Optimized {len(manifest)} images.')
