#!/usr/bin/env python3
"""
Extracts species accounts and pictures from the two field guides (PDFs you own)
and links them to species in the catalogue:

  Birds of East Africa (Stevenson & Fanshawe)   -> identification, status & habitat,
                                                   voice, plus a crop of the plate
  Jonathan Scott's Safari Guide to East African -> the chapter's sections (habitat,
  Animals                                          food, ...) plus its photos and captions
  Coastal Fishes of the Western Indian Ocean    -> description, distribution, remarks,
  (Heemstra et al., 5 volumes + colour plates)     plate photos and line drawings

Writes
  public/books/books.json   accounts per species id      } local only: git-ignored,
  public/books/img/...      plate crops and photos       } never committed or deployed
  src/lib/data/book-facts.json  bird lengths and Kenyan abundance, fish sizes (facts only; committed)
  src/lib/data/book-species.json  Kenyan fish in the WIO guide that iNaturalist has no Kenyan
                                  records of; npm run species adds them (facts only; committed)

  npm run books                 (needs poppler: brew install poppler; python packages Pillow + numpy)
  npm run books -- --only wiof  re-extract one book, keeping the others' output

PDFs are found anywhere under sources/ (or the project folder).

The books are copyrighted, so their text and pictures stay on this machine.
The app shows them when public/books/ exists and quietly skips them otherwise.
"""
from __future__ import annotations

import glob
import hashlib
import json
import os
import re
import subprocess
import sys
import tempfile
import time
import urllib.parse
from xml.etree import ElementTree as ET

import numpy as np
from PIL import Image, ImageFilter

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT_DIR = os.path.join(ROOT, 'public', 'books')
IMG_DIR = os.path.join(OUT_DIR, 'img')
FACTS = os.path.join(ROOT, 'src', 'lib', 'data', 'book-facts.json')
CACHE = os.path.join(ROOT, '.cache', 'books')
XHTML = '{http://www.w3.org/1999/xhtml}'

SOURCES = {
    'boea': {
        'title': 'Birds of East Africa',
        'authors': 'Terry Stevenson & John Fanshawe',
        'edition': '2nd edition, Helm 2020',
        'glob': 'Birds of East Africa*.pdf',
    },
    'safari': {
        'title': "Jonathan Scott's Safari Guide to East African Animals",
        'authors': 'Jonathan Scott',
        'edition': 'Kensta',
        'glob': 'Safari Guide to East African Animals*.pdf',
    },
    'wiof': {
        'title': 'Coastal Fishes of the Western Indian Ocean',
        'authors': 'Heemstra et al. (eds)',
        'edition': 'NRF-SAIAB 2022',
        'glob': '*wiof_volume_*.pdf',
    },
}
BOOK_SPECIES = os.path.join(ROOT, 'src', 'lib', 'data', 'book-species.json')


def find_pdfs(pattern: str) -> list[str]:
    for d in (os.path.join(ROOT, 'sources', '**'), ROOT, os.path.join(ROOT, 'books')):
        hits = sorted(glob.glob(os.path.join(d, pattern), recursive=True))
        if hits:
            return hits
    return []


def find_pdf(pattern: str) -> str | None:
    hits = find_pdfs(pattern)
    return hits[0] if hits else None


def run(*args: str) -> str:
    return subprocess.run(args, check=True, capture_output=True, text=True).stdout


# ---------------------------------------------------------------------------
# Catalogue matching

def binomial(s: str) -> str:
    return ' '.join(s.lower().split()[:2])


def norm_name(s: str) -> str:
    s = s.lower().replace('’', "'").replace('grey', 'gray')
    s = re.sub(r"'s\b", 's', s)
    return re.sub(r'[^a-z]', '', s)


class Catalogue:
    def __init__(self):
        species = json.load(open(os.path.join(ROOT, 'src', 'lib', 'data', 'species.json')))
        # Species added from book-species.json don't count as known: they are re-derived each run.
        # Keep their ids, though: a hand-written entry may have given one its own id.
        self.book_ids = {binomial(s['scientificName']): s['id'] for s in species if s.get('fromBook')}
        species = [s for s in species if not s.get('fromBook')]
        self.by_sci = {binomial(s['scientificName']): s for s in species}
        self.by_name = {}
        for s in species:
            self.by_name.setdefault((s['category'], norm_name(s['name'])), s)
        self.by_inat = {s['inatId']: s for s in species if s.get('inatId')}
        os.makedirs(CACHE, exist_ok=True)
        self.last_call = 0.0

    def inat_search(self, q: str) -> list[dict]:
        """iNaturalist name search (handles synonyms), cached on disk."""
        url = 'https://api.inaturalist.org/v1/taxa?' + urllib.parse.urlencode(
            {'q': q, 'per_page': 5, 'locale': 'en'})
        path = os.path.join(CACHE, hashlib.sha1(url.encode()).hexdigest() + '.json')
        if os.path.exists(path):
            return json.load(open(path))
        time.sleep(max(0, self.last_call + 1.1 - time.time()))
        self.last_call = time.time()
        # curl rather than urllib: python.org builds on macOS often lack CA certificates.
        for attempt in range(4):
            r = subprocess.run(['curl', '-sf', '--max-time', '30', '-A',
                                'KenyaSpotter/0.1 (field guide linker; contact via project repository)', url],
                               capture_output=True, text=True)
            if r.returncode == 0:
                results = json.loads(r.stdout).get('results', [])
                break
            if attempt == 3:
                print(f'  ! iNaturalist search failed for {q} (curl exit {r.returncode})')
                return []
            time.sleep(5 * 2 ** attempt)
        json.dump(results, open(path, 'w'))
        return results

    def match(self, category: str, sci_names: list[str], name: str | None, search: bool = True) -> dict | None:
        for sci in sci_names:
            s = self.by_sci.get(binomial(sci))
            if s:
                return s
        if name:
            s = self.by_name.get((category, norm_name(name)))
            if s:
                return s
        for sci in sci_names if search else []:
            for t in self.inat_search(sci):
                # The search also matches common names ("Aquila africana" finds African
                # Fish Eagle), so only accept hits found by this scientific name.
                if t.get('id') in self.by_inat and binomial(t.get('matched_term') or '') == binomial(sci):
                    return self.by_inat[t['id']]
        return None


# ---------------------------------------------------------------------------
# Text helpers

WORDS: set[str] = set()
if os.path.exists('/usr/share/dict/words'):
    WORDS = {w.strip().lower() for w in open('/usr/share/dict/words')}


