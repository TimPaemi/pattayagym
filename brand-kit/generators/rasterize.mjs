import { chromium } from 'playwright';
import fs from 'fs';
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
async function png(svgFile,size,out,{bg=null}={}){
  const svg=fs.readFileSync('assets/'+svgFile,'utf8');
  const ctx=await b.newContext({viewport:{width:size,height:size},deviceScaleFactor:1});
  const p=await ctx.newPage();
  await p.setContent(`<html><head><style>
    *{margin:0;padding:0}
    html,body{width:${size}px;height:${size}px;overflow:hidden;${bg?`background:${bg};`:''}}
    svg{width:${size}px !important;height:${size}px !important;display:block}
  </style></head><body>${svg}</body></html>`);
  await p.waitForTimeout(150);
  await p.screenshot({path:out,omitBackground:!bg});
  await ctx.close();
  const kb=(fs.statSync(out).size/1024).toFixed(1);
  console.log(`  ${String(size).padStart(4)}px  ${out.replace('assets/','')}  ${kb} KB`);
}
for (const s of [16,32,48]) await png('favicon.svg',s,`assets/icon-${s}.png`);
await png('logo-mark.svg',180,'assets/icon-180.png');
await png('logo-mark.svg',192,'assets/icon-192.png');
await png('logo-mark.svg',512,'assets/icon-512.png');
await png('icon-maskable.svg',512,'assets/icon-512-maskable.png');
await png('logo-mark.svg',800,'assets/avatar-800.png');
await b.close();
