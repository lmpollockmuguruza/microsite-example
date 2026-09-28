# Draws the mock-up logo mark, favicon and illustrations as SVG.
# Run from anywhere: python3 tools/illustrations.py
import os, pathlib
ROOT = pathlib.Path(__file__).resolve().parent.parent
OUT = str(ROOT / 'assets/images/illustrations')
os.makedirs(OUT, exist_ok=True)
NAVY='#003a69'; INK='#12263f'; SUN='#ffc845'; CORAL='#ff7a5c'; MINT='#37c3a0'; SKY='#cfe6fb'; SKYL='#eef6fd'; CREAM='#fff4e2'; LILAC='#b9a6f0'; PINK='#ffb3c1'; GREY='#c9d3df'; WHITE='#ffffff'; TEAL='#0f8b8d'
SKINS=['#f5cfa7','#d9a066','#a86b3c','#6b4226','#e8b48a']
HAIRS=['#2b1d14','#5a3a22','#1a1a1a','#c77d3a','#8a5a2b']

def svg(w,h,body,title=''):
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" width="{w}" height="{h}" role="presentation" aria-hidden="true">{body}</svg>\n'

def face(cx,cy,r):
    e=r*0.33
    return (f'<circle cx="{cx-e:.1f}" cy="{cy-r*0.05:.1f}" r="{r*0.09:.1f}" fill="{INK}"/>'
            f'<circle cx="{cx+e:.1f}" cy="{cy-r*0.05:.1f}" r="{r*0.09:.1f}" fill="{INK}"/>'
            f'<path d="M{cx-r*0.3:.1f} {cy+r*0.3:.1f} q{r*0.3:.1f} {r*0.28:.1f} {r*0.6:.1f} 0" stroke="{INK}" stroke-width="{max(1.5,r*0.1):.1f}" fill="none" stroke-linecap="round"/>'
            f'<circle cx="{cx-r*0.55:.1f}" cy="{cy+r*0.25:.1f}" r="{r*0.14:.1f}" fill="{CORAL}" opacity=".35"/>'
            f'<circle cx="{cx+r*0.55:.1f}" cy="{cy+r*0.25:.1f}" r="{r*0.14:.1f}" fill="{CORAL}" opacity=".35"/>')

def head(cx,cy,r,skin,hair,style='short'):
    s=''
    if style=='long':
        s+=f'<path d="M{cx-r*1.1} {cy+r*1.3} V{cy} a{r*1.1} {r*1.1} 0 0 1 {r*2.2} 0 V{cy+r*1.3} z" fill="{hair}"/>'
    if style=='bun':
        s+=f'<circle cx="{cx}" cy="{cy-r*1.05}" r="{r*0.45}" fill="{hair}"/>'
    s+=f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="{skin}"/>'
    if style in ('short','bun','long'):
        s+=f'<path d="M{cx-r*1.02} {cy-r*0.05} a{r*1.02} {r*1.02} 0 0 1 {r*2.04} 0 q{-r*0.5} {-r*0.55} {-r*1.2} {-r*0.45} q{-r*0.5} {r*0.1} {-r*0.84} {r*0.45} z" fill="{hair}"/>'
    elif style=='curly':
        for dx,dy in [(-0.8,-0.35),(-0.45,-0.8),(0,-0.95),(0.45,-0.8),(0.8,-0.35)]:
            s+=f'<circle cx="{cx+dx*r:.1f}" cy="{cy+dy*r:.1f}" r="{r*0.42:.1f}" fill="{hair}"/>'
    s+=face(cx,cy,r)
    return s

