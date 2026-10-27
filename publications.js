/* Local publication imports. Text is stored on this device, never uploaded. */
(() => {
  'use strict';
  const DB = 'wordfreak-publications-v1';
  const LIMIT = 30 * 1024 * 1024;
  const PDF_VERSION = '6.4.299';
  async function database() {
    return new Promise((resolve,reject) => {
      const request=indexedDB.open(DB,1);
      request.onupgradeneeded=()=>request.result.createObjectStore('books',{keyPath:'book.id'});
      request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error);
    });
  }
  async function storage(action,value) {
    const db=await database();
    try { return await new Promise((resolve,reject)=>{
      const tx=db.transaction('books',action==='put'?'readwrite':'readonly');
      const store=tx.objectStore('books');const request=value===undefined?store[action]():store[action](value);
      let result;request.onsuccess=()=>{result=request.result;};tx.oncomplete=()=>resolve(result);tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error || Error('Storage unavailable'));
    }); } finally { db.close(); }
  }
  function buildDocument(book, sections) {
    const sentences=[], chapters=[];let paragraphIndex=0;
    const segmenter=new Intl.Segmenter(book.language || 'en',{granularity:'sentence'});
    for(const section of sections) {
      const start=sentences.length, chapterIndex=chapters.length;
      for(const paragraph of section.paragraphs || []) {
        const clean=String(paragraph).replace(/\s+/g,' ').trim();if(!clean)continue;
        for(const part of segmenter.segment(clean)) if(part.segment.trim()) sentences.push({text:part.segment.trim(),paragraphIndex,chapterIndex});
        paragraphIndex++;
      }
      if(sentences.length>start) chapters.push({title:section.title || `Section ${chapterIndex+1}`,start,end:sentences.length-1,index:chapterIndex});
    }
    if(!sentences.length)throw Error('No selectable text found. Scanned PDFs need OCR before importing.');
    let savedIndex=0;try { savedIndex=JSON.parse(localStorage.getItem('wordfreak:book-progress:v1') || '{}')[book.id]?.index || 0; } catch {}
    return {book,sentences,chapters,savedIndex};
  }
  function htmlSections(raw,title) {
    const doc=new DOMParser().parseFromString(raw,'text/html');
    doc.querySelectorAll('script,style,nav,header,footer,aside,form,iframe,svg,[hidden]').forEach(n=>n.remove());
    const root=doc.querySelector('.reader-body, .ltx_document, [data-type="page"], article, main') || doc.body;
    const sections=[];let section={title,paragraphs:[]};
    for(const node of root.querySelectorAll('h1,h2,h3,p,li,pre,blockquote')) {
      if(node.parentElement?.closest('p,li,pre,blockquote'))continue;
      const value=node.textContent.trim();if(!value)continue;
      if(/^H[123]$/.test(node.tagName)) { if(section.paragraphs.length)sections.push(section);section={title:value,paragraphs:[]}; }
      else section.paragraphs.push(value);
    }
    if(section.paragraphs.length)sections.push(section);
    return sections;
  }
  async function pdfSections(bytes,progress) {
    const pdfjs=await import(`https://cdn.jsdelivr.net/npm/pdfjs-dist@${PDF_VERSION}/legacy/build/pdf.mjs`);
    pdfjs.GlobalWorkerOptions.workerSrc=`https://cdn.jsdelivr.net/npm/pdfjs-dist@${PDF_VERSION}/legacy/build/pdf.worker.mjs`;
    const task=pdfjs.getDocument({data:new Uint8Array(bytes),isEvalSupported:false});
    task.onPassword=()=>task.destroy();
    const pdf=await task.promise;const sections=[];
    try {
      if(pdf.numPages>1500)throw Error('Please split PDFs longer than 1,500 pages before importing.');
      for(let i=1;i<=pdf.numPages;i++) {
        progress?.(`Reading PDF page ${i} of ${pdf.numPages}…`);
        const page=await pdf.getPage(i);const content=await page.getTextContent();
        let lines=[],line='';
        for(const item of content.items) {if(!('str' in item))continue;line+=item.str+' ';if(item.hasEOL){lines.push(line.trim());line='';}}
        if(line.trim())lines.push(line.trim());
        // Keep each source page as a chapter for citations and navigation.
        sections.push({title:`Page ${i}`,paragraphs:lines.join('\n').split(/\n\s*\n/).map(p=>p.replace(/\n/g,' '))});page.cleanup();
      }
    } finally {await task.destroy();}
    return sections;
  }
  async function importFile(file,language='en',progress) {
    if(file.size>LIMIT)throw Error('Choose a file smaller than 30 MB.');
    const bytes=await file.arrayBuffer();const title=file.name.replace(/\.[^.]+$/,'');
    const id='publication:'+Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes))).map(n=>n.toString(16).padStart(2,'0')).join('')+':'+language;
    const book={id,source:'publication',title,author:'Imported document',language,genres:['nonfiction'],link:'',access:'On this device · text reader'};
    let sections;
    if(new TextDecoder().decode(bytes.slice(0,5))==='%PDF-')sections=await pdfSections(bytes,progress);
    else if(/\.(txt|md|html?|xhtml)$/i.test(file.name)) {
      const raw=new TextDecoder().decode(bytes);
      sections=/\.(html?|xhtml)$/i.test(file.name)?htmlSections(raw,title):[{title,paragraphs:raw.split(/\r?\n\s*\r?\n/)}];
    } else throw Error('Use a text-based PDF, TXT, Markdown or HTML file.');
    const result=buildDocument(book,sections);await storage('put',{book,sections});return result;
  }
  async function open(book) {
    if(book.dataUrl) {
      const response=await fetch(book.dataUrl);if(!response.ok)throw Error('Publication download failed.');
      const payload=await response.json();return buildDocument(book,payload.chapters);
    }
    const saved=await storage('get',book.id);if(!saved)throw Error('This file is not on this device. Import it again from Library.');
    return buildDocument(saved.book,saved.sections);
  }
  async function openPdf(book,progress) {
    const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),20000);
    try {
      const response=await fetch(book.link,{credentials:'omit',signal:controller.signal});
      if(!response.ok)throw Error('Download unavailable');
      if(Number(response.headers.get('content-length'))>LIMIT)throw Error('File exceeds 30 MB');
      const blob=await response.blob();
      const result=await importFile(new File([blob],book.title+'.pdf'), 'en',progress);
      result.book={...result.book,title:book.title,author:book.author,link:book.link,genres:book.genres};
      // Persist source attribution with the extracted document.
      const record=await storage('get',result.book.id);record.book=result.book;await storage('put',record);
      return result;
    } catch {throw Error('This publisher cannot send the PDF directly to this reader. Download it using its publisher link, then use “Import a publication”.');}
    finally {clearTimeout(timer);}
  }
  window.WordfreakPublications={buildDocument,htmlSections,importFile,open,openPdf,list:async()=> (await storage('getAll')).map(r=>r.book)};
})();
