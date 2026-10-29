/* 场景集市交互预览。以下专家、专家团和交付说明均为示例，不代表已上线能力。 */
(() => {
  'use strict';

  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => [...document.querySelectorAll(selector)];
  const escapeHTML = (value = '') => String(value).replace(/[&<>"']/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[character]));
  const icon = (name) => `<svg class="icon" aria-hidden="true"><use href="#i-${escapeHTML(name)}"></use></svg>`;
  const categories = ['全部', '营销增长', '内容创作', '日常办公', '产品技术', '企业服务'];
  const state = { type: 'experts', category: '全部', query: '', sort: 'recommended', mode: 'populated' };
  const entry = (id, title, category, image, summary, tags, input, output, prompt, kind = 'custom', teamMembers = []) => ({
    id, title, categories: category, icon: image, summary, tags, input, output, prompt, kind, teamMembers,
    type: teamMembers.length ? 'teams' : 'experts',
  });
  const items = [
    entry('copywriter', '营销文案顾问', ['营销增长', '内容创作'], 'file', '围绕产品卖点，整理适合不同渠道的推广文案。', ['产品卖点', '推广文案'],
      ['产品介绍与现有卖点', '目标客户、发布渠道与语气要求'], ['卖点梳理、标题和正文初稿', '需用户核对产品信息与宣传表述'],
      '请根据我提供的产品资料，整理一份推广文案。先确认目标客户、发布渠道与需要突出的卖点。'),
    entry('poster-designer', '海报设计师', ['内容创作', '营销增长'], 'image', '根据活动信息，梳理海报内容和版式方向。', ['活动海报', '视觉物料'],
      ['活动主题、时间、地点与报名方式', '品牌素材、尺寸及参考风格'], ['海报文案与版式建议', '图片制作范围需开始前确认'],
      '请根据我提供的活动资料，整理海报内容与版式方向。先确认尺寸、主题、时间、地点和报名方式。', 'poster'),
    entry('video-planner', '视频脚本策划', ['内容创作', '营销增长'], 'video', '把品牌或产品资料整理成视频结构与分镜脚本。', ['视频脚本', '分镜策划'],
      ['品牌或产品介绍及参考视频', '目标观众、时长与投放渠道'], ['视频结构、分镜和旁白初稿', '脚本示例不等于已生成视频文件'],
      '请根据品牌资料，整理一份视频脚本。先确认目标观众、视频时长、发布渠道与可使用素材。', 'video'),
    entry('report-assistant', '工作汇报助手', ['日常办公'], 'file', '从已有记录中整理进展、结果和需要协调的事项。', ['周报整理', '进展汇总'],
      ['指定时间范围的工作记录', '汇报对象与格式要求'], ['工作汇报初稿', '缺失信息与待核对事实清单'],
      '请根据我提供的工作记录，整理本周工作汇报，包含已完成事项、当前进展和待协调问题，不补写没有依据的成果。', 'report'),
    entry('meeting-assistant', '会议纪要助手', ['日常办公'], 'file', '从会议文字记录中整理结论、分歧与后续安排。', ['会议纪要', '行动事项'],
      ['会议文字记录或转写内容', '会议主题与需要关注的问题'], ['会议纪要和待办初稿', '负责人和时间不明确时标记待确认'],
      '请根据我提供的会议记录，整理主要结论和待办，明确已有的负责人及时间，缺失信息标记为待确认。'),
    entry('spreadsheet-assistant', '表格分析助手', ['日常办公', '产品技术'], 'layers', '解释表格中的变化，梳理结论与待核查的数据。', ['数据整理', '表格分析'],
      ['待分析的数据与字段说明', '分析问题、时间范围及统计口径'], ['分析思路和结论初稿', '数据缺失、异常与口径说明'],
      '请根据我提供的数据，分析主要变化。先确认字段含义、统计口径和我要回答的问题，缺少依据时说明限制。'),
    entry('product-adviser', '产品需求顾问', ['产品技术'], 'layers', '把业务问题梳理为目标、用户流程和验收要求。', ['需求梳理', '验收要求'],
      ['业务背景、目标用户与现有问题', '功能边界、约束与相关材料'], ['需求结构和用户流程草稿', '待确认问题与验收建议'],
      '请帮我梳理产品需求。先确认用户、具体问题、目标和本期范围，再整理流程、功能要求及验收方式。'),
    entry('frontend-assistant', '前端开发助手', ['产品技术'], 'layers', '围绕明确的界面要求，整理实现建议与验证步骤。', ['界面实现', '问题排查'],
      ['界面需求或问题描述', '现有代码、运行方式及技术约束'], ['实现建议或代码草案', '验证步骤；实际可运行性需要另行验证'],
      '请根据现有界面和代码，先说明影响范围，再给出最小实现方案与验证步骤，涉及复杂改动时先等我确认。'),
    entry('policy-adviser', '企业政策顾问', ['企业服务'], 'briefcase', '依据提供的政策材料，整理条件、流程与待核实事项。', ['政策梳理', '申报准备'],
      ['政策原文及来源、发布日期', '企业基本情况与需要了解的问题'], ['政策条件与材料清单初稿', '适用性、有效期和官方核实事项；不承诺申报结果'],
      '请根据我提供的政策原文与企业情况，整理适用条件、所需材料和待核实问题，保留官方来源与时效说明。'),
    entry('customer-assistant', '客户沟通助手', ['营销增长', '企业服务'], 'user', '根据客户背景与沟通记录，准备问题和后续沟通稿。', ['沟通准备', '跟进建议'],
      ['客户背景与已有沟通记录', '本次目标和对外表达边界'], ['沟通提纲与跟进文案初稿', '对外发送前需用户核对'],
      '请根据客户资料与沟通记录，整理下一次沟通提纲和跟进文案，避免补写未经确认的承诺。'),
    entry('hiring-copywriter', '招聘文案助手', ['企业服务', '日常办公'], 'briefcase', '把真实岗位要求整理成清晰的招聘介绍。', ['岗位介绍', '招聘文案'],
      ['岗位职责、要求与实际待遇', '工作地点、用工方式和发布渠道'], ['招聘介绍初稿', '缺失或存在歧义的条件清单'],
      '请根据我提供的真实岗位信息，整理招聘文案。缺失待遇、职责或工作条件时先标记待确认，不自行补写。'),
    entry('knowledge-assistant', '知识整理助手', ['日常办公', '企业服务'], 'search', '把分散资料整理成目录、摘要与常见问题。', ['资料整理', '知识归档'],
      ['需要整理的原始材料', '目标读者和使用方式'], ['资料结构、摘要或常见问题初稿', '内容与原材料的对应关系'],
      '请根据我提供的材料，整理一份可检索的知识目录与摘要，保留来源，对冲突或缺失信息明确标注。'),
    entry('launch-team', '新品推广专家团', ['营销增长', '内容创作'], 'briefcase', '从产品卖点到推广文案、海报和视频脚本，一起梳理。', ['新品推广', '物料策划'],
      ['产品介绍、目标客户与推广目标', '渠道、时间、预算边界和品牌素材'], ['推广方案与物料需求草稿', '文案、海报方向及脚本范围需分别确认'],
      '我想为新品做一次推广。请先确认目标客户、产品卖点、渠道、时间与预算，再协同整理推广方案和物料要求。', 'custom',
      [['营销文案顾问', '梳理卖点和渠道文案'], ['海报设计师', '整理视觉物料方向'], ['视频脚本策划', '准备视频结构与脚本']]),
    entry('brand-film-team', '品牌短片专家团', ['内容创作', '营销增长'], 'video', '协同梳理品牌信息、叙事结构和分镜脚本。', ['品牌表达', '视频策划'],
      ['品牌介绍、现有素材与参考片', '目标观众、时长和发布渠道'], ['品牌短片方案、分镜和旁白草稿', '视频成片范围需单独确认'],
      '我想制作品牌宣传短片。请先梳理品牌信息、目标观众、时长与素材，再协同整理叙事方案和分镜脚本。', 'video',
      [['营销文案顾问', '梳理品牌信息与表达'], ['视频脚本策划', '设计叙事、分镜和旁白'], ['海报设计师', '提供视觉风格建议']]),
    entry('weekly-team', '周报整理专家团', ['日常办公'], 'file', '汇总工作记录、会议结论和数据，准备周报初稿。', ['周报整理', '事实核对'],
      ['本周工作记录与会议材料', '相关数据、汇报对象与格式'], ['带来源线索的周报初稿', '待补资料与待核对事实'],
      '请整理本周工作汇报。结合我提供的工作记录、会议纪要和表格数据，汇总结果、进展和待协调事项，缺少依据时标注。', 'report',
      [['工作汇报助手', '组织汇报结构'], ['会议纪要助手', '提取会议结论和待办'], ['表格分析助手', '核对数据与统计口径']]),
    entry('client-visit-team', '客户拜访准备专家团', ['营销增长', '企业服务'], 'user', '整理客户资料、拜访问题与沟通材料。', ['客户研究', '拜访准备'],
      ['客户背景与已有沟通记录', '本次拜访目标、产品资料和表达边界'], ['客户背景摘要与拜访提纲', '跟进文案草稿；对外承诺需确认'],
      '请帮我准备客户拜访。根据已有资料，整理客户背景、关键问题、沟通提纲和后续跟进安排，不补写未经确认的信息。', 'custom',
      [['客户沟通助手', '设计提问与沟通顺序'], ['知识整理助手', '整理客户与产品资料'], ['营销文案顾问', '准备对外介绍初稿']]),
    entry('event-team', '活动宣传专家团', ['营销增长', '内容创作'], 'image', '围绕同一场活动，准备宣传文案与海报方向。', ['活动宣传', '内容协同'],
      ['活动主题、时间、地点与参与方式', '目标受众、宣传渠道和品牌素材'], ['活动宣传文案与海报方向', '发布前需核对活动信息'],
      '请帮我准备活动宣传。先确认活动信息、目标受众和渠道，再协同整理宣传文案、海报内容及发布安排建议。', 'poster',
      [['营销文案顾问', '整理不同渠道的宣传文案'], ['海报设计师', '梳理海报内容与版式'], ['客户沟通助手', '准备邀请和答疑文案']]),
    entry('research-team', '产品调研专家团', ['产品技术', '企业服务'], 'search', '整理已有调研材料，归纳用户问题和产品机会。', ['产品研究', '需求分析'],
      ['用户访谈、竞品材料与数据', '调研问题、目标用户和范围'], ['有来源线索的调研草稿', '问题归纳、假设与下一步验证建议'],
      '请根据我提供的用户、竞品和业务材料，开展产品调研整理。区分事实、推测与建议，保留来源，并列出需要验证的问题。', 'custom',
      [['产品需求顾问', '定义问题与需求边界'], ['知识整理助手', '整理资料和来源'], ['表格分析助手', '核对数据和对比口径']]),
  ];
  const expertsByName = new Map();
  items.filter((item) => item.type === 'experts').forEach((item, atlasIndex) => {
    item.atlasIndex = atlasIndex;
    expertsByName.set(item.title, item);
  });

  function filteredItems() {
    const query = state.query.trim().toLocaleLowerCase();
    const result = items.filter((item) => item.type === state.type
      && (state.category === '全部' || item.categories.includes(state.category))
      && (!query || [item.title, item.summary, ...item.tags, ...item.categories].join(' ').toLocaleLowerCase().includes(query)));
    if (state.sort === 'name') result.sort((a, b) => a.title.localeCompare(b.title, 'zh-CN'));
    return result;
  }

  function portrait(item, extraClass = '') {
    const column = item.atlasIndex % 4;
    const row = Math.floor(item.atlasIndex / 4);
    return `<span class="expert-avatar expert-portrait ${extraClass}" style="--portrait-x:${column / 3 * 100}%;--portrait-y:${row / 2 * 100}%" aria-hidden="true"></span>`;
  }

  function card(item) {
    const summon = `<button type="button" class="expert-summon" data-catalogue-use="${item.id}" aria-label="召唤${escapeHTML(item.title)}">召唤</button>`;
    if (item.type === 'teams') {
      return `<article class="expert-card team-card" data-catalogue-item="${item.id}" aria-label="${escapeHTML(item.title)}">
        <div class="team-card-heading"><h3 class="expert-card-title">${escapeHTML(item.title)}</h3><span class="expert-type">${item.teamMembers.length} 位专家协作</span></div>
        <ul class="team-member-list" aria-label="协作成员与分工">${item.teamMembers.map(([name, responsibility]) => {
          const member = expertsByName.get(name);
          return `<li class="team-member">${member ? portrait(member, 'team-member-avatar') : ''}<div><strong>${escapeHTML(name)}</strong><span>${escapeHTML(responsibility)}</span></div></li>`;
        }).join('')}</ul>
        <div class="team-delivery"><span>共同交付</span><p>${escapeHTML(item.output[0])}</p></div>
        ${summon}
      </article>`;
    }
    return `<article class="expert-card person-card" data-catalogue-item="${item.id}" aria-label="${escapeHTML(item.title)}">
      ${portrait(item)}
      <div class="person-card-copy"><h3 class="expert-card-title">${escapeHTML(item.title)}</h3><p class="expert-description">${escapeHTML(item.summary)}</p><div class="expert-tags">${item.tags.slice(0, 2).map((tag) => `<span>${escapeHTML(tag)}</span>`).join('')}</div></div>
      ${summon}
    </article>`;
  }

  function renderFeatured() {
    const featured = $('#catalogue-featured');
    if (!featured) return;
    const topics = [
      { title: '营销增长', summary: '从产品卖点，到客户沟通', tone: 1, ids: ['launch-team', 'copywriter', 'client-visit-team'] },
      { title: '内容创作', summary: '把想法整理成可讨论的初稿', tone: 2, ids: ['brand-film-team', 'poster-designer', 'video-planner'] },
      { title: '日常办公', summary: '整理记录，推进日常工作', tone: 3, ids: ['weekly-team', 'meeting-assistant', 'spreadsheet-assistant'] },
    ];
    featured.innerHTML = topics.map((topic) => `<section class="feature-card tone-${topic.tone}"><div class="feature-card-heading"><strong>${topic.title}</strong><p>${topic.summary}</p></div><div class="feature-card-links">${topic.ids.map((id) => {
      const item = items.find((candidate) => candidate.id === id);
      return `<button type="button" data-catalogue-feature="${id}"><span>${escapeHTML(item.title)}</span>${icon('arrow')}</button>`;
    }).join('')}</div></section>`).join('');
  }

  function render() {
    const grid = $('#catalogue-grid');
    if (!grid) return;
    const busy = state.mode === 'loading';
    const failed = state.mode === 'error';
    const unavailable = busy || failed;
    $$('[data-catalogue-type]').forEach((tab) => {
      const selected = tab.dataset.catalogueType === state.type;
      tab.setAttribute('aria-selected', String(selected));
      tab.tabIndex = selected ? 0 : -1;
      tab.classList.toggle('is-active', selected);
    });
    grid.setAttribute('aria-labelledby', state.type === 'teams' ? 'tab-teams' : 'tab-experts');
    grid.setAttribute('aria-busy', String(busy));
    grid.classList.toggle('catalogue-grid-teams', state.type === 'teams');
    const categoryGroup = $('#catalogue-categories');
    if (categoryGroup) {
      // 更新属性而非重建分类按钮，保留键盘焦点。
      if (!categoryGroup.childElementCount) categoryGroup.innerHTML = categories.map((category) => `<button type="button" class="catalogue-filter" data-catalogue-category="${category}" aria-pressed="false">${category}</button>`).join('');
      $$('[data-catalogue-category]').forEach((button) => {
        const selected = button.dataset.catalogueCategory === state.category;
        button.setAttribute('aria-pressed', String(selected));
        button.classList.toggle('is-active', selected);
      });
    }
    const result = filteredItems();
    grid.innerHTML = unavailable ? '' : result.map(card).join('');
    grid.hidden = unavailable || result.length === 0;
    if ($('#catalogue-loading')) $('#catalogue-loading').hidden = !busy;
    if ($('#catalogue-error')) $('#catalogue-error').hidden = !failed;
    if ($('#catalogue-empty')) $('#catalogue-empty').hidden = unavailable || result.length > 0;
    if ($('#catalogue-featured')) $('#catalogue-featured').hidden = unavailable;
    if ($('#catalogue-count')) $('#catalogue-count').textContent = busy ? '正在载入目录…' : failed ? '目录暂时无法显示' : `${result.length}${state.type === 'teams' ? ' 个专家团' : ' 位专家'}`;
    if ($('#catalogue-search')) $('#catalogue-search').disabled = unavailable;
    if ($('#catalogue-sort')) $('#catalogue-sort').disabled = unavailable;
    $$('[data-catalogue-type], [data-catalogue-category]').forEach((control) => { control.disabled = unavailable; });
  }

  function focusCatalogue() {
    const heading = $('#catalogue-view h1');
    if (!heading) return;
    heading.tabIndex = -1;
    heading.focus({ preventScroll: true });
  }

  function showCatalogue(event) {
    event?.preventDefault();
    window.WorkspacePreview?.showCatalogue();
    render();
    focusCatalogue();
  }

  function selectType(type, focus = false) {
    if (!['experts', 'teams'].includes(type)) return;
    state.type = type;
    render();
    if (focus) $(`[data-catalogue-type="${type}"]`)?.focus();
  }

  function revealFeaturedItem(id) {
    const item = items.find((candidate) => candidate.id === id);
    if (!item || ['loading', 'error'].includes(state.mode)) return;
    state.type = item.type;
    state.category = item.categories[0];
    state.query = '';
    if ($('#catalogue-search')) $('#catalogue-search').value = '';
    render();
    $(`[data-catalogue-use="${item.id}"]`)?.focus({ preventScroll: false });
  }

  $('#nav-catalogue')?.addEventListener('click', showCatalogue);
  $('#all-scenes-button')?.addEventListener('click', showCatalogue);
  $('#catalogue-search')?.addEventListener('input', (event) => {
    state.query = event.target.value;
    render();
  });
  $('#catalogue-sort')?.addEventListener('change', (event) => {
    state.sort = event.target.value === 'name' ? 'name' : 'recommended';
    render();
  });
  $('#catalogue-clear')?.addEventListener('click', () => {
    state.query = '';
    state.category = '全部';
    if ($('#catalogue-search')) $('#catalogue-search').value = '';
    render();
    $('#catalogue-search')?.focus();
  });
  $('#catalogue-retry')?.addEventListener('click', () => {
    window.WorkspacePreview?.setMode('populated');
    state.mode = 'populated';
    window.WorkspacePreview?.showCatalogue();
    render();
    focusCatalogue();
  });
  $('#catalogue-view')?.addEventListener('click', (event) => {
    const target = event.target instanceof Element ? event.target : null;
    if (!target) return;
    const typeTab = target.closest('[data-catalogue-type]');
    const category = target.closest('[data-catalogue-category]');
    const feature = target.closest('[data-catalogue-feature]');
    const use = target.closest('[data-catalogue-use]');
    if (typeTab) selectType(typeTab.dataset.catalogueType);
    else if (category) {
      state.category = category.dataset.catalogueCategory;
      render();
    } else if (feature) revealFeaturedItem(feature.dataset.catalogueFeature);
    else if (use && !['loading', 'error'].includes(state.mode)) {
      const item = items.find((candidate) => candidate.id === use.dataset.catalogueUse);
      if (item) window.WorkspacePreview?.appendPrompt(item.prompt, item.kind);
    }
  });
  $$('[data-catalogue-type]').forEach((tab) => tab.addEventListener('keydown', (event) => {
    const tabs = $$('[data-catalogue-type]');
    const index = tabs.indexOf(tab);
    let targetIndex;
    if (event.key === 'ArrowRight') targetIndex = (index + 1) % tabs.length;
    else if (event.key === 'ArrowLeft') targetIndex = (index - 1 + tabs.length) % tabs.length;
    else if (event.key === 'Home') targetIndex = 0;
    else if (event.key === 'End') targetIndex = tabs.length - 1;
    else return;
    event.preventDefault();
    if (!tabs[targetIndex].disabled) selectType(tabs[targetIndex].dataset.catalogueType, true);
  }));
  document.addEventListener('workspace:preview-state', (event) => {
    state.mode = ['new', 'loading', 'error', 'populated'].includes(event.detail?.mode) ? event.detail.mode : 'populated';
    render();
  });
  document.addEventListener('workspace:view', (event) => {
    if (event.detail?.name === 'catalogue') render();
  });
  renderFeatured();
  render();
  if (/^#catalogue(?:\?|$)/.test(window.location.hash)) {
    const parameters = new URLSearchParams(window.location.hash.split('?')[1] || '');
    if (parameters.get('type') === 'teams') state.type = 'teams';
    showCatalogue();
  }
})();