def standing(x,y,h,skin,hair,shirt,trousers,style='short',wave=False,bag=None):
    # x,y = feet centre on ground; h = total height
    r=h*0.12; hy=y-h+r; by=hy+r*1.05; bw=h*0.30; bh=h*0.38
    s=''
    if bag: s+=f'<rect x="{x-bw*0.75}" y="{by+bh*0.1}" width="{bw*0.5}" height="{bh*0.7}" rx="{bw*0.12}" fill="{bag}"/>'
    s+=f'<rect x="{x-bw*0.36}" y="{by+bh*0.85}" width="{bw*0.28}" height="{y-by-bh*0.85}" rx="{bw*0.1}" fill="{trousers}"/>'
    s+=f'<rect x="{x+bw*0.08}" y="{by+bh*0.85}" width="{bw*0.28}" height="{y-by-bh*0.85}" rx="{bw*0.1}" fill="{trousers}"/>'
    s+=f'<ellipse cx="{x-bw*0.24}" cy="{y}" rx="{bw*0.24}" ry="{bw*0.1}" fill="{INK}"/><ellipse cx="{x+bw*0.24}" cy="{y}" rx="{bw*0.24}" ry="{bw*0.1}" fill="{INK}"/>'
    s+=f'<rect x="{x-bw/2}" y="{by}" width="{bw}" height="{bh}" rx="{bw*0.4}" fill="{shirt}"/>'
    aw=bw*0.2
    s+=f'<path d="M{x-bw*0.42} {by+bh*0.2} l{-bw*0.2} {bh*0.55}" stroke="{shirt}" stroke-width="{aw}" stroke-linecap="round"/>'
    if wave:
        s+=f'<path d="M{x+bw*0.42} {by+bh*0.2} l{bw*0.35} {-bh*0.45}" stroke="{shirt}" stroke-width="{aw}" stroke-linecap="round"/><circle cx="{x+bw*0.8}" cy="{by-bh*0.3}" r="{aw*0.6}" fill="{skin}"/>'
    else:
        s+=f'<path d="M{x+bw*0.42} {by+bh*0.2} l{bw*0.2} {bh*0.55}" stroke="{shirt}" stroke-width="{aw}" stroke-linecap="round"/>'
    s+=f'<circle cx="{x-bw*0.62}" cy="{by+bh*0.8}" r="{aw*0.6}" fill="{skin}"/>'
    if not wave: s+=f'<circle cx="{x+bw*0.62}" cy="{by+bh*0.8}" r="{aw*0.6}" fill="{skin}"/>'
    s+=head(x,hy,r,skin,hair,style)
    return s

def plant(x,y,s=1):
    return (f'<g transform="translate({x} {y}) scale({s})"><path d="M0 0 C-30 -20 -28 -60 -6 -70 C-2 -40 0 -20 0 0z" fill="{MINT}"/>'
            f'<path d="M0 0 C30 -18 34 -52 12 -64 C6 -36 2 -18 0 0z" fill="{TEAL}"/>'
            f'<path d="M-16 0 h32 l-5 26 h-22z" fill="{CORAL}"/></g>')

def sun(x,y,r):
    rays=''.join(f'<rect x="{x-3}" y="{y-r-16}" width="6" height="10" rx="3" fill="{SUN}" transform="rotate({a} {x} {y})"/>' for a in range(0,360,45))
    return rays+f'<circle cx="{x}" cy="{y}" r="{r}" fill="{SUN}"/>'

def blob(cx,cy,rx,ry,fill):
    return f'<path d="M{cx-rx} {cy} C{cx-rx} {cy-ry*1.1} {cx-rx*0.2} {cy-ry} {cx+rx*0.3} {cy-ry*0.95} C{cx+rx*1.05} {cy-ry*0.9} {cx+rx*1.05} {cy+ry*0.2} {cx+rx*0.8} {cy+ry*0.7} C{cx+rx*0.5} {cy+ry*1.15} {cx-rx*0.6} {cy+ry*1.1} {cx-rx} {cy}z" fill="{fill}"/>'

def cloud(x,y,s=1,fill=WHITE):
    return f'<g transform="translate({x} {y}) scale({s})" fill="{fill}"><circle cx="0" cy="0" r="14"/><circle cx="18" cy="-8" r="18"/><circle cx="38" cy="0" r="14"/><rect x="0" y="-2" width="38" height="16" rx="8"/></g>'

