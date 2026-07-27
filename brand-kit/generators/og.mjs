import { chromium } from 'playwright';
import fs from 'fs';
const mark=fs.readFileSync('assets/logo-mark.svg','utf8');
const wm=fs.readFileSync('assets/logo-wordmark-ink.svg','utf8');
const font=fs.readFileSync('space-grotesk.woff2').toString('base64');
const html=(title,sub,stats)=>`<html><head><style>
@font-face{font-family:SG;src:url(data:font/woff2;base64,${font}) format('woff2-variations');font-weight:300 700}
*{margin:0;box-sizing:border-box}
body{width:1200px;height:630px;background:#f7f8f3;font-family:SG,system-ui;color:#14180f;
 padding:64px 72px;display:flex;flex-direction:column;justify-content:space-between;
 background-image:radial-gradient(120% 90% at 100% -20%, rgba(203,255,60,.5) 0%, rgba(203,255,60,0) 62%)}
.top{display:flex;align-items:center;gap:20px}
.top svg{width:76px;height:76px}
.wm{height:52px}
h1{font-size:70px;line-height:1.02;letter-spacing:-.035em;font-weight:700;max-width:15ch}
.sub{font-size:27px;color:#5b6151;margin-top:20px;max-width:30ch;line-height:1.4}
.stats{display:flex;gap:52px;border-top:2px solid #dfe3d4;padding-top:26px}
.s .n{font-size:44px;font-weight:700;letter-spacing:-.03em;line-height:1}
.s .l{font-size:15px;color:#5b6151;letter-spacing:.1em;text-transform:uppercase;margin-top:7px;font-weight:600}
.rule{width:120px;height:9px;background:#cbff3c;border-radius:5px;margin-bottom:26px}
</style></head><body>
<div class="top">${mark}<img class="wm" src="data:image/svg+xml;base64,${Buffer.from(wm).toString('base64')}"></div>
<div><h1>${title}</h1><div class="sub">${sub}</div></div>
<div class="stats">${stats.map(([n,l])=>`<div class="s"><div class="n">${n}</div><div class="l">${l}</div></div>`).join('')}</div>
</body></html>`;
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
const ctx=await b.newContext({viewport:{width:1200,height:630},deviceScaleFactor:1});
const p=await ctx.newPage();
await p.setContent(html('Every gym, ring and court in Pattaya.',
  'An independent directory of every sport venue in Pattaya — priced with dates, re-checked on a rolling basis.',
  [['215','Listings'],['15','Sports'],['6','Neighbourhoods'],['47','Guides']]));
await p.waitForTimeout(600);
await p.screenshot({path:'assets/og-image.png'});
console.log('og-image.png', (fs.statSync('assets/og-image.png').size/1024).toFixed(1),'KB');
await b.close();
