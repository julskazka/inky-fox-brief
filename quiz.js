(() => {
  'use strict';

  const KEY = 'inkyFoxBrief:v5';
  const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbz06rYAjbywJ6CS5yUHYVgi7-O6FDV-xbsHAh7UBQLbdGwlgXbL0DFuPDCfsfxPjYKw/exec';
  const $ = (s, root = document) => root.querySelector(s);
  const esc = (v = '') => String(v).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));

  const initialState = {
    name:'', telegram:'', projectName:'', projectTypes:[], projectTypeOther:'', projectDescription:'',
    userGoal:'', audience:'', trafficSources:[], trafficOther:'', afterPage:'', funnel:'', hasScenarios:'',
    scenarios:'', mustHave:'', textStatus:'', textOwner:'', designStatus:'', designRefs:'', integrations:[],
    integrationOther:'', launchDate:'', readyDate:'', importantDates:'', projectLifetime:'', futureUpdates:'',
    important:'', avoid:'', extra:''
  };

  const sections = [
    {k:'Знакомство', t:'Для начала — как к вам обращаться?', d:'Оставьте имя и Telegram, чтобы бриф не потерялся среди проектов.', f:[
      {n:'name', l:'Как вас зовут?', type:'text', req:1, ph:'Имя'},
      {n:'telegram', l:'Ваш ник в Telegram', type:'text', req:1, ph:'@username', hint:'Можно указать с @ или без него.'}
    ]},
    {k:'01 · О проекте', t:'Что нужно собрать?', d:'Можно выбрать несколько вариантов. Архитектуру и блоки я продумываю сама — здесь важен общий формат.', f:[
      {n:'projectName', l:'Название проекта / продукта', type:'text', req:1, ph:'Например: клуб, интенсив, голосование…'},
      {n:'projectTypes', l:'Что нужно сделать?', type:'multi', req:1, o:[['landing','Посадочная страница'],['registration','Регистрация на мероприятие / вебинар / интенсив'],['club','Страница клуба'],['vote','Голосование'],['quiz','Квиз / тест'],['catalog','Каталог'],['leadmagnet','Лид-магнит'],['sales','Страница продажи'],['interactive','Интерактивная механика'],['other','Другое']]},
      {n:'projectTypeOther', l:'Уточните, что именно', type:'text', ph:'Ваш вариант', show:['projectTypes','other']},
      {n:'projectDescription', l:'Коротко опишите задачу своими словами. Что должно получиться в результате?', type:'textarea', req:1, ph:'Опишите задачу в свободной форме…'}
    ]},
    {k:'02 · Цель', t:'Что должен сделать пользователь?', d:'Какое действие будет главным и для кого создаётся проект.', f:[
      {n:'userGoal', l:'Что в итоге должен сделать пользователь?', type:'textarea', req:1, ph:'Зарегистрироваться, оставить заявку, купить, проголосовать, пройти тест…'},
      {n:'audience', l:'Кто основная аудитория проекта?', type:'textarea', req:1, ph:'Кто эти люди, для кого собираем страницу / MiniApp?'}
    ]},
    {k:'03 · Воронка', t:'Как человек проходит путь?', d:'Откуда он приходит, что делает внутри и куда идёт дальше.', f:[
      {n:'trafficSources', l:'Откуда пользователь попадает на страницу / в MiniApp?', type:'multi', req:1, o:[['tgChannel','Telegram-канал'],['bot','Telegram-бот'],['ads','Реклама'],['mail','Рассылка'],['getcourse','GetCourse'],['social','Соцсети'],['qr','QR-код'],['site','Сайт'],['other','Другое']]},
      {n:'trafficOther', l:'Уточните источник', type:'text', ph:'Ваш вариант', show:['trafficSources','other']},
      {n:'afterPage', l:'Что происходит после страницы / MiniApp? Куда пользователь должен попасть дальше?', type:'textarea', req:1, ph:'Например: после регистрации — в Telegram-бот…'},
      {n:'funnel', l:'Если уже есть понимание воронки — опишите её целиком', type:'textarea', ph:'Реклама → бот → MiniApp → регистрация → сообщения → мероприятие'},
      {n:'hasScenarios', l:'Есть ли разные сценарии для пользователей?', type:'radio', o:[['no','Нет'],['yes','Да']]},
      {n:'scenarios', l:'Коротко опишите сценарии', type:'textarea', ph:'Какие ветки уже известны?', show:['hasScenarios','yes']}
    ]},
    {k:'04 · Внутри', t:'Что обязательно должно быть реализовано?', d:'Только то, без чего проект точно не состоится. Если жёстких требований нет — структуру и механику предложу сама.', f:[
      {n:'mustHave', l:'Есть ли что-то, что обязательно должно быть реализовано?', type:'textarea', ph:'Форма регистрации, голосование, тест, личный кабинет, каталог, видео, расписание…'}
    ]},
    {k:'05 · Тексты', t:'Что сейчас с текстами?', d:'Нужно понять исходную точку и нужна ли помощь с упаковкой.', f:[
      {n:'textStatus', l:'Как обстоят дела с текстами?', type:'radio', req:1, o:[['ready','Тексты полностью готовы'],['adapt','Тексты есть, но их нужно адаптировать под страницу / MiniApp'],['materials','Есть материалы, из которых нужно собрать тексты'],['fromScratch','Тексты нужно подготовить с нуля']]},
      {n:'textOwner', l:'Есть ли кто будет делать тексты?', type:'radio', req:1, o:[['yes','Да'],['needHelp','Нет, нужна ваша помощь']]}
    ]},
    {k:'06 · Дизайн', t:'Как будем работать с визуалом?', d:'Выберите текущую ситуацию по дизайну.', f:[
      {n:'designStatus', l:'Как будем работать с дизайном?', type:'radio', req:1, o:[['ready','Есть готовый дизайн'],['designer','Есть дизайнер, который подготовит макеты'],['needDesigner','Нужен ваш дизайнер'],['adapt','Есть существующий стиль проекта, нужно адаптировать его под новую страницу / MiniApp'],['none','Визуального стиля пока нет']]},
      {n:'designRefs', l:'Есть ли фирменный стиль, брендбук или примеры страниц / приложений, на которые хочется ориентироваться?', type:'textarea', ph:'Можно приложить ссылки или кратко описать, что нравится.'}
    ]},
    {k:'07 · Интеграции', t:'С чем нужно связать проект?', d:'Можно выбрать несколько вариантов. Доступы на этом этапе не нужны.', f:[
      {n:'integrations', l:'Нужны ли интеграции с внешними сервисами?', type:'multi', o:[['getcourse','GetCourse'],['amo','AMO CRM'],['bitrix','Битрикс24'],['payments','Платёжная система'],['other','Другое'],['unknown','Пока не знаю'],['no','Не нужны']]},
      {n:'integrationOther', l:'Уточните интеграции', type:'text', ph:'Ваш вариант', show:['integrations','other']}
    ]},
    {k:'08 · Сроки', t:'Когда проект должен выйти?', d:'Если даты ещё плавают — заполняйте только то, что уже известно.', f:[
      {n:'launchDate', l:'Когда планируется запуск проекта / мероприятия?', type:'date', req:1},
      {n:'readyDate', l:'К какой дате страница / MiniApp должна быть готова?', type:'date', req:1},
      {n:'importantDates', l:'Есть ли важные даты внутри проекта?', type:'textarea', ph:'Начало рекламы, открытие регистрации, эфир, мероприятие, закрытие регистрации…'}
    ]},
    {k:'09 · После запуска', t:'Это разовый запуск или проект надолго?', d:'Так я заложу подходящую архитектуру и пойму, нужно ли предусматривать обновления.', f:[
      {n:'projectLifetime', l:'Проект создаётся:', type:'radio', req:1, o:[['one','Под один конкретный запуск'],['ongoing','Для постоянного использования'],['repeat','Планируется использовать повторно и обновлять'],['unknown','Пока не определено']]},
      {n:'futureUpdates', l:'Планируются ли дальнейшие изменения или обновления?', type:'textarea', ph:'Если да — какие примерно?'}
    ]},
    {k:'10 · Дополнительно', t:'Что ещё важно знать до начала работы?', d:'Последний блок — здесь можно зафиксировать пожелания, ограничения и нюансы.', f:[
      {n:'important', l:'Что для вас особенно важно в этом проекте?', type:'textarea'},
      {n:'avoid', l:'Есть ли что-то, что точно не хочется видеть или использовать?', type:'textarea'},
      {n:'extra', l:'Есть ли ещё что-то важное, что мне стоит знать до начала работы?', type:'textarea'}
    ]}
  ];

  let state = load();
  let step = -1;
  let assets = { hero:'', paw:'', idea:'', sleep:'' };
  let sending = false;

  function load(){
    try { return { ...initialState, ...(JSON.parse(localStorage.getItem(KEY)) || {}) }; }
    catch { return { ...initialState }; }
  }
  function save(){
    localStorage.setItem(KEY, JSON.stringify(state));
    const el = $('#saveStatus');
    if(el){ el.textContent='Сохранено'; clearTimeout(save.t); save.t=setTimeout(()=>el.textContent='',900); }
  }
  function visible(f){ if(!f.show) return true; const [n,v]=f.show; const x=state[n]; return Array.isArray(x) ? x.includes(v) : x===v; }
  function field(f){
    if(!visible(f)) return '';
    const req=f.req?' required':'';
    const hint=f.hint?`<div class="field-hint">${esc(f.hint)}</div>`:'';
    if(f.type==='textarea') return `<div class="field"><label class="${req}">${esc(f.l)}</label>${hint}<textarea class="text-area" name="${f.n}" placeholder="${esc(f.ph||'')}">${esc(state[f.n]||'')}</textarea></div>`;
    if(f.type==='text'||f.type==='date') return `<div class="field"><label class="${req}">${esc(f.l)}</label>${hint}<input class="${f.type==='date'?'date-input':'text-input'}" type="${f.type}" name="${f.n}" value="${esc(state[f.n]||'')}" placeholder="${esc(f.ph||'')}"></div>`;
    const vals=f.type==='multi'?(state[f.n]||[]):[state[f.n]];
    return `<div class="field"><div class="field-label ${req}">${esc(f.l)}</div><div class="choice-grid">${f.o.map(([v,l])=>`<label class="choice-card"><input type="${f.type==='multi'?'checkbox':'radio'}" name="${f.n}" value="${v}" ${vals.includes(v)?'checked':''}><span class="choice-body"><span class="choice-dot"></span><span class="choice-text">${esc(l)}</span></span></label>`).join('')}</div></div>`;
  }
  const pawImg = (cls='') => assets.paw ? `<img class="watercolor-paw ${cls}" src="${assets.paw}" alt="" aria-hidden="true">` : '';

  function intro(){
    step=-1;
    $('#progressShell').classList.add('is-hidden');
    $('#navRow').classList.add('is-hidden');
    $('#deviceNote').classList.add('is-hidden');
    $('#screen').innerHTML=`<div class="intro-grid"><div class="intro-copy"><div class="eyebrow">БРИФ · MINIAPP / WEB</div><h1>Расскажите о проекте — я соберу из этого понятную задачу на разработку</h1><p class="lead">Не нужно готовить техническое задание. Ответьте на вопросы так, как понимаете сейчас. Если чего-то ещё нет — это нормально.</p><div class="intro-points"><span>≈ 7–10 минут</span><span>можно вернуться назад</span><span>ответы не потеряются</span></div><button class="btn btn-primary btn-large" id="startBtn">Начать бриф</button></div><div class="intro-art"><div class="hero-halo"></div>${assets.hero?`<img class="hero-fox" src="${assets.hero}" alt="Лисёнок Inky Fox с ноутбуком">`:''}${pawImg('intro-paw')}<span class="sparkles sparkles-one">✦</span><span class="sparkles sparkles-two">✧</span></div></div>`;
    $('#startBtn').onclick=()=>go(0);
  }

  function go(n){ step=Math.max(0,Math.min(n,sections.length)); render(); window.scrollTo({top:0,behavior:'smooth'}); }
  function render(){
    if(step===sections.length){ review(); return; }
    const s=sections[step];
    $('#progressShell').classList.remove('is-hidden'); $('#navRow').classList.remove('is-hidden'); $('#deviceNote').classList.remove('is-hidden');
    const pct=Math.round((step+1)/(sections.length+1)*100); $('#progressLabel').textContent=`Шаг ${step+1} из ${sections.length+1}`; $('#progressPercent').textContent=`${pct}%`; $('#progressFill').style.width=`${pct}%`;
    $('#screen').innerHTML=`<div class="step-screen"><span class="step-decor-splash pink"></span><span class="step-decor-splash blue"></span><span class="step-decor-splash mint"></span>${pawImg('step-paw')}<div class="step-kicker">${esc(s.k)}</div><h2 class="step-title">${esc(s.t)}</h2><p class="step-description">${esc(s.d)}</p><div class="field-stack">${s.f.map(field).join('')}</div><div class="validation-message" id="validationMessage"></div></div>`;
    $('#backBtn').textContent=step===0?'В начало':'Назад'; $('#nextBtn').textContent='Далее'; $('#nextBtn').disabled=false; bind();
  }
  function bind(){
    $('#screen').querySelectorAll('input,textarea').forEach(el=>el.addEventListener(el.type==='checkbox'||el.type==='radio'?'change':'input',e=>{
      const x=e.target;
      if(x.type==='checkbox'){ const a=new Set(state[x.name]||[]); x.checked?a.add(x.value):a.delete(x.value); state[x.name]=[...a]; }
      else state[x.name]=x.value;
      save();
      if(sections[step].f.some(f=>f.show&&f.show[0]===x.name)) render();
    }));
  }
  function valid(){
    const s=sections[step];
    for(const f of s.f){
      if(!f.req||!visible(f)) continue;
      const v=state[f.n];
      if(Array.isArray(v)?!v.length:!String(v||'').trim()) return `Заполните: ${f.l}`;
    }
    return '';
  }

  const projectTypeLabels={landing:'Посадочная страница',registration:'Регистрация на мероприятие / вебинар / интенсив',club:'Страница клуба',vote:'Голосование',quiz:'Квиз / тест',catalog:'Каталог',leadmagnet:'Лид-магнит',sales:'Страница продажи',interactive:'Интерактивная механика',other:'Другое'};
  const trafficLabels={tgChannel:'Telegram-канал',bot:'Telegram-бот',ads:'Реклама',mail:'Рассылка',getcourse:'GetCourse',social:'Соцсети',qr:'QR-код',site:'Сайт',other:'Другое'};
  const integrationLabels={getcourse:'GetCourse',amo:'AMO CRM',bitrix:'Битрикс24',payments:'Платёжная система',other:'Другое',unknown:'Пока не знаю',no:'Не нужны'};
  const textLabels={ready:'Тексты полностью готовы',adapt:'Тексты есть, но их нужно адаптировать',materials:'Есть материалы, из которых нужно собрать тексты',fromScratch:'Тексты нужно подготовить с нуля'};
  const designLabels={ready:'Есть готовый дизайн',designer:'Есть дизайнер, который подготовит макеты',needDesigner:'Нужен ваш дизайнер',adapt:'Есть существующий стиль проекта, нужно адаптировать его',none:'Визуального стиля пока нет'};
  const lifetimeLabels={one:'Под один конкретный запуск',ongoing:'Для постоянного использования',repeat:'Использовать повторно и обновлять',unknown:'Пока не определено'};
  const listLabels=(arr,map)=>Array.isArray(arr)?arr.map(x=>map[x]||x).join(', '):'';
  function summaryCards(){
    const cards=[
      ['Контакт',`Имя: ${state.name||'—'}\nTelegram: ${state.telegram||'—'}`],
      ['Проект',`Название: ${state.projectName||'—'}\nФормат: ${listLabels(state.projectTypes,projectTypeLabels)}${state.projectTypeOther?`\nДругое: ${state.projectTypeOther}`:''}\nЗадача: ${state.projectDescription||'—'}`],
      ['Цель',`Действие: ${state.userGoal||'—'}\nАудитория: ${state.audience||'—'}`],
      ['Воронка',`Откуда: ${listLabels(state.trafficSources,trafficLabels)}${state.trafficOther?`\nДругое: ${state.trafficOther}`:''}\nКуда дальше: ${state.afterPage||'—'}\nВоронка: ${state.funnel||'—'}${state.scenarios?`\nСценарии: ${state.scenarios}`:''}`],
      ['Внутри',state.mustHave||'—'],
      ['Тексты',`${textLabels[state.textStatus]||'—'}\n${state.textOwner==='yes'?'Есть человек, который делает тексты':state.textOwner==='needHelp'?'Нужна помощь с текстами':'—'}`],
      ['Дизайн',`${designLabels[state.designStatus]||'—'}\n${state.designRefs||'—'}`],
      ['Интеграции',`${listLabels(state.integrations,integrationLabels)}${state.integrationOther?`\nДругое: ${state.integrationOther}`:''}`],
      ['Сроки',`Запуск: ${state.launchDate||'—'}\nГотовность: ${state.readyDate||'—'}\nВажные даты: ${state.importantDates||'—'}`],
      ['После запуска',`${lifetimeLabels[state.projectLifetime]||'—'}\n${state.futureUpdates||'—'}`],
      ['Дополнительно',`Важно: ${state.important||'—'}\nНе хочется: ${state.avoid||'—'}\nЕщё: ${state.extra||'—'}`]
    ];
    return cards.map(([t,v])=>`<div class="summary-card"><h3>${esc(t)}</h3><p>${esc(v)}</p></div>`).join('');
  }
  function review(){
    $('#progressShell').classList.remove('is-hidden'); $('#navRow').classList.remove('is-hidden'); $('#deviceNote').classList.remove('is-hidden');
    $('#progressLabel').textContent=`Шаг ${sections.length+1} из ${sections.length+1}`; $('#progressPercent').textContent='100%'; $('#progressFill').style.width='100%';
    $('#screen').innerHTML=`<div class="step-screen review-screen">${pawImg('step-paw')}<div class="review-head"><div><div class="step-kicker">ФИНАЛ</div><h2 class="step-title">Проверьте бриф перед отправкой</h2><p class="step-description">Если всё верно — нажмите «Отправить бриф». Ответы сразу попадут в таблицу.</p></div>${assets.idea?`<img class="review-fox" src="${assets.idea}" alt="Лисёнок с лампочкой">`:''}</div><div class="summary">${summaryCards()}</div><div class="validation-message" id="validationMessage"></div></div>`;
    $('#backBtn').textContent='Назад'; $('#nextBtn').textContent='Отправить бриф'; $('#nextBtn').disabled=false;
  }
  function payload(){
    return {
      ...state,
      projectTypes:(state.projectTypes||[]).join(', '),
      trafficSources:(state.trafficSources||[]).join(', '),
      integrations:(state.integrations||[]).join(', '),
      sentAt:new Date().toISOString()
    };
  }
  async function submit(){
    if(sending) return;
    sending=true; $('#nextBtn').disabled=true; $('#nextBtn').textContent='Отправляем…';
    const msg=$('#validationMessage'); if(msg) msg.textContent='';
    try{
      await fetch(SCRIPT_URL,{method:'POST',mode:'no-cors',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify(payload())});
      localStorage.removeItem(KEY); state={...initialState}; success();
    }catch(err){
      sending=false; $('#nextBtn').disabled=false; $('#nextBtn').textContent='Отправить бриф';
      if(msg) msg.textContent='Не удалось отправить бриф. Попробуйте ещё раз.';
    }
  }
  function success(){
    sending=false; $('#progressShell').classList.add('is-hidden'); $('#navRow').classList.add('is-hidden'); $('#deviceNote').classList.add('is-hidden');
    $('#screen').innerHTML=`<div class="success-screen"><div class="success-copy"><div class="step-kicker">ГОТОВО</div><h2 class="step-title">Спасибо! Бриф отправлен</h2><p class="step-description">Ответы сохранены. Ничего дополнительно отправлять или скачивать не нужно.</p><button class="btn btn-primary" id="restartBtn">Заполнить новый бриф</button></div>${assets.sleep?`<img class="success-fox" src="${assets.sleep}" alt="Спящий лисёнок">`:''}</div>`;
    $('#restartBtn').onclick=intro;
  }

  $('#backBtn').onclick=()=>step<=0?intro():go(step-1);
  $('#nextBtn').onclick=()=>{
    if(step===sections.length){ submit(); return; }
    const m=valid(); if(m){ $('#validationMessage').textContent=m; return; }
    go(step+1);
  };
  $('#brandLink').onclick=e=>{ e.preventDefault(); intro(); };

  async function loadAsset(path){
    try{
      const b64=(await fetch(path,{cache:'no-store'}).then(r=>{if(!r.ok) throw new Error(); return r.text();})).trim();
      return `data:image/webp;base64,${b64}`;
    }catch{return '';}
  }
  (async()=>{
    const [hero,paw,idea,sleep]=await Promise.all([
      loadAsset('assets/inky-fox.b64'), loadAsset('assets/paw.b64'), loadAsset('assets/idea.b64'), loadAsset('assets/sleep.b64')
    ]);
    assets={hero,paw,idea,sleep}; intro();
  })();
})();