def join_lines(lines: list[str], soft_hyphens: bool) -> str:
    """Joins wrapped lines. A line ending in '-' is a compound word (kept) unless
    `soft_hyphens` is set and the joined word is a dictionary word."""
    out = ''
    for line in lines:
        line = line.strip()
        if not line:
            continue
        if out.endswith('-') and line[:1].islower():
            head = re.search(r'(\w+)-$', out)
            tail = re.match(r'(\w+)', line)
            if soft_hyphens and head and tail and (head.group(1) + tail.group(1)).lower() in WORDS:
                out = out[:-1] + line
            else:
                out += line
        else:
            out = f'{out} {line}' if out else line
    return re.sub(r'\s+', ' ', out).strip()


def save_jpeg(im: Image.Image, rel: str, max_w: int, quality: int) -> dict:
    if im.width > max_w:
        im = im.resize((max_w, round(im.height * max_w / im.width)), Image.LANCZOS)
    path = os.path.join(IMG_DIR, rel)
    os.makedirs(os.path.dirname(path), exist_ok=True)
    im.convert('RGB').save(path, 'JPEG', quality=quality, optimize=True, progressive=True)
    return {'src': f'books/img/{rel}', 'width': im.width, 'height': im.height}


def render(pdf: str, page: int, dpi: int, tmp: str) -> Image.Image:
    base = os.path.join(tmp, f'r{page}')
    run('pdftoppm', '-f', str(page), '-l', str(page), '-r', str(dpi), '-singlefile', '-png', pdf, base)
    return Image.open(base + '.png')


def bbox_pages(pdf: str, first: int | None = None, last: int | None = None):
    """Yields (page_no, width, height, lines) where lines are dicts with text and box."""
    args = ['pdftotext', '-bbox-layout']
    if first:
        args += ['-f', str(first), '-l', str(last or first)]
    xml = run(*args, pdf, '-')
    xml = re.sub(r'<!DOCTYPE[^>]*>', '', xml)
    root = ET.fromstring(xml)
    for i, page in enumerate(root.iter(XHTML + 'page')):
        lines = []
        for line in page.iter(XHTML + 'line'):
            words = [w.text or '' for w in line.iter(XHTML + 'word')]
            text = ' '.join(w for w in words if w).strip()
            if text:
                lines.append({'text': text, **{k: float(line.get(k)) for k in ('xMin', 'yMin', 'xMax', 'yMax')}})
        yield (first or 1) + i, float(page.get('width')), float(page.get('height')), lines


# ---------------------------------------------------------------------------
# Birds of East Africa

COUNTRY = {'Ke': 'Kenya', 'Tz': 'Tanzania', 'Ug': 'Uganda', 'Rw': 'Rwanda', 'Bu': 'Burundi'}
COMPASS = {'N': 'northern', 'S': 'southern', 'E': 'eastern', 'W': 'western', 'C': 'central',
           'NE': 'north-eastern', 'NW': 'north-western', 'SE': 'south-eastern', 'SW': 'south-western',
           'NC': 'north-central', 'SC': 'south-central', 'EC': 'east-central', 'WC': 'west-central'}


def expand_places(s: str) -> str:
    def rep(m):
        d, c = m.group(1), m.group(2)
        return f'{COMPASS[d]} {COUNTRY[c]}' if d else COUNTRY[c]
    s = re.sub(r'\b(NE|NW|SE|SW|NC|SC|EC|WC|N|S|E|W|C)?(Ke|Tz|Ug|Rw|Bu)\b', rep, s)
    s = re.sub(r'\bEA\b', 'East Africa', s)
    return s


HEADER = re.compile(
    r'^\s*(?P<name>[A-Z][^\d]*?)\s+(?P<sci>[A-Z][a-z]+ [a-z]+(?: [a-z]+)?)\s+'
    r'(?P<len>(?:c\.\s?)?\d[\d.,–-]*\s?cm\b.*?)\s*$')

RARITY_WORDS = [
    (r'\bvagrants?\b|\bvery rare\b|\bextremely rare\b|\bfew records\b', 'Very Rare'),
    (r'\brare\b|\bscarce\b', 'Rare'),
    (r'\buncommon\b|\blocally common\b|\bfairly common\b|\blocal\b', 'Uncommon'),
    (r'\bcommon\b|\babundant\b', 'Common'),
]


def kenya_rarity(sh: str) -> str | None:
    """Abundance word from the Status & Habitat text, preferring a sentence about Kenya."""
    sentences = re.split(r'(?<=[.;])\s+', sh)
    kenya = [s for s in sentences if re.search(r'\b(?:[NSEWC]{1,2})?Ke\b', s)]
    first = sentences[0] if sentences else ''
    candidates = kenya[:1]
    # The opening sentence covers the whole region unless it names another country only.
    if kenya or not re.search(r'\b(?:[NSEWC]{1,2})?(?:Tz|Ug|Rw|Bu)\b', first):
        candidates.append(first)
    for pick in candidates:
        best = None
        for pattern, rarity in RARITY_WORDS:
            m = re.search(pattern, pick, re.I)
            if m and (best is None or m.start() < best[0]):
                best = (m.start(), rarity)
        if best:
            return best[1]
    return None


def split_account(body: str) -> list[dict]:
    alt = None
    m = re.search(r'\[Alt\.\s*(.*?)\]\s*$', body)
    if m:
        alt, body = m.group(1), body[:m.start()].strip()
    parts = re.split(r'\s(SH|Voice|Note)\s', ' ' + body + ' ')
    sections = [{'heading': 'Identification', 'text': parts[0].strip()}]
    names = {'SH': 'Status and habitat', 'Voice': 'Voice', 'Note': 'Taxonomy note'}
    for key, text in zip(parts[1::2], parts[2::2]):
        text = text.strip()
        sections.append({'heading': names[key], 'text': expand_places(text) if key == 'SH' else text})
    if alt:
        sections.append({'heading': 'Other names', 'text': alt})
    return [s for s in sections if s['text']]


def label_lines(lines: list[dict]) -> list[dict]:
    """Plate labels, joining two-line labels that sit directly above each other."""
    out = []
    for l in sorted(lines, key=lambda l: (l['yMin'], l['xMin'])):
        if not re.search(r'[A-Za-z]{3}', l['text']) or 'indd' in l['text']:
            continue
        prev = out[-1] if out else None
        if (prev and 0 <= l['yMin'] - prev['yMax'] < 4
                and abs(l['xMin'] - prev['xMin']) < 30 and prev['text'][-1:] != '.'):
            prev['text'] += ' ' + l['text']
            prev['yMax'] = l['yMax']
            prev['xMax'] = max(prev['xMax'], l['xMax'])
            continue
        out.append(dict(l))
    return out


