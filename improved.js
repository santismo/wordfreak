(() => {
  'use strict';
  const $ = (id) => document.getElementById(id);
  const SETTINGS_KEY = 'wordfreak:improved:settings:v1';
  const LAST_BOOK_KEY = 'wordfreak:improved:last-book:v1';
  const fonts = { times: '"Times New Roman", Times, serif', georgia: 'Georgia, serif', palatino: 'Palatino, "Palatino Linotype", serif', sans: '-apple-system, BlinkMacSystemFont, sans-serif' };
  const readStorage = (key, fallback) => { try { return JSON.parse(localStorage.getItem(key)) || fallback; } catch { return fallback; } };
  const writeStorage = (key, value) => { try { localStorage.setItem(key, JSON.stringify(value)); } catch { status('Browser storage is full. This session still works, but new settings may not be saved.', 6000); } };
  const prefs = { font: 'times', size: 24, spacing: '1.85', theme: 'black', reading: 'en', translation: 'fa', lens: true, ...readStorage(SETTINGS_KEY, {}) };
  let api, catalog = [], shelf = 'all', current = null, generation = 0, renderedStart = 0, renderedEnd = 0, savedIndex = 0;
  let word = null, holding = false, pointerId = null, pointerStart = null, dragging = false, holdTimer = 0, requestVersion = 0, hideTimer = 0, saveTimer = 0, statusTimer = 0, scrollFrame = 0, activeJobs = 0, searchVersion = 0;
  let jobs = [], blocks = new Map(), readingObserver, autoScroll = 0, dragPoint = null, favorites = new Set();
  const scroll = $('readingScroll');
  const text = $('readingText');
  const lens = $('glassLens');
  function status(message, duration = 0) { clearTimeout(statusTimer); $('readerStatus').textContent = message; if (duration) statusTimer = setTimeout(() => { $('readerStatus').textContent = ''; }, duration); }
  function savePrefs() { writeStorage(SETTINGS_KEY, prefs); }
  function applyAppearance() {
    if (!fonts[prefs.font]) prefs.font = 'times';
    if (!['paper','sepia','night','black'].includes(prefs.theme)) prefs.theme = 'black';
    prefs.size = Math.max(18, Math.min(40, Number(prefs.size) || 24));
    if (!['1.55','1.85','2.15'].includes(String(prefs.spacing))) prefs.spacing = '1.85';
    document.body.dataset.theme = prefs.theme;
    document.documentElement.style.setProperty('--reader-font', fonts[prefs.font]);
    document.documentElement.style.setProperty('--reader-size', `${prefs.size}px`);
    document.documentElement.style.setProperty('--reader-spacing', prefs.spacing);
    $('fontSelect').value = prefs.font; $('fontSize').value = prefs.size; $('fontSizeOutput').textContent = `${prefs.size} px`; $('spacingSelect').value = prefs.spacing;
    document.querySelectorAll('.theme-picker button').forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.theme === prefs.theme)));
    $('lensToggle').setAttribute('aria-pressed', String(prefs.lens));
    document.querySelector('meta[name="theme-color"]').content = getComputedStyle(document.body).getPropertyValue('--paper').trim();
    if (word) positionLens();
  }
  function showDialog(id) { releaseLens(); $(id).showModal(); }
  document.querySelectorAll('[data-close]').forEach((button) => button.addEventListener('click', () => button.closest('dialog').close()));
  document.querySelectorAll('dialog').forEach((dialog) => dialog.addEventListener('click', (event) => { if (event.target !== dialog) return; const r = dialog.getBoundingClientRect(); if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) dialog.close(); }));
  $('appearanceButton').onclick = () => showDialog('appearanceDialog');
  $('libraryButton').onclick = $('chooseBook').onclick = () => { renderLibrary(); showDialog('libraryDialog'); };
  $('fontSelect').onchange = (event) => { prefs.font = event.target.value; applyAppearance(); savePrefs(); };
  $('fontSize').oninput = (event) => { prefs.size = Number(event.target.value); applyAppearance(); savePrefs(); };
  $('spacingSelect').onchange = (event) => { prefs.spacing = event.target.value; applyAppearance(); savePrefs(); };
  document.querySelectorAll('.theme-picker button').forEach((button) => button.onclick = () => { prefs.theme = button.dataset.theme; applyAppearance(); savePrefs(); });
  function focusMode(on) {
    document.body.classList.toggle('focus-mode', on); $('focusButton').setAttribute('aria-pressed', String(on)); $('exitFocus').hidden = !on;
    // Fullscreen is optional: the edge-to-edge layout also works on iPhone Safari.
    if (on && document.documentElement.requestFullscreen) document.documentElement.requestFullscreen().catch(() => {});
    if (!on && document.fullscreenElement) document.exitFullscreen().catch(() => {});
    positionLens();
  }
  $('focusButton').onclick = () => focusMode(true);
  $('exitFocus').onclick = () => focusMode(false);
  document.addEventListener('fullscreenchange', () => { if (!document.fullscreenElement) { document.body.classList.remove('focus-mode'); $('exitFocus').hidden = true; $('focusButton').setAttribute('aria-pressed','false'); } });
  $('lensToggle').onclick = () => { prefs.lens = !prefs.lens; if (!prefs.lens) clearLens(); applyAppearance(); savePrefs(); };

  function renderLibrary(books) {
    if (!api) return;
    favorites = new Set(api.favorites());
    const query = $('bookSearch').value.trim().toLocaleLowerCase();
    const results = (books || catalog).filter((book) => (shelf !== 'favorites' || favorites.has(book.id)) && (shelf !== 'official' || book.source === 'usaf') && (!query || `${book.title} ${book.author}`.toLocaleLowerCase().includes(query)));
    $('bookGrid').replaceChildren();
    for (const [index, book] of results.entries()) {
      const card = document.createElement('article'); card.className = 'library-book';
      const open = document.createElement('button'); open.className = 'open-book';
      const number = document.createElement('span'); number.className = 'book-spine'; number.textContent = `${String(index + 1).padStart(2,'0')} / ${book.source === 'usaf' ? 'OFFICIAL EDITION' : 'THE READING LIBRARY'}`;
      const title = document.createElement('strong'); title.textContent = book.title;
      const author = document.createElement('small'); author.textContent = book.author || 'Unknown author';
      open.append(number, title, author); open.onclick = () => openBook(book);
      const favorite = document.createElement('button'); favorite.className = 'favorite-book'; favorite.textContent = favorites.has(book.id) ? '★' : '☆'; favorite.setAttribute('aria-pressed', String(favorites.has(book.id))); favorite.setAttribute('aria-label', `Favorite ${book.title}`);
      favorite.onclick = () => { api.favorite(book); catalog = api.catalog(); renderLibrary(books); };
      card.append(open, favorite); $('bookGrid').append(card);
    }
    if (!results.length) { const empty = document.createElement('p'); empty.textContent = shelf === 'favorites' ? 'Star a book to keep it here.' : 'No books match. Try another title or search the wider library.'; $('bookGrid').append(empty); }
    $('searchMore').hidden = !query || shelf !== 'all';
  }
  document.querySelectorAll('[data-shelf]').forEach((button) => button.onclick = () => { shelf = button.dataset.shelf; document.querySelectorAll('[data-shelf]').forEach((tab) => tab.setAttribute('aria-pressed', String(tab === button))); renderLibrary(); });
  $('bookSearch').oninput = () => { searchVersion++; renderLibrary(); };
  $('librarySearch').onsubmit = (event) => { event.preventDefault(); renderLibrary(); };
  $('searchMore').onclick = async () => {
    const request = ++searchVersion; const query = $('bookSearch').value.trim();
    $('searchMore').disabled = true; $('searchMore').textContent = 'Searching…';
    try { const result = await api.search(query); if (request === searchVersion) { renderLibrary(result.books); status(`${result.books.length} library results`, 3000); } }
    catch { status('The wider library is unavailable. Your curated shelf is still available.', 6000); }
    finally { $('searchMore').disabled = false; $('searchMore').textContent = 'Search the wider library ↗'; }
  };
  async function openBook(book) {
    const token = ++generation;
    persistProgress(); clearLens(); readingObserver?.disconnect(); jobs = [];
    $('libraryDialog').close(); status(`Opening ${book.title}…`);
    try {
      const result = await api.open(book);
      if (token !== generation) return;
      current = result; savedIndex = Math.min(result.savedIndex, result.sentences.length - 1);
      writeStorage(LAST_BOOK_KEY, result.book);
      $('bookTitle').textContent = result.book.title; $('bookAuthor').textContent = result.book.author;
      $('editionLabel').textContent = 'WORD FREAK IMPROVED · THE READING EDITION';
      $('sourceLink').href = result.book.link; $('sourceLink').hidden = false;
      $('sourceLink').textContent = result.book.source === 'usaf' ? 'Official USAF source ↗' : 'Original edition ↗';
      $('welcome').hidden = true; $('chaptersButton').disabled = false; $('previousWord').disabled = $('nextWord').disabled = false;
      renderWindow(savedIndex); renderChapters();
      status(prefs.reading === 'en' ? 'Tap a word. Drag the handle. Hold to translate.' : `Preparing your ${api.languages[prefs.reading].label} reading view…`, 6000);
    } catch (error) { if (token === generation) { status(`Could not open this book: ${error.message}`, 10000); renderLibrary(); showDialog('libraryDialog'); } }
  }
  function tokenize(value, language) {
    const parts = typeof Intl.Segmenter === 'function'
      ? [...new Intl.Segmenter(language, {granularity:'word'}).segment(value)].map((part) => ({ text: part.segment, word: part.isWordLike }))
      : (value.match(/[\p{L}\p{M}\p{N}\u200c]+(?:['’\-][\p{L}\p{M}\p{N}\u200c]+)*|[^\p{L}\p{M}\p{N}\u200c]+/gu) || []).map((part) => ({text:part,word:/[\p{L}\p{N}]/u.test(part)}));
    return parts.reduce((merged, part) => {
      if (!part.word && merged.length && !merged[merged.length-1].word) merged[merged.length-1].text += part.text;
      else merged.push({...part});
      return merged;
    }, []);
  }
  function fillBlock(block, value) {
    if (!block.node.isConnected) return;
    block.value = value; block.loaded = true; block.node.style.minHeight = ""; block.node.classList.remove("pending-block"); block.node.replaceChildren();
    // Segment the displayed language, so a lens always targets the actual word
    // under the glass, including Persian half-spaces and unspaced CJK text.
    const segments = typeof Intl.Segmenter === 'function' ? [...new Intl.Segmenter(prefs.reading, {granularity:'sentence'}).segment(value)].map((s) => s.segment) : (value.match(/[^.!?؟。！？।॥]+[.!?؟。！？।॥]*[”’"')\]]*\s*/gu) || [value]);
    for (const sentenceText of segments) {
      const sentence = document.createElement('span'); sentence.className = 'reader-sentence'; sentence.dataset.sourceStart = block.start; sentence.dataset.sourceEnd = block.end; sentence.dataset.text = sentenceText.trim();
      const parts = tokenize(sentenceText, prefs.reading);
      for (const part of parts) {
        if (part.word) { const span = document.createElement('span'); span.className = 'reader-word'; span.textContent = part.text; sentence.append(span); }
        else {
          const punct = part.text.match(/^(.*?)([.!?؟。！？।॥]+[”’"')\]]*)(\s*)$/s);
          if (punct && /[.!?؟。！？।॥][”’"')\]]*\s*$/.test(sentenceText) && part === parts[parts.length-1]) {
            sentence.append(document.createTextNode(punct[1])); const span = document.createElement('span'); span.className = 'reader-word sentence-end'; span.textContent = punct[2]; span.setAttribute('aria-label','Sentence translation'); sentence.append(span, document.createTextNode(punct[3]));
          } else sentence.append(document.createTextNode(part.text));
        }
      }
      block.node.append(sentence);
    }
    if (word?.isConnected) positionLens();
  }
  function queueBlock(block, priority = false) {
    if (block.loaded || block.queued || block.failed) return;
    block.queued = true;
    const job = { block, token:generation, language:prefs.reading };
    priority ? jobs.unshift(job) : jobs.push(job); pumpJobs();
  }
  function pumpJobs() {
    while (activeJobs < 2 && jobs.length) {
      const job = jobs.shift(); if (job.token !== generation) continue;
      activeJobs++;
      api.translate(job.block.original, 'en', job.language).then((translated) => {
        if (job.token !== generation || job.language !== prefs.reading) return;
        if (!translated) throw new Error('Translation unavailable');
        fillBlock(job.block, translated);
      }).catch(() => {
        if (job.token !== generation) return;
        job.block.failed = true; job.block.node.replaceChildren();
        const message = document.createElement('span'); message.className = 'translation-pending'; message.textContent = `${api.languages[job.language].label} translation unavailable. `;
        const retry = document.createElement('button'); retry.className = 'retry-translation'; retry.textContent = 'Tap to retry'; retry.onclick = () => { job.block.failed = false; job.block.queued = false; queueBlock(job.block, true); retry.disabled = true; retry.textContent = 'Trying again…'; };
        job.block.node.append(message,retry);
      }).finally(() => { activeJobs--; pumpJobs(); });
    }
  }
  function makeBlocks(start, end, prepend = false) {
    const fragment = document.createDocumentFragment();
    let i = start;
    while (i < end) {
      const first = i; const initial = current.sentences[i]; const pieces = [initial.text];
      // Translate whole paragraph passages for context, bounded for provider limits.
      while (i + 1 < end && current.sentences[i+1].paragraphIndex === initial.paragraphIndex && current.sentences[i+1].chapterIndex === initial.chapterIndex && pieces.join(' ').length + current.sentences[i+1].text.length < 1400) pieces.push(current.sentences[++i].text);
      const chapter = current.chapters.find((c) => c.start === first);
      if (chapter) { const h2 = document.createElement('h2'); h2.textContent = chapter.title; fragment.append(h2); }
      const node = document.createElement('p'); node.dataset.block = first;
      const block = {node, start:first, end:i, original:pieces.join(' '), loaded:false, queued:false, failed:false}; blocks.set(first,block);
      fragment.append(node);
      if (prefs.reading !== 'en') { node.className = 'pending-block'; const waiting = document.createElement('span'); waiting.className = 'translation-pending'; waiting.textContent = `Loading ${api.languages[prefs.reading].label} passage…`; node.append(waiting); node.style.minHeight = `${Math.max(2, Math.min(8, Math.ceil(block.original.length / 60)))*prefs.size*Number(prefs.spacing)}px`; }
      i++;
    }
    prepend ? text.prepend(fragment) : text.append(fragment);
    for (const block of blocks.values()) {
      if (block.loaded || block.queued) continue;
      if (prefs.reading === 'en') fillBlock(block,block.original);
      else readingObserver.observe(block.node);
    }
  }
  function renderWindow(index) {
    if (!current) return;
    generation++; jobs = []; clearLens(); readingObserver?.disconnect(); blocks = new Map(); text.replaceChildren();
    text.lang = prefs.reading; text.dir = api.languages[prefs.reading].dir;
    readingObserver = new IntersectionObserver((entries) => entries.forEach((entry) => { if (!entry.isIntersecting) return; const block = blocks.get(Number(entry.target.dataset.block)); if (block) queueBlock(block); }), {root:scroll,rootMargin:'650px 0px'});
    renderedStart = Math.max(0,index - 8); renderedEnd = Math.min(current.sentences.length,index + 50);
    // Begin/end at paragraph boundaries so paragraph translations stay reusable.
    while (renderedStart > 0 && current.sentences[renderedStart-1].paragraphIndex === current.sentences[renderedStart].paragraphIndex) renderedStart--;
    makeBlocks(renderedStart,renderedEnd);
    $('moreText').hidden = renderedEnd === current.sentences.length;
    requestAnimationFrame(() => {
      const block = [...blocks.values()].find((b) => b.start <= index && b.end >= index);
      if (index && block) scroll.scrollTop += block.node.getBoundingClientRect().top - scroll.getBoundingClientRect().top - 40;
      else scroll.scrollTop = 0;
      if (block && prefs.reading !== 'en') queueBlock(block,true);
      updateProgress(index);
    });
  }
  function appendText() {
    if (!current || renderedEnd >= current.sentences.length) return;
    const end = Math.min(current.sentences.length,renderedEnd + 40); makeBlocks(renderedEnd,end); renderedEnd = end; $('moreText').hidden = end === current.sentences.length;
  }
  function prependText() {
    if (!current || !renderedStart) return;
    const height = scroll.scrollHeight; const start = Math.max(0,renderedStart - 40); makeBlocks(start,renderedStart,true); renderedStart = start; scroll.scrollTop += scroll.scrollHeight - height;
  }
  $('moreText').onclick = appendText;
  function updateProgress(index) { savedIndex = index; const percent = Math.round((index + 1) / current.sentences.length * 100); $('readingProgress').textContent = `${percent}% · ${api.languages[prefs.reading].label.toUpperCase()}`; $('positionRange').value = index; $('positionOutput').textContent = `${percent}%`; }
  function persistProgress() { clearTimeout(saveTimer); if (api && current) api.save(current.book,savedIndex,current.sentences.length,prefs.reading); }
  scroll.addEventListener('scroll', () => {
    if (!current) return;
    if (!scrollFrame) scrollFrame = requestAnimationFrame(() => {
      scrollFrame = 0; const top = scroll.getBoundingClientRect().top;
      const visible = [...blocks.values()].sort((a,b) => a.start-b.start).find((block) => block.node.getBoundingClientRect().bottom > top + 55);
      if (visible) updateProgress(visible.start);
      if (scroll.scrollTop + scroll.clientHeight > scroll.scrollHeight - 900) appendText();
      if (scroll.scrollTop < 120 && renderedStart) prependText();
      positionLens(); clearTimeout(saveTimer); saveTimer = setTimeout(persistProgress,450);
    });
  }, {passive:true});
  window.addEventListener('pagehide',persistProgress);
  document.addEventListener('visibilitychange', () => { if (document.hidden) { persistProgress(); releaseLens(); } });
  window.addEventListener('resize', () => positionLens());
  function renderChapters() {
    $('chapterList').replaceChildren(); $('positionRange').max = current.sentences.length - 1;
    for (const chapter of current.chapters) { const button = document.createElement('button'); button.textContent = chapter.title; button.setAttribute('aria-current',String(savedIndex >= chapter.start && savedIndex <= chapter.end)); button.onclick = () => { persistProgress(); updateProgress(chapter.start); renderWindow(chapter.start); $('chaptersDialog').close(); }; $('chapterList').append(button); }
  }
  $('chaptersButton').onclick = () => { renderChapters(); showDialog('chaptersDialog'); };
  $('positionRange').oninput = (event) => { $('positionOutput').textContent = `${Math.round((Number(event.target.value)+1)/current.sentences.length*100)}%`; };
  $('positionRange').onchange = (event) => { updateProgress(Number(event.target.value)); renderWindow(savedIndex); persistProgress(); $('chaptersDialog').close(); };
  $('readingLanguage').onchange = (event) => {
    persistProgress(); prefs.reading = event.target.value;
    if (prefs.translation === prefs.reading) prefs.translation = prefs.reading === 'en' ? (api.language === 'en' ? 'fa' : api.language) : 'en';
    $('translationLanguage').value = prefs.translation; savePrefs(); renderWindow(savedIndex);
  };
  $('translationLanguage').onchange = (event) => { prefs.translation = event.target.value; releaseLens(); savePrefs(); };

  function clearLens() { releaseLens(); word?.classList.remove('active-word'); word = null; lens.hidden = true; }
  function selectWord(next, hold = false) {
    if (!next || !prefs.lens) return;
    clearTimeout(hideTimer);
    if (word !== next) { word?.classList.remove('active-word'); word = next; word.classList.add('active-word'); requestVersion++; clearTimeout(holdTimer); lens.classList.remove('translating'); $('lensOriginal').textContent = word.textContent; $('lensOriginal').lang = prefs.reading; lens.classList.toggle('sentence-lens', word.classList.contains('sentence-end')); }
    lens.hidden = false; positionLens();
    if (hold) armTranslation();
  }
  function positionLens() {
    if (!word?.isConnected || !prefs.lens) { lens.hidden = true; return; }
    const r = word.getBoundingClientRect(); const viewport = scroll.getBoundingClientRect();
    if (r.bottom < viewport.top || r.top > viewport.bottom) { lens.hidden = true; return; }
    lens.hidden = false;
    const expanded = lens.classList.contains('translating'); const maxWidth = Math.min(word.classList.contains('sentence-end') ? 390 : 285,innerWidth-32);
    const baseWidth = Math.min(Math.max(76,r.width*1.24+34),innerWidth-32);
    const width = expanded ? maxWidth : baseWidth;
    const x = Math.max(width/2+16,Math.min(innerWidth-width/2-16,r.left+r.width/2));
    const y = Math.min(viewport.bottom-44,Math.max(viewport.top+70,r.bottom+5));
    lens.style.left = `${x}px`; lens.style.top = `${y}px`; lens.style.setProperty('--lens-width',`${baseWidth}px`); lens.style.setProperty('--lens-max-height',`${Math.max(70,Math.min(270,y-viewport.top-10))}px`);
  }
  function armTranslation() { clearTimeout(holdTimer); holdTimer = setTimeout(() => translateSelection(), 480); }
  async function translateSelection() {
    if (!word || !api) return;
    const target = word; const token = ++requestVersion; const sentence = target.closest('.reader-sentence');
    const full = target.classList.contains('sentence-end'); const value = full ? sentence.dataset.text : target.textContent;
    lens.classList.add('translating'); $('lensKind').textContent = `${full ? 'SENTENCE' : 'WORD'} · ${api.languages[prefs.translation].label.toUpperCase()}`;
    $('lensTranslation').textContent = 'Translating…'; $('lensTranslation').lang = prefs.translation; $('lensTranslation').dir = api.languages[prefs.translation].dir; positionLens();
    try {
      const translated = await api.translate(value,prefs.reading,prefs.translation);
      if (token !== requestVersion || target !== word) return;
      $('lensTranslation').textContent = translated || 'Translation unavailable. Hold again to retry.';
    } catch { if (token === requestVersion) $('lensTranslation').textContent = 'Unable to translate. Check your connection and hold again.'; }
    positionLens();
  }
  function releaseLens() {
    holding = false; dragging = false; pointerId = null; dragPoint = null; clearTimeout(holdTimer); cancelAnimationFrame(autoScroll); autoScroll = 0; lens.classList.remove('holding');
    if (lens.classList.contains('translating')) { clearTimeout(hideTimer); hideTimer = setTimeout(() => { requestVersion++; lens.classList.remove('translating'); positionLens(); }, 2200); }
    else requestVersion++;
  }
  function wordAt(x,y) {
    let hit = document.elementFromPoint(x,y)?.closest('.reader-word');
    if (hit && text.contains(hit)) return hit;
    // Snap only to nearby words on the same line; never jump across paragraphs.
    let nearest = null, distance = 36;
    for (const block of blocks.values()) { const bounds = block.node.getBoundingClientRect(); if (y < bounds.top-9 || y > bounds.bottom+9) continue; for (const node of block.node.querySelectorAll('.reader-word')) { const r = node.getBoundingClientRect(); if (y < r.top-9 || y > r.bottom+9) continue; const d = Math.max(r.left-x,0,x-r.right); if (d < distance) { nearest=node; distance=d; } } }
    return nearest;
  }
  function dragTick() {
    if (!dragging || !dragPoint) { autoScroll=0; return; }
    const bounds = scroll.getBoundingClientRect(); const y = dragPoint.y;
    const delta = y < bounds.top + 65 ? -5 : y > bounds.bottom - 75 ? 5 : 0;
    if (delta) { scroll.scrollTop += delta; const next = wordAt(dragPoint.x,Math.max(bounds.top+15,Math.min(bounds.bottom-15,y))); if (next && next !== word) selectWord(next,true); }
    autoScroll=requestAnimationFrame(dragTick);
  }
  $('lensHandle').addEventListener('pointerdown', (event) => {
    if (!word || event.button > 0) return;
    event.preventDefault(); clearTimeout(hideTimer); holding=true; dragging=true; pointerId=event.pointerId;
    const r=word.getBoundingClientRect(); pointerStart={x:event.clientX,y:event.clientY,offsetX:event.clientX-(r.left+r.width/2),offsetY:event.clientY-(r.top+r.height/2)};
    $('lensHandle').setPointerCapture(event.pointerId); lens.classList.add('holding'); armTranslation();
  });
  $('lensHandle').addEventListener('pointermove', (event) => {
    if (!dragging || event.pointerId !== pointerId) return;
    dragPoint={x:event.clientX-pointerStart.offsetX,y:event.clientY-pointerStart.offsetY};
    const next=wordAt(dragPoint.x,dragPoint.y); if(next && next !== word) selectWord(next,true);
    if(!autoScroll) autoScroll=requestAnimationFrame(dragTick);
  });
  for (const type of ['pointerup','pointercancel','lostpointercapture']) $('lensHandle').addEventListener(type,releaseLens);
  text.addEventListener('pointerdown', (event) => {
    const next=event.target.closest('.reader-word'); if (!next || event.button > 0) return;
    selectWord(next); holding=true; pointerId=event.pointerId; pointerStart={x:event.clientX,y:event.clientY}; armTranslation();
  });
  text.addEventListener('pointermove', (event) => { if(!holding || dragging || event.pointerId !== pointerId) return; if(Math.hypot(event.clientX-pointerStart.x,event.clientY-pointerStart.y)>10) releaseLens(); });
  text.addEventListener('pointerup',releaseLens); text.addEventListener('pointercancel',releaseLens);
  text.addEventListener('contextmenu',(event) => { if(holding && event.target.closest('.reader-word')) event.preventDefault(); });
  function stepWord(direction) {
    if(!prefs.lens) { prefs.lens=true; applyAppearance(); savePrefs(); }
    const words=[...text.querySelectorAll('.reader-word')];
    if(!words.length) return;
    let index=words.indexOf(word); if(index < 0) { const top=scroll.getBoundingClientRect().top; index=words.findIndex((node) => node.getBoundingClientRect().top >= top+25)-direction; }
    let target=words[index+direction];
    if(!target && direction>0 && renderedEnd<current.sentences.length) { appendText(); target=[...text.querySelectorAll('.reader-word')][index+direction]; }
    if(!target && direction<0 && renderedStart>0) { prependText(); const expanded=[...text.querySelectorAll('.reader-word')]; target=expanded[expanded.indexOf(word)-1]; }
    if(!target) return; releaseLens(); target.scrollIntoView({block:'nearest'}); selectWord(target);
  }
  $('previousWord').onclick=()=>stepWord(-1); $('nextWord').onclick=()=>stepWord(1);
  $('lensHandle').addEventListener('keydown',(event)=> { if(['ArrowRight','ArrowLeft','ArrowDown','ArrowUp','Enter',' '].includes(event.key)) event.preventDefault(); if(event.key==='ArrowRight'||event.key==='ArrowDown')stepWord(1); if(event.key==='ArrowLeft'||event.key==='ArrowUp')stepWord(-1); if(event.key==='Enter'||event.key===' ')translateSelection(); if(event.key==='Escape')clearLens(); });
  document.addEventListener('keydown',(event)=>{if(event.key==='Escape' && document.body.classList.contains('focus-mode'))focusMode(false);});
  async function initialize() {
    api=$('readerEngine').contentWindow.WordfreakReader;
    if(!api) { status('The reading engine could not load. Reload this page to retry.',10000); return; }
    if(!api.languages[prefs.reading])prefs.reading='en';
    if(!api.languages[prefs.translation])prefs.translation='en';
    if(!readStorage(SETTINGS_KEY,null))prefs.translation=api.language==='en'?'fa':api.language;
    for(const id of ['readingLanguage','translationLanguage']) { for(const [code,language] of Object.entries(api.languages)) { const option=document.createElement('option');option.value=code;option.textContent=language.label+(id==='readingLanguage'&&code==='en'?' · Original':'');$(id).append(option); } }
    $('readingLanguage').value=prefs.reading; $('translationLanguage').value=prefs.translation;
    catalog=api.catalog(); renderLibrary(); status('');
    const last=readStorage(LAST_BOOK_KEY,null); if(last)await openBook(last);
    if('serviceWorker' in navigator)navigator.serviceWorker.register('sw.js').catch(()=>{});
  }
  applyAppearance();
  if($('readerEngine').contentWindow.WordfreakReader) initialize(); else $('readerEngine').addEventListener('load',initialize,{once:true});
})();
