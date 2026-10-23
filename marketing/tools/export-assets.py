from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'assets'
PINE='#263d33'; PAPER='#f3f0e8'; CLAY='#b85936'
def mark(size):
 im=Image.new('RGB',(size,size),PINE); d=ImageDraw.Draw(im)
 pts=lambda seq:[(round(x*size/64),round(y*size/64)) for x,y in seq]
 w=max(1,round(size*4/64))
 d.line(pts([(18,45),(18,19),(46,19),(46,45)]),fill=PAPER,width=w,joint='curve')
 d.line(pts([(32,45),(32,30),(46,30)]),fill=PAPER,width=w,joint='curve')
 r=w/2
 for x,y in pts([(18,45),(46,45),(32,45)]):d.ellipse((x-r,y-r,x+r,y+r),fill=PAPER)
 return im
base=mark(1024)
for n in (16,32,48,180,192,512):base.resize((n,n),Image.Resampling.LANCZOS).save(OUT/f'icon-{n}.png')
base.save(OUT/'favicon.ico',sizes=[(16,16),(32,32),(48,48)])
def font(n,bold=False):return ImageFont.truetype('/System/Library/Fonts/Supplemental/Arial'+(' Bold' if bold else '')+'.ttf',n)
im=Image.new('RGB',(1200,630),PAPER);d=ImageDraw.Draw(im)
im.paste(base.resize((70,70),Image.Resampling.LANCZOS),(70,60))
d.text((158,68),'room',font=font(53,True),fill=PINE);d.text((291,68),'.',font=font(53,True),fill=CLAY)
d.text((70,210),'Your screen.',font=font(82),fill=PINE);d.text((70,305),'Your space.',font=font(82),fill=PINE)
d.text((74,465),'Make an old screen feel at home.',font=font(26),fill=PINE)
d.text((74,559),'getroomdisplay.com',font=font(22),fill=PINE)
d.rounded_rectangle((790,111,1120,524),radius=29,fill='#efeee7',outline='#b6bbb0',width=2)
d.ellipse((951,128,958,135),fill=PINE)
d.rectangle((813,154,1097,473),fill=CLAY)
d.text((841,239),'hello',font=font(61),fill=PAPER);d.text((841,306),'again.',font=font(61),fill=PAPER)
d.ellipse((944,487,966,509),outline='#a6aca0',width=2)
im.save(OUT/'social-preview.png')
print('Exported 6 PNG icons, ICO and 1200 × 630 social preview.')
