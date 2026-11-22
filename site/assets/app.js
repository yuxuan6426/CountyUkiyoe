/* 县城浮世绘 · 人物图鉴 v5 · 县志档案风（Phase 2 体验规范落地） */
'use strict';
const DATA = window.COUNTY_DATA || {meta:{},cards:[]};
const cards = DATA.cards;
const bySlug = new Map(cards.map(c=>[c.slug,c]));
const $ = s=>document.querySelector(s);
const esc = s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
let limit = 24, onlySaved = false;
let saved = new Set();
try{ saved = new Set(JSON.parse(localStorage.getItem('county-saved-v2')||'[]')); }catch(e){}
const savedBtn = $('#savedBtn');
const persist=()=>{ try{localStorage.setItem('county-saved-v2',JSON.stringify([...saved]));}catch(e){}
  $('#savedCount').textContent=saved.size;
  savedBtn.setAttribute('aria-label',`查看我的收藏，当前 ${saved.size} 人`); };

function art(c){return c.image?`<img src="${esc(c.image)}" alt="${esc(c.name)}的原创虚构人物插画" loading="lazy" width="768" height="1024">`:`<div class="pending"><strong>形象待绘制</strong><small>人物档案已编号</small></div>`}

const storyTags = new Set(['A','BLOCKQUOTE','BR','CODE','DEL','DIV','EM','H1','H2','H3','H4','H5','H6','HR','LI','OL','P','PRE','STRONG','TABLE','TBODY','TD','TH','THEAD','TR','UL']);
const sourceUrl = /^https:\/\/www\.douyin\.com\/video\/\d{18,20}$/;
function renderMarkdown(text){
  const template=document.createElement('template');
  template.innerHTML=marked.parse(text);
  template.content.querySelectorAll('*').forEach(element=>{
    if(!storyTags.has(element.tagName)){element.remove();return;}
    const href=element.getAttribute('href')||'';
    [...element.attributes].forEach(attribute=>element.removeAttribute(attribute.name));
    if(element.tagName==='A'&&sourceUrl.test(href)){
      element.href=href;
      element.target='_blank';
      element.rel='noopener noreferrer';
    }
  });
  return template;
}

function filtered(){
  const q=$('#search').value.trim().toLocaleLowerCase(),cat=$('#category').value,view=$('#view').value;
  let a=cards.filter(c=>(!onlySaved||saved.has(c.slug))&&(!cat||c.category===cat)&&(!q||[c.name,...c.aliases,c.summary].join(' ').toLocaleLowerCase().includes(q))&&(view==='all'||view==='illustrated'&&c.image||view==='pending'&&!c.image||view==='validated'&&c.validated));
  const s=$('#sort').value;
  if(s==='sources')a.sort((x,y)=>y.sources.length-x.sources.length);
  else if(s==='name')a.sort((x,y)=>x.name.localeCompare(y.name,'zh'));
  else a.sort((x,y)=>x.id-y.id);
  return a;
}

function cardHTML(c){
  const on=saved.has(c.slug);
  return `<article class="card" data-id="${esc(c.slug)}">
    <div class="card-top"><span>NO. ${String(c.id).padStart(4,'0')}</span><span>${esc(c.category)}</span></div>
    <button class="save" data-save="${esc(c.slug)}" aria-label="${on?'取消收藏':'收藏'}${esc(c.name)}" aria-pressed="${on}">${on?'★':'☆'}</button>
    <button class="card-art" data-open="${esc(c.slug)}" aria-label="翻看${esc(c.name)}的人物档案">${art(c)}${c.image?'<span class="art-caption">原创虚构造像</span>':''}</button>
    <div class="card-info"><h3 class="${c.name.length>8?'long':''}">${esc(c.name)}</h3><p>${esc(c.summary)}</p>
    <div class="card-bottom"><span>关联 ${c.sources.length} 篇故事${c.validated?' · 已校验':''}</span><button class="open" data-open="${esc(c.slug)}">翻看档案 ↗</button></div></div>
  </article>`;
}

/* 增量渲染：筛选状态不变且 limit 增长时只 append 新一批，旧卡 DOM 不动、图片不闪烁 */
let lastKey=null,lastLimit=0,lastCount=0;
const stateKey=()=>[$('#search').value.trim(),$('#category').value,$('#view').value,$('#sort').value,onlySaved].join('|');

