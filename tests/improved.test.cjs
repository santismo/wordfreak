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
 const sw=fs.readFileSync('sw.js','utf8');for(const asset of ['improved.html','improved.css?v=7','improved.js?v=10','app.js?v=58','styles.css?v=33'])assert.ok(sw.includes(asset));
 assert.ok(fs.readFileSync('index.html','utf8').includes('href="improved.html"'));
});

function readerFunction(name, nextName) {
 const start = improved.indexOf(`  function ${name}(`) >= 0 ? improved.indexOf(`  function ${name}(`) : improved.indexOf(`  async function ${name}(`);
 const end = improved.indexOf(`  function ${nextName}(`,start);
 return improved.slice(start,end).trim();
}
const fitLensFont=vm.runInNewContext(`(${readerFunction('fitLensFont','fitLensLabel')})`);
test('word translations shrink inside the selected footprint, with a readable overflow fallback',()=>{
 const short=fitLensFont(40,80,30,24);assert.equal(short.overflow,false);assert.equal(short.size,24);
 const longer=fitLensFont(120,75,30,24);assert.equal(longer.size,15);assert.equal(longer.overflow,false);
 const tiny=fitLensFont(220,18,30,24);assert.equal(tiny.size,10);assert.equal(tiny.overflow,true);
 const tall=fitLensFont(40,100,20,32);assert.ok(tall.size*1.12<=20);
});
function lensHarness() {
 const nodes=new Map(); const classes=new Set();
 const get=id=>{if(!nodes.has(id))nodes.set(id,{textContent:'',lang:'',dir:''});return nodes.get(id);};
 let resolve;const calls=[];const result={};
 const selected={textContent:'سلام',classList:{contains:()=>false,remove(){}},closest:()=>({dataset:{text:'سلام دنیا.'}})};
 const context={word:selected,api:{languages:{en:{label:'English',dir:'ltr'}},translate:(...args)=>{calls.push(args);return new Promise(r=>resolve=r);}},prefs:{reading:'fa',translation:'en'},requestVersion:0,holdTimer:0,holding:true,dragging:false,pointerId:1,dragPoint:null,autoScroll:0,lensFitKey:'',lens:{hidden:false,classList:{add:(...names)=>names.forEach(n=>classes.add(n)),remove:(...names)=>names.forEach(n=>classes.delete(n))}},$:get,clearTimeout(){},cancelAnimationFrame(){},positionLens(){},updateReadingControls(){},translationKey:v=>'fa|en|'+v,nearbyTranslations:new Map(),rememberNearby(){},scheduleNearbyTranslations(){},openDock:(mode,source,value)=>Object.assign(result,{mode,source,value}),clearSentenceOutline(){},closeDock:()=>{for(const key of Object.keys(result))delete result[key];}};
 vm.createContext(context);
 vm.runInContext(readerFunction('clearLens','selectWord'),context);
 const start=improved.indexOf('  async function translateSelection('), end=improved.indexOf("  document.addEventListener('pointerdown'",start);
 vm.runInContext(improved.slice(start,end),context);
 return {context,calls,result,resolve:value=>resolve(value),nodes,classes};
}
test('tapping the glass requests the entire displayed sentence and uses the reserved panel',async()=>{
 const h=lensHarness();const work=h.context.translateSelection(true);
 assert.deepEqual(h.calls[0],['سلام دنیا.','fa','en']);assert.equal(h.result.mode,'sentence');
 h.resolve('Hello world.');await work;assert.equal(h.result.value,'Hello world.');assert.ok(!h.classes.has('translating'));
});
test('releasing a hold keeps a slow word translation, but dismissing discards it',async()=>{
 const h=lensHarness();const work=h.context.translateSelection();h.context.releaseLens();h.resolve('Hello');await work;
 assert.equal(h.nodes.get('lensTranslation').textContent,'Hello');
 const late=h.context.translateSelection();h.context.clearLens();h.resolve('Stale result');await late;
 assert.equal(h.context.word,null);assert.equal(h.context.lens.hidden,true);assert.notEqual(h.nodes.get('lensTranslation').textContent,'Stale result');assert.deepEqual(h.result,{});
});