def phone(x,y,w,h,frame=INK,screen=WHITE,rot=0):
    return (f'<g transform="rotate({rot} {x+w/2} {y+h/2})"><rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{w*0.16}" fill="{frame}"/>'
            f'<rect x="{x+w*0.07}" y="{y+w*0.12}" width="{w*0.86}" height="{h-w*0.24}" rx="{w*0.1}" fill="{screen}"/></g>')

def tick_badge(cx,cy,r,fill=MINT):
    return f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="{fill}"/><path d="M{cx-r*0.45} {cy} l{r*0.3} {r*0.32} l{r*0.6} {-r*0.62}" stroke="#fff" stroke-width="{r*0.28}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>'

def lock_badge(cx,cy,r):
    return (f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="{NAVY}"/><rect x="{cx-r*0.42}" y="{cy-r*0.05}" width="{r*0.84}" height="{r*0.6}" rx="{r*0.12}" fill="#fff"/>'
            f'<path d="M{cx-r*0.26} {cy-r*0.05} v-{r*0.2} a{r*0.26} {r*0.26} 0 0 1 {r*0.52} 0 v{r*0.2}" stroke="#fff" stroke-width="{r*0.16}" fill="none"/>')

def app_grid(x,y,cols,rows,size,gap,colors,states):
    s=''; i=0
    for rr in range(rows):
        for cc in range(cols):
            ax=x+cc*(size+gap); ay=y+rr*(size+gap)
            st=states[i%len(states)]; col=colors[i%len(colors)]
            if st=='on':
                s+=f'<rect x="{ax}" y="{ay}" width="{size}" height="{size}" rx="{size*0.26}" fill="{col}"/>'
            else:
                s+=f'<rect x="{ax}" y="{ay}" width="{size}" height="{size}" rx="{size*0.26}" fill="{GREY}" opacity=".6"/>'
            i+=1
    return s

# ---------------------------------------------------------------- logo mark
logo = svg(48,48,
  f'<circle cx="35" cy="13" r="8" fill="{SUN}"/>'
  f'<circle cx="18" cy="19" r="6.5" fill="{CORAL}"/><path d="M7 44v-5a11 11 0 0 1 22 0v5z" fill="{CORAL}"/>'
  f'<circle cx="32" cy="28" r="4.8" fill="{MINT}"/><path d="M24.5 44v-2.5a7.5 7.5 0 0 1 15 0V44z" fill="{MINT}"/>')
open(ROOT / 'assets/images/logo-mark.svg','w').write(logo)
open(ROOT / 'assets/images/favicon.svg','w').write(svg(48,48,
  f'<rect width="48" height="48" rx="12" fill="{NAVY}"/><circle cx="35" cy="13" r="7" fill="{SUN}"/><circle cx="18" cy="20" r="6" fill="{CORAL}"/><path d="M8 44v-4a10 10 0 0 1 20 0v4z" fill="{CORAL}"/><circle cx="32" cy="29" r="4.5" fill="{MINT}"/><path d="M25 44v-2a7 7 0 0 1 14 0v2z" fill="{MINT}"/>'))

# ---------------------------------------------------------------- public hero: school (no phones, safe for control group)
b = blob(250,175,230,140,SKYL)
b += sun(400,62,24) + cloud(70,70,1) + cloud(300,40,0.7)
# school
b += f'<rect x="150" y="120" width="190" height="130" rx="6" fill="{CREAM}"/>'
b += f'<path d="M135 125 L245 62 L355 125z" fill="{NAVY}"/>'
b += f'<circle cx="245" cy="100" r="13" fill="#fff"/><path d="M245 92v8l6 4" stroke="{NAVY}" stroke-width="3" fill="none" stroke-linecap="round"/>'
for wx in (168,208,262,302):
    b += f'<rect x="{wx}" y="140" width="24" height="24" rx="4" fill="{SKY}"/>'
