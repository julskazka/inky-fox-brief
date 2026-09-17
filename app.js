(() => {
  'use strict';

  const STORAGE_KEY = 'inkyFoxBrief:v10';
  const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbz06rYAjbywJ6CS5yUHYVgi7-O6FDV-xbsHAh7UBQLbdGwlgXbL0DFuPDCfsfxPjYKw/exec';
  const TOTAL_STEPS = 11;
  const $ = (s, root = document) => root.querySelector(s);
  const esc = (v='') => String(v).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));

  const assetPaths = {
    hero: 'assets/inky-fox.b64',
    idea: 'assets/idea.b64',
    sleep: 'assets/sleep.b64',
    pawPink: 'assets/paw.b64',
    pawPurple: 'assets/paw.b64',
    pawBlue: 'assets/paw.b64',
    pawMint: 'assets/paw.b64'
  };
  const assets = {};

  const initialState = {
    name:'', telegram:'', projectName:'', projectTypes:[], projectTypeOther:'', projectDescription:'',
    userGoal:'', audience:'', trafficSources:[], trafficOther:'', afterPage:'', funnel:'', hasScenarios:'', scenarios:'',
    mustHave:'', textStatus:'', textOwner:'', designStatus:'', designRefs:'', integrations:[], integrationOther:'',
    launchDate:'', readyDate:'', importantDates:'', projectLifetime:'', futureUpdates:'', important:'', avoid:'', extra:''
  };

  const sections = [
    {k:'Знакомство',t:'Для начала — как к вам обращаться?',d:'Оставьте имя и Telegram, чтобы я понимала, чей это бриф.',f:[
      {n:'name',l:'Как вас зовут?',type:'text',req:1,ph:'Имя'},
      {n:'telegram',l:'Ваш ник в Telegram',type:'text',req:1,ph:'@username',hint:'Можно указать с @ или без него.'}
    ]},
    {k:'01 · О проекте',t:'Какой формат проекта планируете?',d:'Можно выбрать несколько вариантов.',f:[
      {n:'projectName',l:'Название проекта / продукта',type:'text',req:1,ph:'Например: клуб, интенсив, голосование…'},
      {n:'projectTypes',l:'Что нужно сделать?',type:'multi',req:1,o:[['landing','Лендинг / посадочная'],['miniapp','MiniApp в Telegram / MAX'],['registration','Регистрация на мероприятие / вебинар / интенсив'],['club','Закрытый клуб / сообщество'],['vote','Голосование'],['quiz','Квиз / тест'],['catalog','Каталог'],['leadmagnet','Лид-магнит'],['sales','Страница продажи'],['interactive','Интерактивная механика'],['other','Другое']]},
      {n:'projectTypeOther',l:'Напишите свой вариант',type:'text',ph:'Ваш вариант…',show:['projectTypes','other']}
    ]},
    {k:'01 · О проекте',t:'Коротко опишите задачу своими словами',d:'Что должно получиться в результате? Без технических терминов.',f:[
      {n:'projectDescription',l:'Что должно получиться в результате?',type:'textarea',req:1,ph:'Например: нужна страница регистрации, после которой человек попадает в Telegram-бот…'}
    ]},
    {k:'02 · Цель',t:'Что должен сделать пользователь?',d:'Какое действие будет главным и для кого создаётся проект.',f:[
      {n:'userGoal',l:'Что в итоге должен сделать пользователь?',type:'textarea',req:1,ph:'Зарегистрироваться, оставить заявку, купить, проголосовать…'},
      {n:'audience',l:'Кто основная аудитория проекта?',type:'textarea',req:1,ph:'Кто эти люди, для кого собираем страницу / MiniApp?'}
    ]},
    {k:'03 · Воронка',t:'Откуда человек приходит и куда идёт дальше?',d:'Так станет понятно место страницы / MiniApp в общей воронке.',f:[
      {n:'trafficSources',l:'Откуда пользователь попадает на страницу / в MiniApp?',type:'multi',req:1,o:[['tgChannel','Telegram-канал'],['bot','Telegram-бот'],['ads','Реклама'],['mail','Рассылка'],['getcourse','GetCourse'],['social','Соцсети'],['qr','QR-код'],['site','Сайт'],['other','Другое']]},
      {n:'trafficOther',l:'Уточните источник',type:'text',ph:'Ваш вариант',show:['trafficSources','other']},
      {n:'afterPage',l:'Куда пользователь должен попасть дальше?',type:'textarea',req:1,ph:'Например: после регистрации — в Telegram-бот…'}
    ]},
    {k:'03 · Воронка',t:'Есть ли уже понимание сценария целиком?',d:'Можно описать цепочку в одну строку. Если есть разные ветки — тоже отметьте.',f:[
      {n:'funnel',l:'Если уже есть понимание воронки — опишите её целиком',type:'textarea',ph:'Реклама → бот → MiniApp → регистрация → сообщения → мероприятие'},
      {n:'hasScenarios',l:'Есть ли разные сценарии для пользователей?',type:'radio',o:[['no','Нет, пока без разных сценариев'],['yes','Да, есть разные сценарии']]},
      {n:'scenarios',l:'Коротко опишите сценарии',type:'textarea',ph:'Какие ветки уже известны?',show:['hasScenarios','yes']}
    ]},
    {k:'04 · Внутри',t:'Что обязательно должно быть реализовано?',d:'Только то, без чего проект точно не состоится. Остальную структуру я предложу сама.',f:[
      {n:'mustHave',l:'Что обязательно должно быть внутри?',type:'textarea',ph:'Форма регистрации, голосование, тест, личный кабинет, каталог, видео, расписание…'}
    ]},
    {k:'05 · Тексты',t:'Что сейчас с текстами?',d:'Нужно понять исходную точку и нужна ли помощь с упаковкой.',f:[
      {n:'textStatus',l:'Как обстоят дела с текстами?',type:'radio',req:1,o:[['ready','Тексты полностью готовы'],['adapt','Тексты есть, но их нужно адаптировать'],['materials','Есть материалы, из которых нужно собрать тексты'],['fromScratch','Тексты нужно подготовить с нуля']]},
      {n:'textOwner',l:'Кто будет делать тексты?',type:'radio',req:1,o:[['yes','Есть человек, который делает тексты'],['needHelp','Нужна ваша помощь с текстами']]}
    ]},
    {k:'06 · Дизайн',t:'Как будем работать с визуалом?',d:'Выберите ситуацию, которая сейчас ближе всего.',f:[
      {n:'designStatus',l:'Что сейчас с дизайном?',type:'radio',req:1,o:[['ready','Есть готовый дизайн'],['designer','Есть дизайнер, который подготовит макеты'],['needDesigner','Нужен ваш дизайнер'],['adapt','Есть существующий стиль — нужно адаптировать'],['none','Визуального стиля пока нет']]},
      {n:'designRefs',l:'Есть ли фирменный стиль, брендбук или визуальные референсы?',type:'textarea',ph:'Можно приложить ссылки или коротко описать, что нравится.'}
    ]},
    {k:'07 · Интеграции',t:'С чем нужно связать проект?',d:'Можно выбрать несколько вариантов. Доступы сейчас не нужны.',f:[
      {n:'integrations',l:'Нужны ли интеграции с внешними сервисами?',type:'multi',o:[['getcourse','GetCourse'],['amo','AMO CRM'],['bitrix','Битрикс24'],['payments','Платёжная система'],['other','Другое'],['unknown','Пока не знаю'],['no','Не нужны']]},
      {n:'integrationOther',l:'Уточните интеграции',type:'text',ph:'Ваш вариант',show:['integrations','other']}
    ]},
    {k:'08 · Сроки',t:'Когда проект должен выйти?',d:'Финальный блок: даты и то, как проект будет жить после запуска.',f:[
      {n:'launchDate',l:'Когда планируется запуск проекта / мероприятия?',type:'date',req:1},
      {n:'readyDate',l:'К какой дате страница / MiniApp должна быть готова?',type:'date',req:1},
      {n:'importantDates',l:'Есть ли важные даты внутри проекта?',type:'textarea',ph:'Начало рекламы, открытие регистрации, эфир, мероприятие…'},
      {n:'projectLifetime',l:'Проект создаётся:',type:'radio',req:1,o:[['one','Под один конкретный запуск'],['ongoing','Для постоянного использования'],['repeat','Планируется использовать повторно и обновлять'],['unknown','Пока не определено']]},
      {n:'futureUpdates',l:'Планируются ли дальнейшие изменения или обновления?',type:'textarea',ph:'Если да — какие примерно?'},
      {n:'important',l:'Что для вас особенно важно в этом проекте?',type:'textarea'},
      {n:'avoid',l:'Есть ли что-то, что точно не хочется видеть или использовать?',type:'textarea'},
      {n:'extra',l:'Есть ли ещё что-то важное, что мне стоит знать?',type:'textarea'}
    ]}
  ];

  let state = loadState();
  let step = -1;
  let sending = false;

  function loadState(){ try{return {...initialState,...(JSON.parse(localStorage.getItem(STORAGE_KEY)||'null')||{})};}catch{return {...initialState};} }
  function saveState(){ localStorage.setItem(STORAGE_KEY,JSON.stringify(state)); const el=$('#saveStatus'); if(el){el.textContent='Сохранено';clearTimeout(saveState.t);saveState.t=setTimeout(()=>el.textContent='',900);} }
  function visible(f){ if(!f.show)return true; const [n,v]=f.show; const cur=state[n]; return Array.isArray(cur)?cur.includes(v):cur===v; }

  function fieldHtml(f){
    if(!visible(f)) return '';
    const req=f.req?' required':'';
    const hint=f.hint?`<div class="field-hint">${esc(f.hint)}</div>`:'';
    if(f.type==='text'||f.type==='date') return `<div class="field"><label class="${req}">${esc(f.l)}</label>${hint}<input class="${f.type==='date'?'date-input':'text-input'}" type="${f.type}" name="${f.n}" value="${esc(state[f.n]||'')}" placeholder="${esc(f.ph||'')}"></div>`;
    if(f.type==='textarea') return `<div class="field"><label class="${req}">${esc(f.l)}</label>${hint}<textarea class="text-area" name="${f.n}" placeholder="${esc(f.ph||'')}">${esc(state[f.n]||'')}</textarea></div>`;
    const vals=f.type==='multi'?(state[f.n]||[]):[state[f.n]];
    return `<div class="field"><div class="field-label ${req}">${esc(f.l)}</div><div class="choice-grid">${f.o.map(([v,l])=>`<label class="choice-card"><input type="${f.type==='multi'?'checkbox':'radio'}" name="${f.n}" value="${v}" ${vals.includes(v)?'checked':''}><span class="choice-body"><span class="choice-box"></span><span class="choice-text">${esc(l)}</span></span></label>`).join('')}</div></div>`;
  }

  async function loadAsset(path){
    try{ const b64=(await fetch(path,{cache:'no-store'}).then(r=>{if(!r.ok)throw new Error();return r.text();})).trim(); return `data:image/webp;base64,${b64}`; }
    catch{return '';}
  }
  async function loadAssets(){ for(const [k,p] of Object.entries(assetPaths)) assets[k]=await loadAsset(p); }

  function intro(){
    step=-1; $('#progress').classList.add('is-hidden'); $('#nav').classList.add('is-hidden'); $('#miniFooter').classList.remove('is-hidden');
    $('#screen').innerHTML=`<section class="intro"><h1>Заполни бриф</h1><p class="intro-sub">и получи понятную задачу на сайт / MiniApp под твой проект</p><div class="feature-list"><div class="feature"><span class="feature-icon">♢</span><span>Пойму твою задачу<br>и предложу решение</span></div><div class="feature"><span class="feature-icon">⚙</span><span>Учту тексты, дизайн,<br>интеграции и сроки</span></div><div class="feature"><span class="feature-icon">♡</span><span>Соберу понятный<br>план работы</span></div></div><div class="hero-stage"><img class="hero-img" src="${assets.hero}" alt="Inky Fox с ноутбуком">${assets.pawPink?`<img class="hero-paw" src="${assets.pawPink}" alt="">`:''}</div><button class="btn btn-start" id="startBtn" type="button">Начать бриф →</button><div class="time-note">▣ &nbsp; Это займёт 7–10 минут</div></section>`;
    $('#startBtn').onclick=()=>go(0);
  }

  function go(n){ step=Math.max(0,Math.min(n,sections.length)); render(); window.scrollTo({top:0,behavior:'smooth'}); }
  function render(){ if(step===sections.length){review();return;} const s=sections[step]; $('#progress').classList.remove('is-hidden'); $('#nav').classList.remove('is-hidden'); $('#miniFooter').classList.add('is-hidden'); const pct=Math.round((step+1)/TOTAL_STEPS*100); $('#progressFill').style.width=`${pct}%`; $('#progressCount').textContent=`${step+1} / ${TOTAL_STEPS}`; $('#screen').innerHTML=`<section class="question"><div class="question-kicker">${esc(s.k)}</div><h2 class="question-title">${esc(s.t)}</h2><p class="question-desc">${esc(s.d)}</p><div class="fields">${s.f.map(fieldHtml).join('')}</div><div class="validation" id="validation"></div><div class="decor-bottom">${assets.pawPink?`<img class="paw-decor" src="${step%2?assets.pawPurple:assets.pawPink}" alt="">`:''}<div class="quote-hand">Большие проекты начинаются<br>с честного брифа ♡</div>${assets.pawBlue?`<img class="paw-decor small" src="${assets.pawBlue}" alt="">`:''}</div></section>`; bindFields(); $('#nextBtn').innerHTML='<span>Далее</span> →'; $('#backBtn').innerHTML='← <span>Назад</span>'; }

  function bindFields(){
    $('#screen').querySelectorAll('input,textarea').forEach(el=>{ const evt=(el.type==='checkbox'||el.type==='radio')?'change':'input'; el.addEventListener(evt,e=>{ const {name,type,value,checked}=e.target; if(type==='checkbox'){const set=new Set(Array.isArray(state[name])?state[name]:[]); checked?set.add(value):set.delete(value); state[name]=[...set];}else state[name]=value; saveState(); renderConditionals(); }); });
  }
  function renderConditionals(){ sections[step]?.f.filter(f=>f.show).forEach(f=>{ const existing=$(`[name="${f.n}"]`); const should=visible(f); if(should&&!existing){render();} if(!should&&existing){render();} }); }

  function validate(){ const s=sections[step]; const errors=[]; for(const f of s.f){ if(!f.req||!visible(f))continue; const v=state[f.n]; if(Array.isArray(v)?v.length===0:!String(v||'').trim())errors.push(`Заполните: ${f.l}`); } return errors; }

  function prettyDate(v){ if(!v)return '—'; const [y,m,d]=v.split('-'); return `${d}.${m}.${y}`; }
  function values(arr,map){ return (arr||[]).map(v=>map[v]||v).join(', ')||'—'; }
  function summaryCards(){
    const projectMap={landing:'Лендинг / посадочная',miniapp:'MiniApp в Telegram / MAX',registration:'Регистрация',club:'Закрытый клуб / сообщество',vote:'Голосование',quiz:'Квиз / тест',catalog:'Каталог',leadmagnet:'Лид-магнит',sales:'Страница продажи',interactive:'Интерактивная механика',other:`Другое: ${state.projectTypeOther||''}`};
    const trafficMap={tgChannel:'Telegram-канал',bot:'Telegram-бот',ads:'Реклама',mail:'Рассылка',getcourse:'GetCourse',social:'Соцсети',qr:'QR-код',site:'Сайт',other:`Другое: ${state.trafficOther||''}`};
    const intMap={getcourse:'GetCourse',amo:'AMO CRM',bitrix:'Битрикс24',payments:'Платёжная система',other:`Другое: ${state.integrationOther||''}`,unknown:'Пока не знаю',no:'Не нужны'};
    const cards=[['Контакт',`Имя: ${state.name}\nTelegram: ${state.telegram}`],['Проект',`${state.projectName}\n${values(state.projectTypes,projectMap)}\n${state.projectDescription||''}`],['Цель',`${state.userGoal||'—'}\nАудитория: ${state.audience||'—'}`],['Воронка',`${values(state.trafficSources,trafficMap)}\nДальше: ${state.afterPage||'—'}\n${state.funnel||''}`],['Внутри',state.mustHave||'—'],['Тексты',`${state.textStatus||'—'} / ${state.textOwner||'—'}`],['Дизайн',`${state.designStatus||'—'}\n${state.designRefs||''}`],['Интеграции',values(state.integrations,intMap)],['Сроки',`Запуск: ${prettyDate(state.launchDate)}\nГотово к: ${prettyDate(state.readyDate)}\n${state.importantDates||''}`],['Дополнительно',`${state.important||''}\n${state.avoid||''}\n${state.extra||''}`]];
    return cards.map(([t,p])=>`<div class="summary-card"><h3>${esc(t)}</h3><p>${esc(p)}</p></div>`).join('');
  }

  function review(){ $('#progress').classList.remove('is-hidden'); $('#nav').classList.remove('is-hidden'); $('#progressFill').style.width='100%'; $('#progressCount').textContent=`${TOTAL_STEPS} / ${TOTAL_STEPS}`; $('#screen').innerHTML=`<section class="review"><div class="review-head"><div><div class="question-kicker">Финал</div><h2 class="question-title">Проверьте бриф перед отправкой</h2><p class="question-desc">Если всё верно — нажмите «Отправить бриф».</p></div><img class="review-fox" src="${assets.idea}" alt="Inky Fox с идеей"></div><div class="summary">${summaryCards()}</div><div class="validation" id="validation"></div></section>`; $('#nextBtn').innerHTML='<span>Отправить бриф</span> →'; $('#backBtn').innerHTML='← <span>Назад</span>'; }

  function payload(){ return {...state, projectTypes:(state.projectTypes||[]).join(', '), trafficSources:(state.trafficSources||[]).join(', '), integrations:(state.integrations||[]).join(', '), sentAt:new Date().toISOString(), submissionId:`inky-${Date.now()}-${Math.random().toString(36).slice(2,8)}`}; }

  async function submit(){
    if(sending)return; sending=true; $('#nextBtn').disabled=true; $('#nextBtn').innerHTML='<span>Отправляем…</span>';
    const body=JSON.stringify(payload());
    let queued=false;
    try{
      if(navigator.sendBeacon){ queued=navigator.sendBeacon(SCRIPT_URL,new Blob([body],{type:'text/plain;charset=UTF-8'})); }
      if(!queued){ await fetch(SCRIPT_URL,{method:'POST',mode:'no-cors',headers:{'Content-Type':'text/plain;charset=UTF-8'},body,keepalive:true}); queued=true; }
      if(!queued) throw new Error('not queued');
      localStorage.removeItem(STORAGE_KEY); state={...initialState}; setTimeout(success,550);
    }catch(err){ sending=false; $('#nextBtn').disabled=false; $('#nextBtn').innerHTML='<span>Отправить бриф</span> →'; const m=$('#validation'); if(m)m.textContent='Не удалось отправить. Попробуйте ещё раз.'; }
  }

  function success(){ sending=false; $('#progress').classList.add('is-hidden'); $('#nav').classList.add('is-hidden'); $('#miniFooter').classList.remove('is-hidden'); $('#screen').innerHTML=`<section class="success"><div class="success-heart">♡</div><h1>Бриф отправлен!</h1><p>Спасибо! Я получила твои ответы<br>и уже изучаю проект.</p><p>Совсем скоро свяжусь с тобой в Telegram, чтобы обсудить детали и предложить решение.</p><div class="success-art"><img class="success-img" src="${assets.sleep}" alt="Спящий Inky Fox">${assets.pawPink?`<img class="success-paw" src="${assets.pawPink}" alt="">`:''}</div><button class="btn btn-back-home" id="homeBtn" type="button">⌂ &nbsp; Вернуться на главную</button></section>`; $('#homeBtn').onclick=intro; }

  $('#backBtn').onclick=()=>{ if(step===sections.length)go(sections.length-1); else if(step<=0)intro(); else go(step-1); };
  $('#topBack').onclick=()=>{ if(step===sections.length)go(sections.length-1); else if(step<=0)intro(); else go(step-1); };
  $('#nextBtn').onclick=async()=>{ if(step===sections.length){await submit();return;} const errs=validate(); if(errs.length){$('#validation').textContent=errs[0];return;} go(step+1); };
  $('#brandBtn').onclick=intro;

  (async()=>{ await loadAssets(); intro(); })();
})();