function render(){
  const a=filtered();
  const q=$('#search').value.trim();
  const label=onlySaved?'我的收藏':q?`「${q}」相关`:($('#view').value==='illustrated'&&!$('#category').value?'已绘制画像':'符合条件');
  $('#results').textContent=limit<a.length
    ?`${label} · 共 ${a.length} 位 · ${limit<=24?'展示前':'已展示'} ${Math.min(limit,a.length)} 位`
    :`${label} · ${a.length} 位 · 已全部展示`;
  const emptyEl=$('#empty');
  if(a.length===0){
    emptyEl.innerHTML=onlySaved&&saved.size===0
      ?'点卡片右上角的 ☆，把想再翻的人收进收藏。'
      :'换个关键词，或重置筛选查看全部人物。';
    emptyEl.hidden=false;
  }else emptyEl.hidden=true;
  const more=$('#more');
  more.hidden=a.length<=limit;
  if(!more.hidden)more.textContent=`继续翻阅 · 还剩 ${a.length-limit} 位`;
  const grid=$('#grid'),key=stateKey();
  if(key===lastKey&&limit>lastLimit&&grid.children.length===lastCount&&lastCount<a.length){
    const frag=document.createElement('div');
    frag.innerHTML=a.slice(lastCount,limit).map(cardHTML).join('');
    while(frag.firstChild)grid.appendChild(frag.firstChild);
  }else{
    grid.innerHTML=a.slice(0,limit).map(cardHTML).join('');
  }
  lastKey=key;lastLimit=limit;lastCount=Math.min(limit,a.length);
}

function group(title,items,c,isStory,note){
  if(!items||!items.length)return '';
  const body=items.map(it=>{
    if(typeof it==='string')return `<li>${esc(it)}</li>`;
    const t=it.title||it.issue||it.domain||it.target||it.name||it.label||'';
    const d=it.description||it.narrative||it.desc||it.claim||it.relation||it.resolution||it.text||it.detail||it.content||it.summary||it.role||'';
    const refs=(it.url?[it]:it.evidence||[]).filter(ref=>sourceUrl.test(ref.url));
    const links=refs.map(ref=>`<a href="${esc(ref.url)}" target="_blank" rel="noopener noreferrer">作品 ${esc(ref.index)}</a>`);
    return `<li>${t?`<strong>${esc(t)}</strong>`:''}${d?`<p>${esc(d)}</p>`:''}${links.length?`<span class="cites">${links.join(' · ')}</span>`:''}</li>`;
  }).join('');
  return `<details ${isStory?'open':''}><summary>${esc(title)} <span class="tag">${items.length}</span></summary>${note?`<p class="note">${esc(note)}</p>`:''}<ul>${body}</ul></details>`;
}

function variantBlock(c){
  if(!c.variants||!c.variants.length)return '';
  return `<div class="variants"><p class="vlabel">性别变体 · 艺术设定</p><div class="vgrid">${c.variants.map(v=>`<figure><img src="${esc(v.image)}" alt="${esc(c.name)}${v.gender==='female'?'女性':'男性'}变体插画" loading="lazy"><figcaption>${v.gender==='female'?'女':'男'} · 艺术设定</figcaption></figure>`).join('')}</div></div>`;
}

