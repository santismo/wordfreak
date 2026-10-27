/* Conservative lexical correspondence: never guess a pair from position alone. */
(() => {
  'use strict';
  const normalize = value => value.normalize('NFKC').toLocaleLowerCase().replace(/[يى]/g,'ی').replace(/ك/g,'ک').replace(/[\p{M}\u200c\u200d]/gu,'').replace(/[^\p{L}\p{N}]/gu,'');
  function equivalent(a,b,language) {
    a=normalize(a);b=normalize(b);if(!a || !b)return false;if(a===b)return true;
    if(language==='en') { const stem=w=>w.length>4?w.replace(/(?:ing|ed|es|s)$/,''):w;return stem(a)===stem(b); }
    if(language==='ru') { const stem=w=>w.replace(/(?:ыми|ого|ому|ая|ый|ой|ое|ые|ым|ую|ий|ей|ия|ии|ие|ов|ам|ах|ом|ы|и|а|я|у|ю|е|ь)$/,'');const x=stem(a),y=stem(b);return x.length>=4 && x===y; }
    return false;
  }
  function findPhrase(words, phrase, language, ratio=0) {
    const wanted=normalize(phrase);if(!wanted)return [];
    const matches=[];
    for(let i=0;i<words.length;i++) for(let length=1;length<=5 && i+length<=words.length;length++) {
      if(equivalent(words.slice(i,i+length).join(' '),wanted,language))matches.push(Array.from({length},(_,offset)=>i+offset));
    }
    return matches.sort((a,b)=>Math.abs(a[0]/Math.max(1,words.length-1)-ratio)-Math.abs(b[0]/Math.max(1,words.length-1)-ratio))[0] || [];
  }
  function create({sourceRoot,targetRoot,tokenize,translate,announce}) {
    let source=[],target=[],from='en',to='fa',selected=[],serial=0,press=null;
    const links=new Map(),translations=new Map();
    const key=node=>source.includes(node)?`s:${source.indexOf(node)}`:`t:${target.indexOf(node)}`;
    const owns=node=>source.includes(node)||target.includes(node);
    function clearHighlight() {serial++;for(const node of selected){node.classList.remove('paired-word');node.setAttribute('aria-pressed','false');}selected=[];announce('');}
    function clear() {
      clearHighlight();press=null;links.clear();
      for(const node of source){node.removeAttribute('role');node.removeAttribute('tabindex');node.removeAttribute('aria-pressed');node.classList.remove('pairable-word');}
      source=[];target=[];
    }
    function configure(sentence,value,sourceLanguage,targetLanguage) {
      clear();from=sourceLanguage;to=targetLanguage;
      source=[...sentence.querySelectorAll('.reader-word:not(.sentence-end)')];targetRoot.replaceChildren();
      for(const part of tokenize(value,to)) {
        if(!part.word){targetRoot.append(document.createTextNode(part.text));continue;}
        const span=document.createElement('span');span.textContent=part.text;span.className='translation-word';target.push(span);targetRoot.append(span);
      }
      for(const node of [...source,...target]){node.classList.add('pairable-word');node.setAttribute('role','button');node.tabIndex=0;node.setAttribute('aria-pressed','false');}
    }
    async function translated(value,a,b) {
      const id=`${a}|${b}|${value}`;if(translations.has(id))return translations.get(id);
      const promise=Promise.resolve().then(()=>translate(value,a,b)).catch(()=>'');translations.set(id,promise);
      const result=await promise;if(!result)translations.delete(id);if(translations.size>160)translations.delete(translations.keys().next().value);return result;
    }
    function paint(nodes) {selected=nodes;for(const node of nodes){node.classList.add('paired-word');node.setAttribute('aria-pressed','true');}}
    async function toggle(node) {
      if(!owns(node))return;
      if(selected.includes(node)){clearHighlight();return;}
      clearHighlight();const version=serial;paint([node]);
      const same=source.includes(node)?source:target,other=source.includes(node)?target:source;
      const a=same===source?from:to,b=same===source?to:from;
      const ratio=same.indexOf(node)/Math.max(1,same.length-1);
      const cached=links.get(key(node));
      if(cached){paint(cached);return;}
      const words=other.map(n=>n.textContent);
      let match=findPhrase(words,node.textContent,b,ratio);
      if(!match.length) {
        const value=await translated(node.textContent,a,b);if(version!==serial)return;
        match=findPhrase(words,value,b,ratio);
      }
      // A contextual sentence may use a different inflection/synonym. Check a
      // bounded set in reverse; relative position only orders lexical candidates.
      if(!match.length) {
        const candidates=other.map((n,i)=>i).sort((x,y)=>Math.abs(x/Math.max(1,other.length-1)-ratio)-Math.abs(y/Math.max(1,other.length-1)-ratio)).slice(0,8);
        for(let i=0;i<candidates.length && !match.length;i+=2) {
          if(version!==serial)return;
          const results=await Promise.all(candidates.slice(i,i+2).map(async index=>({index,value:await translated(words[index],b,a)})));
          if(version!==serial)return;
          const found=results.find(r=>equivalent(r.value,node.textContent,a));if(found)match=[found.index];
        }
      }
      if(version!==serial || !owns(node))return;
      if(!match.length){announce('No direct word match found in this sentence.');return;}
      const paired=[node,...match.map(index=>other[index])];
      for(const n of paired)links.set(key(n),paired);
      paint(paired);announce(`${node.textContent}: ${match.map(i=>words[i]).join(' ')}`);
    }
    function candidate(event) {const node=event.target.closest('.pairable-word');return owns(node)?node:null;}
    for(const root of [sourceRoot,targetRoot]) {
      root.addEventListener('pointerdown',event=>{const node=candidate(event);if(!node || event.button>0)return;event.stopImmediatePropagation();press={node,id:event.pointerId,x:event.clientX,y:event.clientY,moved:false};},{capture:true});
      root.addEventListener('pointermove',event=>{if(press && press.id===event.pointerId && Math.hypot(event.clientX-press.x,event.clientY-press.y)>9)press.moved=true;},{passive:true});
      root.addEventListener('pointerup',event=>{if(!press || press.id!==event.pointerId)return;const p=press;press=null;if(!p.moved && candidate(event)===p.node)void toggle(p.node);});
      root.addEventListener('pointercancel',()=>{press=null;});
      root.addEventListener('keydown',event=>{const node=candidate(event);if(node && ['Enter',' '].includes(event.key)){event.preventDefault();if(!event.repeat)void toggle(node);}});
    }
    return {configure,clear,toggle};
  }
  window.WordfreakWordPairing={create,findPhrase,equivalent};
})();
