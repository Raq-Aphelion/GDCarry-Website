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
const setInput=(page,label,value)=>page.evaluate((l,v)=>{
  const input=[...document.querySelectorAll('input')].find(i=>i.getAttribute('aria-label')===l);
  if(!input) return false;
  const setter=Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,'value').set;
  setter.call(input,v);
  input.dispatchEvent(new Event('input',{bubbles:true}));
  return true;
},label,value);

// Card
const cat = await visit('/boosting/ffxiv?cat=field-explorations');
const card = await cat.evaluate(()=>{const a=[...document.querySelectorAll('a')].find(x=>x.href.includes('occult-job-unlocks'));return a?.textContent??'';});
check('card Occult Crescent Boost', card.includes('Occult Crescent Boost') && card.includes('Phantom jobs & relic steps'));
check('card From 20', card.replace(/\D/g,'').includes('20'));
await cat.close();

// Page
const page = await visit('/boosting/ffxiv/ffxiv-occult-job-unlocks');
const text = await page.evaluate(()=>document.body.innerText);
for (const t of ['Occult Crescent Glamour','Phantom Jobs','Relic Steps','Occult Crescent Bunnies','Have a level 100 Job','Own the Dawntrail Expansion','Occult Crescent Unlocked','Piloted vs AFK Carry'])
  check(`content: ${t.slice(0,30)}`, text.includes(t));
check('Phantom Job select', text.includes('Phantom Job'));
check('freelancer default 1->2 = 20', digits(await price(page)).startsWith('20'), await price(page));

// Switch to Berserker (max 3) via CustomSelect
await page.evaluate(()=>{const b=[...document.querySelectorAll('.purchase-box button')].find(x=>x.textContent.includes('Freelancer'));b?.click();});
await new Promise(r=>setTimeout(r,400));
await page.evaluate(()=>{const o=[...document.querySelectorAll('[role="option"], li, button')].find(x=>x.textContent.trim()==='Berserker');o?.click();});
await new Promise(r=>setTimeout(r,400));
// end input to 3 => 1->3 = 40
await setInput(page,'Desired level','3');
await new Promise(r=>setTimeout(r,400));
const t1 = await price(page);
check('berserker 1->3 = 40', digits(t1).startsWith('40'), t1);

// Unlock addon +35
await page.evaluate(()=>{const b=document.querySelector('.aob-toggle');b?.click();});
await new Promise(r=>setTimeout(r,800));
const aob = await page.evaluate(()=>document.querySelector('.aob')?.textContent??'');
check('unlock addon in drawer', aob.includes('Unlock Occult Crescent'));
await page.evaluate(()=>{const b=[...document.querySelectorAll('button')].find(x=>x.textContent.includes('Unlock Occult Crescent'));b?.click();});
await new Promise(r=>setTimeout(r,400));
const t2 = await price(page);
check('unlock +35 = 75', digits(t2).startsWith('75'), t2);
check('completion 3 Days', text.includes('3 Days'));
await page.close();
await browser.close();server.close();
console.log(failures?`${failures} check(s) FAILED`:'all checks passed');
process.exit(failures?1:0);
