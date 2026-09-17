(() => {
  const KEY = 'inkyFoxBrief:v4';
  const $ = (s, root=document) => root.querySelector(s);
  const esc = (v='') => String(v).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
  const load = () => { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch { return {}; } };
  const state = load();
  let step = -1;
  let heroSrc = '';

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

  function save(){ localStorage.setItem(KEY, JSON.stringify(state)); const el=$('#saveStatus'); if(el){el.textContent='Сохранено'; clearTimeout(save.t); save.t=setTimeout(()=>el.textContent='',900);} }
  function visible(f){ if(!f.show) return true; const [n,v]=f.show; const x=state[n]; return Array.isArray(x) ? x.includes(v) : x===v; }
  function field(f){
    if(!visible(f)) return '';
    const req=f.req?' required':''; const hint=f.hint?`<div class="field-hint">${esc(f.hint)}</div>`:'';
    if(f.type==='textarea') return `<div class="field"><label class="${req}">${esc(f.l)}</label>${hint}<textarea class="text-area" name="${f.n}" placeholder="${esc(f.ph||'')}">${esc(state[f.n]||'')}</textarea></div>`;
    if(f.type==='text'||f.type==='date') return `<div class="field"><label class="${req}">${esc(f.l)}</label>${hint}<input class="${f.type==='date'?'date-input':'text-input'}" type="${f.type}" name="${f.n}" value="${esc(state[f.n]||'')}" placeholder="${esc(f.ph||'')}"></div>`;
    const vals=f.type==='multi'?(state[f.n]||[]):[state[f.n]];
    return `<div class="field"><div class="field-label ${req}">${esc(f.l)}</div><div class="choice-grid">${f.o.map(([v,l])=>`<label class="choice-card"><input type="${f.type==='multi'?'checkbox':'radio'}" name="${f.n}" value="${v}" ${vals.includes(v)?'checked':''}><span class="choice-body"><span class="choice-dot"></span><span class="choice-text">${esc(l)}</span></span></label>`).join('')}</div></div>`;
  }
  function paw(){ return `<span class="css-paw" aria-hidden="true"><i></i><i></i><i></i><i></i><b></b></span>`; }
  function intro(){
    step=-1; $('#progressShell').classList.add('is-hidden'); $('#navRow').classList.add('is-hidden'); $('#deviceNote').classList.add('is-hidden');
    $('#screen').innerHTML=`<div class="intro-grid"><div class="intro-copy"><div class="eyebrow">БРИФ · MINIAPP / WEB</div><h1>Расскажите о проекте — я соберу из этого понятную задачу на разработку</h1><p class="lead">Не нужно готовить техническое задание. Ответьте на вопросы так, как понимаете сейчас. Если чего-то ещё нет — это нормально.</p><div class="intro-points"><span>≈ 7–10 минут</span><span>можно вернуться назад</span><span>ответы не потеряются</span></div><button class="btn btn-primary btn-large" id="startBtn">Начать бриф</button></div><div class="intro-art"><span class="splash splash-pink"></span><span class="splash splash-blue"></span><span class="splash splash-mint"></span>${paw()}<span class="sparkles sparkles-one">✦</span><span class="sparkles sparkles-two">✧</span>${heroSrc?`<img class="hero-fox" src="${heroSrc}" alt="Лисёнок Inky Fox">`:''}</div></div>`;
    $('#startBtn').onclick=()=>go(0);
  }
  function go(n){ step=Math.max(0,Math.min(n,sections.length)); render(); scrollTo({top:0,behavior:'smooth'}); }
  function render(){
    if(step===sections.length){ final(); return; }
    const s=sections[step]; $('#progressShell').classList.remove('is-hidden'); $('#navRow').classList.remove('is-hidden'); $('#deviceNote').classList.remove('is-hidden');
    const pct=Math.round((step+1)/(sections.length+1)*100); $('#progressLabel').textContent=`Шаг ${step+1} из ${sections.length+1}`; $('#progressPercent').textContent=`${pct}%`; $('#progressFill').style.width=`${pct}%`;
    $('#screen').innerHTML=`<div class="step-screen"><span class="step-decor-splash pink"></span><span class="step-decor-splash blue"></span><span class="step-decor-splash mint"></span>${paw()}<div class="step-kicker">${esc(s.k)}</div><h2 class="step-title">${esc(s.t)}</h2><p class="step-description">${esc(s.d)}</p><div class="field-stack">${s.f.map(field).join('')}</div><div class="validation-message" id="validationMessage"></div></div>`;
    $('#backBtn').textContent=step===0?'В начало':'Назад'; $('#nextBtn').textContent='Далее'; bind();
  }
  function bind(){
    $('#screen').querySelectorAll('input,textarea').forEach(el=>el.addEventListener(el.type==='checkbox'||el.type==='radio'?'change':'input',e=>{
      const x=e.target; if(x.type==='checkbox'){ const a=new Set(state[x.name]||[]); x.checked?a.add(x.value):a.delete(x.value); state[x.name]=[...a]; } else state[x.name]=x.value; save();
      if(sections[step].f.some(f=>f.show&&f.show[0]===x.name)) render();
    }));
  }
  function valid(){ const s=sections[step]; for(const f of s.f){ if(!f.req||!visible(f)) continue; const v=state[f.n]; if(Array.isArray(v)?!v.length:!String(v||'').trim()) return `Заполните: ${f.l}`; } return ''; }
  function final(){ $('#progressShell').classList.add('is-hidden'); $('#navRow').classList.add('is-hidden'); $('#deviceNote').classList.add('is-hidden'); $('#screen').innerHTML=`<div class="final-message"><div class="final-mark">✦</div><div class="step-kicker">ГОТОВО</div><h2 class="step-title">Спасибо! Бриф заполнен</h2><p class="step-description">Ничего дополнительно отправлять или скачивать не нужно.</p></div>`; }
  $('#backBtn').onclick=()=>step<=0?intro():go(step-1);
  $('#nextBtn').onclick=()=>{ const m=valid(); if(m){$('#validationMessage').textContent=m; return;} go(step+1); };
  $('#brandLink').onclick=e=>{e.preventDefault();intro();};
  (async()=>{ try{ const b64=(await fetch('assets/inky-fox.b64',{cache:'no-store'}).then(r=>r.text())).trim(); heroSrc=`data:image/webp;base64,${b64}`; }catch{} intro(); })();
})();
