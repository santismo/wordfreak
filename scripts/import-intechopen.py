import urllib.request,json,re,concurrent.futures
from html.parser import HTMLParser
from pathlib import Path
sources=[(65630,'Introductory Chapter: The Future of Mobile Communications','Mark Stephen Leeson'),(61420,'Optical Wireless and Millimeter Waves for 5G Access Networks','Mark Stephen Leeson and Matthew David Higgins'),(59578,'Rateless Space-Time Block Codes for 5G Wireless Communication Systems','Ali Alqahtani'),(62178,'Evolution and Move toward Fifth-Generation Antenna','Kioumars Pedram, Mohsen Karamirad and Negin Pouyanfar'),(62865,'Where are the Things of the Internet? Precise Time of Arrival Estimation for IoT Positioning','Wen Xu, Armin Dammann and Tobias Laas')]
class Reader(HTMLParser):
 def __init__(self): super().__init__();self.depth=0;self.capture=None;self.parts=[];self.paragraphs=[]
 def handle_starttag(self,tag,attrs):
  d=dict(attrs)
  if tag=='div':
   if self.depth:self.depth+=1
   elif 'reader-body' in d.get('class','').split():self.depth=1
  if self.depth and not self.capture and tag in ['p','h2','h3','h4','figcaption','li']:self.capture=tag;self.parts=[]
 def handle_data(self,data):
  if self.depth and self.capture:self.parts.append(data)
 def handle_endtag(self,tag):
  if self.capture==tag:
   t=re.sub(r'\s+',' ',' '.join(self.parts)).strip()
   if t:self.paragraphs.append(t)
   self.capture=None;self.parts=[]
  if tag=='div' and self.depth:self.depth-=1

def get(s):
 i,title,author=s;url=f'https://www.intechopen.com/chapters/{i}'
 raw=urllib.request.urlopen(url,timeout=45).read().decode()
 license=re.search(r'https?://creativecommons.org/licenses/by/([\d.]+)/?',raw)
 if not license:raise ValueError(f'No CC BY license {i}')
 parser=Reader();parser.feed(raw)
 if len(' '.join(parser.paragraphs))<2000:raise ValueError('Too little body text')
 note=f'{title}. {author}. Published by IntechOpen in The Fifth Generation (5G) of Wireless Communication (2019), edited by Ahmed Kishk. Source: {url}. © 2019 The Author(s). CC BY {license[1]}: https://creativecommons.org/licenses/by/{license[1]}/. Adapted to flowing text; consult the original for figures, equations and tables.'
 return {'title':title,'author':author,'source':url,'license':f'https://creativecommons.org/licenses/by/{license[1]}/','paragraphs':[note]+parser.paragraphs}
with concurrent.futures.ThreadPoolExecutor(max_workers=5) as ex: chapters=list(ex.map(get,sources))
p=Path('data/books/5g-wireless-2019.json');p.write_text(json.dumps({'title':'The Fifth Generation (5G) of Wireless Communication','chapters':chapters},ensure_ascii=False,indent=2))
print([(c['title'],len(c['paragraphs'])) for c in chapters]);print(p.stat().st_size)
