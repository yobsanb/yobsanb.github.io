(() => {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const themeButton = $('#theme-toggle');
  const themeLabel = () => { const dark = document.documentElement.dataset.theme === 'dark'; themeButton.setAttribute('aria-label', `Switch to ${dark ? 'light' : 'dark'} theme`); themeButton.title = `Switch to ${dark ? 'light' : 'dark'} theme`; };
  themeLabel();
  themeButton.addEventListener('click', () => { const value = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark'; document.documentElement.dataset.theme = value; try { localStorage.setItem('theme', value); } catch {} themeLabel(); });
  const menu = $('#menu-toggle');
  menu.addEventListener('click', () => { const opened = menu.getAttribute('aria-expanded') !== 'true'; menu.setAttribute('aria-expanded', String(opened)); $('#main-nav').classList.toggle('open', opened); });
  document.addEventListener('keydown', e => { if(e.key === 'Escape') { $$('dialog[open]').forEach(d=>d.close()); menu.setAttribute('aria-expanded','false'); $('#main-nav').classList.remove('open'); } });
  const updateScroll = () => { const max = document.documentElement.scrollHeight - innerHeight; $('.reading-progress').style.width = `${max > 0 ? scrollY / max * 100 : 0}%`; $('#back-top').hidden = scrollY < 500; };
  addEventListener('scroll', updateScroll, {passive:true}); updateScroll();
  $('#back-top').addEventListener('click', () => { window.scrollTo({top:0,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'}); $('.brand').focus({preventScroll:true}); });
  const searchDialog = $('#search-dialog');
  const searchInput = $('#site-search');
  let index = []; let loading = null;
  const loadIndex = () => loading ||= fetch('search-index.json').then(r => { if(!r.ok) throw new Error('Search unavailable'); return r.json(); }).then(data => { index = data; }).catch(() => { index = $$('#main-nav a').map(a => ({title:a.textContent,url:a.getAttribute('href'),category:'Page',text:''})); });
  const renderSearch = () => {
    const q = searchInput.value.trim().toLowerCase();
    const result = index.filter(x => `${x.title} ${x.text}`.toLowerCase().includes(q)).slice(0,14);
    const host = $('#search-results'); host.replaceChildren();
    if(!result.length){const p=document.createElement('p');p.className='empty';p.textContent='No results. Try “segmentation”, “teaching”, or “scholarship”.';host.append(p);return;}
    result.forEach(item => { const a = document.createElement('a'); a.className='search-result'; a.href=item.url; const title=document.createElement('span');title.textContent=item.title;const type=document.createElement('small');type.textContent=item.category+' ↗';a.append(title,type);host.append(a); });
  };
  const openSearch = async () => { if(!searchDialog.open) searchDialog.showModal(); searchInput.focus(); await loadIndex(); renderSearch(); };
  $('#search-toggle').addEventListener('click', openSearch);
  searchInput.addEventListener('input', renderSearch);
  searchDialog.addEventListener('keydown', e => { const links=$$('.search-result',searchDialog);if(!links.length)return;const active=links.indexOf(document.activeElement);if(e.key==='ArrowDown'){e.preventDefault();links[(active+1)%links.length].focus();}if(e.key==='ArrowUp'){e.preventDefault();links[(active-1+links.length)%links.length].focus();}if(e.key==='Enter'&&document.activeElement===searchInput){e.preventDefault();links[0].click();} });
  document.addEventListener('keydown', e => { if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();openSearch();} });
  $$('[data-close]').forEach(b=>b.addEventListener('click',()=>b.closest('dialog').close()));
  $$('dialog').forEach(d=>d.addEventListener('click',e=>{if(e.target===d){const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)d.close();}}));
  const toast = message => {const t=$('#toast');t.textContent=message;t.hidden=false;clearTimeout(window.toastTimer);window.toastTimer=setTimeout(()=>t.hidden=true,3000);};
  const copy = async text => {try {await navigator.clipboard.writeText(text);toast('Copied to clipboard');}catch{toast('Copy unavailable. Select and copy the text instead.');}};
  $$('[data-cite]').forEach(b=>b.addEventListener('click',()=>{$('#citation-text').textContent=b.dataset.cite;$('#citation-dialog').showModal();}));
  $('#copy-citation').addEventListener('click',()=>copy($('#citation-text').textContent));
  $$('[data-copy]').forEach(b=>b.addEventListener('click',()=>copy(b.dataset.copy)));
  $$('[data-zoom]').forEach(b=>b.addEventListener('click',()=>{const img=$('#zoom-image');img.src=b.dataset.zoom;img.alt=b.dataset.alt||'Research architecture';$('#image-dialog').showModal();}));
  $$('[data-print]').forEach(b=>b.addEventListener('click',()=>window.print()));
  const filterInput=$('#publication-search');
  if(filterInput){let active='all';const filter=()=>{const query=filterInput.value.trim().toLowerCase();const year=$('#publication-year').value;let count=0;$$('.publication-list .pub').forEach(p=>{const visible=(active==='all'||p.dataset.type===active)&&(!year||p.dataset.year===year)&&p.textContent.toLowerCase().includes(query);p.hidden=!visible;if(visible)count++;});$('#result-count').textContent=`${count} publication${count===1?'':'s'}`;$('#no-publications').hidden=count!==0;};$$('[data-filter]').forEach(b=>b.addEventListener('click',()=>{active=b.dataset.filter;$$('[data-filter]').forEach(t=>t.setAttribute('aria-pressed',String(t===b)));filter();}));filterInput.addEventListener('input',filter);$('#publication-year').addEventListener('change',filter);filter();}
  const projectSearch=$('#project-search');
  if(projectSearch){projectSearch.addEventListener('input',()=>{const query=projectSearch.value.trim().toLowerCase();let count=0;$$('.project-entry').forEach(p=>{p.hidden=!p.textContent.toLowerCase().includes(query);if(!p.hidden)count++;});$('#project-count').textContent=`${count} project${count===1?'':'s'}`;$('#no-projects').hidden=count!==0;});}
  const activitySearch=$('#activity-search');
  if(activitySearch){const category=$('#activity-category');const filter=()=>{const q=activitySearch.value.trim().toLowerCase();let count=0;$$('.activity-list > li').forEach(item=>{item.hidden=!!((category.value&&item.dataset.category!==category.value)||!item.textContent.toLowerCase().includes(q));if(!item.hidden)count++;});$('#activity-count').textContent=`${count} activit${count===1?'y':'ies'}`;$('#no-activities').hidden=count!==0;};activitySearch.addEventListener('input',filter);category.addEventListener('change',filter);}
  if(location.hash){const target=document.getElementById(decodeURIComponent(location.hash.slice(1)));if(target)requestAnimationFrame(()=>target.scrollIntoView());}
})();
