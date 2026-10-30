/* 落地页交互：固定时点的模拟政策筛选与结果展示，不访问或修改工作台资料。 */
(() => {
  'use strict';
  const D = window.PolicyLandingData;
  if (!D) return;
  const esc = (value = '') => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const $ = selector => document.querySelector(selector);
  const $$ = selector => [...document.querySelectorAll(selector)];
  const state = {region:'all', industry:'all', support:'all', status:'open', query:'', distribution:'industry', visible:6, carousel:0, expertTab:'experts', workStep:'profile'};
  const statuses = {open:'申报中',upcoming:'即将开始',closed:'已截止',unknown:'时间待明确',notice:'政策公告',result:'结果公示'};
  let readerTrigger = null;
  const date = value => {
    if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
    const parsed = new Date(`${value}T00:00:00Z`);
    return Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0,10) !== value ? null : value;
  };
  const asOf = date(D.snapshot.date) || '2026-10-30';
  function classifyWindow(policy, at = asOf) {
    if (policy.category === '结果公示') return 'result';
    if (policy.category !== '申报通知') return 'notice';
    const start = date(policy.applicationStart), end = date(policy.applicationEnd), today = date(at);
    if (!start || !end || !today || start > end) return 'unknown';
    if (today < start) return 'upcoming';
    if (today > end) return 'closed';
    return 'open';
  }
  function uniquePolicies(items) {
    const seen = new Map();
    for (const item of items) {
      const key = JSON.stringify([item.projectId || item.id, item.batchId || item.id]);
      if (!seen.has(key) || String(item.publishedAt) > String(seen.get(key).publishedAt)) seen.set(key,item);
    }
    return [...seen.values()];
  }
  const policies = uniquePolicies(D.policies);
  function filterPolicies(filters = state, input = policies) {
    const terms = String(filters.query || '').trim().toLocaleLowerCase('zh-CN').split(/\s+/).filter(Boolean);
    return uniquePolicies(input).filter(policy => {
      const haystack = [policy.title,policy.region,policy.supportType,policy.summary,...policy.industries].join(' ').toLocaleLowerCase('zh-CN');
      return (!filters.region || filters.region === 'all' || policy.region === filters.region)
        && (!filters.industry || filters.industry === 'all' || policy.industries.includes(filters.industry))
        && (!filters.support || filters.support === 'all' || policy.supportType === filters.support)
        && (!filters.status || filters.status === 'all' || classifyWindow(policy) === filters.status)
        && terms.every(term => haystack.includes(term));
    }).sort((a,b) => String(b.publishedAt).localeCompare(String(a.publishedAt)) || a.id.localeCompare(b.id));
  }
  const arrow = '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="M5 12h14m-5-5 5 5-5 5"/></svg>';
  const check = '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="m5 12 4 4L19 6"/></svg>';
  const displayDate = value => date(value) ? value.replaceAll('-','.') : '待明确';
  function period(policy) {
    if (policy.category !== '申报通知') return '不适用';
    if (!date(policy.applicationStart) || !date(policy.applicationEnd)) return '申报时间待明确';
    return `${displayDate(policy.applicationStart)} — ${displayDate(policy.applicationEnd)}`;
  }
  const statusTag = policy => `<span class="policy-status status-${classifyWindow(policy)}">${esc(statuses[classifyWindow(policy)])}</span>`;
  function setOptions(selector, values, label) {
    const element = $(selector);
    if (!element) return;
    element.innerHTML = `<option value="all">${esc(label)}</option>${values.map(value => `<option value="${esc(value)}">${esc(value === '全国' ? '全国适用' : value)}</option>`).join('')}`;
  }
  function updateFilters() {
    for (const key of ['region','industry','support','status']) {
      const element = $(`#${key}-filter`);
      if (element) element.value = state[key];
    }
    const active = ['region','industry','support'].filter(key => state[key] !== 'all');
    const chips = active.map(key => `<button class="filter-chip" type="button" data-clear-filter="${key}" aria-label="取消${esc(state[key])}筛选">${esc(state[key])}<span aria-hidden="true">×</span></button>`);
    if (state.query) chips.push(`<button id="search-query" class="filter-chip" type="button" data-clear-filter="query" aria-label="取消搜索${esc(state.query)}">搜索：${esc(state.query)}<span aria-hidden="true">×</span></button>`);
    if (state.status !== 'open') chips.push(`<button class="filter-chip" type="button" data-clear-filter="status">${esc(state.status === 'all' ? '全部状态' : statuses[state.status])}<span aria-hidden="true">×</span></button>`);
    if ($('#filter-chips')) $('#filter-chips').innerHTML = chips.join('');
    if ($('#clear-filters')) $('#clear-filters').hidden = !chips.length;
  }
  function renderDistribution(items) {
    const open = items.filter(item => classifyWindow(item) === 'open');
    const regionCount = new Set(open.map(item => item.region).filter(region => region !== '全国')).size;
    const industries = new Set(open.flatMap(item => item.industries));
    const counts = {open:open.length, regions:regionCount, industries:industries.size};
    for (const [key,value] of Object.entries(counts)) {
      const element = $(`#opportunity-summary [data-stat="${key}"]`);
      if (element) element.textContent = String(value);
    }
    const national = open.filter(item => item.region === '全国').length;
    if ($('#national-count')) $('#national-count').textContent = `其中${national}项全国适用，不重复计入各省`;
    $$('#distribution-tabs [data-distribution]').forEach(button => {
      const selected = button.dataset.distribution === state.distribution;
      button.classList.toggle('is-active',selected);
      button.setAttribute('aria-pressed',String(selected));
    });
    const buckets = new Map();
    for (const item of open) {
      const labels = state.distribution === 'industry' ? item.industries : [state.distribution === 'region' ? item.region : item.supportType];
      for (const label of new Set(labels)) buckets.set(label,(buckets.get(label) || 0)+1);
    }
    const entries = [...buckets].sort((a,b) => b[1]-a[1] || a[0].localeCompare(b[0],'zh-CN'));
    const max = Math.max(1,...entries.map(([,count]) => count));
    if ($('#distribution-chart')) $('#distribution-chart').innerHTML = entries.length ? entries.map(([label,count],index) => `<button class="distribution-row" type="button" data-filter-kind="${esc(state.distribution)}" data-filter-value="${esc(label)}" aria-label="筛选${esc(label)}，${count}项申报中项目"><span class="distribution-label">${esc(label === '全国' ? '全国适用' : label)}</span><span class="distribution-track" aria-hidden="true"><span class="distribution-bar bar-${index}" style="width:${count/max*100}%"></span></span><span class="distribution-value">${count}<small>项</small></span></button>`).join('') : '<div class="distribution-empty"><strong>当前范围暂无申报中项目</strong><p>更换筛选条件，或在下方查看其他状态的政策。</p></div>';
    if ($('#distribution-note')) $('#distribution-note').textContent = state.distribution === 'industry' ? '仅统计申报中项目；一个项目可对应多个行业，各项数量不相加。' : state.distribution === 'region' ? '省级口径；全国适用项目单列，不重复计入各省。' : '每项按主要支持类型统计，仅包含申报窗口开放的项目。';
  }
  function renderPolicies(items) {
    const featured = items.filter(item => item.featured);
    const slides = featured.length ? featured : items.slice(0,4);
    state.carousel = slides.length ? ((state.carousel % slides.length)+slides.length)%slides.length : 0;
    const policy = slides[state.carousel];
    if ($('#policy-carousel')) $('#policy-carousel').innerHTML = policy ? `<article class="policy-feature"><div class="policy-feature-top"><span class="section-kicker">重点项目 / ${esc(policy.region === '全国' ? '全国适用' : policy.region)}</span>${statusTag(policy)}</div><h3><button type="button" data-policy-id="${esc(policy.id)}">${esc(policy.title)}</button></h3><p>${esc(policy.summary)}</p><div class="policy-feature-tags"><span>${esc(policy.supportType)}</span>${policy.industries.map(item => `<span>${esc(item)}</span>`).join('')}</div><dl class="policy-dates"><div><dt>发布日期</dt><dd>${esc(displayDate(policy.publishedAt))}</dd></div><div><dt>申报时间</dt><dd>${esc(period(policy))}</dd></div></dl><button class="text-button" type="button" data-policy-id="${esc(policy.id)}">查看条件与材料 ${arrow}</button></article>` : '<div class="policy-feature policy-feature-empty"><h3>暂未找到符合条件的政策</h3><p>试试其他行业、地区，或清除当前筛选。</p></div>';
    if ($('#policy-position')) $('#policy-position').textContent = slides.length ? `${state.carousel+1} / ${slides.length}` : '0 / 0';
    for (const id of ['#policy-prev','#policy-next']) if ($(id)) $(id).disabled = slides.length < 2;
    if ($('#policy-list')) $('#policy-list').innerHTML = items.slice(0,state.visible).map(item => `<article class="policy-row"><div class="policy-row-copy"><div class="policy-meta"><span>${esc(item.region === '全国' ? '全国适用' : item.region)}</span><span>${esc(item.supportType)}</span>${statusTag(item)}</div><h3><button type="button" data-policy-id="${esc(item.id)}">${esc(item.title)}</button></h3><p class="policy-agency">${esc(item.agency)} · ${esc(item.category)}</p></div><dl class="policy-row-dates"><div><dt>发布</dt><dd>${esc(displayDate(item.publishedAt))}</dd></div><div><dt>申报</dt><dd>${esc(period(item))}</dd></div></dl><button class="policy-row-open" type="button" data-policy-id="${esc(item.id)}" aria-label="查看${esc(item.title)}">${arrow}</button></article>`).join('');
    if ($('#policy-empty')) $('#policy-empty').hidden = items.length > 0;
    if ($('#policy-count')) $('#policy-count').textContent = `${items.length}项政策`;
    if ($('#show-more-policies')) { $('#show-more-policies').hidden = state.visible >= items.length; $('#show-more-policies').textContent = `再看${Math.min(6,Math.max(0,items.length-state.visible))}项`; }
  }
  function render() {
    const items = filterPolicies();
    updateFilters();
    renderDistribution(items);
    renderPolicies(items);
    if ($('#hero-query-status')) $('#hero-query-status').textContent = state.query ? `在演示政策中查找“${state.query}”：当前条件下找到${items.length}项。` : '';
    if ($('#policy-reader') && !$('#policy-reader').hidden) closeReader(false);
  }
  function changeFilter(key,value) {
    if (!['region','industry','support','status','query'].includes(key)) return;
    state[key] = value;
    state.visible = 6;
    state.carousel = 0;
    render();
  }
  function openReader(id,trigger) {
    const policy = policies.find(item => item.id === id);
    const reader = $('#policy-reader');
    if (!policy || !reader) return;
    readerTrigger = trigger;
    reader.innerHTML = `<div class="policy-reader-head"><span class="section-kicker">政策详情 · 模拟数据</span><button id="policy-reader-close" class="text-button" type="button">收起详情 <span aria-hidden="true">×</span></button></div><div class="policy-meta"><span>${esc(policy.region === '全国' ? '全国适用' : policy.region)}</span><span>${esc(policy.category)}</span>${statusTag(policy)}</div><h3>${esc(policy.title)}</h3><p>${esc(policy.summary)}</p><dl class="policy-dates"><div><dt>发布部门</dt><dd>${esc(policy.agency)}</dd></div><div><dt>发布日期</dt><dd>${esc(displayDate(policy.publishedAt))}</dd></div><div><dt>申报时间</dt><dd>${esc(period(policy))}</dd></div></dl><div class="policy-reader-columns"><section><h4>先核对这些条件</h4><ul>${policy.conditions.map(item => `<li>${esc(item)}</li>`).join('')}</ul></section><section><h4>需要准备的材料</h4><ul>${policy.materials.map(item => `<li>${esc(item)}</li>`).join('')}</ul></section></div><div class="policy-reader-foot"><p>来源：平台演示政策模板。此处不对应真实政策原文，条件与日期均用于体验。</p><a class="button button-primary" href="index.html#new">创建申报准备任务 ${arrow}</a></div>`;
    reader.hidden = false;
    reader.focus({preventScroll:true});
    reader.scrollIntoView?.({behavior:'instant',block:'nearest'});
  }
  function closeReader(restore = true) {
    const reader = $('#policy-reader');
    if (reader) reader.hidden = true;
    if (restore && readerTrigger?.isConnected) readerTrigger.focus({preventScroll:true});
    readerTrigger = null;
  }
  function portrait(index,className = 'expert-portrait') {
    const safe = Number.isInteger(index) && index >= 0 && index < 6 ? index : 0;
    return `<div class="${className}" style="--portrait-x:${safe%3*50}%;--portrait-y:${Math.floor(safe/3)*100}%" aria-hidden="true"></div>`;
  }
  function expertLink(serviceId) {
    const route = {profile:'profile',search:'policy',interpret:'policy',diagnosis:'diagnosis',assembly:'assembly',guidance:'guidance'}[serviceId] || 'task';
    return `index.html#${route}?task=task-innovation`;
  }
  function renderExperts() {
    if ($('#expert-grid')) $('#expert-grid').innerHTML = D.experts.map((expert,index) => `<article class="expert-card expert-card-${index}"><div class="expert-copy"><h3>${esc(expert.title)}</h3><h4>${esc(expert.headline)}</h4><p>${esc(expert.description)}</p><div class="expert-tags">${expert.deliverables.map(item => `<span>${esc(item)}</span>`).join('')}</div><a class="expert-action" href="${esc(expertLink(expert.serviceId))}">让TA帮我 ${arrow}</a></div>${portrait(expert.portraitIndex)}</article>`).join('');
    if ($('#team-grid')) $('#team-grid').innerHTML = D.teams.map((team,index) => `<article class="team-card team-card-${index}"><div class="team-copy"><h3>${esc(team.title)}</h3><p>${esc(team.headline)}</p><ol class="team-flow">${team.steps.map((step,stepIndex) => `<li><span>${String(stepIndex+1).padStart(2,'0')}</span>${esc(step)}</li>`).join('')}</ol><div class="expert-tags">${team.deliverables.map(item => `<span>${esc(item)}</span>`).join('')}</div><a class="expert-action" href="index.html#task?task=${index ? 'task-review' : 'task-innovation'}">开始协作 ${arrow}</a></div><div class="team-members" aria-hidden="true">${team.portraitIndices.map(item => portrait(item,'team-person')).join('')}</div></article>`).join('');
    selectExpertTab(state.expertTab);
  }
  function selectExpertTab(tab,focus = false) {
    if (!['experts','teams'].includes(tab)) return;
    state.expertTab = tab;
    $$('[data-expert-tab]').forEach(button => {
      const selected = button.dataset.expertTab === tab;
      button.classList.toggle('is-active',selected);
      button.setAttribute('aria-selected',String(selected));
      button.tabIndex = selected ? 0 : -1;
      if (selected && focus) button.focus();
    });
    if ($('#expert-grid')) $('#expert-grid').hidden = tab !== 'experts';
    if ($('#team-grid')) $('#team-grid').hidden = tab !== 'teams';
  }
  const workSteps = {
    profile:{number:'01',title:'先了解企业，再找候选项目',user:'我们是杭州的软件企业，有研发项目，能看看哪些政策值得准备吗？',reply:'先把地区、行业和项目资料理清楚。候选政策会列出匹配原因，条件不明确的地方再逐项核对。',result:'企业档案',lines:[['注册地区','杭州市'],['所属行业','软件与信息服务'],['已有资料','企业简介、研发项目记录'],['下一步','核对候选政策与适用条件']],link:'profile',action:'看看企业档案'},
    diagnosis:{number:'02',title:'对照条件，把差距列清楚',user:'这个项目我们还缺什么？现在开始准备来得及吗？',reply:'当前6项资料里已有4项，还缺研发费用归集表和年度财务报告。资料缺失需要补证据，不能直接判断为不符合条件。',result:'申报准备清单',lines:[['准备度','4 / 6项 · 67%'],['待补资料','研发费用归集表'],['待补资料','年度财务报告'],['下一步','补充资料，再核对申报条件']],link:'diagnosis',action:'查看差距清单'},
    assembly:{number:'03',title:'用已有资料组稿，留下来源和版本',user:'按模板帮我整理材料，缺少的信息先留出来。',reply:'可以。章节会引用你提供的资料，未提供的数据明确留待补充。你可以修改、保存版本，再由企业负责人确认。',result:'申报材料草稿',lines:[['企业情况','引用：企业简介'],['项目介绍','引用：研发项目记录'],['费用说明','待补：费用归集资料'],['版本管理','草稿、来源、修改记录']],link:'assembly',action:'查看组稿过程'},
  };
  function selectWorkStep(step,focus = false) {
    const data = workSteps[step];
    if (!data) return;
    state.workStep = step;
    $$('#work-steps [data-work-step]').forEach(button => {
      const selected = button.dataset.workStep === step;
      button.classList.toggle('is-active',selected);
      button.setAttribute('aria-selected',String(selected));
      button.tabIndex = selected ? 0 : -1;
      if (focus && selected) button.focus();
    });
    if ($('#work-preview')) $('#work-preview').setAttribute('aria-labelledby',`step-${step}`);
    if ($('#work-preview')) $('#work-preview').innerHTML = `<div class="work-chat"><div class="work-message message-user"><span>企业</span><p>${esc(data.user)}</p></div><div class="work-message message-adviser"><span>政策顾问</span><p>${esc(data.reply)}</p></div><a class="text-button" href="index.html#${data.link}?task=task-innovation">${esc(data.action)} ${arrow}</a></div><div class="work-result"><div class="work-result-title">${check}<h3>${esc(data.result)}</h3><span>演示</span></div><dl>${data.lines.map(([label,value]) => `<div><dt>${esc(label)}</dt><dd>${esc(value)}</dd></div>`).join('')}</dl><span class="work-result-caption">每一步都有可以核对的结果。</span></div>`;
  }
  function renderCases() {
    if ($('#case-grid')) $('#case-grid').innerHTML = D.cases.map((item,index) => `<article class="case-card case-card-${index}"><div class="case-meta"><span>${esc(item.region)} · ${esc(item.industry)}</span><span>案例演示</span></div><h3 class="case-company">${esc(item.company)}</h3><div class="case-support"><strong>${esc(item.amountLabel)}</strong><span>${esc(item.status)} · ${esc(item.supportLabel)}</span></div><p class="case-project">${esc(item.project)}</p><div class="case-story"><h4>平台协助完成</h4><ol>${item.steps.map(step => `<li>${esc(step)}</li>`).join('')}</ol></div><a class="case-link" href="index.html#task?task=${esc(item.taskId)}">体验同类准备流程 ${arrow}</a></article>`).join('');
  }
  function closeMenu() {
    $('#menu-toggle')?.setAttribute('aria-expanded','false');
    $('#landing-nav')?.classList.remove('is-open');
    document.body.classList.remove('landing-menu-open');
  }
  function init() {
    setOptions('#region-filter',D.regions,'全部地区');
    setOptions('#industry-filter',D.industries,'全部行业');
    setOptions('#support-filter',D.supportTypes,'全部支持类型');
    const status = $('#status-filter');
    if (status) status.innerHTML = '<option value="all">全部状态</option>'+Object.entries(statuses).map(([value,label]) => `<option value="${value}">${label}</option>`).join('');
    renderExperts();
    renderCases();
    selectWorkStep(state.workStep);
    render();
    $('#opportunity-filters')?.addEventListener('change',event => {
      const key = { 'region-filter':'region','industry-filter':'industry','support-filter':'support','status-filter':'status' }[event.target.id];
      if (key) changeFilter(key,event.target.value);
    });
    $('#hero-query-form')?.addEventListener('submit',event => {
      event.preventDefault();
      const input = event.currentTarget.querySelector('[name="query"]');
      changeFilter('query',String(input?.value || '').trim().slice(0,100));
      $('#opportunities')?.scrollIntoView?.({behavior:'instant',block:'start'});
    });
    document.addEventListener('click',event => {
      const target = event.target.closest('button,a');
      if (!target) return;
      if (target.id === 'menu-toggle') {
        const expanded = target.getAttribute('aria-expanded') === 'true';
        target.setAttribute('aria-expanded',String(!expanded));
        $('#landing-nav')?.classList.toggle('is-open',!expanded);
        document.body.classList.toggle('landing-menu-open',!expanded);
      }
      if (target.closest('#landing-nav') && target.tagName === 'A') closeMenu();
      if (target.dataset.distribution) { state.distribution = target.dataset.distribution; renderDistribution(filterPolicies()); }
      if (target.dataset.filterKind) changeFilter(target.dataset.filterKind,state[target.dataset.filterKind] === target.dataset.filterValue ? 'all' : target.dataset.filterValue);
      if (target.dataset.clearFilter) {
        const key = target.dataset.clearFilter;
        changeFilter(key,key === 'status' ? 'open' : key === 'query' ? '' : 'all');
        if (key === 'query' && $('#hero-query-form [name="query"]')) $('#hero-query-form [name="query"]').value = '';
      }
      if (target.id === 'clear-filters') {
        Object.assign(state,{region:'all',industry:'all',support:'all',status:'open',query:'',visible:6,carousel:0});
        if ($('#hero-query-form [name="query"]')) $('#hero-query-form [name="query"]').value = '';
        render();
      }
      if (target.id === 'policy-prev' || target.id === 'policy-next') { state.carousel += target.id === 'policy-prev' ? -1 : 1; renderPolicies(filterPolicies()); }
      if (target.id === 'show-more-policies') { state.visible += 6; renderPolicies(filterPolicies()); }
      if (target.dataset.policyId) openReader(target.dataset.policyId,target);
      if (target.id === 'policy-reader-close') closeReader();
      if (target.dataset.expertTab) selectExpertTab(target.dataset.expertTab);
      if (target.dataset.workStep) selectWorkStep(target.dataset.workStep);
    });
    document.addEventListener('keydown',event => {
      if (event.key === 'Escape') closeMenu();
      const target = event.target.closest('[data-expert-tab],[data-work-step]');
      if (!target || !['ArrowLeft','ArrowRight','Home','End'].includes(event.key)) return;
      event.preventDefault();
      const expert = Boolean(target.dataset.expertTab);
      const tabs = expert ? $$('[data-expert-tab]') : $$('#work-steps [data-work-step]');
      const current = tabs.indexOf(target);
      const next = event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length-1 : (current+(event.key === 'ArrowRight' ? 1 : -1)+tabs.length)%tabs.length;
      if (expert) selectExpertTab(tabs[next].dataset.expertTab,true); else selectWorkStep(tabs[next].dataset.workStep,true);
    });
  }
  window.PolicyLanding = Object.freeze({classifyWindow,uniquePolicies,filterPolicies,getState:() => ({...state}),getAsOf:() => asOf});
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded',init,{once:true}); else init();
})();