b += f'<rect x="228" y="190" width="34" height="60" rx="17" fill="{CORAL}"/>'
b += f'<rect x="100" y="248" width="300" height="10" rx="5" fill="{MINT}" opacity=".5"/>'
b += f'<circle cx="112" cy="190" r="30" fill="{MINT}"/><rect x="108" y="200" width="8" height="50" fill="{TEAL}"/>'
b += f'<circle cx="378" cy="196" r="24" fill="{TEAL}"/><rect x="374" y="206" width="8" height="44" fill="{NAVY}"/>'
b += standing(70,300,110,SKINS[1],HAIRS[0],SUN,NAVY,'long',wave=True)
b += standing(115,300,78,SKINS[3],HAIRS[2],CORAL,INK,'curly',bag=MINT)
b += standing(405,300,80,SKINS[0],HAIRS[3],MINT,NAVY,'bun',bag=CORAL)
b += standing(445,300,72,SKINS[2],HAIRS[0],LILAC,INK,'short',bag=SUN)
open(f'{OUT}/school.svg','w').write(svg(500,310,b))

# ---------------------------------------------------------------- members hero: family together
b = blob(250,170,230,140,'#fde7d3')
b += sun(425,60,20)
# sofa
b += f'<rect x="90" y="175" width="320" height="80" rx="30" fill="{NAVY}"/><rect x="70" y="200" width="60" height="80" rx="24" fill="{NAVY}"/><rect x="370" y="200" width="60" height="80" rx="24" fill="{NAVY}"/><rect x="120" y="225" width="260" height="45" rx="16" fill="#1d5a91"/>'
# parent sitting
px,py=195,150
b += f'<rect x="{px-38}" y="{py}" width="76" height="90" rx="30" fill="{CORAL}"/>'
b += f'<rect x="{px-10}" y="225" width="90" height="26" rx="13" fill="{INK}"/><rect x="{px+60}" y="225" width="22" height="60" rx="10" fill="{INK}"/>'
b += head(px,py-28,30,SKINS[2],HAIRS[0],'long')
# child sitting
cx,cy=292,172
b += f'<rect x="{cx-28}" y="{cy}" width="56" height="66" rx="24" fill="{MINT}"/>'
b += f'<rect x="{cx-6}" y="228" width="60" height="20" rx="10" fill="{NAVY}" opacity=".9"/><rect x="{cx+36}" y="228" width="18" height="50" rx="9" fill="{SUN}"/>'
b += head(cx,cy-22,23,SKINS[2],HAIRS[2],'curly')
# shared tablet / guide
b += f'<g transform="rotate(-8 245 205)"><rect x="210" y="180" width="72" height="52" rx="8" fill="{INK}"/><rect x="215" y="185" width="62" height="42" rx="5" fill="#fff"/>'
b += f'<rect x="221" y="192" width="30" height="5" rx="2.5" fill="{NAVY}"/><rect x="221" y="202" width="46" height="4" rx="2" fill="{GREY}"/><rect x="221" y="210" width="40" height="4" rx="2" fill="{GREY}"/>'
b += tick_badge(266,218,6) + '</g>'
b += f'<path d="M{px+28} {py+30} q30 22 40 42" stroke="{CORAL}" stroke-width="14" fill="none" stroke-linecap="round"/><circle cx="{px+68}" cy="{py+74}" r="8" fill="{SKINS[2]}"/>'
b += f'<path d="M{cx-22} {cy+18} q-18 16 -30 28" stroke="{MINT}" stroke-width="11" fill="none" stroke-linecap="round"/><circle cx="{cx-52}" cy="{cy+48}" r="6.5" fill="{SKINS[2]}"/>'
# speech bubble with heart
b += f'<rect x="330" y="70" width="70" height="50" rx="18" fill="#fff"/><path d="M345 118 l-6 16 18-14z" fill="#fff"/>'
b += f'<path d="M365 104 c-12-8-16-14-12-20 3-5 10-5 12 1 2-6 9-6 12-1 4 6 0 12-12 20z" fill="{CORAL}"/>'
b += plant(460,255,1.1)
open(f'{OUT}/family.svg','w').write(svg(500,300,b))

