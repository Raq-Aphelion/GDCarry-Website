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
async function visit(route){const page=await browser.newPage();await page.goto(`http://127.0.0.1:${port}${route}`,{waitUntil:'domcontentloaded',timeout:30000});await new Promise(r=>setTimeout(r,4000));return page;}

// Leveling cards: tag1 swapped with tag3
const lev = await visit('/boosting/ffxiv?cat=leveling');
const levText = await lev.evaluate(()=>document.body.innerText);
check('leveling tags swapped',
  levText.includes('Piloted Service') && levText.includes('Any job, any level') && levText.includes('Any level up to 80') && levText.includes('Any Expansion or Patches'));
await lev.close();

// Resistance: Relic Weapon above DC
const res = await visit('/boosting/ffxiv/ffxiv-resistance-rank');
const o1 = await res.evaluate(()=>[...document.querySelectorAll('.purchase-box p')].map(p=>p.textContent.trim()).filter(t=>t.length<30));
const i1=(t)=>o1.findIndex(h=>h.startsWith(t));
check('resistance: relic above DC', i1('Relic Weapon') > -1 && i1('Relic Weapon') < i1('Data Center'), JSON.stringify(o1));
await res.close();

// Eureka: DC right above Additional Options (below groups)
const eureka = await visit('/boosting/ffxiv/ffxiv-eureka-leveling');
const o2 = await eureka.evaluate(()=>[...document.querySelectorAll('.purchase-box p, .purchase-box .aob-toggle span')].map(p=>p.textContent.trim()).filter(t=>t.length<30));
const i2=(t)=>o2.findIndex(h=>h.startsWith(t));
check('eureka: groups above DC above additional options',
  i2('Relic Weapon') < i2('Data Center') && i2('Eurekan Armour') < i2('Data Center') && i2('Data Center') < i2('Additional Options'), JSON.stringify(o2));
const eurekaText = await eureka.evaluate(()=>document.body.innerText);
for (const t of ['Increased Elemental Level','Completion of Eureka zone progression','Baldesion Arsenal','Eureka Relic Weapon','lvl 1 to lvl 60','relic weapons and armor'])
  check(`eureka content: ${t.slice(0,35)}`, eurekaText.includes(t));
await eureka.close();
await browser.close();server.close();
console.log(failures?`${failures} check(s) FAILED`:'all checks passed');
process.exit(failures?1:0);