test('held navigation follows the speed slider and stops without a trailing step',()=>{
 const pending=new Map();let id=0;const steps=[];
 const c={prefs:{stepRate:120},repeatTimer:0,repeatDirection:0,stepSelection:d=>steps.push(d),setTimeout:(fn,delay)=>{pending.set(++id,{fn,delay});return id;},clearTimeout:key=>pending.delete(key)};
 vm.createContext(c);vm.runInContext(readerFunction('stopRepeating','startRepeating'),c);
 const start=improved.indexOf('  function startRepeating('),end=improved.indexOf('  for(const [id,direction]',start);vm.runInContext(improved.slice(start,end),c);
 c.startRepeating(1);assert.deepEqual(steps,[1]);assert.equal(pending.get(c.repeatTimer).delay,500);
 let tick=pending.get(c.repeatTimer);pending.delete(c.repeatTimer);tick.fn();assert.deepEqual(steps,[1,1]);
 c.prefs.stepRate=60;tick=pending.get(c.repeatTimer);pending.delete(c.repeatTimer);tick.fn();assert.equal(pending.get(c.repeatTimer).delay,1000);
 c.stopRepeating();assert.equal(pending.size,0);assert.equal(steps.length,3);
 c.startRepeating(-1);assert.equal(steps.at(-1),-1);c.stopRepeating();
});
test('locked translation and sentence navigation have distinct toggle behavior',()=>{
 const requests=[];const c={prefs:{sentenceMode:false,translateLocked:false},centerHeld:false,centerTapTimer:0,lastCenterTap:1,requestVersion:0,ensureSelection:()=>true,clearTimeout(){},closeDock(){},lens:{classList:{remove(){}}},updateReadingControls(){},savePrefs(){},translateSelection:full=>requests.push(Boolean(full)),positionLens(){}};
 vm.createContext(c);vm.runInContext(readerFunction('toggleSentenceMode','lockTranslation'),c);
 const start=improved.indexOf('  function lockTranslation('),end=improved.indexOf("  const center=$('translateButton')",start);vm.runInContext(improved.slice(start,end),c);
 c.lockTranslation();assert.equal(c.prefs.translateLocked,true);assert.equal(c.prefs.sentenceMode,false);assert.equal(requests.at(-1),false);
 c.toggleSentenceMode();assert.equal(c.prefs.sentenceMode,true);assert.equal(requests.at(-1),true);
 c.toggleSentenceMode();assert.equal(c.prefs.sentenceMode,false);assert.equal(c.prefs.translateLocked,true);
 c.lockTranslation();assert.equal(c.prefs.translateLocked,false);
});
test('preloading is bounded to one worker and skips obsolete language or book jobs',async()=>{
 let active=0,peak=0;const calls=[];const cache=new Map();
 const c={preloadRunning:false,preloadQueue:[{value:'old',from:'en',to:'ru',generation:1},{value:'سلام',from:'fa',to:'en',generation:2},{value:'دنیا',from:'fa',to:'en',generation:2}],generation:2,prefs:{reading:'fa',translation:'en'},nearbyTranslations:cache,rememberNearby:(key,value)=>cache.set(key,value),api:{translate:async(value)=>{active++;peak=Math.max(peak,active);calls.push(value);await Promise.resolve();active--;return value==='سلام'?'Hello':'World';}}};
 vm.createContext(c);const start=improved.indexOf('  async function runNearbyTranslations('),end=improved.indexOf("  $('lensHandle').addEventListener('keydown'",start);vm.runInContext(improved.slice(start,end),c);
 await Promise.all([c.runNearbyTranslations(),c.runNearbyTranslations()]);assert.deepEqual(calls,['سلام','دنیا']);assert.equal(peak,1);assert.equal(cache.size,2);
});