# ---------------------------------------------------------------- iPhone guide
def restrict_phone(b, x, y, frame, label_color):
    b += phone(x,y,120,230,frame)
    b += f'<rect x="{x+44}" y="{y+18}" width="32" height="8" rx="4" fill="{frame}"/>'
    b += app_grid(x+18,y+42,3,4,24,9,[MINT,SUN,CORAL,SKY,LILAC,MINT,TEAL,SUN,CORAL,SKY,PINK,MINT],['on','on','on','off','off','on','off','off','off','off','on','off'])
    return b
b = blob(200,150,190,130,SKYL) + cloud(40,60,0.8)
b = restrict_phone(b,140,40,INK,NAVY)
b += tick_badge(152,90,0) 
b += lock_badge(268,205,22) + tick_badge(128,120,18)
b += f'<path d="M300 90 l30 -10 30 10 v26 c0 22-14 34-30 40 -16-6-30-18-30-40z" fill="{MINT}"/><path d="M318 110 l8 8 16-16" stroke="#fff" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>'
b += sun(60,210,14)
open(f'{OUT}/guide-iphone.svg','w').write(svg(400,300,b))

# ---------------------------------------------------------------- Android guide: parent phone linked to child phone
b = blob(200,150,190,130,'#e6f7f1') + cloud(300,40,0.7)
b += phone(40,90,90,170,NAVY) + app_grid(56,130,2,3,24,10,[CORAL,SKY,SUN],['on'])
b += f'<path d="M140 170 q60 -60 120 -20" stroke="{CORAL}" stroke-width="5" fill="none" stroke-dasharray="4 10" stroke-linecap="round"/>'
b += f'<circle cx="200" cy="138" r="18" fill="{SUN}"/><path d="M200 128v10l7 5" stroke="{INK}" stroke-width="3" fill="none" stroke-linecap="round"/>'
b = restrict_phone(b,250,50,'#2c3e50',NAVY)
b += lock_badge(372,215,20) + tick_badge(248,98,16)
open(f'{OUT}/guide-android.svg','w').write(svg(420,300,b))

# ---------------------------------------------------------------- Delay guide: child outdoors with kite
b = blob(200,160,190,130,'#fff1c9') + sun(330,60,22) + cloud(50,55,0.8)
b += f'<path d="M0 262 q100 -30 200 -6 t200 -4 V300 H0z" fill="{MINT}" opacity=".7"/>'
b += f'<path d="M250 70 l30 22 -12 38 -38 -22z" fill="{CORAL}"/><path d="M250 70 L256 118" stroke="#fff" stroke-width="2"/><path d="M230 108 q-10 50 -60 88" stroke="{INK}" stroke-width="2" fill="none"/>'
b += f'<path d="M256 130 q-6 10 4 16 q-10 6 -2 14" stroke="{SUN}" stroke-width="4" fill="none" stroke-linecap="round"/>'
b += standing(160,270,120,SKINS[4],HAIRS[3],SKY,NAVY,'bun',wave=True)
b += standing(95,270,150,SKINS[4],HAIRS[1],TEAL,INK,'short')
b += plant(345,262,0.9)
open(f'{OUT}/guide-delay.svg','w').write(svg(400,300,b))

# ---------------------------------------------------------------- Videos: webinar screen
b = blob(200,150,190,125,'#efeafd') + sun(350,55,16)
b += f'<rect x="70" y="60" width="260" height="170" rx="16" fill="{INK}"/><rect x="82" y="72" width="236" height="134" rx="8" fill="#fff"/>'
tiles=[(88,78,SKY,SKINS[0],HAIRS[3],'long'),(206,78,'#fde7d3',SKINS[3],HAIRS[2],'curly'),(88,144,'#e6f7f1',SKINS[1],HAIRS[0],'short'),(206,144,'#fff1c9',SKINS[2],HAIRS[1],'bun')]
for tx,ty,bg,sk,hr,st in tiles:
    b += f'<rect x="{tx}" y="{ty}" width="106" height="58" rx="6" fill="{bg}"/>'
    b += f'<rect x="{tx+36}" y="{ty+38}" width="34" height="20" rx="10" fill="{NAVY}"/>' + head(tx+53,ty+26,13,sk,hr,st)
