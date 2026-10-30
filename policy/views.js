/* 页面只负责呈现；写入与导航由 app.js 统一处理。企业与政策数据为演示案例。 */
(() => {
  'use strict';
  const E = (value = '') => window.PolicyUI?.escape ? window.PolicyUI.escape(String(value ?? '')) : String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
  const I = (name) => window.PolicyUI?.icon ? window.PolicyUI.icon(name) : '';
  const D = () => window.PolicyData;
  const S = () => window.PolicyStore;
  const steps = [['profile', '企业档案', 'profile'], ['match', '政策匹配', 'policy'], ['diagnosis', '差距诊断', 'diagnosis'], ['assembly', '材料组稿', 'assembly'], ['review', '人工确认', 'assembly']];
  const statusLabels = { ready: '资料已具备', missing: '缺少资料', unmet: '条件未满足', unknown: '待核实' };
  const statusClasses = { ready: 'tag-success', missing: 'tag-warn', unmet: 'tag-warn', unknown: 'tag-muted' };
  const route = (name, label, taskId = '', policyId = '', style = 'button button-secondary') => `<button type="button" class="${style}" data-route="${E(name)}"${taskId ? ` data-task="${E(taskId)}"` : ''}${policyId ? ` data-id="${E(policyId)}"` : ''}>${E(label)}</button>`;
  const action = (name, label, taskId = '', itemId = '', style = 'button button-secondary') => `<button type="button" class="${style}" data-action="${E(name)}"${taskId ? ` data-task="${E(taskId)}"` : ''}${itemId ? ` data-id="${E(itemId)}"` : ''}>${E(label)}</button>`;
  const avatar = (index) => `<span class="role-avatar" aria-hidden="true" data-avatar-index="${index}" style="--portrait-x:${(index % 4) / 3 * 100}%;--portrait-y:${Math.floor(index / 4) * 50}%"></span>`;
  const stats = (task) => {
    const ready = task.requirements.filter((item) => item.status === 'ready').length;
    return { ready, total: task.requirements.length, gap: task.requirements.length - ready, completed: steps.filter(([key]) => task.steps[key]).length, percent: task.requirements.length ? Math.round(ready / task.requirements.length * 100) : 0 };
  };
  const getPolicy = (id) => D().policies.find((item) => item.id === id);
  const activeTask = () => S().getTask(S().getState().activeTaskId) || S().getState().tasks[0] || null;
  const header = (title, description = '', buttons = '') => `<header class="page-header"><div><h1>${E(title)}</h1>${description ? `<p class="muted">${E(description)}</p>` : ''}</div>${buttons ? `<div class="page-actions">${buttons}</div>` : ''}</header>`;
  const notFound = () => `${header('没有找到这个项目')}<div class="empty-state"><p class="muted">返回工作台选择一个项目继续。</p>${route('dashboard', '返回工作台')}</div>`;
  const missingSummary = (task) => {
    const missing = task.requirements.filter((item) => item.status === 'missing');
    const unknown = task.requirements.filter((item) => item.status === 'unknown');
    const unmet = task.requirements.filter((item) => item.status === 'unmet');
    return [missing.length ? `还缺 ${missing.length} 项资料` : '', unknown.length ? `${unknown.length} 项待核实` : '', unmet.length ? `${unmet.length} 项条件需处理` : ''].filter(Boolean).join('，') || '清单资料已具备，可核对草稿与来源';
  };
  const workflowState = (task) => task.steps.review || task.status === 'done' ? 'done' : task.steps.assembly || task.status === 'review' ? 'review' : task.status === 'processing' ? 'processing' : stats(task).gap > 0 ? 'needs-input' : 'processing';
  const nextRoute = (task) => !task.steps.profile ? 'profile' : !task.steps.match ? 'policy' : !task.steps.diagnosis || stats(task).gap ? 'diagnosis' : 'assembly';
  const progress = (task, className = '') => {
    const count = stats(task).completed;
    return `<div class="step-progress ${className}"><span>已完成 ${count}/5 步</span><progress value="${count}" max="5" aria-label="任务处理进度：已完成 ${count} 步，共 5 步"></progress></div>`;
  };
  const sourceRow = (source, taskId) => `<div class="source-row"><div>${I('file')}<span>${E(source.name)}</span><span class="tag ${source.provided ? 'tag-success' : 'tag-muted'}">${source.provided ? '已提供' : '未提供'}</span></div>${action('view-source', source.provided ? '查看来源' : '录入资料', taskId, source.id, 'text-button')}</div>`;
  const mockScore = (policy) => `<div class="mock-score"><div><span class="muted">预估申报成功率</span><strong>${E(policy.mockSuccess)}<small>%</small></strong></div><div><span class="tag tag-muted">模拟值</span><p class="muted">仅作演示，不代表获批判断。</p></div></div>`;
  const field = (label, name, value = '', options = {}) => `<label class="form-field" for="field-${E(name)}"><span>${E(label)}${options.required ? '<span aria-hidden="true"> *</span>' : ''}</span><input id="field-${E(name)}" name="${E(name)}" type="${E(options.type || 'text')}" maxlength="${options.max || 200}" value="${E(value)}"${options.required ? ' required' : ''}${options.placeholder ? ` placeholder="${E(options.placeholder)}"` : ''}${options.type === 'number' ? ' min="0" step="1"' : ''}></label>`;

  function dashboard() {
    const tasks = S().getState().tasks;
    const current = activeTask();
    let focus = '';
    if (current) {
      const count = stats(current);
      focus = `<section class="focus-panel" aria-label="当前项目"><div class="focus-main"><h2>${E(current.title)}</h2><p class="muted">${E(current.company.name || '企业档案待填写')}</p><p class="focus-next">${E(missingSummary(current))}</p>${progress(current)}<div class="focus-actions">${route(nextRoute(current), '继续准备', current.id, '', 'button button-primary')}${route('task', '查看项目', current.id, '', 'text-button')}</div></div><div class="focus-side"><p>申报准备情况</p><div class="readiness-value">${count.percent}<span>%</span></div><p class="muted">已具备 ${count.ready}/${count.total} 项</p>${route('diagnosis', '查看缺口', current.id, '', 'text-button')}</div></section>`;
    } else focus = `<section class="focus-panel"><div class="focus-main"><h2>从一项申报目标开始</h2><p class="muted">填写企业信息，逐项准备需要的资料。</p>${route('new', '创建新任务', '', '', 'button button-primary')}</div></section>`;
    const services = `<section class="capability-section" aria-label="政策服务"><div class="section-heading"><h2>需要哪方面帮助？</h2>${route('services', '全部服务', '', '', 'text-button')}</div><div class="capability-strip">${D().services.map((service, index) => `<button type="button" class="capability-item" data-action="service-use" data-id="${E(service.id)}"${current ? ` data-task="${E(current.id)}"` : ''}>${avatar(index)}<span>${E(service.title)}</span></button>`).join('')}</div></section>`;
    const columns = [['needs-input', '待补资料'], ['processing', '处理中'], ['review', '待确认']];
    const board = `<section class="board-section" aria-labelledby="board-title"><div class="section-heading"><h2 id="board-title">申报项目</h2><span class="muted">${tasks.length} 个项目</span></div><div class="task-board">${columns.map(([status, title]) => {
      const group = tasks.filter((task) => workflowState(task) === status);
      return `<section class="board-column"><div class="board-column-header"><h3>${title}</h3><span class="board-count">${group.length}</span></div><div class="board-cards">${group.length ? group.map((task) => `<article class="task-card"><span class="task-card-company muted">${E(task.company.name || '企业信息待填写')}</span><h4>${route('task', task.title, task.id, '', 'task-card-title')}</h4><p>${E(status === 'review' ? '已有材料草稿，请核对待补段落与资料来源' : status === 'processing' ? '正在核对项目条件，继续查看下一步' : missingSummary(task))}</p>${progress(task)}<div class="task-card-footer"><span class="muted">${status === 'review' ? '待人工确认' : '政策顾问协助'}</span>${route(status === 'review' ? 'assembly' : 'task', '查看项目', task.id, '', 'text-button')}</div></article>`).join('') : '<p class="board-empty muted">暂无项目</p>'}</div></section>`;
    }).join('')}</div></section>`;
    const done = tasks.filter((task) => workflowState(task) === 'done');
    const archive = done.length ? `<section class="archive-section"><div class="section-heading"><h2>已完成准备</h2></div>${done.map((task) => `<div class="archive-row"><div><h3>${E(task.title)}</h3><p class="muted">${E(task.company.name)}</p></div><span class="tag tag-success">材料已确认</span>${route('task', '查看项目', task.id, '', 'text-button')}</div>`).join('')}</section>` : '';
    return header('申报工作台', '', route('new', '创建新任务', '', '', 'button button-primary')) + focus + services + board + archive;
  }

  function newTask({ intent = '' } = {}) {
    const prompts = ['帮我查找适合企业的研发创新政策，先核对申报条件。', '看看现有企业资料还缺什么，整理一份申报准备清单。', '按已有政策模板整理材料，缺少的信息保留待补。'];
    return `<div class="new-task-layout"><div class="new-task-intro"><div class="start-work-visual"><img src="assets/start-work-ring.png" alt="" width="612" height="367"></div><h1>这次想申报什么？</h1></div><form id="new-task-form" class="new-task-form"><input type="hidden" name="intent" value="${E(intent)}"><label class="form-field request-field" for="task-request"><span class="sr-only">申报目标</span><textarea id="task-request" name="request" rows="5" maxlength="5000" required placeholder="告诉我企业想申请的支持，或先帮你找找适合的政策……">${E(S().getTaskDraft())}</textarea></label><div class="form-grid">${field('企业名称', 'companyName', '', { required: true, placeholder: '填写企业名称', max: 300 })}${field('所在地区', 'region', '杭州市', { required: true, max: 100 })}${field('所属行业', 'industry', '', { required: true, placeholder: '例如：软件与信息服务', max: 200 })}</div><div class="form-actions"><span class="muted">企业资料可在下一步补充。</span><button type="submit" class="button button-primary">创建任务 ${I('arrow')}</button></div></form><div class="prompt-examples"><h2>从一个具体问题开始</h2>${prompts.map((prompt, index) => `<button type="button" class="prompt-card" data-action="prompt-fill" data-prompt="${E(prompt)}"><span>${['查找适用政策', '诊断申报差距', '已有材料组稿'][index]}</span>${I('arrow')}</button>`).join('')}</div></div>`;
  }

  function services({ type = 'services', query = '' } = {}) {
    const teamMode = ['teams', 'team', 'plans'].includes(type);
    const current = activeTask();
    const needle = query.trim().toLocaleLowerCase();
    const items = (teamMode ? D().teams : D().services).filter((item) => `${item.title} ${item.description} ${item.tags.join(' ')}`.toLocaleLowerCase().includes(needle));
    const toolbar = `<div class="services-toolbar"><div class="service-tabs" role="group" aria-label="服务类型">${action('service-tab', '单项能力', '', 'services', `service-tab${!teamMode ? ' is-active' : ''}`)}${action('service-tab', '申报协作方案', '', 'teams', `service-tab${teamMode ? ' is-active' : ''}`)}</div><form id="services-search-form" role="search" data-type="${teamMode ? 'teams' : 'services'}"><label for="service-search" class="sr-only">搜索政策服务</label><input type="search" id="service-search" name="query" maxlength="100" value="${E(query)}" placeholder="搜索能力或用途"><button type="submit" class="button button-secondary">搜索</button></form></div>`;
    const cards = items.map((item) => {
      const serviceIndex = D().services.findIndex((service) => service.id === item.id);
      return `<article class="service-card">${teamMode ? `<div class="team-avatar-stack">${item.serviceIds.slice(0, 3).map((serviceId) => avatar(D().services.findIndex((service) => service.id === serviceId))).join('')}</div>` : avatar(serviceIndex)}<h2>${E(item.title)}</h2><p class="service-description">${E(item.description)}</p>${teamMode ? `<ol class="team-sequence">${item.serviceIds.map((serviceId) => `<li>${E(D().services.find((service) => service.id === serviceId)?.title || serviceId)}</li>`).join('')}</ol>` : ''}<p class="service-output"><span class="muted">产出</span>${E(item.output)}</p><div class="service-card-footer"><div class="service-tags">${item.tags.map((tag) => `<span class="tag tag-muted">${E(tag)}</span>`).join('')}</div>${action(teamMode ? 'team-use' : 'service-use', '使用', current?.id || '', item.id, 'button button-primary')}</div></article>`;
    }).join('');
    return `${header('政策服务')}${toolbar}<div class="services-grid">${cards || '<div class="empty-state"><h2>没有找到相关服务</h2><p class="muted">换个关键词试试。</p></div>'}</div>`;
  }

  function task(taskId) {
    const current = S().getTask(taskId);
    if (!current) return notFound();
    const count = stats(current);
    const selectedPolicy = getPolicy(current.policyId);
    const versions = S().getState().versions.filter((version) => version.taskId === current.id);
    return `${header(current.title, current.company.name || '企业信息待填写', route('dashboard', '返回工作台'))}<ol class="task-stepper" aria-label="任务步骤">${steps.map(([key, label, destination], index) => `<li class="${current.steps[key] ? 'is-complete' : ''}"><button type="button" data-route="${destination}" data-task="${E(current.id)}"><span class="step-number">${current.steps[key] ? I('check') : index + 1}</span><span>${label}</span><small>${current.steps[key] ? '已完成' : '待处理'}</small></button></li>`).join('')}</ol><div class="task-overview"><section class="content-panel"><h2>下一步</h2><p class="next-action-text">${E(missingSummary(current))}</p>${progress(current)}${route(nextRoute(current), '继续处理', current.id, '', 'button button-primary')}</section><section class="content-panel"><h2>项目概要</h2><dl class="summary-list"><div><dt>企业地区</dt><dd>${E(current.company.region || '待填写')}</dd></div><div><dt>准备情况</dt><dd>已具备 ${count.ready}/${count.total} 项</dd></div><div><dt>申报项目</dt><dd>${current.steps.match ? E(selectedPolicy?.title || '待选择') : '待检索与选择'}</dd></div><div><dt>材料版本</dt><dd>${versions.length ? `${versions.length} 个版本` : '尚未保存'}</dd></div></dl></section></div><section class="task-results"><div class="section-heading"><h2>项目资料与结果</h2></div><div class="result-links">${[['profile', '企业档案', '核对基本信息与资料来源'], ['policy', '政策条件', '查看适用范围与材料要求'], ['diagnosis', '差距诊断', '区分资料缺失与待核实条件'], ['assembly', '材料组稿', '按模板整理并保存版本'], ['guidance', '办理指引', '检查后续办理步骤']].map(([destination, title, description]) => `<button type="button" class="result-link" data-route="${destination}" data-task="${E(current.id)}"><span>${title}</span><small>${description}</small>${I('arrow')}</button>`).join('')}</div></section>`;
  }

  function profile(taskId) {
    const current = S().getTask(taskId);
    if (!current) return notFound();
    return `${header('企业档案', current.title, route('task', '返回项目', current.id))}<div class="profile-layout"><section class="content-panel"><div class="section-heading"><h2>基本信息</h2>${action('load-demo', '载入示例企业资料', current.id, '', 'text-button')}</div><form id="profile-form" data-task="${E(current.id)}"><div class="form-grid">${field('企业名称', 'name', current.company.name, { required: true, max: 300 })}${field('注册地区', 'region', current.company.region, { required: true, max: 100 })}${field('所属行业', 'industry', current.company.industry, { required: true, max: 200 })}${field('成立日期', 'established', current.company.established, { type: 'date', max: 20 })}${field('员工人数', 'employees', current.company.employees, { type: 'number', max: 10 })}</div><p class="muted">年度营业收入：${current.company.revenue === null || current.company.revenue === '' ? '未提供，待财务资料核实' : E(current.company.revenue)}</p><div class="form-actions"><span class="muted">确认档案后，可继续核对政策条件。</span><button type="submit" class="button button-primary">确认企业档案</button></div></form></section><section class="content-panel"><div class="section-heading"><h2>资料来源</h2><span class="muted">${current.sources.filter((source) => source.provided).length}/${current.sources.length} 项已提供</span></div><div class="source-list">${current.sources.map((source) => sourceRow(source, current.id)).join('')}</div></section></div>`;
  }

  function policy(taskId, policyId) {
    const current = S().getTask(taskId);
    if (!current) return notFound();
    if (policyId) {
      const item = getPolicy(policyId);
      if (!item) return notFound();
      return `${header(item.title, `${item.agency} · ${item.region}`, route('policy', '返回候选项目', current.id))}<div class="policy-detail-grid"><section class="content-panel"><h2>项目解读</h2><p class="policy-summary">${E(item.summary)}</p><dl class="summary-list"><div><dt>申报时间</dt><dd>${E(item.deadline)}</dd></div><div><dt>资料来源</dt><dd>${E(item.sourceLabel)}</dd></div><div><dt>申报模板</dt><dd>${item.template ? '已配置演示模板' : '暂未配置，提供清单与填写指引'}</dd></div></dl><h2>适用条件</h2><ol class="reading-list">${item.conditions.map((condition) => `<li>${E(condition)}</li>`).join('')}</ol><h2>材料要求</h2><ul class="material-list">${item.materials.map((material) => `<li>${E(material)}</li>`).join('')}</ul></section><aside class="content-panel policy-side">${mockScore(item)}${action('choose-policy', '选用这个项目', current.id, item.id, 'button button-primary')}${route('diagnosis', '查看企业差距', current.id, '', 'text-button')}</aside></div>`;
    }
    const pageHeader = header('检索与匹配政策', current.company.name || '企业档案待填写', route('task', '返回项目', current.id));
    if (!current.steps.profile) return `${pageHeader}<section class="empty-state"><h2>先确认企业档案</h2><p class="muted">地区与行业信息用于筛选候选项目。</p>${route('profile', '核对企业档案', current.id, '', 'button button-primary')}</section>`;
    if (!current.steps.match) return `${pageHeader}<section class="content-panel match-intro"><h2>根据企业信息查找候选项目</h2><p class="muted">${E(current.company.region)} · ${E(current.company.industry)}</p>${action('run-match', '检索演示政策', current.id, '', 'button button-primary')}</section>`;
    const region = current.company.region.trim();
    const matches = region ? D().policies.filter((item) => item.region === region || region.includes(item.region) || (item.region === '浙江省' && /杭州|浙江/.test(region))) : [];
    return `${pageHeader}<div class="section-heading"><p class="muted">按企业地区筛选 · ${matches.length} 个候选项目</p>${action('run-match', '重新检索', current.id, '', 'text-button')}</div><div class="policy-list">${matches.length ? matches.map((item) => `<article class="policy-card"><div class="policy-card-head"><span class="tag tag-muted">${E(item.region)}</span>${current.policyId === item.id ? '<span class="tag tag-success">当前项目</span>' : ''}</div><h2>${E(item.title)}</h2><p>${E(item.summary)}</p><p class="muted">${E(item.sourceLabel)} · ${item.template ? '有组稿模板' : '暂无组稿模板'}</p><div class="policy-reasons"><h3>匹配依据</h3><ul><li>企业注册地区为${E(current.company.region)}，位于此演示项目范围内。</li><li>${current.sources.some((source) => source.id === 'research-project' && source.provided) ? '已有研发项目资料，可继续对照具体条件。' : '研发、财务等条件仍需根据资料核实。'}</li></ul></div>${route('policy', '查看条件与解读', current.id, item.id, 'button button-secondary')}</article>`).join('') : `<div class="empty-state"><h2>当前地区暂无演示项目</h2><p class="muted">可以核对企业地区，或使用杭州示例企业体验流程。</p>${route('profile', '核对企业档案', current.id)}</div>`}</div>`;
  }

  function diagnosis(taskId) {
    const current = S().getTask(taskId);
    if (!current) return notFound();
    const pageHeader = header('诊断申报差距', current.title, route('task', '返回项目', current.id));
    if (!current.steps.profile || !current.steps.match) return `${pageHeader}<section class="empty-state"><h2>先确认企业信息与申报项目</h2><p class="muted">有了企业档案和政策条件，才能对照资料清单。</p>${route(!current.steps.profile ? 'profile' : 'policy', !current.steps.profile ? '核对企业档案' : '检索适用政策', current.id, '', 'button button-primary')}</section>`;
    if (!current.steps.diagnosis) return `${pageHeader}<section class="content-panel"><h2>对照申报材料清单</h2><p class="muted">分别标出资料缺失、条件未满足和信息待核实。</p>${action('run-diagnosis', '核对申报差距', current.id, '', 'button button-primary')}</section>`;
    const count = stats(current);
    const item = getPolicy(current.policyId) || D().policies[0];
    return `${pageHeader}<div class="diagnosis-overview"><section class="content-panel"><h2>已具备 ${count.ready}/${count.total} 项</h2><p>${E(missingSummary(current))}</p><progress class="readiness-progress" value="${count.ready}" max="${Math.max(1, count.total)}" aria-label="申报准备情况：已具备 ${count.ready} 项，共 ${count.total} 项"></progress><p class="muted">这是材料准备情况，具体政策条件仍需逐项核实。</p></section><section class="content-panel">${mockScore(item)}</section></div><section class="requirements-section"><div class="section-heading"><h2>准备清单</h2>${route('assembly', '查看组稿模板', current.id, '', 'text-button')}</div><div class="requirement-list">${current.requirements.map((requirement) => {
      const source = current.sources.find((entry) => entry.id === requirement.sourceId);
      const canProvide = requirement.kind === 'material' && ['missing', 'unknown'].includes(requirement.status);
      return `<article class="requirement-row"><div class="requirement-main"><div class="requirement-heading"><h3>${E(requirement.label)}</h3><span class="tag ${statusClasses[requirement.status]}">${statusLabels[requirement.status]}</span></div><p>${E(requirement.evidence || '尚未提供核对依据。')}</p><p class="muted">${requirement.kind === 'condition' ? '条件要求' : '材料要求'}${source ? ` · 来源：${E(source.name)}` : ''}</p></div><div class="requirement-actions">${source?.provided ? action('view-source', '查看来源', current.id, source.id, 'text-button') : ''}${canProvide ? action('view-source', '录入资料', current.id, requirement.sourceId, 'text-button') + action('mark-ready', '补充示例资料', current.id, requirement.id, 'button button-secondary') : requirement.status === 'unmet' ? '<span class="muted">需补充改进证据后重新核对</span>' : requirement.status === 'unknown' ? '<span class="muted">待补充核对依据</span>' : ''}</div></article>`;
    }).join('')}</div></section><section class="next-suggestion"><h2>接下来怎么做</h2><p>${count.gap ? '先补齐缺失资料。尚未提供证据的条件保留待核实，不能直接判断不符合。' : '资料清单已具备，可以按模板整理，并逐段核对内容来源。'}</p>${route('assembly', '进入材料组稿', current.id, '', 'button button-primary')}</section>`;
  }

  function guidance(taskId) {
    const current = S().getTask(taskId);
    if (!current) return notFound();
    const count = stats(current);
    const pending = [!current.steps.profile ? '确认企业基本信息' : '', !current.steps.match ? '核对适用政策及正式办理要求' : '', count.gap ? `处理 ${count.gap} 项资料或条件缺口` : '', !current.steps.assembly ? '按模板整理并保存材料版本' : '', !current.steps.review ? '人工核对并确认材料版本' : ''].filter(Boolean);
    return `${header('办理指引', current.title, route('task', '返回项目', current.id))}<section class="content-panel"><h2>提交前的三件事</h2><ol class="guidance-steps"><li><span class="step-number">1</span><div><h3>核实正式政策与窗口</h3><p>核对主管部门发布的政策原文、申报期限和受理渠道。当前演示项目没有真实办理入口。</p>${route('policy', '回看项目条件', current.id, current.policyId, 'text-button')}</div></li><li><span class="step-number">2</span><div><h3>检查材料与授权</h3><p>核对企业名称、证明材料、签字盖章与附件要求，确保所用资料为当前有效版本。</p>${route('diagnosis', '检查准备清单', current.id, '', 'text-button')}</div></li><li><span class="step-number">3</span><div><h3>确认版本，再按官方渠道办理</h3><p>由企业相关负责人核对最终材料并提交，保留受理凭证。这里不会发起真实申报。</p>${route('assembly', '查看材料版本', current.id, '', 'text-button')}</div></li></ol></section><section class="content-panel pending-checklist"><h2>${pending.length ? '当前待完成' : '本平台材料准备已确认'}</h2>${pending.length ? `<ul class="reading-list">${pending.map((entry) => `<li>${E(entry)}</li>`).join('')}</ul>` : '<p class="muted">后续仍需按正式政策要求核对和办理，材料确认不代表政府受理或审核通过。</p>'}</section>`;
  }

  window.PolicyViews = Object.freeze({ dashboard, newTask, services, task, profile, policy, diagnosis, guidance });
})();
