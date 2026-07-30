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

const cat = await visit('/boosting/ffxiv?cat=reputation');
const card = await cat.evaluate(()=>{const a=[...document.querySelectorAll('a')].find(x=>x.href.includes('beast-tribes'));return {text:a?.textContent??'', img:a?.querySelector('img')?.getAttribute('src')??''};});
check('card renamed', card.text.includes('Allied Society Reputation Boost') && !card.text.includes('Beast Tribe'));
check('card image', card.img.includes('allied-society'));
await cat.close();

const page = await visit('/boosting/ffxiv/ffxiv-beast-tribes');
const text = await page.evaluate(()=>document.body.innerText);
for (const t of ['Target Rank Reached','Exclusive Society Mounts','Titles & Questlines','Currencies & Rewards Kept','Allied Society'])
  check(`content: ${t.slice(0,25)}`, text.includes(t));
const t1 = await price(page);
check('default faction 1->8 = 105', digits(t1).startsWith('105'), t1);

// Faction dropdown: newest first, reverse order
await page.evaluate(()=>{document.querySelector('button[aria-label="Select allied society"]')?.click();});
await new Promise(r=>setTimeout(r,500));
const factions = await page.evaluate(()=>{
  const dd=[...document.querySelectorAll('.max-h-60')].find(d=>d.querySelector('button'));
  return dd ? [...dd.querySelectorAll('button')].map(b=>b.textContent.trim()) : [];
});
check('20 factions reverse order', factions.length===20 && factions[0].startsWith('Pelupelu') && factions[19].startsWith('Sahagin'), JSON.stringify(factions.slice(0,3)));

// ARR tribe caps at rank 4 -> 1->4 = 45
await page.evaluate(()=>{
  const dd=[...document.querySelectorAll('.max-h-60')].find(d=>d.querySelector('button'));
  [...dd.querySelectorAll('button')].find(x=>x.textContent.trim().startsWith('Amalj'))?.click();
});
await new Promise(r=>setTimeout(r,400));
const t2 = await price(page);
check("amalj'aa 1->4 = 45", digits(t2).startsWith('45'), t2);

// Ixali caps at 7 -> 90
await page.evaluate(()=>{document.querySelector('button[aria-label="Select allied society"]')?.click();});
await new Promise(r=>setTimeout(r,400));
await page.evaluate(()=>{
  const dd=[...document.querySelectorAll('.max-h-60')].find(d=>d.querySelector('button'));
  [...dd.querySelectorAll('button')].find(x=>x.textContent.trim().startsWith('Ixali'))?.click();
});
await new Promise(r=>setTimeout(r,400));
const t3 = await price(page);
check('ixali 1->7 = 90', digits(t3).startsWith('90'), t3);

// drawer has stream+priority
await page.evaluate(()=>{document.querySelector('.aob-toggle')?.click();});
await new Promise(r=>setTimeout(r,800));
const aob = await page.evaluate(()=>document.querySelector('.aob')?.textContent??'');
check('drawer stream+priority', aob.includes('Private Stream') && aob.includes('Priority'));
await page.close();
await browser.close();server.close();
console.log(failures?`${failures} check(s) FAILED`:'all checks passed');
process.exit(failures?1:0);