let detailReturnFocus=null;
function openDetail(slug){
  const c=bySlug.get(slug); if(!c)return; const d=c.dossier||{};
  const story = c.story || c.summary || '';
  const links=`<button class="md-open" data-md="${esc(c.slug)}">📖 阅读档案全文</button><a href="${esc(c.json_path)}" target="_blank" rel="noopener">人物 JSON ↗</a>`;
  $('#detailBody').innerHTML=`<div class="detail-grid">
    <aside class="detail-visual">${art(c)}<div class="stamp">NO. ${String(c.id).padStart(4,'0')} / ${esc(c.category)}</div><p class="slug-line">${esc(c.slug)}</p><p>${esc(c.art_note)}</p>${variantBlock(c)}</aside>
    <section class="detail-text">
      <p class="eyebrow">人物档案 / CHARACTER DOSSIER</p>
      <h2 id="detailTitle">${esc(c.name)}</h2>
      ${d.nature?`<p class="nature">${esc(d.nature)}</p>`:''}
      <div class="story-block">
        <h3>人物故事</h3>
        <div class="story-content"></div>
      </div>
      <div class="detail-links">${links}</div>
      <details class="pro-details">
        <summary>专业档案</summary>
        ${group('身份与原文依据',d.identity,c)}
        ${group('人物特征与动机',d.traits,c)}
        ${group('独立故事线',d.storylines,c,true)}
        ${group('叙事事件',d.events,c)}
        ${group('人物关系',d.relationships,c)}
        ${group('生活领域',d.life_domains,c)}
        ${group('说话方式',d.speech_habits,c)}
        ${group('并列的叙述版本',d.contradictions,c)}
        ${group('后续研究线索',d.gaps,c)}
        ${group('创作构想',d.creative_expansions,c)}
      </details>
      <details><summary>作品出处 <span class="tag">${c.sources.length}</span></summary><div class="source-list">${c.sources.map(s=>`<a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">作品 ${esc(s.index)} ↗</a>`).join('')}</div>${group('作品与档案的关联',d.source_coverage,c)}</details>
      <details><summary>造像与艺术设定</summary><p>${esc(c.art_note)}</p><p>${esc(c.face_design)}</p></details>
    </section></div>`;
  $('#detailBody .story-content').replaceChildren(renderMarkdown(story).content);
  detailReturnFocus=document.activeElement;
  $('#detail').showModal(); $('#detail').scrollTop=0; document.body.style.overflow='hidden';
}

async function openMd(slug){
  const c=bySlug.get(slug); if(!c)return;
  $('#mdTitle').textContent=`${c.name} · 档案全文`;
  $('#mdRaw').href=c.md_path;
  $('#mdBody').innerHTML='<p class="loading">正在载入档案…</p>';
  $('#mdView').showModal(); document.body.style.overflow='hidden';
  try{
    const r=await fetch(c.md_path);
    if(!r.ok)throw new Error('HTTP '+r.status);
    const content=renderMarkdown(await r.text()).content;
    // md 内 h1 与 #mdTitle 语义撞层，统一降级为 h2
    content.querySelectorAll('h1').forEach(h=>{const h2=document.createElement('h2');h2.append(...h.childNodes);h.replaceWith(h2);});
    $('#mdBody').replaceChildren(content);
  }catch(e){
    $('#mdBody').innerHTML=`<p class="loading">请选择重试，或 <a href="${esc(c.md_path)}" target="_blank" rel="noopener">打开 Markdown ↗</a>。</p><p class="loading"><button id="mdRetry" type="button">重试载入全文</button></p>`;
    const b=$('#mdRetry'); if(b)b.addEventListener('click',()=>openMd(slug));
  }
}

document.addEventListener('click',e=>{
  const t=e.target.closest('[data-open],[data-save],[data-md]');
  if(!t)return;
  if(t.dataset.save){
    const s=t.dataset.save, wasOn=saved.has(s);
    if(wasOn)saved.delete(s); else saved.add(s);
    persist();
    // 收藏视图下取消收藏：卡片应离开列表，重渲可接受；其余场景就地更新，不整格重建
    if(onlySaved&&wasOn){render();return;}
    const on=saved.has(s), c=bySlug.get(s);
    t.textContent=on?'★':'☆';
    t.setAttribute('aria-pressed',String(on));
    t.setAttribute('aria-label',(on?'取消收藏':'收藏')+(c?c.name:''));
    return;
  }
  if(t.dataset.md){openMd(t.dataset.md); return;}
  if(t.dataset.open)openDetail(t.dataset.open);
});
$('#detailClose').addEventListener('click',()=>{$('#detail').close();});
$('#mdClose').addEventListener('click',()=>{$('#mdView').close();});
$('#detail').addEventListener('close',()=>{
  document.body.style.overflow='';
  // 焦点归还：回到打开弹窗的触发元素；跨翻页找不到时回到图鉴标题
  const el=(detailReturnFocus&&detailReturnFocus.isConnected)?detailReturnFocus:$('#gallery h2');
  if(el&&typeof el.focus==='function')el.focus();
});
$('#mdView').addEventListener('close',()=>{if(!$('#detail').open)document.body.style.overflow='';});
// 「看一眼就走」的轻层：点遮罩关闭（仅 pointer 路径；mdView 是长文沉浸态，不加）
$('#detail').addEventListener('click',e=>{ if(e.target===$('#detail'))$('#detail').close(); });
// 搜索 180ms 防抖（role=status 结果行同步降频播报）；select 保持立即响应
let searchTimer=0;
$('#search').addEventListener('input',()=>{clearTimeout(searchTimer);searchTimer=setTimeout(()=>{limit=24;render();},180);});
['category','view','sort'].forEach(id=>$('#'+id).addEventListener('input',()=>{limit=24;render();}));
$('#reset').addEventListener('click',()=>{
  $('#search').value='';$('#category').value='';$('#view').value='illustrated';$('#sort').value='id';
  onlySaved=false;savedBtn.setAttribute('aria-pressed','false');limit=24;render();
});
$('#more').addEventListener('click',()=>{limit+=24;render();});
savedBtn.addEventListener('click',()=>{
  onlySaved=!onlySaved;limit=24;
  savedBtn.setAttribute('aria-pressed',String(onlySaved));
  render();
});
const m=DATA.meta||{};
$('#builtAt').textContent=m.built_at?`数据快照 ${String(m.built_at).slice(0,10)}`:'';
$('#footStats').textContent=`${cards.length} 张独立角色图 · ${cards.filter(c=>c.validated).length} 份校验档案`;
persist();
render();
