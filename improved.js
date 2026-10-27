(() => {
  'use strict';
  const $ = (id) => document.getElementById(id);
  const SETTINGS_KEY = 'wordfreak:improved:settings:v1';
  const LAST_BOOK_KEY = 'wordfreak:improved:last-book:v1';
  const fonts = { times: '"Times New Roman", Times, serif', georgia: 'Georgia, serif', palatino: 'Palatino, "Palatino Linotype", serif', sans: '-apple-system, BlinkMacSystemFont, sans-serif' };
  const readStorage = (key, fallback) => { try { return JSON.parse(localStorage.getItem(key)) || fallback; } catch { return fallback; } };
  const writeStorage = (key, value) => { try { localStorage.setItem(key, JSON.stringify(value)); } catch { status('Browser storage is full. This session still works, but new settings may not be saved.', 6000); } };
  const prefs = { font: 'times', size: 24, spacing: '1.85', theme: 'black', reading: 'en', translation: 'fa', lens: true, controls: true, stepRate: 60, translateLocked: false, sentenceMode: false, ...readStorage(SETTINGS_KEY, {}) };
  let api, catalog = [], shelf = 'all', current = null, generation = 0, renderedStart = 0, renderedEnd = 0, savedIndex = 0;
  let word = null, holding = false, pointerId = null, pointerStart = null, dragging = false, holdTimer = 0, requestVersion = 0, saveTimer = 0, statusTimer = 0, scrollFrame = 0, activeJobs = 0, searchVersion = 0;
  let repeatTimer = 0, repeatDirection = 0, centerHoldTimer = 0, centerTapTimer = 0, lastCenterTap = 0, centerHeld = false, centerCancelled = false, moveTimer = 0;
  let preloadTimer = 0, preloadQueue = [], preloadRunning = false;
  const nearbyTranslations = new Map();
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
    updateReadingControls();
    if (word) positionLens();
  }
  function showDialog(id) { clearLens(); $(id).showModal(); }
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
    syncFooterSpace(); positionLens();
  }
  $('focusButton').onclick = () => focusMode(true);
  $('exitFocus').onclick = () => focusMode(false);
  document.addEventListener('fullscreenchange', () => { if (!document.fullscreenElement) { document.body.classList.remove('focus-mode'); $('exitFocus').hidden = true; $('focusButton').setAttribute('aria-pressed','false'); syncFooterSpace(); } });
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
      $('welcome').hidden = true; $('chaptersButton').disabled = false; $('previousWord').disabled = $('nextWord').disabled = $('translateButton').disabled = false;
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
  $('translationLanguage').onchange = (event) => { prefs.translation = event.target.value; clearLens(); savePrefs(); };

  let lensMeasure = null, lensBox = null, dockMode = '', surfacePress = null, skipSurfaceClick = false;
  let lensFitKey = '', lensFitOverflow = false, lensFitHeight = 0;

  // Keep the visual footprint tied to the selected glyphs, never to the
  // translation's length. Long translations wrap inside the glass, never in a dock.
  function fitLensFont(measuredWidth, availableWidth, availableHeight, preferredSize) {
    const maximum = Math.min(preferredSize, availableHeight / 1.12);
    const wanted = Math.min(maximum, preferredSize * availableWidth / Math.max(1, measuredWidth));
    const size = Math.max(10, Math.floor(wanted * 10) / 10);
    return { size, overflow: wanted < 10 };
  }
  function fitLensLabel(node, value) {
    if (!lensBox) return false;
    const preferred = prefs.size * 1.08;
    const key = `${node.id}|${value}|${prefs.font}|${preferred}|${lensBox.width}|${lensBox.height}`;
    if (key === lensFitKey) { if(lensFitHeight)lens.style.setProperty('--lens-height',`${lensFitHeight}px`); return lensFitOverflow; }
    lensMeasure ||= document.createElement('canvas').getContext('2d');
    if (!lensMeasure) return false;
    lensMeasure.font = `${preferred}px ${getComputedStyle(text).fontFamily}`;
    const fit = fitLensFont(lensMeasure.measureText(value).width, Math.max(1,lensBox.width-8), Math.max(1,lensBox.height-4), preferred);
    lensFitHeight = 0;
    if(node.id === 'lensTranslation') {
      node.style.width = `${Math.max(12,lensBox.width-8)}px`;
      let size=Math.min(preferred,Math.max(8,fit.size));
      node.style.fontSize=`${size}px`;
      while(size>8 && node.scrollHeight>lensBox.height-4) {size=Math.max(8,size-.5);node.style.fontSize=`${size}px`;}
      // Even unusually long word translations remain wholly inside the lens.
      lensFitHeight=Math.max(lensBox.height,node.scrollHeight+6);
      lens.style.setProperty('--lens-height',`${lensFitHeight}px`);
    } else node.style.fontSize = `${fit.size}px`;
    lensFitKey = key; lensFitOverflow = fit.overflow;
    return fit.overflow;
  }
  function syncDockSpace() {
    const height = $('translationDock').hidden ? 0 : Math.ceil($('translationDock').getBoundingClientRect().height);
    document.body.style.setProperty('--translation-dock-height', `${height}px`);
    positionLens();
  }
  function closeDock() {
    dockMode = ''; $('translationDock').hidden = true;
    $('lensSurface').setAttribute('aria-expanded','false');
    document.body.style.setProperty('--translation-dock-height','0px');
  }
  function openDock(mode, source, translation) {
    dockMode = mode; $('translationDock').hidden = false;
    $('dockKind').textContent = `${mode === 'sentence' ? 'SENTENCE' : 'WORD'} · ${api.languages[prefs.translation].label.toUpperCase()}`;
    $('dockSource').textContent = source; $('dockSource').lang = prefs.reading; $('dockSource').dir = api.languages[prefs.reading].dir;
    $('dockTranslation').textContent = translation; $('dockTranslation').lang = prefs.translation; $('dockTranslation').dir = api.languages[prefs.translation].dir;
    $('lensSurface').setAttribute('aria-expanded','true');
    syncDockSpace();
    // The panel reserves space, rather than covering the bottom lines of text.
    // Keep the selected word in the now-smaller reading viewport.
    keepSelectionVisible(true);
    positionLens();
  }
  if (typeof ResizeObserver === 'function') new ResizeObserver(syncDockSpace).observe($('translationDock'));
  $('dockClose').onclick = () => { clearLens(); scroll.focus({preventScroll:true}); };
  function clearLens() {
    releaseLens(); requestVersion++; closeDock();
    word?.classList.remove('active-word'); word = null; lens.hidden = true;
    lens.classList.remove('translating','loading'); lensFitKey = '';
  }
  function selectWord(next, hold = false) {
    if (!next || !prefs.lens) return;
    const firstPlacement = lens.hidden;
    if (word !== next) {
      word?.classList.remove('active-word'); word = next; word.classList.add('active-word');
      requestVersion++; clearTimeout(holdTimer); closeDock(); lensFitKey = '';
      clearTimeout(moveTimer); lens.classList.add('moving'); moveTimer=setTimeout(()=>lens.classList.remove('moving'),200);
      lens.classList.remove('translating','loading'); $('lensSurface').title='';
      $('lensOriginal').textContent = word.textContent; $('lensOriginal').lang = prefs.reading;
      $('lensSurface').setAttribute('aria-label', `Translate the full sentence containing ${word.textContent}`);
    }
    lens.hidden = false;
    if (firstPlacement) { lens.classList.add('placing'); requestAnimationFrame(() => requestAnimationFrame(() => lens.classList.remove('placing'))); }
    positionLens();
    if (prefs.sentenceMode || prefs.translateLocked) translateSelection(prefs.sentenceMode);
    else if (hold) armTranslation();
    keepSelectionVisible(prefs.sentenceMode);positionLens();
    scheduleNearbyTranslations();
  }
  function keepSelectionVisible(sentence = false) {
    if(!word?.isConnected || dragging)return;
    const view=scroll.getBoundingClientRect();
    const sentenceRect=word.closest('.reader-sentence')?.getBoundingClientRect();
    const r=sentence && sentenceRect && sentenceRect.height<view.height-120 ? sentenceRect : word.getBoundingClientRect();
    const top=view.top+24, bottom=view.bottom-90;
    const delta=r.bottom>bottom ? r.bottom-bottom : r.top<top ? r.top-top : 0;
    if(delta)scroll.scrollTop+=delta;
  }
  function positionLens() {
    if (!word?.isConnected || !prefs.lens) { lens.hidden = true; return; }
    const r = [...word.getClientRects()].find((rect) => rect.width > 0) || word.getBoundingClientRect();
    const viewport = scroll.getBoundingClientRect();
    if (r.top < viewport.top || r.bottom > viewport.bottom) { lens.hidden = true; word.classList.remove('active-word'); return; }
    lens.hidden = false; word.classList.add('active-word');
    const width = Math.min(innerWidth-16, Math.max(lens.classList.contains('translating')?20:0,r.width+6));
    const height = Math.min(r.height+4, prefs.size*1.6);
    const x = Math.max(width/2+4,Math.min(innerWidth-width/2-4,r.left+r.width/2));
    const y = r.top+r.height/2;
    lensBox = {width,height};
    lens.style.setProperty('--lens-x',`${x}px`); lens.style.setProperty('--lens-y',`${y}px`);
    lens.style.setProperty('--lens-width',`${width}px`); lens.style.setProperty('--lens-height',`${height}px`); lens.style.setProperty('--lens-radius',`${Math.min(height/2,Math.max(7,width*.22))}px`);
    const label = lens.classList.contains('translating') ? $('lensTranslation') : $('lensOriginal');
    fitLensLabel(label,label.textContent);

  }
  function armTranslation() { clearTimeout(holdTimer); holdTimer = setTimeout(() => translateSelection(), 480); }
  async function translateSelection(fullSentence = false) {
    if (!word || !api) return;
    clearTimeout(holdTimer);
    const target = word; const token = ++requestVersion; const sentence = target.closest('.reader-sentence');
    const full = fullSentence || target.classList.contains('sentence-end'); const value = full ? sentence.dataset.text : target.textContent;
    if (full) prefs.sentenceMode=true;
    updateReadingControls();
    closeDock();
    const cached=nearbyTranslations.get(translationKey(value));
    if (full) {
      lens.classList.remove('translating','loading');
      openDock('sentence',value,cached || 'Translating…');
    } else {
      lens.classList.add('translating','loading'); $('lensKind').textContent = `Word · ${api.languages[prefs.translation].label}`;
      $('lensTranslation').textContent = cached || '···'; $('lensTranslation').lang = prefs.translation; $('lensTranslation').dir = api.languages[prefs.translation].dir;
    }
    positionLens();
    let translated = cached || '';
    try { if(!translated) translated = await api.translate(value,prefs.reading,prefs.translation); } catch { /* Keep failures visible and retryable. */ }
    if (token !== requestVersion || target !== word) return;
    if(translated) rememberNearby(translationKey(value),translated);
    lens.classList.remove('loading'); lensFitKey = '';
    if (full) openDock('sentence',value,translated || 'Translation unavailable. Tap the glass to retry.');
    else if (translated) { $('lensTranslation').textContent = translated; positionLens(); }
    else { $('lensTranslation').textContent = '↻'; $('lensSurface').title = 'Translation unavailable. Hold to retry.'; positionLens(); }
    scheduleNearbyTranslations();
  }
  function releaseLens() {
    holding = false; dragging = false; pointerId = null; dragPoint = null;
    clearTimeout(holdTimer); cancelAnimationFrame(autoScroll); autoScroll = 0;
    lens.classList.remove('holding');
    // Keep the result until the user moves the lens or taps outside, including
    // when they release before a slow translation request completes.
  }
  document.addEventListener('pointerdown', (event) => {
    if (event.target.closest('#glassLens, #translationDock, .reader-word, #previousWord, #nextWord, #translateButton, .reading-speed')) return;
    clearLens();
  }, {capture:true});
  document.addEventListener('pointerup', () => { if (holding && !dragging) releaseLens(); });
  document.addEventListener('keydown',(event) => { if(event.key==='Escape')clearLens(); });
  $('lensSurface').addEventListener('pointerdown',(event) => {
    if (event.button > 0) return;
    surfacePress={x:event.clientX,y:event.clientY,time:performance.now(),moved:false};
    skipSurfaceClick=false; holding=true; armTranslation();
  });
  $('lensSurface').addEventListener('pointermove',(event) => {
    if(surfacePress && Math.hypot(event.clientX-surfacePress.x,event.clientY-surfacePress.y)>9) { surfacePress.moved=true; releaseLens(); }
  });
  $('lensSurface').addEventListener('pointerup',() => {
    skipSurfaceClick=Boolean(surfacePress && (surfacePress.moved || performance.now()-surfacePress.time>=480));
    surfacePress=null; releaseLens();
  });
  $('lensSurface').addEventListener('pointercancel',() => { surfacePress=null;skipSurfaceClick=true;releaseLens(); });
  $('lensSurface').addEventListener('contextmenu',(event) => event.preventDefault());
  $('lensSurface').addEventListener('click',(event) => {
    if(skipSurfaceClick && event.detail!==0) { skipSurfaceClick=false;return; }
    skipSurfaceClick=false;translateSelection(true);
  });
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
    event.preventDefault(); holding=true; dragging=true; pointerId=event.pointerId;
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
    const words=[...text.querySelectorAll('.reader-word:not(.sentence-end)')];
    if(!words.length) return;
    let index=words.indexOf(word); if(index < 0) { const top=scroll.getBoundingClientRect().top; index=words.findIndex((node) => node.getBoundingClientRect().top >= top+25)-direction; }
    let target=words[index+direction];
    if(!target && direction>0 && renderedEnd<current.sentences.length) { appendText(); target=[...text.querySelectorAll('.reader-word:not(.sentence-end)')][index+direction]; }
    if(!target && direction<0 && renderedStart>0) { prependText(); const expanded=[...text.querySelectorAll('.reader-word:not(.sentence-end)')]; target=expanded[expanded.indexOf(word)-1]; }
    if(!target) { prepareNextPassage(direction); return; } releaseLens(); target.scrollIntoView({block:'nearest'}); selectWord(target);
  }
  function prepareNextPassage(direction) {
    const index=Number(word?.closest('.reader-sentence')?.dataset.sourceStart ?? savedIndex);
    const candidates=[...blocks.values()].filter(b=>!b.loaded && (direction>0 ? b.end>=index : b.start<=index)).sort((a,b)=>direction>0?a.start-b.start:b.start-a.start);
    if(candidates[0]) { queueBlock(candidates[0],true); status('Preparing the next passage…',1500); }
  }
  function stepSentence(direction) {
    let sentences=[...text.querySelectorAll('.reader-sentence')];
    if(!sentences.length) { prepareNextPassage(direction);return; }
    const selected=word?.closest('.reader-sentence');
    let index=sentences.indexOf(selected);
    if(index<0) {const top=scroll.getBoundingClientRect().top;index=sentences.findIndex(s=>s.getBoundingClientRect().bottom>top+20)-direction;}
    let target=sentences[index+direction];
    if(!target && direction>0 && renderedEnd<current.sentences.length) {appendText();sentences=[...text.querySelectorAll('.reader-sentence')];target=sentences[index+direction];}
    if(!target && direction<0 && renderedStart>0) {prependText();sentences=[...text.querySelectorAll('.reader-sentence')];target=sentences[sentences.indexOf(selected)-1];}
    const first=target?.querySelector('.reader-word');
    if(!first) {prepareNextPassage(direction);return;}
    releaseLens();first.scrollIntoView({block:'nearest'});selectWord(first);
  }
  function stepSelection(direction) {
    if(!current)return;
    if(!prefs.lens){prefs.lens=true;applyAppearance();savePrefs();}
    if(prefs.sentenceMode)stepSentence(direction);else stepWord(direction);
  }
  function syncFooterSpace() {
    document.body.style.setProperty('--reader-footer-height',`${Math.ceil($('readerFooter').getBoundingClientRect().height)}px`);
    positionLens();
  }
  function updateReadingControls() {
    prefs.stepRate=Math.max(10,Math.min(300,Number(prefs.stepRate)||60));
    $('readingControls').hidden=prefs.controls===false;
    document.body.classList.toggle('controls-hidden',prefs.controls===false);
    $('navigationToggle').checked=prefs.controls!==false;
    $('stepSpeed').value=prefs.stepRate;
    lens.style.setProperty('--lens-duration',`${Math.min(240,60000/prefs.stepRate*.68)}ms`);
    $('stepSpeedOutput').textContent=`${prefs.stepRate} ${prefs.sentenceMode?'sentences':'words'}/min`;
    $('translateButtonLabel').textContent=prefs.sentenceMode?'Sentence':prefs.translateLocked?'Translation locked':'Translate';
    $('translationModeLabel').textContent=prefs.sentenceMode?'Double-tap for words':prefs.translateLocked?'Hold to unlock · double-tap for sentences':'Hold to lock · double-tap for sentences';
    $('translateButton').setAttribute('aria-pressed',String(prefs.sentenceMode||prefs.translateLocked));
    $('previousWord').setAttribute('aria-label',`Previous ${prefs.sentenceMode?'sentence':'word'}. Hold to keep moving backward.`);
    $('nextWord').setAttribute('aria-label',`Next ${prefs.sentenceMode?'sentence':'word'}. Hold to keep moving forward.`);
    syncFooterSpace();
  }
  if(typeof ResizeObserver==='function')new ResizeObserver(syncFooterSpace).observe($('readerFooter'));
  $('navigationToggle').onchange=event=>{prefs.controls=event.target.checked;stopRepeating();updateReadingControls();savePrefs();};
  $('stepSpeed').oninput=event=>{prefs.stepRate=Number(event.target.value);updateReadingControls();savePrefs();};
  function stopRepeating(){clearTimeout(repeatTimer);repeatTimer=0;repeatDirection=0;}
  function startRepeating(direction) {
    stopRepeating();repeatDirection=direction;stepSelection(direction);
    const tick=()=>{if(!repeatDirection)return;stepSelection(repeatDirection);repeatTimer=setTimeout(tick,60000/prefs.stepRate);};
    repeatTimer=setTimeout(tick,Math.max(350,60000/prefs.stepRate));
  }
  for(const [id,direction] of [['previousWord',-1],['nextWord',1]]) {
    const button=$(id);
    button.addEventListener('pointerdown',event=>{if(event.button>0)return;event.preventDefault();button.setPointerCapture(event.pointerId);startRepeating(direction);});
    for(const type of ['pointerup','pointercancel','lostpointercapture','blur'])button.addEventListener(type,stopRepeating);
    button.addEventListener('click',event=>{if(event.detail===0)stepSelection(direction);});
    button.addEventListener('keydown',event=>{if(event.key===' '||event.key==='Enter'){event.preventDefault();if(!event.repeat)startRepeating(direction);}});
    button.addEventListener('keyup',event=>{if(event.key===' '||event.key==='Enter'){event.preventDefault();stopRepeating();}});
  }
  function ensureSelection(){if(!word)stepWord(1);return Boolean(word);}
  function toggleSentenceMode() {
    if(!ensureSelection())return;
    prefs.sentenceMode=!prefs.sentenceMode;requestVersion++;closeDock();lens.classList.remove('translating','loading');
    updateReadingControls();savePrefs();
    if(prefs.sentenceMode||prefs.translateLocked)translateSelection(prefs.sentenceMode);else positionLens();
  }
  function lockTranslation() {
    centerHeld=true;clearTimeout(centerTapTimer);lastCenterTap=0;
    if(!ensureSelection())return;
    prefs.sentenceMode=false;prefs.translateLocked=!prefs.translateLocked;
    requestVersion++;closeDock();lens.classList.remove('translating','loading');
    updateReadingControls();savePrefs();
    if(prefs.translateLocked)translateSelection();else positionLens();
  }
  const center=$('translateButton');
  center.addEventListener('pointerdown',event=>{if(event.button>0)return;centerHeld=false;centerCancelled=false;center.setPointerCapture(event.pointerId);clearTimeout(centerHoldTimer);centerHoldTimer=setTimeout(lockTranslation,520);});
  center.addEventListener('pointerup',()=>clearTimeout(centerHoldTimer));
  center.addEventListener('pointercancel',()=>{clearTimeout(centerHoldTimer);centerCancelled=true;});
  center.addEventListener('lostpointercapture',()=>clearTimeout(centerHoldTimer));
  center.addEventListener('click',()=>{
    if(centerHeld||centerCancelled){centerHeld=false;centerCancelled=false;return;}
    const now=performance.now();
    if(lastCenterTap&&now-lastCenterTap<320){clearTimeout(centerTapTimer);lastCenterTap=0;toggleSentenceMode();return;}
    lastCenterTap=now;clearTimeout(centerTapTimer);
    centerTapTimer=setTimeout(()=>{lastCenterTap=0;if(ensureSelection())translateSelection(prefs.sentenceMode);},320);
  });
  center.addEventListener('keydown',event=>{if(event.key===' '||event.key==='Enter'){if(!event.repeat){centerHeld=false;centerCancelled=false;centerHoldTimer=setTimeout(lockTranslation,520);}if(event.repeat)event.preventDefault();}});
  center.addEventListener('keyup',()=>clearTimeout(centerHoldTimer));
  window.addEventListener('blur',()=>{stopRepeating();clearTimeout(centerHoldTimer);releaseLens();});
  document.addEventListener('visibilitychange',()=>{if(document.hidden){stopRepeating();clearTimeout(centerHoldTimer);}});

  function translationKey(value){return `${prefs.reading}|${prefs.translation}|${value}`;}
  function rememberNearby(key,value){if(!value)return;nearbyTranslations.set(key,value);while(nearbyTranslations.size>160)nearbyTranslations.delete(nearbyTranslations.keys().next().value);}
  function scheduleNearbyTranslations() {
    clearTimeout(preloadTimer);
    preloadTimer=setTimeout(()=>{
      if(!word||!api)return;
      const sentenceMode=prefs.sentenceMode;
      const items=[...text.querySelectorAll(sentenceMode?'.reader-sentence':'.reader-word:not(.sentence-end)')];
      const index=items.indexOf(sentenceMode?word.closest('.reader-sentence'):word);
      if(index<0)return;
      preloadQueue=[1,-1,2,3].map(offset=>items[index+offset]).filter(Boolean).map(node=>({value:sentenceMode?node.dataset.text:node.textContent,from:prefs.reading,to:prefs.translation,generation})).filter(job=>!nearbyTranslations.has(`${job.from}|${job.to}|${job.value}`));
      runNearbyTranslations();
    },100);
  }
  async function runNearbyTranslations() {
    if(preloadRunning)return;preloadRunning=true;
    try {
      while(preloadQueue.length){
        const job=preloadQueue.shift();if(job.generation!==generation||job.from!==prefs.reading||job.to!==prefs.translation)continue;
        const key=`${job.from}|${job.to}|${job.value}`;if(nearbyTranslations.has(key))continue;
        try{const translated=await api.translate(job.value,job.from,job.to);if(translated)rememberNearby(key,translated);}catch{/* Foreground translation retains its retry path. */}
      }
    } finally {preloadRunning=false;}
  }
  $('lensHandle').addEventListener('keydown',(event)=> { if(['ArrowRight','ArrowLeft','ArrowDown','ArrowUp','Enter',' '].includes(event.key)) event.preventDefault(); if(event.key==='ArrowRight'||event.key==='ArrowDown')stepSelection(1); if(event.key==='ArrowLeft'||event.key==='ArrowUp')stepSelection(-1); if(event.key==='Enter'||event.key===' ')translateSelection(event.shiftKey); if(event.key==='Escape')clearLens(); });
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
