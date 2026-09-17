(() => {
  'use strict';

  const STORAGE_KEY = 'inkyFoxBrief:v1';

  const initialData = {
    name: '', telegram: '', projectName: '', projectTypes: [], projectTypeOther: '', projectDescription: '',
    userGoal: '', audience: '', trafficSources: [], trafficOther: '', afterPage: '', funnel: '', hasScenarios: '',
    scenarios: '', mustHave: '', textStatus: '', textOwner: '', designStatus: '', designRefs: '', integrations: [],
    integrationOther: '', launchDate: '', readyDate: '', importantDates: '', projectLifetime: '', futureUpdates: '',
    important: '', avoid: '', extra: ''
  };

  const screens = [
    { id: 'contact', kicker: 'Знакомство', title: 'Для начала — как к вам обращаться?', description: 'Оставьте имя и Telegram, чтобы бриф не потерялся среди проектов.' },
    { id: 'project', kicker: '01 · О проекте', title: 'Что будем собирать?', description: 'Можно выбрать несколько вариантов. Техническую структуру продумывать не нужно — здесь важен общий формат.' },
    { id: 'projectDescription', kicker: '01 · О проекте', title: 'Коротко опишите задачу своими словами', description: 'Что должно получиться в результате? Без технических терминов — как вы объяснили бы задачу человеку.' },
    { id: 'goal', kicker: '02 · Цель', title: 'Что должен сделать пользователь?', description: 'Какое действие будет главным и для кого создаётся проект.' },
    { id: 'funnelA', kicker: '03 · Воронка', title: 'Откуда человек приходит и куда идёт дальше?', description: 'Так станет понятен контекст страницы / MiniApp и её место в воронке.' },
    { id: 'funnelB', kicker: '03 · Воронка', title: 'Есть ли уже понимание сценария целиком?', description: 'Можно описать цепочку в одну строку. Если есть разные ветки — тоже отметьте.' },
    { id: 'inside', kicker: '04 · Внутри', title: 'Что обязательно должно быть реализовано?', description: 'Только то, без чего проект точно не состоится. Если требований нет — структуру и механику я предложу сама.' },
    { id: 'texts', kicker: '05 · Тексты', title: 'Что сейчас с текстами?', description: 'Нужно понять исходную точку и нужна ли помощь с упаковкой.' },
    { id: 'design', kicker: '06 · Дизайн', title: 'Как будем работать с визуалом?', description: 'Если есть фирменный стиль, брендбук или референсы — добавьте ссылки в поле ниже.' },
    { id: 'integrations', kicker: '07 · Интеграции', title: 'С чем нужно связать проект?', description: 'Можно выбрать несколько вариантов. Технические доступы на этом этапе не нужны.' },
    { id: 'dates', kicker: '08 · Сроки', title: 'Когда проект должен выйти?', description: 'Если даты ещё плавают — заполняйте только то, что уже известно.' },
    { id: 'after', kicker: '09 · После запуска', title: 'Это разовый запуск или проект надолго?', description: 'Так я сразу заложу подходящую архитектуру и пойму, нужно ли предусматривать обновления.' },
    { id: 'extra', kicker: '10 · Дополнительно', title: 'Что ещё важно знать до начала работы?', description: 'Последний блок — здесь можно зафиксировать важные пожелания, ограничения и нюансы.' },
    { id: 'review', kicker: 'Проверка', title: 'Готово. Проверим главное перед финалом', description: 'Ниже короткая сводка. Если что-то хочется изменить — вернитесь назад, ответы сохранятся.' }
  ];

  let data = loadData();
  let current = -1;

  const screenEl = document.getElementById('screen');
  const navRow = document.getElementById('navRow');
  const backBtn = document.getElementById('backBtn');
  const nextBtn = document.getElementById('nextBtn');
  const progressShell = document.getElementById('progressShell');
  const progressLabel = document.getElementById('progressLabel');
  const progressPercent = document.getElementById('progressPercent');
  const progressFill = document.getElementById('progressFill');
  const saveNote = document.getElementById('saveNote');
  const topbarStatus = document.getElementById('topbarStatus');

  function loadData() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
      return { ...initialData, ...(saved || {}) };
    } catch {
      return { ...initialData };
    }
  }

  function saveData() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    topbarStatus.textContent = 'Сохранено';
    window.clearTimeout(saveData._t);
    saveData._t = window.setTimeout(() => { topbarStatus.textContent = ''; }, 1200);
  }

  function esc(value = '') {
    return String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#039;');
  }

  function intro() {
    current = -1;
    progressShell.hidden = true;
    navRow.hidden = true;
    saveNote.hidden = true;
    const tpl = document.getElementById('introTemplate');
    screenEl.replaceChildren(tpl.content.cloneNode(true));
    document.getElementById('startBtn').addEventListener('click', () => goTo(0));
  }

  function goTo(index) {
    current = Math.max(0, Math.min(index, screens.length - 1));
    render();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function updateProgress() {
    const pct = Math.round(((current + 1) / screens.length) * 100);
    progressLabel.textContent = `Шаг ${current + 1} из ${screens.length}`;
    progressPercent.textContent = `${pct}%`;
    progressFill.style.width = `${pct}%`;
  }

  function shell(body) {
    const s = screens[current];
    return `<div class="step-screen"><div class="step-kicker">${esc(s.kicker)}</div><h2 class="step-title">${esc(s.title)}</h2><p class="step-description">${esc(s.description)}</p>${body}<div class="validation-message" id="validationMessage" role="alert"></div></div>`;
  }

  function inputField(name, label, value, opts = {}) {
    const type = opts.type || 'text';
    const required = opts.required ? ' required' : '';
    const className = type === 'date' ? 'date-input' : 'text-input';
    return `<div class="field"><label for="${name}" class="${opts.required ? 'required' : ''}">${esc(label)}</label>${opts.hint ? `<span class="field-hint">${esc(opts.hint)}</span>` : ''}<input class="${className}" id="${name}" name="${name}" type="${type}" value="${esc(value)}" placeholder="${esc(opts.placeholder || '')}"${required} autocomplete="${opts.autocomplete || 'off'}" /></div>`;
  }

  function areaField(name, label, value, opts = {}) {
    return `<div class="field"><label for="${name}" class="${opts.required ? 'required' : ''}">${esc(label)}</label>${opts.hint ? `<span class="field-hint">${esc(opts.hint)}</span>` : ''}<textarea class="text-area" id="${name}" name="${name}" placeholder="${esc(opts.placeholder || '')}">${esc(value)}</textarea></div>`;
  }

  function choices(name, items, selected, { multi = false, cols = 2 } = {}) {
    const values = multi ? (Array.isArray(selected) ? selected : []) : [selected];
    return `<div class="choice-grid ${cols === 3 ? 'cols-3' : ''}">${items.map(item => {
      const checked = values.includes(item.value) ? ' checked' : '';
      return `<label class="choice-card ${multi ? '' : 'radio'}"><input type="${multi ? 'checkbox' : 'radio'}" name="${name}" value="${esc(item.value)}"${checked} /><span class="choice-body"><span class="choice-dot"></span><span class="choice-text">${esc(item.label)}</span></span></label>`;
    }).join('')}</div>`;
  }

  function render() {
    progressShell.hidden = false;
    navRow.hidden = false;
    saveNote.hidden = false;
    updateProgress();

    const id = screens[current].id;
    const renderers = {
      contact: renderContact, project: renderProject, projectDescription: renderProjectDescription, goal: renderGoal,
      funnelA: renderFunnelA, funnelB: renderFunnelB, inside: renderInside, texts: renderTexts, design: renderDesign,
      integrations: renderIntegrations, dates: renderDates, after: renderAfter, extra: renderExtra, review: renderReview
    };

    screenEl.innerHTML = shell(renderers[id]());
    nextBtn.textContent = id === 'review' ? 'Сформировать бриф' : 'Далее';
    backBtn.textContent = current === 0 ? 'В начало' : 'Назад';
    bindInputs();
    bindConditionalUi();
  }

  function renderContact() {
    return `<div class="field-stack">${inputField('name', 'Как вас зовут?', data.name, { required: true, placeholder: 'Имя', autocomplete: 'name' })}${inputField('telegram', 'Ваш ник в Telegram', data.telegram, { required: true, placeholder: '@username', hint: 'Можно указать с @ или без него.' })}</div>`;
  }

  function renderProject() {
    const types = [['landing','Посадочная страница'],['registration','Регистрация на мероприятие / вебинар / интенсив'],['club','Страница клуба'],['vote','Голосование'],['quiz','Квиз / тест'],['catalog','Каталог'],['leadmagnet','Лид-магнит'],['sales','Страница продажи'],['interactive','Интерактивная механика'],['other','Другое']].map(([value,label]) => ({value,label}));
    return `<div class="field-stack">${inputField('projectName', 'Название проекта / продукта', data.projectName, { required: true, placeholder: 'Например: новый клуб, интенсив, голосование…' })}<div class="field"><span class="field-label required">Что нужно сделать?</span>${choices('projectTypes', types, data.projectTypes, { multi: true })}<div class="conditional ${data.projectTypes.includes('other') ? 'is-visible' : ''}" id="projectTypeOtherWrap">${inputField('projectTypeOther', 'Уточните, что именно', data.projectTypeOther, { placeholder: 'Ваш вариант' })}</div></div></div>`;
  }

  function renderProjectDescription() {
    return `<div class="field-stack">${areaField('projectDescription', 'Что должно получиться в результате?', data.projectDescription, { required: true, placeholder: 'Опишите задачу в свободной форме…', hint: 'Например: нужна страница регистрации на офлайн-мероприятие, после регистрации человек должен попасть в Telegram-бот.' })}</div>`;
  }

  function renderGoal() {
    return `<div class="field-stack">${areaField('userGoal', 'Что в итоге должен сделать пользователь?', data.userGoal, { required: true, placeholder: 'Зарегистрироваться, оставить заявку, купить, проголосовать, пройти тест…' })}${areaField('audience', 'Кто основная аудитория проекта?', data.audience, { required: true, placeholder: 'Кто эти люди, для кого собираем страницу / MiniApp?' })}</div>`;
  }

  function renderFunnelA() {
    const traffic = [['tgChannel','Telegram-канал'],['bot','Telegram-бот'],['ads','Реклама'],['mail','Рассылка'],['getcourse','GetCourse'],['social','Соцсети'],['qr','QR-код'],['site','Сайт'],['other','Другое']].map(([value,label]) => ({value,label}));
    return `<div class="field-stack"><div class="field"><span class="field-label required">Откуда пользователь попадает на страницу / в MiniApp?</span>${choices('trafficSources', traffic, data.trafficSources, { multi: true, cols: 3 })}<div class="conditional ${data.trafficSources.includes('other') ? 'is-visible' : ''}" id="trafficOtherWrap">${inputField('trafficOther', 'Уточните источник', data.trafficOther, { placeholder: 'Ваш вариант' })}</div></div>${areaField('afterPage', 'Что происходит после страницы / MiniApp? Куда пользователь должен попасть дальше?', data.afterPage, { required: true, placeholder: 'Например: после регистрации — в Telegram-бот, после оплаты — в закрытый клуб…' })}</div>`;
  }

  function renderFunnelB() {
    const yn = [{value:'no',label:'Нет, пока без разных сценариев'},{value:'yes',label:'Да, есть разные сценарии'}];
    return `<div class="field-stack">${areaField('funnel', 'Если уже есть понимание воронки — опишите её целиком', data.funnel, { placeholder: 'Например: реклама → бот → MiniApp → регистрация → сообщения → мероприятие', hint: 'Поле можно оставить пустым, если воронка пока не собрана.' })}<div class="field"><span class="field-label">Есть ли разные сценарии для пользователей?</span><span class="field-hint">Например: зарегистрировался / нет, купил / нет, разные результаты теста.</span>${choices('hasScenarios', yn, data.hasScenarios)}</div><div class="conditional ${data.hasScenarios === 'yes' ? 'is-visible' : ''}" id="scenariosWrap">${areaField('scenarios', 'Коротко опишите сценарии', data.scenarios, { placeholder: 'Какие ветки уже известны?' })}</div></div>`;
  }

  function renderInside() {
    return `<div class="field-stack">${areaField('mustHave', 'Есть ли что-то, что обязательно должно быть реализовано?', data.mustHave, { placeholder: 'Например: форма регистрации, голосование, тест, личный кабинет, каталог, видео, расписание, закрытый контент…', hint: 'Если обязательных требований нет — можно так и написать. Структуру и механику я предложу сама.' })}</div>`;
  }

  function renderTexts() {
    const status = [['ready','Тексты полностью готовы'],['adapt','Тексты есть, но их нужно адаптировать'],['materials','Есть материалы, из которых нужно собрать тексты'],['scratch','Тексты нужно подготовить с нуля']].map(([value,label]) => ({value,label}));
    const owner = [{value:'client',label:'Тексты делает специалист со стороны проекта'},{value:'help',label:'Нужна ваша помощь с текстами'}];
    return `<div class="field-stack"><div class="field"><span class="field-label required">Как обстоят дела с текстами?</span>${choices('textStatus', status, data.textStatus)}</div><div class="field"><span class="field-label required">Кто будет заниматься текстами?</span>${choices('textOwner', owner, data.textOwner)}</div></div>`;
  }

  function renderDesign() {
    const design = [['ready','Есть готовый дизайн'],['designer','Есть дизайнер, который подготовит макеты'],['needDesigner','Нужен ваш дизайнер'],['adapt','Есть стиль проекта — нужно адаптировать'],['none','Визуального стиля пока нет']].map(([value,label]) => ({value,label}));
    return `<div class="field-stack"><div class="field"><span class="field-label required">Как будем работать с дизайном?</span>${choices('designStatus', design, data.designStatus)}</div>${areaField('designRefs', 'Есть фирменный стиль, брендбук или примеры, на которые хочется ориентироваться?', data.designRefs, { placeholder: 'Вставьте ссылки или напишите, что уже есть', hint: 'Можно одной ссылкой на папку / Figma / существующий сайт.' })}</div>`;
  }

  function renderIntegrations() {
    const integrations = [['getcourse','GetCourse'],['amo','AMO CRM'],['bitrix','Битрикс24'],['payment','Платёжная система'],['other','Другое'],['unknown','Пока не знаю'],['none','Не нужны']].map(([value,label]) => ({value,label}));
    return `<div class="field-stack"><div class="field"><span class="field-label">Нужны ли интеграции с внешними сервисами?</span>${choices('integrations', integrations, data.integrations, { multi: true })}<div class="conditional ${data.integrations.includes('other') ? 'is-visible' : ''}" id="integrationOtherWrap">${inputField('integrationOther', 'Какие ещё?', data.integrationOther, { placeholder: 'Название сервиса / системы' })}</div></div></div>`;
  }

  function renderDates() {
    return `<div class="field-stack"><div class="inline-fields">${inputField('launchDate', 'Когда планируется запуск проекта / мероприятия?', data.launchDate, { type: 'date' })}${inputField('readyDate', 'К какой дате проект должен быть готов?', data.readyDate, { type: 'date' })}</div>${areaField('importantDates', 'Есть ли важные даты внутри проекта?', data.importantDates, { placeholder: 'Начало рекламы, открытие регистрации, эфир, мероприятие, закрытие регистрации…' })}</div>`;
  }

  function renderAfter() {
    const lifetime = [['one','Под один конкретный запуск'],['permanent','Для постоянного использования'],['repeat','Будем использовать повторно и обновлять'],['unknown','Пока не определено']].map(([value,label]) => ({value,label}));
    return `<div class="field-stack"><div class="field"><span class="field-label required">Проект создаётся…</span>${choices('projectLifetime', lifetime, data.projectLifetime)}</div>${areaField('futureUpdates', 'Планируются ли дальнейшие изменения или обновления?', data.futureUpdates, { placeholder: 'Если да — какие примерно? Новые события, эксперты, тарифы, контент, голосования…' })}</div>`;
  }

  function renderExtra() {
    return `<div class="field-stack">${areaField('important', 'Что для вас особенно важно в этом проекте?', data.important, { placeholder: 'Что обязательно нужно учесть?' })}${areaField('avoid', 'Есть ли что-то, что точно не хочется видеть или использовать?', data.avoid, { placeholder: 'Что вам не подходит по механике, стилю, подаче?' })}${areaField('extra', 'Есть ли ещё что-то важное, что мне стоит знать?', data.extra, { placeholder: 'Любые дополнительные детали' })}</div>`;
  }

  function renderReview() {
    const labels = projectLabels();
    return `<div class="summary-list">${summaryItem('Контакт', `${data.name || '—'} · ${normalizeTelegram(data.telegram) || '—'}`)}${summaryItem('Проект', `${data.projectName || '—'}\n${labels.join(', ') || 'Тип не выбран'}`)}${summaryItem('Задача', data.projectDescription || '—')}${summaryItem('Цель', data.userGoal || '—')}${summaryItem('Аудитория', data.audience || '—')}${summaryItem('Запуск', [formatDate(data.launchDate), formatDate(data.readyDate)].filter(Boolean).join(' · ') || 'Даты не указаны')}</div>`;
  }

  function summaryItem(title, value) {
    return `<div class="summary-item"><strong>${esc(title)}</strong><p>${esc(value)}</p></div>`;
  }

  function bindInputs() {
    screenEl.querySelectorAll('input[type="text"], input[type="date"], textarea').forEach(el => {
      el.addEventListener('input', () => { data[el.name] = el.value; saveData(); });
    });

    screenEl.querySelectorAll('input[type="radio"]').forEach(el => {
      el.addEventListener('change', () => { data[el.name] = el.value; saveData(); bindConditionalUi(true); });
    });

    screenEl.querySelectorAll('input[type="checkbox"]').forEach(el => {
      el.addEventListener('change', () => {
        let arr = Array.isArray(data[el.name]) ? [...data[el.name]] : [];
        if (el.name === 'integrations' && ['none', 'unknown'].includes(el.value) && el.checked) {
          arr = [el.value];
          screenEl.querySelectorAll('input[name="integrations"]').forEach(box => { box.checked = box.value === el.value; });
        } else {
          if (el.name === 'integrations' && el.checked) {
            arr = arr.filter(v => !['none', 'unknown'].includes(v));
            screenEl.querySelectorAll('input[name="integrations"]').forEach(box => { if (['none', 'unknown'].includes(box.value)) box.checked = false; });
          }
          arr = el.checked ? [...new Set([...arr, el.value])] : arr.filter(v => v !== el.value);
        }
        data[el.name] = arr;
        saveData();
        bindConditionalUi(true);
      });
    });
  }

  function bindConditionalUi() {
    const toggles = [['projectTypeOtherWrap', data.projectTypes.includes('other')],['trafficOtherWrap', data.trafficSources.includes('other')],['scenariosWrap', data.hasScenarios === 'yes'],['integrationOtherWrap', data.integrations.includes('other')]];
    toggles.forEach(([id, show]) => { const el = document.getElementById(id); if (el) el.classList.toggle('is-visible', show); });
  }

  function validateCurrent() {
    const id = screens[current].id;
    const required = {
      contact: [Boolean(data.name.trim()), Boolean(data.telegram.trim())],
      project: [Boolean(data.projectName.trim()), data.projectTypes.length > 0],
      projectDescription: [Boolean(data.projectDescription.trim())],
      goal: [Boolean(data.userGoal.trim()), Boolean(data.audience.trim())],
      funnelA: [data.trafficSources.length > 0, Boolean(data.afterPage.trim())],
      funnelB: [true], inside: [true], texts: [Boolean(data.textStatus), Boolean(data.textOwner)],
      design: [Boolean(data.designStatus)], integrations: [true], dates: [true], after: [Boolean(data.projectLifetime)], extra: [true], review: [true]
    };

    if ((required[id] || []).every(Boolean)) return true;
    const msg = document.getElementById('validationMessage');
    if (msg) msg.textContent = 'Заполните обязательные поля, чтобы продолжить.';
    return false;
  }

  function projectLabels() {
    const map = { landing:'Посадочная страница', registration:'Регистрация', club:'Страница клуба', vote:'Голосование', quiz:'Квиз / тест', catalog:'Каталог', leadmagnet:'Лид-магнит', sales:'Страница продажи', interactive:'Интерактивная механика', other:data.projectTypeOther || 'Другое' };
    return data.projectTypes.map(v => map[v]).filter(Boolean);
  }

  function trafficLabels() {
    const map = { tgChannel:'Telegram-канал', bot:'Telegram-бот', ads:'Реклама', mail:'Рассылка', getcourse:'GetCourse', social:'Соцсети', qr:'QR-код', site:'Сайт', other:data.trafficOther || 'Другое' };
    return data.trafficSources.map(v => map[v]).filter(Boolean);
  }

  function integrationLabels() {
    const map = { getcourse:'GetCourse', amo:'AMO CRM', bitrix:'Битрикс24', payment:'Платёжная система', other:data.integrationOther || 'Другое', unknown:'Пока не знаю', none:'Не нужны' };
    return data.integrations.map(v => map[v]).filter(Boolean);
  }

  function choiceLabel(value, map) { return map[value] || ''; }
  function normalizeTelegram(value = '') { const v = value.trim(); return v ? (v.startsWith('@') ? v : `@${v}`) : ''; }
  function formatDate(value) { if (!value) return ''; const [y,m,d] = value.split('-'); return `${d}.${m}.${y}`; }

  function buildBrief() {
    const textStatusMap = { ready:'Тексты полностью готовы', adapt:'Тексты есть, но их нужно адаптировать', materials:'Есть материалы, из которых нужно собрать тексты', scratch:'Тексты нужно подготовить с нуля' };
    const textOwnerMap = { client:'Тексты делает специалист со стороны проекта', help:'Нужна помощь с текстами' };
    const designMap = { ready:'Есть готовый дизайн', designer:'Есть дизайнер, который подготовит макеты', needDesigner:'Нужен ваш дизайнер', adapt:'Есть существующий стиль — нужна адаптация', none:'Визуального стиля пока нет' };
    const lifetimeMap = { one:'Под один конкретный запуск', permanent:'Для постоянного использования', repeat:'Планируется повторное использование и обновления', unknown:'Пока не определено' };

    const sections = [
      ['КОНТАКТ', `Имя: ${data.name || '—'}\nTelegram: ${normalizeTelegram(data.telegram) || '—'}`],
      ['1. О ПРОЕКТЕ', `Название: ${data.projectName || '—'}\nЧто нужно сделать: ${projectLabels().join(', ') || '—'}\n\nОписание задачи:\n${data.projectDescription || '—'}`],
      ['2. ЦЕЛЬ', `Что должен сделать пользователь:\n${data.userGoal || '—'}\n\nАудитория:\n${data.audience || '—'}`],
      ['3. ВОРОНКА', `Откуда приходит пользователь: ${trafficLabels().join(', ') || '—'}\n\nЧто происходит дальше:\n${data.afterPage || '—'}\n\nВоронка целиком:\n${data.funnel || '—'}\n\nРазные сценарии: ${data.hasScenarios === 'yes' ? 'Да' : data.hasScenarios === 'no' ? 'Нет' : 'Не указано'}${data.scenarios ? `\n${data.scenarios}` : ''}`],
      ['4. ЧТО ДОЛЖНО БЫТЬ ВНУТРИ', data.mustHave || 'Обязательные требования не указаны'],
      ['5. ТЕКСТЫ', `${choiceLabel(data.textStatus, textStatusMap) || '—'}\n${choiceLabel(data.textOwner, textOwnerMap) || '—'}`],
      ['6. ДИЗАЙН', `${choiceLabel(data.designStatus, designMap) || '—'}\n\nСтиль / брендбук / примеры:\n${data.designRefs || '—'}`],
      ['7. ИНТЕГРАЦИИ', integrationLabels().join(', ') || '—'],
      ['8. СРОКИ', `Запуск проекта / мероприятия: ${formatDate(data.launchDate) || '—'}\nГотовность страницы / MiniApp: ${formatDate(data.readyDate) || '—'}\n\nВажные даты:\n${data.importantDates || '—'}`],
      ['9. ПОСЛЕ ЗАПУСКА', `${choiceLabel(data.projectLifetime, lifetimeMap) || '—'}\n\nПланируемые изменения:\n${data.futureUpdates || '—'}`],
      ['10. ДОПОЛНИТЕЛЬНО', `Особенно важно:\n${data.important || '—'}\n\nЧто точно не хочется:\n${data.avoid || '—'}\n\nДополнительно:\n${data.extra || '—'}`]
    ];

    return `БРИФ НА РАЗРАБОТКУ MINIAPP / ВЕБ-СТРАНИЦЫ\n\n${sections.map(([title, body]) => `${title}\n${body}`).join('\n\n────────────────────\n\n')}`;
  }

  function finish() {
    const brief = buildBrief();
    progressShell.hidden = true;
    navRow.hidden = true;
    saveNote.hidden = true;
    screenEl.innerHTML = `<div class="final-screen"><div class="final-icon">✦</div><h2>Бриф собран</h2><p>Ответы сохранены на этом устройстве. Можно скопировать готовый бриф, скачать его файлом или поделиться через системное меню телефона.</p><div class="final-actions"><button class="btn btn-primary" id="copyBtn" type="button">Скопировать</button><button class="btn btn-ghost" id="shareBtn" type="button">Поделиться</button><button class="btn btn-ghost" id="downloadBtn" type="button">Скачать .txt</button></div><button class="final-secondary" id="editBtn" type="button">Вернуться к ответам</button></div>`;

    document.getElementById('copyBtn').addEventListener('click', async (e) => {
      try { await navigator.clipboard.writeText(brief); e.currentTarget.textContent = 'Скопировано'; }
      catch { fallbackCopy(brief); e.currentTarget.textContent = 'Скопировано'; }
    });

    const shareBtn = document.getElementById('shareBtn');
    if (!navigator.share) shareBtn.style.display = 'none';
    shareBtn.addEventListener('click', async () => { try { await navigator.share({ title: `Бриф — ${data.projectName || 'проект'}`, text: brief }); } catch (_) {} });

    document.getElementById('downloadBtn').addEventListener('click', () => {
      const blob = new Blob([brief], { type: 'text/plain;charset=utf-8' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `brief-${slug(data.projectName || data.name || 'project')}.txt`;
      a.click();
      URL.revokeObjectURL(a.href);
    });

    document.getElementById('editBtn').addEventListener('click', () => goTo(screens.length - 1));
  }

  function fallbackCopy(text) {
    const area = document.createElement('textarea'); area.value = text; area.style.position = 'fixed'; area.style.opacity = '0'; document.body.appendChild(area); area.select(); document.execCommand('copy'); area.remove();
  }

  function slug(value) { return value.toLowerCase().trim().replace(/[^a-zа-яё0-9]+/gi, '-').replace(/^-|-$/g, '') || 'project'; }

  backBtn.addEventListener('click', () => { if (current === 0) intro(); else goTo(current - 1); });
  nextBtn.addEventListener('click', () => { if (!validateCurrent()) return; saveData(); if (screens[current].id === 'review') finish(); else goTo(current + 1); });

  intro();
})();
