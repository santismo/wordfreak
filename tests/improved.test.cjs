const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync('app.js','utf8');
function engine(fetcher) {
  const data = new Map(); const storage = {getItem:k=>data.get(k)||null,setItem:(k,v)=>data.set(k,v)};
  const nodes = new Map();
  const node = () => ({ value:'',checked:true,textContent:'',style:{},classList:{add(){},remove(){},toggle(){}}, addEventListener(){}, setAttribute(){}, appendChild(){}, replaceChildren(){} });
  const document={getElementById(id){if(!nodes.has(id))nodes.set(id,node());return nodes.get(id);},querySelectorAll(){return[];},createElement:node,body:node()};
  const context={document,localStorage:storage,location:{search:'?reader-engine=1',href:'https://example.org/index.html?reader-engine=1',origin:'https://example.org'},navigator:{},console,URL,URLSearchParams,TextEncoder,AbortController,Response,Intl,fetch:fetcher, setTimeout:()=>1,clearTimeout(){},performance};
  context.window=context;context.parent={};context.addEventListener=()=>{};
  vm.runInNewContext(source,context);
  return {api:context.WordfreakReader,data};
}
test('reader bridge starts without vocabulary fetches and exposes the real catalog',()=>{
 const {api}=engine(()=>{throw Error('Unexpected startup fetch')});
 assert.equal(api.languages.fa.dir,'rtl');
 assert.equal(api.catalog().length,81);
 assert.ok(api.catalog().some(b=>b.source==='usaf'));
});
test('Farsi to Russian is a direct request, deduplicated and cached',async()=>{
 let calls=[];
 const {api}=engine(async url=>{calls.push(url);return{ok:true,json:async()=>[[['Привет, мир!']]]};});
 const results=await Promise.all([api.translate('سلام دنیا','fa','ru'),api.translate('سلام دنیا','fa','ru')]);
 assert.equal(results[0],'Привет, мир!');assert.equal(calls.length,1);
 assert.equal(new URL(calls[0]).searchParams.get('sl'),'fa');assert.equal(new URL(calls[0]).searchParams.get('tl'),'ru');
 await api.translate('سلام دنیا','fa','ru');assert.equal(calls.length,1);
});
test('unchanged and wrong-script translations fall through; failures are retried',async()=>{
 let calls=0,good=false;
 const {api}=engine(async url=>{calls++;return{ok:true,json:async()=>url.includes('googleapis')?[[[good?'سلام':'Hello']]]:url.includes('lingva')?{translation:'Hello'}:{responseData:{translatedText:'Hello'}}};});
 assert.equal(await api.translate('Hello','en','fa'),''); assert.equal(calls,3);
 good=true;assert.equal(await api.translate('Hello','en','fa'),'سلام');assert.equal(calls,4);
});
test('long paragraphs skip the size-limited fallback and reject punctuation',async()=>{
 const urls=[];const {api}=engine(async url=>{urls.push(url);return{ok:false};});
 assert.equal(await api.translate('A long paragraph. '.repeat(40),'en','fa'),'');assert.equal(urls.length,2);assert.ok(!urls.some(u=>u.includes('mymemory')));
 await api.translate('…','en','ru');assert.equal(urls.length,2);
});
test('favorites and progress keep Classic storage format and preserve other books',()=>{
 const {api,data}=engine(()=>{});const book=api.catalog()[0];
 assert.equal(api.favorite(book),true);assert.ok(api.favorites().includes(book.id));assert.equal(api.favorite(book),false);
 data.set('wordfreak:book-progress:v1',JSON.stringify({unrelated:{index:42}}));
 api.save(book,7,500,'fa');const stored=JSON.parse(data.get('wordfreak:book-progress:v1'));
 assert.equal(stored[book.id].index,7);assert.equal(stored[book.id].language,'fa');assert.equal(stored.unrelated.index,42);
});
const improved=fs.readFileSync('improved.js','utf8');
const tokenizeCode=improved.slice(improved.indexOf('  function tokenize('),improved.indexOf('  function fillBlock('));
const tokenize=vm.runInNewContext(`(${tokenizeCode.trim()})`,{Intl});
test('tokenization keeps Farsi half-spaces and merges sentence endings for hold targets',()=>{
 const fa=tokenize('من می‌روم. ', 'fa');assert.ok(fa.some(p=>p.text==='می‌روم'&&p.word));assert.equal(fa.at(-1).text,'. ');
 const en=tokenize('“Hello.” Next sentence! ', 'en');assert.ok(en.some(p=>p.text==='.” '));
 const ja=tokenize('今日は晴れです。','ja');assert.ok(ja.filter(p=>p.word).length>1);assert.equal(ja.at(-1).text,'。');
});
test('page IDs used by the new controller exist and offline assets are versioned together',()=>{
 const html=fs.readFileSync('improved.html','utf8');const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);assert.equal(new Set(ids).size,ids.length);
 for(const match of improved.matchAll(/\$\('([^']+)'\)/g))assert.ok(ids.includes(match[1]),`Missing ${match[1]}`);
 const sw=fs.readFileSync('sw.js','utf8');for(const asset of ['improved.html','improved.css?v=1','improved.js?v=2','app.js?v=57','styles.css?v=33'])assert.ok(sw.includes(asset));
 assert.ok(fs.readFileSync('index.html','utf8').includes('href="improved.html"'));
});