b += f'<rect x="170" y="230" width="60" height="30" fill="{INK}"/><rect x="130" y="258" width="140" height="12" rx="6" fill="{INK}"/>'
b += f'<circle cx="200" cy="140" r="26" fill="{CORAL}"/><path d="M192 127v26l22-13z" fill="#fff"/>'
open(f'{OUT}/videos.svg','w').write(svg(400,290,b))

# ---------------------------------------------------------------- Upload: phone with chart and arrow
b = blob(200,150,180,125,'#e6f7f1') + cloud(290,50,0.8)
b += phone(130,45,130,240,INK)
for i,(hgt,col) in enumerate([(40,SKY),(70,MINT),(30,SKY),(90,MINT),(55,SKY),(20,SKY),(60,MINT)]):
    b += f'<rect x="{150+i*14}" y="{200-hgt}" width="9" height="{hgt}" rx="4" fill="{col}"/>'
b += f'<rect x="150" y="80" width="60" height="8" rx="4" fill="{NAVY}"/><rect x="150" y="96" width="40" height="6" rx="3" fill="{GREY}"/><rect x="150" y="220" width="90" height="8" rx="4" fill="{GREY}"/><rect x="150" y="236" width="70" height="8" rx="4" fill="{GREY}"/>'
b += f'<circle cx="290" cy="150" r="34" fill="{CORAL}"/><path d="M290 168v-34m-14 14l14-14 14 14" stroke="#fff" stroke-width="7" fill="none" stroke-linecap="round" stroke-linejoin="round"/>'
b += tick_badge(96,110,18) + sun(80,230,12)
open(f'{OUT}/upload.svg','w').write(svg(400,300,b))

# ---------------------------------------------------------------- Help: speech bubbles
b = blob(200,150,180,120,'#fde7d3')
b += f'<rect x="70" y="60" width="150" height="100" rx="30" fill="{NAVY}"/><path d="M110 156 l-16 34 44-34z" fill="{NAVY}"/>'
b += f'<text x="145" y="132" text-anchor="middle" font-family="Nunito, Arial, sans-serif" font-weight="900" font-size="64" fill="{SUN}">?</text>'
b += f'<rect x="190" y="130" width="140" height="90" rx="28" fill="#fff"/><path d="M290 216 l20 30 -44-30z" fill="#fff"/>'
b += f'<path d="M260 196 c-22-14-30-26-22-38 6-10 18-9 22 2 4-11 16-12 22-2 8 12 0 24-22 38z" fill="{CORAL}"/>'
b += sun(340,70,14) + cloud(40,230,0.7)
open(f'{OUT}/help.svg','w').write(svg(400,280,b))

# ---------------------------------------------------------------- Sign in: key and door
b = blob(200,150,170,120,SKYL)
b += f'<rect x="130" y="50" width="130" height="200" rx="60" fill="{NAVY}"/><rect x="145" y="65" width="100" height="185" rx="50" fill="{SUN}"/>'
b += f'<circle cx="222" cy="160" r="7" fill="{NAVY}"/>'
b += f'<g transform="rotate(-30 300 180)"><circle cx="300" cy="180" r="24" fill="{CORAL}"/><circle cx="300" cy="180" r="9" fill="{SKYL}"/><rect x="320" y="174" width="60" height="12" rx="6" fill="{CORAL}"/><rect x="360" y="186" width="10" height="16" rx="3" fill="{CORAL}"/><rect x="344" y="186" width="10" height="12" rx="3" fill="{CORAL}"/></g>'
b += plant(90,250,0.8)
open(f'{OUT}/sign-in.svg','w').write(svg(400,280,b))
print('ok')
