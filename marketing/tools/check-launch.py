from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit, unquote, parse_qs
import json,xml.etree.ElementTree as ET
from PIL import Image
root=Path(__file__).resolve().parents[1]
class Page(HTMLParser):
 def __init__(self,p):super().__init__();self.p=p;self.refs=[];self.ids=set();self.h1=0;self.lang=False;self.title=False;self.viewport=False
 def handle_starttag(self,t,attrs):
  a=dict(attrs)
  if t=='html':self.lang=bool(a.get('lang'))
  if t=='title':self.title=True
  if t=='h1':self.h1+=1
  if t=='meta' and a.get('name')=='viewport':self.viewport=True
  if 'id' in a:assert a['id'] not in self.ids,(self.p,'duplicate id');self.ids.add(a['id'])
  if t=='img':assert a.get('alt'),(self.p,'missing alt')
  for k in ('src','href'):
   if k in a:self.refs.append(a[k])
pages={}
for p in root.glob('*.html'):
 c=Page(p);c.feed(p.read_text());pages[p.resolve()]=c
 assert c.h1==1 and c.lang and c.title and c.viewport,p
for p,c in pages.items():
 for ref in c.refs:
  u=urlsplit(ref)
  if u.scheme=='mailto':
   assert u.path=='ivantorresmia@gmail.com'
   if u.query:
    q=parse_qs(u.query);assert 'subject' in q and 'Device model:' in q['body'][0] and 'OS version:' in q['body'][0]
   continue
  if u.scheme:assert u.scheme=='https',ref;continue
  target=((root.parent / unquote(u.path).lstrip('/')) if u.path.startswith('/') else p.parent/unquote(u.path)).resolve() if u.path else p
  assert target.is_file(),(p,ref)
  if u.fragment:assert u.fragment in pages[target].ids,(p,ref)
 print(p.name+': structure, local links, assets, fragment targets and email URI passed')
for n in (16,32,48,180,192,512):assert Image.open(root/f'assets/icon-{n}.png').size==(n,n)
assert Image.open(root/'assets/social-preview.png').size==(1200,630)
assert Image.open(root/'assets/favicon.ico').ico.sizes()=={(16,16),(32,32),(48,48)}
m=json.loads((root/'site.webmanifest').read_text());assert len(m['icons'])==2
ET.parse(root/'sitemap.xml');ET.parse(root/'assets/room-mark.svg')
assert not any(x in (root/'index.html').read_text() for x in ('googletagmanager','google-analytics','fbq('))
print('Icon dimensions, ICO, social image, manifest, sitemap and SVG passed; no audience trackers found.')