def extract_birds(pdf: str, cat: Catalogue, tmp: str):
    print('Birds of East Africa: reading accounts…')
    pages = run('pdftotext', '-layout', pdf, '-').split('\f')
    accounts = []  # (page_no, plate_no, plate_title, name, sci, length, body)
    for i, text in enumerate(pages):
        m = re.search(r'^\s*PLATE (\d+):\s*(.+?)\s*$', text, re.M)
        if not m:
            continue
        plate_no, plate_title = int(m.group(1)), m.group(2).title()
        current = None
        for line in text.split('\n'):
            h = HEADER.match(line)
            if h and ' ' in h.group('sci'):
                current = [i + 1, plate_no, plate_title, h.group('name').strip(), h.group('sci'),
                           h.group('len').strip(), []]
                accounts.append(current)
            elif current is not None:
                if 'indd' in line or re.match(r'^\s*\d{1,3}\s*$', line):
                    continue
                current[6].append(line)
    print(f'  {len(accounts)} accounts')

    entries, facts, plates_needed = {}, {}, {}
    for page_no, plate_no, plate_title, name, sci, length, body in accounts:
        text = join_lines(body, soft_hyphens=False)
        # Only accounts that mention Kenya are worth a synonym lookup.
        s = cat.match('birds', [sci], name, search=bool(re.search(r'\b(?:[NSEWC]{1,2})?Ke\b', text)))
        if not s:
            continue
        sections = split_account(text)
        sh = next((x['text'] for x in sections if x['heading'] == 'Status and habitat'), '')
        raw_sh = re.split(r'\sVoice\s', re.split(r'\sSH\s', ' ' + text + ' ', maxsplit=1)[-1])[0]
        size = re.sub(r'(\d)cm', r'\1 cm', length.split(',')[0])
        ws = re.search(r'WS\s*([\d–-]+)\s?cm', length)
        facts[s['id']] = {'size': size + (f' (wingspan {ws.group(1)} cm)' if ws else '')}
        r = kenya_rarity(raw_sh) if sh else None
        if r:
            facts[s['id']]['rarity'] = r
        entries.setdefault(s['id'], []).append({
            'source': 'boea', 'ref': f'Plate {plate_no}: {plate_title}', 'page': page_no,
            'name': name, 'sections': sections, 'images': [], '_plate': (page_no + 1, plate_no, name)})
        plates_needed.setdefault(page_no + 1, plate_no)
    print(f'  {len(entries)} matched to the catalogue')

    # Plates face their text page. Crop the band around each species' label.
    print(f'  cropping {len(plates_needed)} plates', end='', flush=True)
    layout = {p: (w, h, l) for p, w, h, l in bbox_pages(pdf)}
    for page_no, plate_no in sorted(plates_needed.items()):
        pw, ph, lines = layout[page_no]
        labels = label_lines(lines)
        img = render(pdf, page_no, 150, tmp)
        sx, sy = img.width / pw, img.height / ph
        art = (25, 25, pw - 25, ph - 28)  # inside the printer's crop marks
        full = save_jpeg(img.crop(tuple(round(v * s) for v, s in zip(art, (sx, sy, sx, sy)))),
                         f'boea/plate-{plate_no:03d}.jpg', 1000, 68)
        on_plate = [(id_, e) for id_, items in entries.items() for e in items
                    if e.get('_plate', (None,))[0] == page_no]
        name_labels = {e['_plate'][2]: best_label(labels, e['_plate'][2]) for _, e in on_plate}
        boxes = species_boxes(img, pw, ph, lines, art, {n: l for n, l in name_labels.items() if l})
        for id_, e in on_plate:
            name = e['_plate'][2]
            caption = f'{name} · Plate {plate_no}'
            box = boxes.get(name)
            if box:
                crop = img.crop((round(box[0] * sx), round(box[1] * sy), round(box[2] * sx), round(box[3] * sy)))
                pic = save_jpeg(crop, f'boea/{id_}-{plate_no}.jpg', 800, 72)
                e['images'].append({**pic, 'caption': caption, 'full': full})
            else:
                e['images'].append({**full, 'caption': caption})
            del e['_plate']
        print('.', end='', flush=True)
    print()
    return entries, facts


