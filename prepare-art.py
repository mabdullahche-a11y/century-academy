from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
from io import BytesIO
from PIL import Image, ImageEnhance, ImageOps, ImageDraw, ImageFont
import requests

assets = Path('dist/assets')
art = {
    'school-of-athens': 'https://upload.wikimedia.org/wikipedia/commons/4/49/%22The_School_of_Athens%22_by_Raffaello_Sanzio_da_Urbino.jpg',
    'young-girl-reading': 'https://upload.wikimedia.org/wikipedia/commons/6/69/Fragonard%2C_The_Reader.jpg',
}

def export(item):
    name, url = item
    try:
        response = requests.get(url, timeout=20)
        response.raise_for_status()
        master = Image.open(BytesIO(response.content)).convert('RGB')
        print(name, 'Commons', master.size)
    except Exception as error:
        master = Image.open(assets / (name + '.jpg')).convert('RGB')
        print(name, 'existing reproduction', master.size, error)
    if name == 'school-of-athens':
        master = ImageEnhance.Color(master).enhance(.8)
        master = ImageEnhance.Brightness(master).enhance(.91)
    for variant in ('', '-portrait') if name == 'school-of-athens' else ('',):
        image = master
        if variant:
            width = round(image.height * .8)
            left = (image.width - width) // 2
            image = image.crop((left, 0, left + width, image.height))
        for width in (640,960,1280,1600,2000):
            sized = image.resize((width, round(width * image.height / image.width)), Image.Resampling.LANCZOS)
            for extension, quality in [('avif',43),('webp',68),('jpg',74)]:
                sized.save(assets / f'{name}{variant}-{width}.{extension}', quality=61 if variant and extension == 'webp' else quality)
    if name == 'school-of-athens':
        share = ImageOps.fit(master,(1200,630),centering=(.5,.61))
        draw = ImageDraw.Draw(share)
        draw.rectangle((28,462,520,602),fill='#172f24',outline='#cbb783',width=2)
        draw.text((56,481),'The Century',font=ImageFont.truetype('georgia.ttf',49),fill='#f7f3e7')
        draw.text((58,549),'A C A D E M Y',font=ImageFont.truetype('arial.ttf',21),fill='#cbb783')
        share.save(assets / 'share.jpg',quality=84,optimize=True)

with ThreadPoolExecutor() as pool:
    list(pool.map(export, art.items()))


