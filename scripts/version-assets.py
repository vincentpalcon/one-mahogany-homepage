"""Refresh local asset URLs after generating the static website.

Keep browser caching useful while changing URLs whenever file contents change.
Bump CACHE_EPOCH to force a refresh of every asset for a deployment.
"""
from pathlib import Path
from urllib.parse import urlsplit, urlunsplit, parse_qsl, urlencode
import hashlib
import json
import re

ROOT = Path(__file__).resolve().parent.parent
CACHE_EPOCH = '20261102a'


def version_url(value, directory=ROOT):
    parts = urlsplit(value)
    if parts.scheme or parts.netloc or not parts.path or parts.path.startswith('/'):
        return value
    target = (directory / parts.path).resolve()
    if not target.is_file() or not target.is_relative_to(ROOT) or target.suffix == '.html':
        return value
    revision = CACHE_EPOCH + '-' + hashlib.sha256(target.read_bytes()).hexdigest()[:12]
    query = [(key, val) for key, val in parse_qsl(parts.query) if key != 'v']
    query.append(('v', revision))
    return urlunsplit(('', '', parts.path, urlencode(query), parts.fragment))


# Fonts/images referenced by CSS must change before hashing each stylesheet.
for css in ROOT.glob('*.css'):
    def css_url(match):
        value = match.group(1).strip().strip('\"\'')
        updated = version_url(value, css.parent)
        return match.group(0) if updated == value else 'url("' + updated + '")'
    css.write_text(re.sub(r'url\(([^)]+)\)', css_url, css.read_text()))

# Hero footage and posters are selected dynamically, so version their URL helper too.
media = hashlib.sha256()
for folder in ['assets/images/hero', 'assets/video/hero']:
    for path in sorted((ROOT / folder).glob('*')):
        if path.suffix not in ['.webp', '.mp4']:
            continue
        media.update(path.name.encode())
        media.update(path.read_bytes())
script = ROOT / 'script.js'
script.write_text(re.sub(r"const heroMediaVersion = '[^']*';", "const heroMediaVersion = '" + CACHE_EPOCH + '-' + media.hexdigest()[:12] + "';", script.read_text()))

manifest = ROOT / 'site.webmanifest'
config = json.loads(manifest.read_text())
for icon in config.get('icons', []):
    icon['src'] = version_url(icon['src'])
manifest.write_text(json.dumps(config, indent=2) + '\n')

# This includes stylesheets, scripts, icons, images, videos, posters and font preloads.
attribute = re.compile(r'''(\b(?:src|href|poster)\s*=\s*)(["'])([^"']*)\2''')
for page in ROOT.glob('*.html'):
    page.write_text(attribute.sub(lambda m: m[1] + m[2] + version_url(m[3]) + m[2], page.read_text()))
print('Updated content-based cache versions for all local assets.')