def species_boxes(img: Image.Image, pw: float, ph: float, lines: list[dict], art: tuple,
                  labels: dict[str, dict]) -> dict[str, tuple]:
    """Finds each painted bird on a plate and gives it to the nearest species label
    (labels sit above, below or beside their birds). Returns crop boxes in points."""
    if not labels:
        return {}
    k = 3  # work at a third of the rendered size
    small = img.convert('L').resize((img.width // k, img.height // k))
    sx, sy = small.width / pw, small.height / ph
    m = np.asarray(small) < 232
    for l in lines:  # ignore all lettering, including "ad", "imm" and race names
        m[max(0, int(l['yMin'] * sy) - 1):int(l['yMax'] * sy) + 2,
          max(0, int(l['xMin'] * sx) - 1):int(l['xMax'] * sx) + 2] = False
    m[:int(art[1] * sy)] = m[int(art[3] * sy):] = False
    m[:, :int(art[0] * sx)] = m[:, int(art[2] * sx):] = False
    m = np.asarray(Image.fromarray(m.astype(np.uint8) * 255).filter(ImageFilter.MaxFilter(5))) > 0

    H, W = m.shape
    seen = np.zeros_like(m)
    out: dict[str, list[float]] = {}
    for y0 in range(H):
        row = m[y0]
        for x0 in np.flatnonzero(row & ~seen[y0]):
            if seen[y0, x0]:
                continue
            stack, seen[y0, x0] = [(y0, x0)], True
            bx0 = bx1 = x0
            by0 = by1 = y0
            n = 0
            while stack:
                y, x = stack.pop()
                n += 1
                bx0, bx1, by0, by1 = min(bx0, x), max(bx1, x), min(by0, y), max(by1, y)
                for ny, nx in ((y + 1, x), (y - 1, x), (y, x + 1), (y, x - 1)):
                    if 0 <= ny < H and 0 <= nx < W and m[ny, nx] and not seen[ny, nx]:
                        seen[ny, nx] = True
                        stack.append((ny, nx))
            if n < 60:
                continue  # specks
            blob = (bx0 / sx, by0 / sy, (bx1 + 1) / sx, (by1 + 1) / sy)
            if (blob[2] - blob[0]) * (blob[3] - blob[1]) > 0.3 * (art[2] - art[0]) * (art[3] - art[1]):
                continue  # overlapping paintings merged into one: can't tell whose
            ranked = sorted(labels, key=lambda nm: rect_gap(blob, labels[nm]))
            name = ranked[0]
            if len(ranked) > 1:
                near, second = rect_gap(blob, labels[ranked[0]]), rect_gap(blob, labels[ranked[1]])
                if not (near < 0.6 * second or second - near > 40):
                    continue  # about as close to another species' label: leave it out
            box = out.setdefault(name, list(blob))
            box[:] = [min(box[0], blob[0]), min(box[1], blob[1]), max(box[2], blob[2]), max(box[3], blob[3])]
    # Full-width band centred on the species' birds and label: neighbours may show at
    # the edges, but birds are never cut in half and the band suits a landscape frame.
    band = 0.42 * (art[3] - art[1])
    res = {}
    for name, l in labels.items():
        b = out.get(name) or [l['xMin'], l['yMin'], l['xMax'], l['yMax']]
        top, bottom = min(b[1], l['yMin']) - 6, max(b[3], l['yMax']) + 6
        if bottom - top < band:
            mid = (top + bottom) / 2
            top, bottom = mid - band / 2, mid + band / 2
        shift = max(0, art[1] - top) - max(0, bottom - art[3])
        res[name] = (art[0], max(art[1], top + shift), art[2], min(art[3], bottom + shift))
    return res


def rect_gap(a: tuple, l: dict) -> float:
    dx = max(l['xMin'] - a[2], a[0] - l['xMax'], 0)
    dy = max(l['yMin'] - a[3], a[1] - l['yMax'], 0)
    return (dx * dx + dy * dy) ** 0.5


def best_label(labels: list[dict], name: str) -> dict | None:
    target = norm_name(name)
    for l in labels:
        if norm_name(l['text']) == target:
            return l
    for l in labels:  # labels sometimes drop or add a word ("Teal" vs "Common Teal")
        t = norm_name(l['text'])
        if len(t) > 4 and (t in target or target in t):
            return l
    return None


# ---------------------------------------------------------------------------
# Safari Guide

# (first PDF page, title as printed, scientific names to try: current then the book's)
CHAPTERS = [
    (18, 'Large-eared Greater Galago', ['Otolemur crassicaudatus', 'Galago crassicaudatus']),
    (20, 'Senegal Galago', ['Galago senegalensis']),
    (22, 'Vervet Monkey', ['Chlorocebus pygerythrus', 'Cercopithecus aethiops']),
    (24, 'Blue or Sykes Monkey', ['Cercopithecus mitis']),
    (26, 'Olive Baboon', ['Papio anubis']),
    (29, 'Yellow Baboon', ['Papio cynocephalus']),
    (30, 'Black and White Colobus', ['Colobus guereza']),
    (32, 'Side-striped Jackal', ['Lupulella adusta', 'Canis adustus']),
    (33, 'Golden Jackal', ['Canis lupaster', 'Canis aureus']),
    (35, 'Black-backed Jackal', ['Lupulella mesomelas', 'Canis mesomelas']),
    (38, 'Bat-eared Fox', ['Otocyon megalotis']),
    (40, 'Hunting Dog', ['Lycaon pictus']),
    (45, 'East African Civet', ['Civettictis civetta']),
    (46, 'Honey Badger', ['Mellivora capensis']),
    (47, 'Slender Mongoose', ['Herpestes sanguineus']),
    (48, 'Dwarf Mongoose', ['Helogale parvula']),
    (50, 'Banded Mongoose', ['Mungos mungo']),
    (53, 'Spotted Hyaena', ['Crocuta crocuta']),
    (57, 'Striped Hyaena', ['Hyaena hyaena']),
    (58, 'Lion', ['Panthera leo']),
    (64, 'Leopard', ['Panthera pardus']),
    (70, 'Cheetah', ['Acinonyx jubatus']),
    (75, 'Caracal', ['Caracal caracal', 'Felis caracal']),
    (76, 'Serval', ['Leptailurus serval', 'Felis serval']),
    (78, 'African Wild Cat', ['Felis lybica']),
    (80, 'African Elephant', ['Loxodonta africana']),
    (86, 'Plains Zebra', ['Equus quagga', 'Equus burchelli']),
    (92, "Grevy's Zebra", ['Equus grevyi']),
    (94, 'Square-lipped or White Rhinoceros', ['Ceratotherium simum']),
    (96, 'Black Rhinoceros', ['Diceros bicornis']),
    (98, 'Rock Hyrax', ['Procavia capensis', 'Procavia johnstoni']),
    (98, 'Yellow-spotted Rock Hyrax', ['Heterohyrax brucei']),
    (101, 'Southern Tree Hyrax', ['Dendrohyrax arboreus']),
    (102, 'Warthog', ['Phacochoerus africanus', 'Phacochoerus aethiopicus']),
    (106, 'Hippopotamus', ['Hippopotamus amphibius']),
    (110, 'Masai Giraffe', ['Giraffa tippelskirchi']),
    (114, 'Reticulated Giraffe', ['Giraffa reticulata']),
    (117, "Rothschild's Giraffe", ['Giraffa camelopardalis']),
    (118, 'Common Wildebeest', ['Connochaetes taurinus']),
    (122, "Coke's Hartebeest", ['Alcelaphus buselaphus']),
    (124, 'Topi', ['Damaliscus lunatus']),
    (128, 'Impala', ['Aepyceros melampus']),
    (134, "Grant's Gazelle", ['Nanger granti', 'Gazella granti']),
    (136, "Thomson's Gazelle", ['Eudorcas thomsonii', 'Gazella thomsonii']),
    (138, "Gerenuk or Waller's Gazelle", ['Litocranius walleri']),
    (140, 'Buffalo', ['Syncerus caffer']),
    (144, 'Common Eland', ['Tragelaphus oryx', 'Taurotragus oryx']),
    (146, 'Greater Kudu', ['Tragelaphus strepsiceros']),
    (148, 'Bongo', ['Tragelaphus eurycerus']),
    (151, 'Bushbuck', ['Tragelaphus sylvaticus', 'Tragelaphus scriptus']),
    (152, 'Roan Antelope', ['Hippotragus equinus']),
    (153, 'Sable Antelope', ['Hippotragus niger']),
    (156, 'Oryx (Beisa and Fringe-eared)', ['Oryx beisa']),
    (158, "Guenther's Dik-dik", ['Madoqua guentheri']),
    (158, "Kirk's Dik-dik", ['Madoqua kirkii']),
    (160, 'Klipspringer', ['Oreotragus oreotragus']),
    (162, 'Oribi', ['Ourebia ourebi']),
    (163, 'Steenbok', ['Raphicerus campestris']),
    (164, 'Defassa and Common Waterbuck', ['Kobus ellipsiprymnus']),
    (167, 'Bohor Reedbuck', ['Redunca redunca']),
    (168, 'Unstriped Ground Squirrel', ['Xerus rutilus']),
    (169, 'Crested Porcupine', ['Hystrix cristata']),
    (170, 'Cape Hare', ['Lepus capensis']),
    (171, 'Marsh or Helmeted Terrapin', ['Pelomedusa subrufa']),
    (172, 'Leopard Tortoise', ['Stigmochelys pardalis', 'Testudo pardalis']),
    (173, 'Nile Monitor', ['Varanus niloticus']),
    (175, 'Agama Lizards', ['Agama lionotus', 'Agama agama']),
    (178, 'Nile Crocodile', ['Crocodylus niloticus']),
    (184, 'Giant Forest Hog', ['Hylochoerus meinertzhageni']),
    (185, "Jackson's Hartebeest", ['Alcelaphus buselaphus']),
]
LAST_PAGE = 185

HEADINGS = {'identification', 'habitat', 'habits', 'food', 'diet', 'reproduction', 'breeding',
            'predation', 'voice', 'behaviour', 'social behaviour', 'distribution', 'status',
            'conservation', 'predators', 'feeding'}
FACT_KEYS = ('Weight', 'Height', 'Length', 'Gestation', 'Incubation', 'Young', 'Lifespan', 'Shoulder height')

OCR_FIXES = [
    (r'(\d)\s?(?:!b|Ib|1b|lbs?)\b', r'\1lb'), (r'(\d)\s?kq\b', r'\1kg'), (r'(\d)\s?Ib', r'\1lb'),
    (r'—', '–'), (r'\s+([,.;:])', r'\1'), (r'\bbya\b', 'by a'),
    # Digits misread in measurements: ½ as %, 1 as I/l, 0 as O, 5 as S.
    (r'(\d)%', r'\1½'), (r'\b[Il](ft|in)\b', r'1\1'), (r'(\d)O', r'\g<1>0'), (r'\bS(ft|in)\b', r'5\1'),
]


def ocr_clean(s: str) -> str:
    for a, b in OCR_FIXES:
        s = re.sub(a, b, s)
    return s.strip()


def photo_boxes(pdf: str, page: int, tmp: str) -> list[tuple[float, float, float, float]]:
    """Photos sit in the scan's background layer (text is a separate mask), so
    paper vs. not-paper on that layer, split with XY-cuts, finds them."""
    base = os.path.join(tmp, f'bg{page}')
    # -all writes the embedded files as-is (decoding to PNG takes ~20s a page).
    run('pdfimages', '-all', '-f', str(page), '-l', str(page), pdf, base)
    files = sorted(glob.glob(base + '-*'))
    if not files:
        return []
    im = Image.open(files[0]).convert('RGB')  # the low-res background layer
    for f in files:
        os.remove(f)
    a = np.asarray(im).astype(int)
    border = np.concatenate([a[0], a[-1], a[:, 0], a[:, -1]])
    mask = np.abs(a - np.median(border, axis=0)).sum(axis=2) > 45
    H, W = mask.shape
    out = []
    for x0, y0, x1, y1 in xy_cut(mask, 0, 0, W, H):
        if x1 - x0 > W * 0.15 and y1 - y0 > H * 0.08 and mask[y0:y1, x0:x1].mean() > 0.5:
            out.append((x0 / W, y0 / H, x1 / W, y1 / H))
    return out


def runs(occ, gap):
    out, start, last = [], None, None
    for i, v in enumerate(occ):
        if v:
            if start is None:
                start = i
            elif i - last > gap:
                out.append((start, last + 1))
                start = i
            last = i
    if start is not None:
        out.append((start, last + 1))
    return out


def xy_cut(m, x0, y0, x1, y1):
    sub = m[y0:y1, x0:x1]
    if sub.size == 0:
        return []
    for axis in (1, 0):
        occ = sub.mean(axis=axis) > 0.03
        r = runs(occ, 6)
        if len(r) > 1 or (r and (r[0][0] > 0 or r[-1][1] < len(occ))):
            res = []
            for a, b in r:
                res += xy_cut(m, x0, y0 + a, x1, y0 + b) if axis == 1 else xy_cut(m, x0 + a, y0, x0 + b, y1)
            return res
    return [(x0, y0, x1, y1)]


def is_noise(text: str) -> bool:
    letters = sum(c.isalpha() for c in text)
    words = re.findall(r'[A-Za-z]{2,}', text)
    if letters < 4 or letters < 0.6 * len(text.replace(' ', '')):
        return True
    if re.search(r'JONATHAN|SCOTT.S SAFARI|GUIDE TO EAST AFRICAN|^ANIMALS$|^GUIDE$', text):
        return True
    real = [w for w in words if w.lower() in WORDS or len(w) > 3]
    return len(real) == 0


def read_safari_page(pdf: str, page: int, tmp: str):
    """Returns (body lines in reading order, [(photo box in points, caption)])."""
    _, pw, ph, lines = next(bbox_pages(pdf, page))
    boxes = [(x0 * pw, y0 * ph, x1 * pw, y1 * ph) for x0, y0, x1, y1 in photo_boxes(pdf, page, tmp)]
    photos = [[b, []] for b in boxes]
    body = []
    for l in lines:
        cx, cy = (l['xMin'] + l['xMax']) / 2, (l['yMin'] + l['yMax']) / 2
        if l['yMax'] < 16 or l['yMin'] > ph - 40 and re.fullmatch(r'[\d\s]{1,4}', l['text']):
            continue
        if any(b[0] <= cx <= b[2] and b[1] <= cy <= b[3] for b in boxes):
            # Mostly OCR noise from the picture, but chapter titles and key facts are
            # printed over the opening photo.
            if not (re.match(r'^(%s)\s*:|^(plus|females|males)\b' % '|'.join(FACT_KEYS), l['text']) or
                    (len(re.findall(r'[a-z]{3,}', l['text'])) >= 3 and not is_noise(l['text']))):
                continue
        # Captions: lines starting just below a photo and within its width.
        owner = None
        for p in photos:
            b = p[0]
            last_y = p[1][-1]['yMax'] if p[1] else b[3]
            if l['xMin'] >= b[0] - 12 and l['xMin'] <= b[2] and 0 <= l['yMin'] - last_y < 9:
                owner = p
                break
        if owner:
            owner[1].append(l)
            continue
        if not is_noise(l['text']) or re.match(r'^(%s)\s*:|^(plus|females|males)\b' % '|'.join(FACT_KEYS), l['text']):
            body.append(l)
    # Reading order: columns left to right, top to bottom within each.
    cols: list[float] = []
    for x in sorted(l['xMin'] for l in body):
        if not cols or x - cols[-1] > 60:
            cols.append(x)
    col_of = lambda l: max(i for i, c in enumerate(cols) if l['xMin'] >= c - 1) if cols else 0
    body.sort(key=lambda l: (col_of(l), l['yMin']))
    caps = [(b, ocr_clean(join_lines([c['text'] for c in cap], True))) for b, cap in photos]
    return body, caps, (pw, ph)


def sections_from_lines(lines: list[dict]) -> list[dict]:
    sections, heading, buf, facts = [], 'Overview', [], []

    def flush():
        text = ocr_clean(join_lines(buf, True))
        if len(text) > 40:
            sections.append({'heading': heading, 'text': text})

    for l in lines:
        t = l['text'].strip()
        key = t.lower().rstrip(':')
        fact = re.match(r'^(%s)\s*:\s*(.*)$' % '|'.join(FACT_KEYS), t)
        if fact:
            facts.append([fact.group(1), fact.group(2)])
            continue
        if facts and heading == 'Overview' and not buf and re.match(r'^(plus|females|males|\(|[\d])', t):
            facts[-1][1] += ' ' + t  # continuation of a facts line
            continue
        if key in HEADINGS:
            flush()
            heading, buf = t.rstrip(':').capitalize(), []
            continue
        if re.fullmatch(r"[A-Z][A-Z’'\- ]{2,}", t) or re.fullmatch(r'[A-Z][a-z]+ [a-z]+( [a-z]+)?', t):
            continue  # running species title or scientific name
        buf.append(t)
    flush()
    if facts:
        sections.insert(0, {'heading': 'Key facts',
                            'facts': [[k, ocr_clean(v).rstrip(',;')] for k, v in facts if v.strip()]})
    # Merge repeated headings (columns split across pages).
    merged: list[dict] = []
    for s in sections:
        prev = next((m for m in merged if m['heading'] == s['heading'] and 'text' in m and 'text' in s), None)
        if prev:
            prev['text'] += ' ' + s['text']
        else:
            merged.append(s)
    return merged


def extract_safari(pdf: str, cat: Catalogue, tmp: str):
    print('Safari Guide: reading chapters…')
    starts = sorted({c[0] for c in CHAPTERS})
    page_cache: dict[int, tuple] = {}
    entries = {}
    for first, title, sci in CHAPTERS:
        s = cat.match('animals', sci, title)
        if not s:
            print(f'  ! no catalogue match for {title}')
            continue
        nxt = next((p for p in starts if p > first), LAST_PAGE + 1)
        lines, images = [], []
        for page in range(first, nxt):
            if page not in page_cache:
                page_cache[page] = read_safari_page(pdf, page, tmp)
            body, caps, (pw, ph) = page_cache[page]
            lines += body
            if caps:
                img = render(pdf, page, 170, tmp)
                sx, sy = img.width / pw, img.height / ph
                for k, (b, caption) in enumerate(caps):
                    crop = img.crop((round(b[0] * sx), round(b[1] * sy), round(b[2] * sx), round(b[3] * sy)))
                    pic = save_jpeg(crop, f'safari/p{page:03d}-{k}.jpg', 900, 72)
                    images.append({**pic, 'caption': caption or title})
        # Pages shared by two chapters (dik-diks, hyraxes): show it under both.
        entries.setdefault(s['id'], []).append({
            'source': 'safari', 'ref': title, 'page': first, 'name': title,
            'sections': sections_from_lines(lines), 'images': images})
        print(f'  {title} → {s["name"]}: {len(images)} photos')
    return entries


# ---------------------------------------------------------------------------
# Coastal Fishes of the Western Indian Ocean

def xml_pages(pdf: str, tmp: str):
    """pdftohtml's XML: text runs with fonts, plus placed images with their boxes.
    Coordinates are in pdftohtml units (1.5 x PDF points)."""
    base = os.path.join(tmp, 'x' + hashlib.sha1(pdf.encode()).hexdigest()[:8])
    run('pdftohtml', '-xml', '-q', pdf, base)
    root = ET.parse(base + '.xml').getroot()
    for f in glob.glob(base + '*'):
        os.remove(f)  # the extracted images lose their masks; pages are rendered instead
    fonts = {f.get('id'): (f.get('family').split('+')[-1], int(f.get('size'))) for f in root.iter('fontspec')}
    for page in root.iter('page'):
        texts = [{'top': int(t.get('top')), 'left': int(t.get('left')), 'width': int(t.get('width')),
                  'height': int(t.get('height')), 'font': fonts.get(t.get('font'), ('', 0)),
                  'text': ''.join(t.itertext())} for t in page.iter('text')]
        images = [{k: int(i.get(k)) for k in ('top', 'left', 'width', 'height')} for i in page.iter('image')]
        yield int(page.get('number')), int(page.get('width')), int(page.get('height')), texts, images


def fish_role(t: dict) -> str:
    fam, size = t['font']
    txt = t['text']
    if 'SemiCnIt' in fam and size >= 22 and 'Semibold' not in fam:
        return 'species'
    if fam.startswith('MinionPro') and size == 14:
        return 'body'
    if fam.startswith('MinionPro') and size <= 13:
        return 'synonymy'
    if 'SemiboldSemiCn' in fam and size == 14 and txt.strip().isupper():
        return 'head'
    if fam.endswith('LightSemiCn') and 17 <= size <= 19:
        return 'common'
    if size >= 22:
        return 'major'  # ORDER / FAMILY / GENUS titles
    if fam.endswith('LightSemiCn') and size == 15:
        return 'author'
    if 'SemiCnIt' in fam and 13 <= size <= 14:
        return 'caption'
    return 'other'


def reading_order(texts: list[dict], width: int) -> list[list[dict]]:
    """Two columns, top to bottom; runs a few units apart vertically share a line."""
    mid = width / 2 - 20
    out = []
    for col in (0, 1):
        items = sorted((t for t in texts if (t['left'] >= mid) == bool(col) and t['width'] > 0),
                       key=lambda t: t['top'])
        lines: list[list[dict]] = []
        for t in items:
            if lines and abs(t['top'] - lines[-1][0]['top']) <= 4:
                lines[-1].append(t)
            else:
                lines.append([t])
        out += [sorted(l, key=lambda t: t['left']) for l in lines]
    return out


SIZE_RE = re.compile(r'\b(?:Attains|Reaches|Grows to|Maximum size)\s+(?:at least\s+|about\s+|~)?'
                     r'([\d.]+(?:–[\d.]+)?\s?(?:mm|cm|m))\s?([TSF]L|DW|disc width)?')


def fish_size(text: str) -> str | None:
    m = SIZE_RE.search(text)
    if not m:
        return None
    return f'Up to {m.group(1)}' + (f' {m.group(2)}' if m.group(2) else '')


def parse_fish_volume(pdf: str, tmp: str):
    """Returns (accounts, figures). Accounts: sci, author, common, family, page, sections.
    Figures: page, box (pdftohtml units), caption, sci."""
    accounts, figures = [], []
    cur = None
    family = None
    want_family = False
    for page_no, W, H, texts, images in xml_pages(pdf, tmp):
        body_texts = [t for t in texts if 60 <= t['top'] <= H - 60]
        body_left = {}
        for col in (0, 1):
            lefts = [t['left'] for t in body_texts if fish_role(t) == 'body' and (t['left'] >= W / 2 - 20) == bool(col)]
            body_left[col] = min(lefts) if lefts else 0
        for line in reading_order(body_texts, W):
            col = int(line[0]['left'] >= W / 2 - 20)
            for k, t in enumerate(line):
                r, txt = fish_role(t), t['text']
                if r == 'major':
                    word = txt.strip()
                    if word == 'FAMILY':
                        want_family = True
                    elif want_family and re.fullmatch(r'[A-Z]+IDAE', word):
                        family, want_family = word.capitalize(), False
                    if cur and not cur['_inhead']:
                        cur = None  # a new genus/family section ends the account
                    if r == 'major' and not (cur and cur['_inhead']):
                        continue
                if r == 'species':
                    if cur and cur['_inhead'] and t['top'] - cur['_top'] < 40:
                        cur['sci'] += ' ' + txt.strip()  # long names wrap
                        cur['_top'] = t['top']
                        continue
                    cur = {'sci': txt.strip(), 'author': '', 'common': None, 'family': family,
                           'page': page_no, 'sections': [['Description', []]], '_inhead': True, '_top': t['top']}
                    accounts.append(cur)
                    continue
                if cur is None:
                    continue
                if r == 'author' and cur['_inhead']:
                    cur['author'] += txt
                    continue
                if r in ('common', 'body', 'head', 'synonymy'):
                    cur['_inhead'] = False
                if r == 'common' and not cur['common']:
                    cur['common'] = txt.strip()
                elif r == 'head':
                    cur['sections'].append([txt.strip().capitalize(), []])
                elif r == 'body':
                    para = k == 0 and t['left'] - body_left[col] > 8
                    cur['sections'][-1][1].append(('\n' if para else '') + txt)
        # Figures: an image with an italic caption starting just below it.
        for img in images:
            if img['width'] < 120 or img['height'] < 50:
                continue
            bottom = img['top'] + img['height']
            caps = [t for t in texts if fish_role(t) == 'caption' and 0 <= t['top'] - bottom <= 45
                    and img['left'] - 10 <= t['left'] <= img['left'] + img['width']]
            if not caps:
                continue
            first = min(caps, key=lambda t: (t['top'], t['left']))
            # Caption lines sit under the picture and within its width (pictures share rows).
            capfont = lambda t: not t['font'][0].startswith('MinionPro') and t['font'][1] <= 14
            # The first line may run past the picture, but only as continuous text: the next
            # picture's caption on the same row starts after a gap.
            same_row = sorted((t for t in texts if abs(t['top'] - first['top']) <= 4 and t['left'] > first['left']
                               and t['width'] > 0 and capfont(t)), key=lambda t: t['left'])
            end = first['left'] + first['width']
            for t in same_row:
                if t['left'] > end + 8:
                    break
                end = max(end, t['left'] + t['width'])
            right = max(img['left'] + img['width'], end)
            rest = sorted((t for t in texts if -4 <= t['top'] - first['top'] <= 34
                           and img['left'] - 10 <= t['left'] < right and t['width'] > 0
                           and not t['font'][0].startswith('MinionPro') and t['font'][1] <= 14),
                          key=lambda t: (0 if abs(t['top'] - first['top']) <= 4 else t['top'], t['left']))
            # One caption naming several species (numbered photos sharing a legend): can't
            # tell which photo is which, so leave them out rather than mislabel.
            named = {binomial(t['text']) for t in rest
                     if fish_role(t) == 'caption' and re.match(r'^[A-Z][a-z]+ [a-z]+', t['text'].strip())}
            if len(named) > 1:
                continue
            parts: list[str] = []
            for t in rest:
                if t['text'].strip() and (not parts or t['text'].strip() != parts[-1].strip()):
                    parts.append(t['text'])
            joined = ''
            for part in parts:  # runs split at font changes and line ends
                if re.search(r'[\w:)]$', joined) and re.match(r'\w', part):
                    joined += ' '
                joined += part
            caption = re.sub(r'\s+', ' ', joined).strip()
            caption = re.sub(r'\s+([.,;])', r'\1', caption)
            credit = ''.join(t['text'] for t in sorted(
                (t for t in texts if t['width'] == 0 and img['top'] - 10 <= t['top'] <= bottom + 10
                 and abs(t['left'] - (img['left'] + img['width'])) < 40), key=lambda t: -t['top'])).strip()
            figures.append({'page': page_no, 'box': (img['left'], img['top'], img['left'] + img['width'], bottom),
                            'caption': caption, 'credit': re.sub(r'\s+', ' ', credit), 'sci': first['text'].strip()})
    return accounts, figures


def fish_sections(raw: list[list]) -> list[dict]:
    out = []
    for heading, parts in raw:
        text = ''.join(parts)
        paras = [join_lines([p], True) for p in text.split('\n')]
        paras = [p for p in paras if p]
        if paras:
            out.append({'heading': heading, 'text': '\n\n'.join(paras)})
    return out


def extract_fish(pdfs: list[str], cat: Catalogue, tmp: str):
    text_pdfs = [p for p in pdfs if 'text' in os.path.basename(p)]
    plate_pdfs = [p for p in pdfs if 'plate' in os.path.basename(p)]
    vol = lambda p: int(re.search(r'volume_(\d+)', p).group(1))
    print(f'Coastal Fishes of the WIO: reading {len(text_pdfs)} text and {len(plate_pdfs)} plate volumes…')

    entries, facts, new_species = {}, {}, {}
    figures = []  # (pdf, figure, is_plate)
    for pdf in text_pdfs:
        accounts, figs = parse_fish_volume(pdf, tmp)
        figures += [(pdf, f, False) for f in figs]
        print(f'  volume {vol(pdf)}: {len(accounts)} accounts, {len(figs)} drawings')
        for a in accounts:
            sci = ' '.join(a['sci'].split()[:2])
            if not re.fullmatch(r'[A-Z][a-z]+ [a-z]+', sci):
                continue
            sections = fish_sections(a['sections'])
            alltext = ' '.join(x['text'] for x in sections)
            kenyan = bool(re.search(r'\bKenya\b', alltext))
            s = cat.match('fish', [sci], a['common'], search=kenyan)
            size = fish_size(alltext)
            if s:
                id_ = s['id']
            elif kenyan:
                # Known from Kenya but not in the iNaturalist-based catalogue: add it.
                id_ = cat.book_ids.get(binomial(sci), slugify(sci))
                hit = next((t for t in cat.inat_search(sci)
                            if binomial(t.get('matched_term') or '') == binomial(sci) and t.get('rank') == 'species'), None)
                rarity = next((r for pat, r in RARITY_WORDS
                               if re.search(pat, next((x['text'] for x in sections if x['heading'] == 'Remarks'), ''), re.I)),
                              'Rare')
                new_species[id_] = {k: v for k, v in {
                    'id': id_, 'scientificName': sci, 'name': a['common'], 'family': a['family'],
                    'size': size, 'rarity': rarity, 'inatId': hit and hit['id']}.items() if v}
            else:
                continue
            if size:
                facts.setdefault(id_, {})['size'] = size
            entries.setdefault(id_, []).append({
                'source': 'wiof', 'ref': f'Volume {vol(pdf)}' + (f', family {a["family"]}' if a['family'] else ''),
                'page': a['page'], 'name': a['common'] or sci, 'sections': sections, 'images': [],
                '_sci': binomial(sci)})
    for pdf in plate_pdfs:
        _, figs = parse_fish_volume(pdf, tmp)
        figures += [(pdf, f, True) for f in figs]
        print(f'  plates volume {vol(pdf)}: {len(figs)} photos')
    print(f'  {len(entries)} species matched ({len(new_species)} Kenyan species new to the catalogue)')

    # Pictures: plate photos first, then line drawings; a few of each per species.
    by_sci = {}
    for id_, items in entries.items():
        for e in items:
            by_sci.setdefault(e.pop('_sci'), (id_, e))
    wanted: dict[tuple, list] = {}
    counts: dict[tuple, int] = {}
    for pdf, f, is_plate in sorted(figures, key=lambda x: not x[2]):
        hit = by_sci.get(binomial(f['sci']))
        if not hit:
            continue
        key = (hit[0], is_plate)
        if counts.get(key, 0) >= (4 if is_plate else 1):
            continue
        counts[key] = counts.get(key, 0) + 1
        wanted.setdefault((pdf, f['page']), []).append((hit, f, is_plate))
    print(f'  cropping {sum(len(v) for v in wanted.values())} pictures from {len(wanted)} pages', end='', flush=True)
    for i, ((pdf, page), items) in enumerate(sorted(wanted.items())):
        img = render(pdf, page, 144, tmp)
        k = 144 / 72 / 1.5  # pdftohtml units -> pixels
        for j, ((id_, e), f, is_plate) in enumerate(items):
            box = tuple(round(v * k) for v in f['box'])
            pic = save_jpeg(img.crop(box), f'wiof/{id_}-{vol(pdf)}-{page}-{j}.jpg', 900, 72)
            caption = f['caption'] + (f' · {f["credit"]}' if f['credit'] else '')
            e['images'].append({**pic, 'caption': caption, 'drawing': not is_plate})
        if i % 20 == 0:
            print('.', end='', flush=True)
    print()
    for items in entries.values():  # plate photos before drawings
        for e in items:
            e['images'].sort(key=lambda im: im.pop('drawing'))
    return entries, facts, new_species


def slugify(s: str) -> str:
    s = re.sub(r'[̀-ͯ]', '', __import__('unicodedata').normalize('NFD', s.lower()))
    return re.sub(r'[^a-z0-9]+', '-', s).strip('-')


# ---------------------------------------------------------------------------

def main():
    import argparse
    import shutil
    ap = argparse.ArgumentParser()
    ap.add_argument('--only', choices=list(SOURCES), help='re-extract one book, keeping the others')
    only = ap.parse_args().only

    out_json = os.path.join(OUT_DIR, 'books.json')
    previous = json.load(open(out_json)) if only and os.path.exists(out_json) else {'sources': {}, 'entries': {}}
    old_facts = json.load(open(FACTS)) if only and os.path.exists(FACTS) else {}
    keys = [only] if only else list(SOURCES)
    for key in keys:
        shutil.rmtree(os.path.join(IMG_DIR, key), ignore_errors=True)
    os.makedirs(IMG_DIR, exist_ok=True)

    cat = Catalogue()
    found = {k: v for k, v in previous['sources'].items() if k not in keys}
    entries: dict[str, list] = {}
    for id_, items in previous['entries'].items():
        kept = [e for e in items if e['source'] not in keys]
        if kept:
            entries[id_] = kept
    # Facts come from the bird guide (birds) and the fish guide (fish): keep the other one's.
    category = {s['id']: s['category'] for s in json.load(open(os.path.join(ROOT, 'src', 'lib', 'data', 'species.json')))}
    redo = {'boea': 'birds', 'wiof': 'fish'}.get(only) if only else None
    facts: dict[str, dict] = {k: v for k, v in old_facts.items() if category.get(k, 'fish') != redo} if only else {}
    new_species = None
    with tempfile.TemporaryDirectory() as tmp:
        for key in keys:
            src = SOURCES[key]
            pdfs = find_pdfs(src['glob'])
            if not pdfs:
                print(f'Skipping {src["title"]}: no PDF matching "{src["glob"]}" under sources/.')
                continue
            found[key] = {k: v for k, v in src.items() if k != 'glob'}
            if key == 'boea':
                e, f = extract_birds(pdfs[0], cat, tmp)
            elif key == 'safari':
                e, f = extract_safari(pdfs[0], cat, tmp), {}
            else:
                e, f, new_species = extract_fish(pdfs, cat, tmp)
            facts.update(f)
            for id_, items in e.items():
                entries.setdefault(id_, []).extend(items)

    json.dump({'sources': found, 'entries': entries}, open(out_json, 'w'), ensure_ascii=False)
    json.dump(dict(sorted(facts.items())), open(FACTS, 'w'), ensure_ascii=False, indent=0)
    open(FACTS, 'a').write('\n')
    if new_species is not None:
        json.dump(sorted(new_species.values(), key=lambda x: x['id']), open(BOOK_SPECIES, 'w'),
                  ensure_ascii=False, indent=0)
        open(BOOK_SPECIES, 'a').write('\n')
    n_img = sum(len(x['images']) for items in entries.values() for x in items)
    print(f'\nWrote accounts for {len(entries)} species ({n_img} pictures) to public/books/ (local only).')
    print(f'Wrote facts for {len(facts)} species to src/lib/data/book-facts.json.')
    if new_species is not None:
        print(f'Wrote {len(new_species)} Kenyan fish to src/lib/data/book-species.json — run npm run species to add them.')


if __name__ == '__main__':
    sys.exit(main())