test('individual translation failures stay in the glass without opening a bottom popup',async()=>{
 const h=lensHarness();h.nodes.set('lensSurface',{title:''});const work=h.context.translateSelection();h.resolve('');await work;
 assert.deepEqual(h.result,{});assert.equal(h.nodes.get('lensTranslation').textContent,'↻');
 assert.ok(!improved.includes("openDock('word'"));
});
test('pace slider and runtime allow 300 steps per minute',()=>{
 assert.match(fs.readFileSync('improved.html','utf8'),/id="stepSpeed"[^>]*max="300"/);
 assert.match(improved,/Math\.min\(300,Number\(prefs\.stepRate\)/);
});

 test('library combines genre, topic and access filters without treating borrowing links as reader books',()=>{
 const start=improved.indexOf('  function matchesLibrary(');
 const end=improved.indexOf('  function renderLibrary(', start);
 const context={};vm.runInNewContext(improved.slice(start,end)+';this.matches=matchesLibrary;',context);
 const book={title:'Books of Blood',author:'Clive Barker',genres:['horror','shorts'],external:true};
 assert.equal(context.matches(book,'clive blood','horror','external'),true);
 assert.equal(context.matches(book,'clive','horror','reader'),false);
 assert.equal(context.matches(book,'','science',''),false);
 const technical={title:'GSM, LTE and 5G specifications',author:'3GPP',genres:['telecommunications','gsm','5g','science'],external:true};
 assert.equal(context.matches(technical,'5g','telecommunications','external'),true);
 const data=JSON.parse(improved.slice(improved.indexOf('  const extraBooks = ')+21,improved.indexOf(';\n  const externalFavorites')));
 assert.equal(new Set(data.map(b=>b.id)).size,data.length);
 assert.ok(data.filter(b=>!b.external).length>=8);
 for(const b of data)assert.equal(new URL(b.link).protocol,'https:');
 });

test('sentence mode outlines the complete sentence and removes the floating word lens',()=>{
 const classes=new Set();const sentence={classList:{add:n=>classes.add(n),remove:n=>classes.delete(n)}};
 const wordClasses=new Set(['active-word']);
 const c={outlinedSentence:null,prefs:{lens:true,sentenceMode:true},word:{isConnected:true,closest:()=>sentence,classList:{remove:n=>wordClasses.delete(n)}},lens:{hidden:false}};
 vm.createContext(c);vm.runInContext(readerFunction('clearSentenceOutline','positionLens')+readerFunction('positionLens','armTranslation'),c);
 c.positionLens();assert.equal(c.lens.hidden,true);assert.ok(classes.has('active-sentence'));assert.equal(wordClasses.size,0);
 c.word=null;c.positionLens();assert.equal(classes.size,0);
});
test('sentence dock contains only translated text',()=>{
 const nodes=new Map();const $=id=>{if(!nodes.has(id))nodes.set(id,{textContent:'old source',setAttribute(){}});return nodes.get(id);};
 const c={$,pairing:{clear(){},configure(){}},word:null,api:{languages:{en:{label:'English',dir:'ltr'}}},prefs:{translation:'en'},syncDockSpace(){},keepSelectionVisible(){},positionLens(){}};
 vm.createContext(c);vm.runInContext(readerFunction('openDock','clearLens').split("  if (typeof ResizeObserver")[0],c);
 c.openDock('sentence','Original sentence.','Translated sentence.');
 assert.equal($('dockSource').textContent,'');assert.equal($('dockSource').hidden,true);assert.equal($('dockTranslation').textContent,'Translated sentence.');
});
test('publications preserve chapter boundaries, source language and reading progress',()=>{
 const c={window:{},Intl,localStorage:{getItem:()=>JSON.stringify({'publication:test':{index:2}})}};
 vm.runInNewContext(fs.readFileSync('publications.js','utf8'),c);
 const api=c.window.WordfreakPublications;
 const parsed=api.buildDocument({id:'publication:test',language:'fa'},[{title:'اول',paragraphs:['سلام دنیا. چطوری؟']},{title:'دوم',paragraphs:['خوبم.']}]);
 assert.equal(parsed.chapters.length,2);assert.equal(parsed.chapters[1].start,2);assert.equal(parsed.sentences[2].chapterIndex,1);assert.equal(parsed.savedIndex,2);
 assert.throws(()=>api.buildDocument({id:'empty'},[{paragraphs:[' ']}]),/No selectable text/);
 const bundled=JSON.parse(fs.readFileSync('data/books/5g-wireless-2019.json','utf8'));
 assert.equal(bundled.chapters.length,5);
 for(const chapter of bundled.chapters) {assert.ok(chapter.source.startsWith('https://www.intechopen.com/chapters/'));assert.ok(chapter.license.includes('creativecommons.org/licenses/by/'));assert.ok(chapter.paragraphs[0].includes(chapter.author));}
 const book=api.buildDocument({id:'5g',language:'en'},bundled.chapters);assert.ok(book.sentences.length>500);assert.equal(book.chapters.length,5);
});

test('holding a word in sentence mode keeps translating its sentence',async()=>{
 const h=lensHarness();h.context.prefs.sentenceMode=true;const work=h.context.translateSelection();
 assert.deepEqual(h.calls[0],['سلام دنیا.','fa','en']);h.resolve('Hello world.');await work;assert.equal(h.result.mode,'sentence');
});

function pairHarness(translator, options = {}) {
 const node=text=>({textContent:text,classes:new Set(),attrs:{},classList:{},addEventListener(){},setAttribute(k,v){this.attrs[k]=v;},removeAttribute(k){delete this.attrs[k];},append(...nodes){this.children.push(...nodes);},replaceChildren(){this.children=[];},children:[]});
 const make=text=>{const n=node(text);n.classList={add:c=>n.classes.add(c),remove:c=>n.classes.delete(c)};return n;};
 const context={window:{},document:{createElement:()=>make(''),createTextNode:make},console};
 vm.runInNewContext(fs.readFileSync('word-pairing.js','utf8'),context);
 const root=make(''),target=make(''),source=(options.source || ['Hello','world']).map(make);
 const pairing=context.window.WordfreakWordPairing.create({sourceRoot:root,targetRoot:target,tokenize:value=>value.split(' ').map(text=>({text,word:true})),translate:translator,announce(){}});
 const configure=()=>pairing.configure({querySelectorAll:()=>source,textContent:options.noContext?'':source.map(n=>n.textContent).join(' ')},options.target || 'سلام دنیا',options.from || 'en',options.to || 'fa');configure();
 return {pairing,source,target,configure,logic:context.window.WordfreakWordPairing};
}
test('word pairing works in both directions, toggles off and replaces earlier highlights',async()=>{
 const h=pairHarness(async value=>({'Hello':'سلام','world':'دنیا','سلام':'Hello','دنیا':'world'}[value] || ''));
 await h.pairing.toggle(h.source[0]);assert.ok(h.source[0].classes.has('paired-word'));assert.ok(h.target.children[0].classes.has('paired-word'));
 await h.pairing.toggle(h.target.children[0]);assert.ok(!h.source[0].classes.has('paired-word'));assert.ok(!h.target.children[0].classes.has('paired-word'));
 await h.pairing.toggle(h.target.children[1]);assert.ok(h.source[1].classes.has('paired-word'));
 await h.pairing.toggle(h.source[0]);assert.ok(!h.source[1].classes.has('paired-word'));assert.ok(!h.target.children[1].classes.has('paired-word'));
 h.pairing.clear();assert.ok(h.source.every(n=>!n.classes.has('paired-word')));
});
test('late word matches cannot re-highlight after another tap or sentence change',async()=>{
 let resolve;const h=pairHarness(()=>new Promise(r=>resolve=r),{noContext:true});
 const pending=h.pairing.toggle(h.source[0]);await Promise.resolve();await h.pairing.toggle(h.source[0]);resolve('سلام');await pending;
 assert.ok(h.source.every(n=>!n.classes.has('paired-word')));assert.ok(h.target.children.every(n=>!n.classes.has('paired-word')));
 const h2=pairHarness(()=>new Promise(r=>resolve=r),{noContext:true});const next=h2.pairing.toggle(h2.source[0]);await Promise.resolve();h2.configure();resolve('سلام');await next;
 assert.ok(h2.source.every(n=>!n.classes.has('paired-word')));assert.ok(h2.target.children.every(n=>!n.classes.has('paired-word')));
});
test('pairing supports phrases and repeated words without positional guesses',()=>{
 const {logic}=pairHarness(async()=> '');
 assert.deepEqual(Array.from(logic.findPhrase(['a','mobile','phone','rings'],'mobile phone','en')),[1,2]);
 assert.deepEqual(Array.from(logic.findPhrase(['world','hello','world'],'world','en',1)),[2]);
 assert.deepEqual(Array.from(logic.findPhrase(['unrelated','words'],'hello','en')),[]);
 assert.equal(logic.equivalent('موبايل','موبایل','fa'),true);
 assert.equal(logic.equivalent('мобильной','мобильный','ru'),true);
});

test('Farsi forms handle half-spaces, attached plurals and possessives without collapsing short words',()=>{
 const {logic}=pairHarness(async()=> '');
 for(const [a,b] of [['کتاب‌هایم','کتاب'],['خانه‌هایشان','خانه'],['پولم','پول'],['ماشینم','ماشین'],['برنامه‌ها','برنامه'],['مقدّمۀ','مقدمه']])assert.equal(logic.equivalent(a,b,'fa'),true,`${a} / ${b}`);
 assert.equal(logic.equivalent('مردم','مرد','fa'),false);
 assert.equal(logic.equivalent('کار','بار','fa'),false);
 assert.deepEqual(Array.from(logic.findPhrase(['کتاب','کتاب‌هایم'],'کتاب‌هایم','fa',0)),[1]);
});
test('contextual translation resolves a different word sense in the displayed sentence',async()=>{
 const calls=[];const h=pairHarness(async value=>{calls.push(value);return value==='شیر'?'milk':value.includes('⟦شیر⟧')?'⟦lion⟧ sleeps':'';},{source:['شیر','می‌خوابد'],target:'lion sleeps',from:'fa',to:'en'});
 await h.pairing.toggle(h.source[0]);assert.ok(h.target.children[0].classes.has('paired-word'));assert.ok(calls.includes('⟦شیر⟧ می‌خوابد'));
});
test('Persian compound matches highlight both source words and corresponding target phrase',async()=>{
 const h=pairHarness(async value=>value==='کیف پولم'?'my wallet':value==='کیف'?'bag':'',{source:['کیف','پولم'],target:'my wallet',from:'fa',to:'en'});
 await h.pairing.toggle(h.source[0]);assert.ok(h.source.every(n=>n.classes.has('paired-word')));assert.ok(h.target.children.every(n=>n.classes.has('paired-word')));
 await h.pairing.toggle(h.target.children[1]);assert.ok(h.source.every(n=>!n.classes.has('paired-word')));
});
test('reverse matching reaches a Persian counterpart beyond the old eight-word window',async()=>{
 const far=['یک','دو','سه','چهار','پنج','شش','هفت','هشت','نه','ده','یازده','رسید'];
 const h=pairHarness(async value=>value==='arrived'?'وارد شد':value==='رسید'?'arrived':'',{source:['arrived','yesterday'],target:far.join(' '),from:'en',to:'fa'});
 await h.pairing.toggle(h.source[0]);assert.ok(h.target.children[11].classes.has('paired-word'));
});
test('context markers preserve repeated occurrences and reject missing or ambiguous markers',()=>{
 const {logic}=pairHarness(async()=> '');assert.equal(logic.markedContext('کتاب و کتاب',['کتاب','و','کتاب'],2),'کتاب و ⟦کتاب⟧');
 assert.equal(logic.contextualPhrase('the ⟦book⟧'),'book');assert.equal(logic.contextualPhrase('book'),'');assert.equal(logic.contextualPhrase('⟦a⟧ ⟦b⟧'),'');
});

test('Farsi context wins when an isolated sense also appears elsewhere in the target sentence',async()=>{
 const h=pairHarness(async value=>value.includes('⟦شیر⟧')?'The ⟦lion⟧ drinks milk':value==='شیر'?'milk':'',{source:['شیر','شیر','می‌نوشد'],target:'The lion drinks milk',from:'fa',to:'en'});
 await h.pairing.toggle(h.source[0]);assert.ok(h.target.children[1].classes.has('paired-word'));assert.ok(!h.target.children[3].classes.has('paired-word'));
});
