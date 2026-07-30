import puppeteer from 'puppeteer';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
const DIST = path.resolve('dist');
const MIME = {'.html':'text/html','.js':'text/javascript','.css':'text/css','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.json':'application/json','.svg':'image/svg+xml','.xml':'application/xml','.webm':'video/webm','.mp4':'video/mp4','.txt':'text/plain'};
const server = http.createServer((req,res)=>{const p=decodeURIComponent((req.url??'/').split('?')[0]);let f=path.join(DIST,p==='/'?'index.html':p);if(fs.existsSync(f)&&fs.statSync(f).isDirectory())f=path.join(f,'index.html');if(!fs.existsSync(f))f=path.join(DIST,'index.html');res.setHeader('content-type',MIME[path.extname(f)]??'application/octet-stream');fs.createReadStream(f).pipe(res);});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const port=server.address().port;
let browser;
try{browser=await puppeteer.launch({headless:'shell',args:['--no-sandbox']});}catch{browser=await puppeteer.launch({executablePath:'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe',args:['--no-sandbox']});}
let failures=0;
const check=(n,c,d='')=>{if(c)console.log(`PASS  ${n}`);else{failures++;console.error(`FAIL  ${n} ${d}`);}};
const digits=(s)=>s.replace(/\D/g,'');
async function visit(route){const page=await browser.newPage();await page.goto(`http://127.0.0.1:${port}${route}`,{waitUntil:'domcontentloaded',timeout:30000});await new Promise(r=>setTimeout(r,4000));return page;}
const price=(page)=>page.evaluate(()=>document.querySelector('.purchase-price-block p')?.textContent??'');
const clickRow=(page,t)=>page.evaluate((tt)=>{const b=[...document.querySelectorAll('button')].find(x=>x.textContent.includes(tt));if(!b)return false;b.click();return true;},t);

// Island: unlock in drawer, Completions group, what you get
const isl = await visit('/boosting/ffxiv/ffxiv-island-sanctuary');
const islText = await isl.evaluate(()=>document.body.innerText);
check('island what you get', islText.includes('Sanctuary Ranks 1 - 20') && islText.includes('All Logs completion (available as an add-on)') && !islText.includes('Time Saver'));
check('completions group', islText.includes('Completions') && islText.includes('Full Gathering Log') && islText.includes('Full Hunting Log'));
const t1 = await price(isl);
check('island base 380', digits(t1).startsWith('380'), t1);
await clickRow(isl,'Full Gathering Log');
await new Promise(r=>setTimeout(r,400));
const t2 = await price(isl);
check('gathering +150 = 530', digits(t2).startsWith('530'), t2);
await clickRow(isl,'Full Hunting Log');
await new Promise(r=>setTimeout(r,400));
const t3 = await price(isl);
check('hunting +100 = 630', digits(t3).startsWith('630'), t3);
await isl.evaluate(()=>{document.querySelector('.aob-toggle')?.click();});
await new Promise(r=>setTimeout(r,800));
const islAob = await isl.evaluate(()=>document.querySelector('.aob')?.textContent??'');
check('island unlock in drawer', islAob.includes('Island Sanctuary Unlock'));
await clickRow(isl,'Island Sanctuary Unlock');
await new Promise(r=>setTimeout(r,400));
const t4 = await price(isl);
check('unlock +5 = 635', digits(t4).startsWith('635'), t4);
await isl.close();

// Resistance: relic dropdown appears on check
const res = await visit('/boosting/ffxiv/ffxiv-resistance-rank');
let has = await res.evaluate(()=>!!document.querySelector('button[aria-label="Select Job"]'));
check('resistance: no dropdown before pick', !has);
await clickRow(res,'Complete Resistance Weapon');
await new Promise(r=>setTimeout(r,400));
has = await res.evaluate(()=>!!document.querySelector('button[aria-label="Select Job"]'));
check('resistance: job dropdown on pick', has);
await res.close();

// Eureka: weapon job dropdown + armour set dropdown with bundles
const eu = await visit('/boosting/ffxiv/ffxiv-eureka-leveling');
await clickRow(eu,'Complete Eureka Relic');
await new Promise(r=>setTimeout(r,400));
const euHas = await eu.evaluate(()=>!!document.querySelector('button[aria-label="Select Job"]'));
check('eureka: job dropdown on relic pick', euHas);
await eu.evaluate(()=>{const b=[...document.querySelectorAll('button')].find(x=>x.textContent.trim().startsWith('Elemental Armour') && !x.textContent.includes('+1'));b?.click();});
await new Promise(r=>setTimeout(r,400));
const setDd = await eu.evaluate(()=>{
  const b=document.querySelector('button[aria-label="Select Armour Set"]');
  if(!b) return null;
  b.click();
  return true;
});
check('eureka: armour set dropdown on armour pick', setDd === true);
await new Promise(r=>setTimeout(r,500));
const sets = await eu.evaluate(()=>{
  const dd=[...document.querySelectorAll('.max-h-60')].find(d=>d.querySelector('button'));
  return dd ? [...dd.querySelectorAll('button')].map(b=>b.textContent.trim()) : [];
});
check('7 armour sets with bundles',
  sets.length===7 && sets.includes('Elemental Set of Fending (PLD, WAR, DRK, GNB)') && sets.includes('Elemental Set of Healing (WHM, SCH, AST, SGE)'),
  JSON.stringify(sets));
await eu.close();

// Occult: phantom weapon job dropdown
const oc = await visit('/boosting/ffxiv/ffxiv-occult-crescent');
await clickRow(oc,'Complete Phantom Weapon');
await new Promise(r=>setTimeout(r,400));
const ocHas = await oc.evaluate(()=>!!document.querySelector('button[aria-label="Select Job"]'));
check('occult: job dropdown on weapon pick', ocHas);
await oc.close();

// Tags
const cat = await visit('/boosting/ffxiv?cat=field-explorations');
const catText = await cat.evaluate(()=>document.body.innerText);
check('tag2 updates', catText.includes('Resistance Relic') && catText.includes('Eureka Relic & Armour') && catText.includes('Phantom Relic & Jobs'));
await cat.close();
await browser.close();server.close();
console.log(failures?`${failures} check(s) FAILED`:'all checks passed');
process.exit(failures?1:0);
