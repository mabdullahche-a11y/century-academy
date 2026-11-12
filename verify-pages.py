from html.parser import HTMLParser
from urllib.parse import urlsplit,unquote
from pathlib import Path
import requests
root=Path('dist').resolve()
class Parse(HTMLParser):
 def __init__(self): super().__init__();self.links=[];self.ids=set();self.h1=0
 def handle_starttag(self,tag,attrs):
  a=dict(attrs)
  if 'id' in a:self.ids.add(a['id'])
  if tag=='h1':self.h1+=1
  for key in ('href','src'):
   if key in a:self.links.append(a[key])
parses={p:Parse() for p in root.rglob('*.html')}
for path,parser in parses.items():parser.feed(path.read_text(encoding='utf-8'))
errors=[];links=0
for path,parser in parses.items():
 if parser.h1!=1:errors.append(f'{path}: expected one H1')
 for link in parser.links:
  u=urlsplit(link)
  if u.scheme or u.netloc:continue
  target=(root/unquote(u.path).lstrip('/')) if u.path.startswith('/') else path.parent/unquote(u.path)
  if not u.path:target=path
  if target.is_dir():target=target/'index.html'
  if not target.exists():errors.append(f'{path}: missing {link}')
  elif u.fragment and target in parses and u.fragment not in parses[target].ids:errors.append(f'{path}: missing anchor {link}')
  links+=1
for path in parses:
 route='/'+str(path.relative_to(root)).replace('\\','/').removesuffix('index.html')
 response=requests.get('http://127.0.0.1:8765'+route,timeout=5)
 if response.status_code!=200:errors.append(f'{route}: HTTP {response.status_code}')
print(f'Checked {len(parses)} pages and {links} internal links/assets; errors: {len(errors)}')
for error in errors:print(error)
raise SystemExit(bool(errors))
