/* Workspace 首页交互预览。所有记录均为示例，仅保存在当前页面内存中。 */
(() => {
  'use strict';

  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => [...document.querySelectorAll(selector)];
  const escapeHTML = (value = '') => String(value).replace(/[&<>"']/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[character]));
  const sampleTasks = [
    {
      id: 'sample-poster-autumn', title: '秋季新品推广海报', kind: 'poster',
      status: 'review', updated: '今天 10:24', action: '查看初稿',
      need: '请核对主标题、活动时间与优惠信息。',
      request: '根据新品介绍，整理一张适合公众号发布的推广海报初稿。',
      artifact: '标题：秋日上新，遇见新灵感\n副标题：新品系列 · 限时体验\n版式建议：产品图居中，下方预留活动时间与报名入口。\n这是排版与文案示例，未生成图片文件。',
      supplements: [], attachments: [],
    },
    {
      id: 'sample-video-brand', title: '品牌宣传短片', kind: 'video',
      status: 'needs-input', updated: '今天 09:40', action: '补充资料',
      need: '还需要品牌介绍、目标观众和计划投放渠道。',
      request: '制作一支 60 秒品牌宣传短片，用于介绍公司的产品与服务。',
      artifact: '', supplements: [], attachments: [],
    },
    {
      id: 'sample-report-weekly', title: '市场部本周工作汇报', kind: 'report',
      status: 'running', updated: '今天 09:18', action: '查看进展',
      need: '示例中正在整理工作记录，尚无可查看的汇报成果。',
      request: '整理本周市场部工作，按已完成、进行中和待协调事项汇总。',
      artifact: '', supplements: [], attachments: [],
    },
    {
      id: 'sample-poster-october', title: '十月活动报名海报', kind: 'poster',
      status: 'done', updated: '昨天 16:32', action: '查看成果',
      need: '示例中已完成内容确认，可在原工作中继续补充修改意见。',
      request: '为十月线下分享活动整理一张报名海报。',
      artifact: '标题：十月，一起聊聊新的可能\n内容：线下分享 · 经验交流 · 现场提问\n信息区：时间、地点与报名方式。\n这是已确认内容的文字示例，未生成图片文件。',
      supplements: [], attachments: [],
    },
    {
      id: 'sample-video-script', title: '新品短片脚本', kind: 'video',
      status: 'ready', updated: '昨天 14:06', action: '查看成果',
      need: '示例脚本可查看，尚未得到用户确认。',
      request: '根据新品卖点整理 30 秒短片脚本，包含画面建议与旁白。',
      artifact: '0—5 秒：展示产品使用场景，提出一个常见问题。\n5—20 秒：通过两个镜头说明主要功能。\n20—30 秒：展示产品细节，补充品牌与行动提示。\n这是脚本文字示例，未生成视频文件。',
      supplements: [], attachments: [],
    },
  ];
  const statusLabels = {
    review: '待确认初稿', 'needs-input': '待补充资料', running: '正在整理',
    done: '已确认', ready: '待查看成果',
  };
  const kindLabels = { poster: '海报', video: '视频', report: '汇报', custom: '工作' };
  const kindIcons = { poster: 'image', video: 'video', report: 'file', custom: 'file' };
  const icon = (name, extraClass = '') => `<svg class="icon ${extraClass}" aria-hidden="true"><use href="#i-${name}"></use></svg>`;
  const scenePrompts = {
    video: '请根据品牌资料，整理一支宣传视频的方案。请先确认视频时长、目标观众和投放渠道。',
    report: '请根据我提供的工作记录，整理本周工作汇报，包含已完成事项、进展和待协调问题。',
    poster: '请根据活动资料，制作一张报名海报。请先确认主题、时间、地点和报名方式。',
  };
  const expectedOutputs = {
    poster: '海报内容与版式初稿；本预览仅展示文字示意。',
    video: '宣传视频方案或脚本，具体交付范围需在开始前确认。',
    report: '依据提供记录整理的汇报初稿；需要用户核对事实。',
    custom: '先确认工作要求和预期成果，再开始处理。',
  };
  const cloneSamples = () => sampleTasks.map((task) => ({ ...task, supplements: [], attachments: [] }));
  const state = { tasks: cloneSamples(), mode: 'populated', activeId: null, scene: 'custom', attachments: [], sequence: 0, allRecords: false, view: 'home' };
  let toastTimer;
  let settingsReturnFocus = null;

  function toast(message) {
    const node = $('#toast');
    if (!node) return;
    clearTimeout(toastTimer);
    node.textContent = message;
    node.hidden = false;
    node.classList.add('is-visible');
    toastTimer = setTimeout(() => {
      node.classList.remove('is-visible');
      node.hidden = true;
    }, 3800);
  }

  function updateInput() {
    const input = $('#request-input');
    const button = $('#start-button');
    if (button && input) button.disabled = !input.value.trim();
  }

  function appendPrompt(prompt, kind = 'custom') {
    const input = $('#request-input');
    if (!input || !prompt) return false;
    showHome(false);
    const existing = input.value.trim();
    if (!existing.includes(prompt)) {
      const nextValue = existing ? `${existing}\n${prompt}` : prompt;
      if (input.maxLength >= 0 && nextValue.length > input.maxLength) {
        toast('输入空间不足，请先精简部分内容。原有要求已保留。');
        input.focus();
        return false;
      }
      input.value = nextValue;
    }
    state.scene = kind;
    $$('[data-scene]').forEach((button) => {
      const active = button.dataset.scene === kind;
      button.setAttribute('aria-pressed', String(active));
      button.classList.toggle('is-selected', active);
    });
    updateInput();
    input.focus();
    input.setSelectionRange(input.value.length, input.value.length);
    return true;
  }

  function renderAttachments() {
    const node = $('#attachment-list');
    if (!node) return;
    node.innerHTML = state.attachments.map((file, index) => `
      <span class="attachment-chip">
        <span class="attachment-name" title="${escapeHTML(file.name)}">${escapeHTML(file.name)}</span>
        <button type="button" class="attachment-remove" data-remove-file="${index}" aria-label="移除 ${escapeHTML(file.name)}">移除</button>
      </span>`).join('');
    node.hidden = state.attachments.length === 0;
  }

  function isPending(task) {
    return task.status === 'review' || task.status === 'needs-input';
  }

  function taskRow(task) {
    return `<article class="task-row" data-task-row="${escapeHTML(task.id)}">
      <span class="task-icon kind-${escapeHTML(task.kind)}" aria-hidden="true">${icon(kindIcons[task.kind] || 'file')}</span>
      <div class="task-copy">
        <button type="button" class="task-title" data-open-task="${escapeHTML(task.id)}">${escapeHTML(task.title)}</button>
        <div class="task-meta">${isPending(task) ? `<span>${escapeHTML(task.need)}</span>` : `<span>${escapeHTML(kindLabels[task.kind] || '工作')}</span><span aria-hidden="true">·</span><span>${escapeHTML(task.updated)}</span>`}</div>
      </div>
      <span class="task-status status-${escapeHTML(task.status)}"><i aria-hidden="true"></i>${escapeHTML(statusLabels[task.status])}</span>
      <button type="button" class="task-action" data-open-task="${escapeHTML(task.id)}" aria-label="${escapeHTML(task.action)}：${escapeHTML(task.title)}">${escapeHTML(task.action)}${icon('arrow')}</button>
    </article>`;
  }

  function renderSidebar() {
    const node = $('#sidebar-recent');
    if (!node) return;
    node.innerHTML = state.mode === 'populated' ? state.tasks.slice(0, 3).map((task) => `
      <button type="button" class="sidebar-record${task.id === state.activeId ? ' is-active' : ''}" data-open-task="${escapeHTML(task.id)}" title="${escapeHTML(task.title)}">
        <span class="sidebar-record-dot status-${escapeHTML(task.status)}" aria-hidden="true"></span><span>${escapeHTML(task.title)}</span>
      </button>`).join('') : '<p class="sidebar-empty">开始工作后，记录会留在这里</p>';
  }

  function renderRecords() {
    const visibleTasks = state.mode === 'populated' ? state.tasks : [];
    const query = ($('#records-search')?.value || '').trim().toLocaleLowerCase();
    const filter = $('#records-filter')?.value || 'all';
    const recent = visibleTasks.filter((task) => {
      const matchesSearch = `${task.title} ${kindLabels[task.kind]} ${statusLabels[task.status]}`.toLocaleLowerCase().includes(query);
      return matchesSearch && (filter === 'all' || (filter === 'done' ? task.status === 'done' : task.status !== 'done'));
    });
    if ($('#recent-list')) $('#recent-list').innerHTML = recent.map(taskRow).join('');
    if ($('#recent-section')) $('#recent-section').hidden = false;
    if ($('#recent-title')) $('#recent-title').textContent = '工作记录';
    if ($('#record-loading')) $('#record-loading').hidden = state.mode !== 'loading';
    if ($('#record-error')) $('#record-error').hidden = state.mode !== 'error';
    if ($('#recent-list')) $('#recent-list').hidden = state.mode === 'loading' || state.mode === 'error';
    const empty = $('#record-empty');
    if (empty) {
      empty.hidden = ['loading', 'error'].includes(state.mode) || recent.length > 0;
      if (!empty.hidden) {
        const hasSearch = Boolean(query || filter !== 'all');
        empty.innerHTML = hasSearch
          ? `<span class="empty-icon" aria-hidden="true">${icon('file')}</span><h3>没有找到相关工作</h3><p>换个关键词，或选择全部状态。</p>`
          : `<span class="empty-icon" aria-hidden="true">${icon('arrow')}</span><h3>从第一件工作开始</h3><p>点击“开始新工作”描述要求，后续记录会留在这里。</p>`;
      }
    }
    renderSidebar();
  }

  function setNavigation(name) {
    [['#new-work-button', 'home'], ['#nav-records', 'records'], ['#nav-catalogue', 'catalogue'], ['#nav-learn', 'learn']].forEach(([selector, key]) => {
      const node = $(selector);
      if (!node) return;
      node.classList.toggle('is-active', key === name);
      if (key === name) node.setAttribute('aria-current', 'page');
      else node.removeAttribute('aria-current');
    });
    const labels = { home: '开始新工作', records: '工作记录', catalogue: '场景集市', learn: '学习中心' };
    if ($('#page-location-text')) $('#page-location-text').textContent = labels[name] || '开始新工作';
  }

  function notifyView(name) {
    state.view = name;
    if ($('#learn-view')) $('#learn-view').hidden = name !== 'learn';
    document.body.dataset.view = name;
    document.dispatchEvent(new CustomEvent('workspace:view', { detail: { name } }));
  }

  function showCatalogue() {
    state.activeId = null;
    $('#home-view').hidden = true;
    if ($('#records-view')) $('#records-view').hidden = true;
    $('#detail-view').hidden = true;
    $('#catalogue-view').hidden = false;
    setNavigation('catalogue');
    renderSidebar();
    closeMenu();
    notifyView('catalogue');
    $('#catalogue-title')?.focus({ preventScroll: true });
    $('#catalogue-view')?.scrollIntoView({ behavior: 'instant', block: 'start' });
  }

  function showHome(focusInput = false) {
    state.activeId = null;
    state.allRecords = false;
    if ($('#home-view')) $('#home-view').hidden = false;
    if ($('#records-view')) $('#records-view').hidden = true;
    if ($('#detail-view')) $('#detail-view').hidden = true;
    if ($('#catalogue-view')) $('#catalogue-view').hidden = true;
    setNavigation('home');
    renderRecords();
    closeMenu();
    notifyView('home');
    if (focusInput) $('#request-input')?.focus();
  }

  function showLearn() {
    state.activeId = null;
    ['#home-view', '#records-view', '#detail-view', '#catalogue-view'].forEach((selector) => {
      if ($(selector)) $(selector).hidden = true;
    });
    setNavigation('learn');
    renderSidebar();
    closeMenu();
    notifyView('learn');
    $('#learn-title')?.focus({ preventScroll: true });
    $('#learn-view')?.scrollIntoView({ behavior: 'instant', block: 'start' });
  }

  function detailSteps(task) {
    if (task.status === 'needs-input') return [
      ['已记录要求', '示例工作已建立，可在下方继续补充资料与说明。'],
      ['等待补充', task.need],
    ];
    if (task.status === 'running') return [
      ['已记录要求', '已明确本周工作汇报的整理范围。'],
      ['正在整理', '此处演示执行中的状态，没有连接真实处理服务。'],
    ];
    return [
      ['已记录要求', task.request],
      ['文字成果示意', '可查看下方的示例内容，真实成果由接入后的执行记录提供。'],
      [task.status === 'done' ? '示例中已确认' : '等待查看或确认', task.need],
    ];
  }

  function renderDetail(task) {
    const node = $('#detail-view');
    if (!node) return;
    const attachments = task.attachments.length
      ? `<div class="detail-attachments"><span class="detail-label">选择的资料</span><p class="detail-body">${task.attachments.map(escapeHTML).join('、')}</p><p class="detail-footnote">仅保留文件名，没有读取或上传文件内容。</p></div>`
      : '';
    node.innerHTML = `<div class="detail-header">
      <button type="button" class="detail-back" data-detail-back>${icon('arrow', 'icon-back')}返回</button>
      <div class="detail-title-row"><h1 class="detail-title" tabindex="-1">${escapeHTML(task.title)}</h1><span class="task-status detail-status status-${escapeHTML(task.status)}"><i aria-hidden="true"></i>${escapeHTML(statusLabels[task.status])}</span></div>
      <p class="detail-meta">${escapeHTML(kindLabels[task.kind] || '工作')} · 示例记录</p>
      <p class="detail-footnote">这是首页交互预览。状态、过程和成果均为示意，未连接真实执行服务。</p>
    </div>
    <div class="detail-grid">
      <section class="detail-panel"><h2>工作要求</h2><p class="detail-body">${escapeHTML(task.request)}</p><span class="detail-label">预期交付</span><p class="detail-body">${escapeHTML(expectedOutputs[task.kind] || expectedOutputs.custom)}</p>${attachments}</section>
      <section class="detail-panel"><h2>处理进展 <span class="detail-label">示例</span></h2><ol class="detail-timeline">${detailSteps(task).map(([title, description], index) => `<li class="detail-step"><span class="detail-step-mark" aria-hidden="true">${index + 1}</span><div class="detail-step-copy"><h3>${escapeHTML(title)}</h3><p>${escapeHTML(description)}</p></div></li>`).join('')}</ol></section>
    </div>
    ${task.artifact ? `<section class="detail-panel detail-artifact"><h2>成果文字预览 <span class="detail-label">示例</span></h2><p class="detail-body">${escapeHTML(task.artifact)}</p></section>` : ''}
    <section class="detail-panel detail-compose"><h2>${task.status === 'needs-input' ? '补充资料说明' : '继续补充要求'}</h2><p class="detail-footnote">文字会保留在这条示例工作中，刷新页面后清空。</p>
      <div class="detail-supplements">${task.supplements.map((text) => `<div class="detail-supplement"><span class="detail-label">你补充的说明 · 预览</span><p class="detail-body">${escapeHTML(text)}</p></div>`).join('')}</div>
      <form id="detail-supplement-form"><label class="sr-only" for="detail-supplement-input">补充工作说明</label><textarea id="detail-supplement-input" rows="3" maxlength="5000" placeholder="补充活动时间、资料说明，或写下想修改的地方……" required></textarea><div class="detail-compose-footer"><span class="detail-footnote">仅保存在当前预览中</span><button type="submit" id="detail-supplement-button" class="primary-button" disabled>保存补充说明</button></div></form>
    </section>`;
    const form = $('#detail-supplement-form');
    const input = $('#detail-supplement-input');
    const button = $('#detail-supplement-button');
    input.value = task.draft || '';
    button.disabled = !input.value.trim();
    input.addEventListener('input', () => {
      task.draft = input.value;
      button.disabled = !input.value.trim();
    });
    form?.addEventListener('submit', (event) => {
      event.preventDefault();
      const text = input.value.trim();
      if (!text) return;
      button.disabled = true;
      task.supplements.push(text);
      task.draft = '';
      task.updated = '刚刚';
      renderDetail(task);
      $('#detail-supplement-input')?.focus();
      toast('说明已保存在这条示例工作中。');
    });
  }

  function openTask(id) {
    const task = state.tasks.find((item) => item.id === id);
    if (!task) return;
    state.activeId = id;
    closeMenu();
    if ($('#home-view')) $('#home-view').hidden = true;
    if ($('#records-view')) $('#records-view').hidden = true;
    if ($('#detail-view')) $('#detail-view').hidden = false;
    if ($('#catalogue-view')) $('#catalogue-view').hidden = true;
    setNavigation('home');
    if ($('#page-location-text')) $('#page-location-text').textContent = '工作详情';
    notifyView('detail');
    renderDetail(task);
    renderSidebar();
    $('#detail-view .detail-title')?.focus({ preventScroll: true });
    $('#detail-view')?.scrollIntoView({ behavior: 'instant', block: 'start' });
  }

  function setMode(mode) {
    const previousView = state.view;
    state.mode = ['populated', 'new', 'loading', 'error'].includes(mode) ? mode : 'populated';
    if ($('#preview-state')) $('#preview-state').value = state.mode;
    if ($('#records-search')) $('#records-search').value = '';
    if ($('#records-filter')) $('#records-filter').value = 'all';
    document.body.dataset.previewState = state.mode;
    document.dispatchEvent(new CustomEvent('workspace:preview-state', { detail: { mode: state.mode } }));
    if (previousView === 'catalogue') showCatalogue();
    else if (previousView === 'learn') showLearn();
    else if (previousView === 'records') focusRecords();
    else showHome(false);
  }

  function closeMenu() {
    $('#sidebar')?.classList.remove('is-open');
    $('#nav-backdrop')?.classList.remove('is-visible');
    if ($('#nav-backdrop')) $('#nav-backdrop').hidden = true;
    $('#menu-button')?.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('menu-open');
  }

  function toggleMenu() {
    const expanded = $('#menu-button')?.getAttribute('aria-expanded') === 'true';
    if (expanded) { closeMenu(); return; }
    $('#sidebar')?.classList.add('is-open');
    if ($('#nav-backdrop')) $('#nav-backdrop').hidden = false;
    $('#nav-backdrop')?.classList.add('is-visible');
    $('#menu-button')?.setAttribute('aria-expanded', 'true');
    document.body.classList.add('menu-open');
  }

  function closeSettings(restoreFocus = false) {
    if ($('#preview-settings')) $('#preview-settings').hidden = true;
    $('#settings-button')?.setAttribute('aria-expanded', 'false');
    if (restoreFocus) settingsReturnFocus?.focus();
  }

  $('#request-input')?.addEventListener('input', updateInput);
  $('#request-input')?.addEventListener('keydown', (event) => {
    if (event.key !== 'Enter' || (!event.metaKey && !event.ctrlKey) || event.isComposing || event.keyCode === 229) return;
    event.preventDefault();
    if ($('#request-input')?.value.trim()) $('#request-form')?.requestSubmit();
  });
  $('#request-form')?.addEventListener('submit', (event) => {
    event.preventDefault();
    const input = $('#request-input');
    const request = input?.value.trim();
    if (!request) return;
    $('#start-button').disabled = true;
    state.mode = 'populated';
    document.body.dataset.previewState = 'populated';
    document.dispatchEvent(new CustomEvent('workspace:preview-state', { detail: { mode: state.mode } }));
    if ($('#preview-state')) $('#preview-state').value = 'populated';
    const task = {
      id: `preview-${Date.now()}-${++state.sequence}`,
      title: request.split('\n')[0].slice(0, 40), kind: state.scene,
      status: 'needs-input', updated: '刚刚', action: '继续说明',
      need: '请在下方补充预期成果、用途与完成时间。此记录仅用于演示原工作续办。',
      request, artifact: '', supplements: [], attachments: state.attachments.map((file) => file.name),
    };
    state.tasks.unshift(task);
    input.value = '';
    state.attachments = [];
    state.scene = 'custom';
    $$('[data-scene]').forEach((button) => { button.setAttribute('aria-pressed', 'false'); button.classList.remove('is-selected'); });
    renderAttachments();
    renderRecords();
    updateInput();
    openTask(task.id);
    toast('已建立一条示例工作，未调用真实服务。');
  });

  $('#attach-button')?.addEventListener('click', () => $('#file-input')?.click());
  $('#file-input')?.addEventListener('change', (event) => {
    const files = [...event.target.files];
    files.forEach((file) => {
      const key = `${file.name}-${file.size}-${file.lastModified}`;
      if (!state.attachments.some((item) => item.key === key)) state.attachments.push({ key, name: file.name });
    });
    event.target.value = '';
    renderAttachments();
    if (files.length) toast('已显示文件名。预览不会读取或上传文件内容。');
  });

  document.addEventListener('click', (event) => {
    const target = event.target instanceof Element ? event.target : null;
    if (!target) return;
    const scene = target.closest('[data-scene]');
    const prompt = target.closest('[data-prompt]');
    const open = target.closest('[data-open-task]');
    const remove = target.closest('[data-remove-file]');
    const previewNote = target.closest('[data-preview-note]');
    if (scene) appendPrompt(scenePrompts[scene.dataset.scene], scene.dataset.scene);
    else if (prompt) appendPrompt(prompt.dataset.prompt);
    else if (open) openTask(open.dataset.openTask);
    else if (remove) {
      state.attachments.splice(Number(remove.dataset.removeFile), 1);
      renderAttachments();
      $('#attach-button')?.focus();
    } else if (target.closest('[data-detail-back]')) {
      const taskId = state.activeId;
      showHome();
      const returnButton = taskId ? $(`#sidebar-recent [data-open-task="${taskId}"]`) : null;
      (returnButton || $('#new-work-button'))?.focus();
    } else if (previewNote) {
      event.preventDefault();
      toast(previewNote.dataset.previewNote || '这个入口暂未接入。');
      closeMenu();
    }
    if (!target.closest('#preview-settings') && !target.closest('#settings-button')) closeSettings();
  });

  $('#records-search')?.addEventListener('input', renderRecords);
  $('#records-filter')?.addEventListener('change', renderRecords);
  function focusRecords(event) {
    event?.preventDefault();
    state.activeId = null;
    state.allRecords = true;
    if ($('#home-view')) $('#home-view').hidden = true;
    if ($('#records-view')) $('#records-view').hidden = false;
    if ($('#detail-view')) $('#detail-view').hidden = true;
    if ($('#catalogue-view')) $('#catalogue-view').hidden = true;
    renderRecords();
    notifyView('records');
    setNavigation('records');
    closeMenu();
    $('#recent-section')?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'start' });
    $('#records-search')?.focus({ preventScroll: true });
  }
  $('#show-all-records')?.addEventListener('click', focusRecords);
  $('#nav-records')?.addEventListener('click', focusRecords);
  $('#new-work-button')?.addEventListener('click', () => showHome(true));
  $('#nav-learn')?.addEventListener('click', showLearn);
  $('#retry-button')?.addEventListener('click', () => { setMode('populated'); toast('已恢复示例记录。'); });
  $('#preview-state')?.addEventListener('change', (event) => setMode(event.target.value));
  $('#density-control')?.addEventListener('change', (event) => { document.body.dataset.density = event.target.value === 'compact' ? 'compact' : 'relaxed'; });
  $('#settings-button')?.addEventListener('click', () => {
    const panel = $('#preview-settings');
    if (!panel) return;
    if (!panel.hidden) { closeSettings(true); return; }
    settingsReturnFocus = document.activeElement;
    panel.hidden = false;
    $('#settings-button')?.setAttribute('aria-expanded', 'true');
    $('#preview-state')?.focus();
  });
  $('#menu-button')?.addEventListener('click', toggleMenu);
  $('#nav-backdrop')?.addEventListener('click', closeMenu);
  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    if ($('#preview-settings') && !$('#preview-settings').hidden) closeSettings(true);
    if ($('#menu-button')?.getAttribute('aria-expanded') === 'true') { closeMenu(); $('#menu-button')?.focus(); }
  });

  window.WorkspacePreview = Object.freeze({ showHome, appendPrompt, toast, showCatalogue, showLearn, setMode });
  updateInput();
  $$('[data-scene]').forEach((button) => button.setAttribute('aria-pressed', 'false'));
  setNavigation('home');
  renderAttachments();
  renderRecords();
  if (window.location.hash === '#learn') showLearn();
})();
