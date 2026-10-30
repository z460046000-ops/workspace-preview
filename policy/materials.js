/* 申报材料：按已有资料组稿，保留版本和来源快照。 */
(() => {
  'use strict';

  const drafts = new Map();
  const defaultSections = [
    { id: 'company', title: '企业概况' },
    { id: 'research', title: '研发基础' },
    { id: 'statement', title: '申报说明' },
    { id: 'attachments', title: '附件清单' },
  ];
  const positiveStatuses = new Set(['met', 'ready', 'provided', 'complete', 'completed', 'satisfied', 'confirmed', 'fulfilled', 'passed']);
  const E = (value = '') => window.PolicyUI?.escape ? window.PolicyUI.escape(String(value)) : String(value).replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));
  const clone = (value) => JSON.parse(JSON.stringify(value));
  const ui = () => window.PolicyUI;
  const store = () => window.PolicyStore;
  const state = () => store()?.getState() || {};
  const taskById = (id) => store()?.getTask(id);
  const asArray = (value) => Array.isArray(value) ? value : value && typeof value === 'object' ? Object.values(value) : [];
  const allTasks = () => asArray(state().tasks);
  const allVersions = () => asArray(state().versions);
  const versionById = (id) => allVersions().find((version) => version.id === id);
  const versionsFor = (id) => allVersions().filter((version) => version.taskId === id);
  const policyFor = (task) => asArray(window.PolicyData?.policies).find((policy) => policy.id === task?.policyId);
  const companyName = (task) => typeof task?.company === 'string' ? task.company : task?.company?.name || task?.company?.companyName || '未命名企业';
  const sourceProvided = (source) => source?.provided === true || positiveStatuses.has(source?.status);
  const sectionList = (version) => asArray(version?.sections || version?.content?.sections);
  const versionLabel = (version) => {
    const value = version?.number ?? version?.versionNumber ?? version?.version ?? (versionsFor(version?.taskId).findIndex((item) => item.id === version?.id) + 1);
    return /^v/i.test(String(value)) ? String(value) : `V${value || 1}`;
  };
  const isConfirmed = (version) => version?.status === 'confirmed' || version?.confirmed === true || Boolean(version?.confirmedAt);
  const dateLabel = (value) => {
    if (!value) return '时间未记录';
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? String(value) : new Intl.DateTimeFormat('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false }).format(date);
  };
  const actionButton = (action, label, attributes = '', primary = false) => `<button type="button" class="mat-button${primary ? ' mat-primary' : ''}" data-action="${action}" ${attributes}>${E(label)}</button>`;

  function missingRequirements(task) {
    return asArray(task?.requirements).filter((requirement) => {
      if (requirement.required === false) return false;
      if (positiveStatuses.has(requirement.status) || requirement.fulfilled === true) return false;
      if (requirement.status) return true;
      return !asArray(task.sources).some((source) => source.id === requirement.sourceId && sourceProvided(source));
    });
  }

  function templateSections(task) {
    const template = policyFor(task)?.template;
    if (!template) return [];
    const configured = Array.isArray(template) ? template : asArray(template.sections || template.chapters);
    return (configured.length ? configured : defaultSections).map((section, index) => typeof section === 'string'
      ? { id: `section-${index + 1}`, title: section }
      : { id: section.id || `section-${index + 1}`, title: section.title || section.label || `第 ${index + 1} 章` });
  }

  function draftFor(task) {
    const previousDraft = drafts.get(task.id);
    if (!previousDraft || previousDraft.policyId !== task.policyId) {
      const latest = versionsFor(task.id).filter((version) => version.policyId === task.policyId).slice(-1)[0];
      drafts.set(task.id, {
        sections: latest ? clone(sectionList(latest)) : templateSections(task).map((section) => ({ ...section, body: '', sourceIds: [], sourceQuotes: [] })),
        note: '', baseVersionId: latest?.id || null, generated: Boolean(latest), policyId: task.policyId,
      });
    }
    const draft = drafts.get(task.id);
    if (!draft.sections.length && templateSections(task).length) draft.sections = templateSections(task).map((section) => ({ ...section, body: '', sourceIds: [], sourceQuotes: [] }));
    return drafts.get(task.id);
  }

  function quoteSnapshot(source) {
    return { id: source.id, name: source.name || '未命名资料', text: String(source.text || ''), type: source.type || '', provided: sourceProvided(source) };
  }

  function sourceDetails(quotes, className = '') {
    if (!quotes.length) return '<p class="mat-source-empty">暂无可引用资料，相关内容需补充后核对。</p>';
    return `<div class="mat-sources ${className}">${quotes.map((source) => `<details class="mat-source"><summary>${E(source.name || '未命名资料')}</summary><div class="mat-source-text">${E(source.text || '该资料尚未录入正文。')}</div></details>`).join('')}</div>`;
  }

  function sectionQuotes(section) {
    // 版本只读取保存时的摘录，不回取企业当前资料。
    return asArray(section.sourceQuotes).map((source) => ({ ...source, name: source.name || '未命名资料' }));
  }

  function assemble(task) {
    const sources = asArray(task.sources).filter((source) => sourceProvided(source));
    const missing = missingRequirements(task);
    return templateSections(task).map((section) => {
      const name = `${section.id} ${section.title}`;
      const attachments = /attachment|附件|清单/i.test(name);
      const pattern = /research|rnd|研发|技术/i.test(name) ? /research|rnd|研发|技术|专利|成果|知识产权|著作权/i
        : /statement|application|申报|说明/i.test(name) ? /statement|application|申报|项目|申请/i
          : /company|overview|企业|概况/i.test(name) ? /company|profile|企业|营业|工商|概况/i : null;
      const selected = attachments ? sources : sources.filter((source) => pattern?.test(`${source.type || ''} ${source.name || ''}`) && String(source.text || '').trim());
      let body;
      if (attachments) {
        body = selected.length ? selected.map((source, index) => `${index + 1}. ${source.name}`).join('\n') : '【待补】尚未提供附件材料。';
        if (missing.length) body += `\n\n待补材料与事项：\n${missing.map((requirement) => `【待补】${requirement.label || requirement.title || '待核对材料'}`).join('\n')}`;
      } else {
        body = selected.length ? selected.map((source) => `${source.name}\n${source.text}`).join('\n\n') : `【待补】请补充${section.title}所需资料。`;
      }
      return { ...section, body, sourceIds: selected.map((source) => source.id), sourceQuotes: selected.map(quoteSnapshot) };
    });
  }

  function pageHeader(context, title, subtitle, actions = '') {
    const companyContext = context && !['申报材料', '申报材料库', '材料版本', '版本对比'].includes(context) && context !== title ? context : '';
    const description = [companyContext, subtitle].filter(Boolean).join(' · ');
    return `<header class="mat-header"><div><h1>${E(title)}</h1>${description ? `<p class="mat-subtitle">${E(description)}</p>` : ''}</div>${actions ? `<div class="mat-header-actions">${actions}</div>` : ''}</header>`;
  }

  function assemblyPrerequisites(task) {
    return [
      { step: 'profile', title: '核对企业档案', action: 'mat-profile' },
      { step: 'match', title: '确认拟申报项目', action: 'mat-policy' },
      { step: 'diagnosis', title: '完成条件诊断', action: 'mat-diagnosis' },
    ].filter((item) => task.steps?.[item.step] !== true);
  }

  function checkAssemblyPrerequisites(task) {
    const pending = assemblyPrerequisites(task);
    if (!pending.length) return true;
    ui().toast(`请先${pending[0].title}，再整理申报材料。`);
    return false;
  }

  function noTask() {
    return `<div class="mat-page">${pageHeader('申报材料', '选择一个申报任务', '每份材料都归属于具体企业与申报项目。')}<div class="mat-empty"><h2>还没有可组稿的任务</h2><p>先确认企业情况与拟申报项目，再准备材料。</p>${actionButton('mat-new', '创建新任务', '', true)}</div></div>`;
  }

  function gapNotice(task) {
    const missing = missingRequirements(task);
    if (!asArray(task.sources).some(sourceProvided)) return '<aside class="mat-gap-notice"><strong>先准备企业资料</strong><p>补充企业介绍、项目记录和对应证明，再按已有资料组稿。</p><span>缺少事实的章节会标为待补，不自动填写企业数据。</span></aside>';
    if (!missing.length) return '<p class="mat-readiness mat-ready">必备资料已具备，请继续核对正文与引用来源。</p>';
    return `<aside class="mat-gap-notice"><strong>还有 ${missing.length} 项需要补充或核对</strong><p>${E(missing.map((requirement) => requirement.label || requirement.title).filter(Boolean).join('、'))}</p><span>可以先保存草稿，补齐并核对后再确认版本。</span></aside>`;
  }

  function renderAssembly(taskId) {
    const task = taskById(taskId);
    if (!task) return noTask();
    const policy = policyFor(task);
    const template = templateSections(task);
    const actions = actionButton('mat-library', '查看材料库') + actionButton('mat-diagnosis', '查看待补项', `data-task-id="${E(task.id)}"`);
    const prerequisites = assemblyPrerequisites(task);
    if (prerequisites.length) return `<div class="mat-page">${pageHeader(companyName(task), '材料组稿', policy?.title || task.title, actionButton('mat-library', '查看材料库'))}<section class="mat-prerequisites"><h2>组稿前，先确认这些信息</h2><p>企业档案、申报项目和条件核对完成后，再整理正文。</p><ol>${prerequisites.map((item) => `<li><span>${E(item.title)}</span>${actionButton(item.action, '去处理', `data-task-id="${E(task.id)}"`)}</li>`).join('')}</ol></section></div>`;
    const draft = draftFor(task);
    if (!template.length) {
      return `<div class="mat-page">${pageHeader(companyName(task), '准备申报材料', policy?.title || task.title, actions)}<div class="mat-no-template"><h2>尚未提供申报模板</h2><p>先整理材料清单，取得模板后再按章节组稿。</p></div>${gapNotice(task)}<section class="mat-material-checklist"><h2>现有材料</h2>${asArray(task.sources).length ? `<ul>${asArray(task.sources).map((source) => `<li><div><strong>${E(source.name)}</strong><span>${sourceProvided(source) ? '已提供' : '待补充'}</span></div>${sourceProvided(source) ? sourceDetails([quoteSnapshot(source)]) : ''}</li>`).join('')}</ul>` : '<p class="mat-muted">尚未添加材料。</p>'}</section></div>`;
    }
    const base = draft.baseVersionId ? versionById(draft.baseVersionId) : null;
    return `<div class="mat-page">${pageHeader(companyName(task), '材料组稿', policy?.title || task.title, actions)}${gapNotice(task)}<div class="mat-editor-layout"><nav class="mat-chapter-nav" aria-label="模板章节"><p>模板章节</p>${draft.sections.map((section, index) => `<button type="button" data-action="mat-section" data-section-index="${index}"><span>${String(index + 1).padStart(2, '0')}</span>${E(section.title)}</button>`).join('')}<small>依据已提供资料整理</small></nav><form id="assembly-form" data-material-task="${E(task.id)}" class="mat-editor-form"><div class="mat-editor-toolbar"><div><h2>申报材料草稿</h2><p>${base ? `基于 ${E(versionLabel(base))} 继续修改` : '先按资料组稿，再逐章核对与修改'}</p></div>${actionButton('mat-generate', '按已有资料组稿', `data-task-id="${E(task.id)}"`, !draft.generated)}</div>${draft.sections.map((section, index) => `<section class="mat-editor-section" id="mat-chapter-${index}"><label for="mat-section-${index}"><span>${String(index + 1).padStart(2, '0')}</span>${E(section.title)}</label><textarea id="mat-section-${index}" class="mat-editor" data-mat-section="${index}" rows="${index === 3 ? 7 : 9}" maxlength="40000" placeholder="按已有资料组稿后，在这里核对与修改。">${E(section.body || '')}</textarea><div class="mat-section-source-heading">本章引用资料</div>${sourceDetails(sectionQuotes(section))}</section>`).join('')}<section class="mat-save-section"><label for="mat-version-note">本次修改说明 <span>选填</span></label><input id="mat-version-note" type="text" maxlength="240" data-mat-note value="${E(draft.note)}" placeholder="例如：补充研发基础，核对附件名称"><p>保存后会新增一个版本，已保存的正文与来源会保留。</p><button type="submit" class="mat-button mat-primary">保存新版本</button></section></form></div></div>`;
  }

  function renderLibrary() {
    const tasks = allTasks();
    const versions = allVersions();
    const firstPair = tasks.map((task) => versionsFor(task.id)).find((list) => list.length > 1)?.slice(-2);
    const optionList = (selectedId) => versions.map((version) => {
      const task = taskById(version.taskId);
      return `<option value="${E(version.id)}"${version.id === selectedId ? ' selected' : ''}>${E(companyName(task))} · ${E(task?.title || version.taskTitle || '申报材料')} · ${E(versionLabel(version))}</option>`;
    }).join('');
    const versionOptions = optionList(firstPair?.[0]?.id);
    const newerOptions = optionList(firstPair?.[1]?.id || versions[1]?.id);
    return `<div class="mat-page">${pageHeader('', '申报材料库', '按企业与申报任务查看材料版本。', actionButton('mat-new', '创建新任务', '', true))}${!versions.length ? `<div class="mat-empty"><h2>材料库里还没有版本</h2><p>完成第一份组稿后，保存的材料会出现在这里。</p>${tasks[0] ? actionButton('mat-assembly', '去组稿', `data-task-id="${E(tasks[0].id)}"`, true) : actionButton('mat-new', '创建新任务', '', true)}</div>` : `<form id="version-compare-form" class="mat-compare-form"><div><h2>比较两个版本</h2><p>查看同一任务的正文和资料来源变化。</p></div><label><span>较早版本</span><select name="leftId" aria-label="较早版本">${versionOptions}</select></label><label><span>较新版本</span><select name="rightId" aria-label="较新版本">${newerOptions}</select></label><button type="submit" class="mat-button">比较版本</button></form>${tasks.filter((task) => versionsFor(task.id).length).map((task) => `<section class="mat-library-group"><header><div><p>${E(companyName(task))}</p><h2>${E(task.title)}</h2></div>${actionButton('mat-assembly', '继续组稿', `data-task-id="${E(task.id)}"`)}</header><div class="mat-version-list">${versionsFor(task.id).slice().reverse().map((version) => `<article class="mat-version-row"><div class="mat-version-number">${E(versionLabel(version))}</div><div class="mat-version-copy"><strong>${E(version.note || '申报材料组稿')}</strong><span>${E(dateLabel(version.createdAt))} · ${sectionList(version).length} 个章节</span></div><span class="mat-status ${isConfirmed(version) ? 'mat-status-confirmed' : ''}">${isConfirmed(version) ? '已确认' : '待核对'}</span>${actionButton('mat-version', '查看版本', `data-version-id="${E(version.id)}"`)}</article>`).join('')}</div></section>`).join('')}`}</div>`;
  }

  function confirmationBlockers(version, task) {
    const result = missingRequirements(task).map((requirement) => requirement.label || requirement.title || '必备资料待补');
    if (version.policyId !== task?.policyId) result.unshift('申报项目已变更，请重新组稿并保存新版本');
    const sources = asArray(task?.sources);
    const sourceChanged = sectionList(version).some((section) => sectionQuotes(section).some((quote) => {
      const current = sources.find((source) => source.id === quote.id);
      return !current || JSON.stringify(quoteSnapshot(current)) !== JSON.stringify(quoteSnapshot(quote));
    }));
    if (sourceChanged) result.unshift('资料已更新，请重新组稿并保存新版本');
    sectionList(version).forEach((section) => {
      if (!String(section.body || '').trim() || /[【\[]待(?:补(?:充)?|核对)[】\]]/.test(section.body)) result.push(`${section.title}尚待补充`);
    });
    if (!sectionList(version).length) result.push('尚无可确认的材料正文');
    return [...new Set(result)];
  }

  function renderVersion(versionId) {
    const version = versionById(versionId);
    if (!version) return `<div class="mat-page">${pageHeader('材料版本', '没有找到这个版本', '可以从材料库重新选择。', actionButton('mat-library', '返回材料库'))}</div>`;
    const task = taskById(version.taskId);
    const sections = sectionList(version);
    const blockers = confirmationBlockers(version, task);
    const confirmed = isConfirmed(version);
    const actions = actionButton('mat-library', '返回材料库') + actionButton('mat-download', '下载 .txt', `data-version-id="${E(version.id)}"`) + actionButton('mat-edit-version', '继续修改', `data-version-id="${E(version.id)}"`);
    return `<div class="mat-page">${pageHeader(version.companyName || companyName(task), `${versionLabel(version)} · ${version.taskTitle || task?.title || '申报材料'}`, `${dateLabel(version.createdAt)}${version.note ? ` · ${version.note}` : ''}`, actions)}<div class="mat-version-summary"><span class="mat-status ${confirmed ? 'mat-status-confirmed' : ''}">${confirmed ? '已确认' : '待核对'}</span><p>正文与引用资料按保存时的内容保留。</p></div><div class="mat-version-document">${sections.map((section, index) => `<section class="mat-readonly-section"><h2><span>${String(index + 1).padStart(2, '0')}</span>${E(section.title)}</h2><div class="mat-body-text">${E(section.body || '本章尚未填写。')}</div><h3>引用资料</h3>${sourceDetails(sectionQuotes(section))}</section>`).join('')}</div>${confirmed ? '<div class="mat-confirmation mat-confirmed"><strong>这个版本已经确认</strong><p>后续修改请保存为新版本，原内容继续保留。</p></div>' : `<section class="mat-confirmation"><div><h2>确认本次材料</h2>${blockers.length ? `<p>当前仍有 ${blockers.length} 项阻断，补齐后请重新组稿并保存新版本。</p><ul>${blockers.map((reason) => `<li>${E(reason)}</li>`).join('')}</ul>` : '<p>请逐章核对企业事实、文字和附件，再确认这个版本。</p>'}</div>${actionButton('mat-confirm', '确认这个版本', `data-version-id="${E(version.id)}"${blockers.length ? ' aria-disabled="true"' : ''}`, true)}</section>`}</div>`;
  }

  function diffBody(body = '', other = '') {
    const otherLines = new Set(String(other).split(/\n+/));
    return String(body).split('\n').map((line) => `<p class="mat-diff-line${line && !otherLines.has(line) ? ' mat-diff-changed' : ''}">${E(line) || '&nbsp;'}</p>`).join('');
  }

  function renderCompare(leftId, rightId) {
    const left = versionById(leftId);
    const right = versionById(rightId);
    if (!left || !right || left.taskId !== right.taskId || left.id === right.id) return `<div class="mat-page">${pageHeader('版本对比', '请选择同一任务的两个不同版本', '每个版本都可以从材料库查看。', actionButton('mat-library', '返回材料库'))}</div>`;
    const task = taskById(left.taskId);
    const before = sectionList(left);
    const after = sectionList(right);
    const ids = [...new Set([...before.map((section) => section.id), ...after.map((section) => section.id)])];
    const comparisons = ids.map((id) => {
      const previous = before.find((section) => section.id === id);
      const next = after.find((section) => section.id === id);
      const changed = previous && next && (previous.body !== next.body || JSON.stringify(sectionQuotes(previous)) !== JSON.stringify(sectionQuotes(next)));
      return { previous, next, label: !previous ? '新增' : !next ? '移除' : changed ? '修改' : '未改' };
    });
    const changes = comparisons.filter((item) => item.label !== '未改').length;
    return `<div class="mat-page">${pageHeader(companyName(task), `${versionLabel(left)} 与 ${versionLabel(right)}`, `${changes} 个章节有变化，${comparisons.length - changes} 个章节未改。`, actionButton('mat-library', '返回材料库'))}<div class="mat-compare-legend"><span><i class="mat-legend-changed"></i>本版修改的文字</span><span>正文及来源均按对应版本显示</span></div><div class="mat-compare-version-headings"><strong>${E(versionLabel(left))}<span>${E(dateLabel(left.createdAt))}</span></strong><strong>${E(versionLabel(right))}<span>${E(dateLabel(right.createdAt))}</span></strong></div>${comparisons.map(({ previous, next, label }) => `<section class="mat-comparison"><header><h2>${E(next?.title || previous?.title)}</h2><span class="mat-diff-label${label !== '未改' ? ' mat-diff-label-changed' : ''}">${label}</span></header><div class="mat-compare-columns"><div><h3 class="mat-mobile-version">${E(versionLabel(left))}</h3>${previous ? `<div class="mat-diff-body">${diffBody(previous.body, next?.body)}</div><h3>引用资料</h3>${sourceDetails(sectionQuotes(previous))}` : '<p class="mat-muted">本版没有这个章节。</p>'}</div><div><h3 class="mat-mobile-version">${E(versionLabel(right))}</h3>${next ? `<div class="mat-diff-body">${diffBody(next.body, previous?.body)}</div><h3>引用资料</h3>${sourceDetails(sectionQuotes(next))}` : '<p class="mat-muted">本版没有这个章节。</p>'}</div></div></section>`).join('')}</div>`;
  }

  function downloadVersion(version) {
    const sections = sectionList(version);
    const title = `${version.taskTitle || taskById(version.taskId)?.title || '申报材料'} · ${versionLabel(version)}`;
    const text = [title, `保存时间：${dateLabel(version.createdAt)}`, `修改说明：${version.note || '未填写'}`, '', ...sections.flatMap((section) => [section.title, section.body || '尚未填写', '', '引用资料：', ...sectionQuotes(section).flatMap((source) => [source.name, source.text || '未保存正文', '']), ''])].join('\n');
    const url = URL.createObjectURL(new Blob(['\uFEFF', text], { type: 'text/plain;charset=utf-8' }));
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `申报材料-${versionLabel(version).replace(/[^\w-]/g, '')}.txt`;
    document.body.append(anchor);
    anchor.click();
    anchor.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function handleClick(target) {
    const button = target instanceof Element ? target.closest('[data-action^="mat-"]') : null;
    if (!button) return false;
    const action = button.dataset.action;
    const taskId = button.dataset.taskId;
    const versionId = button.dataset.versionId;
    if (action === 'mat-new') ui().navigate('new');
    else if (action === 'mat-library') ui().navigate('library');
    else if (action === 'mat-assembly') ui().navigate('assembly', { task: taskId });
    else if (action === 'mat-diagnosis') ui().navigate('diagnosis', { task: taskId });
    else if (action === 'mat-profile') ui().navigate('profile', { task: taskId });
    else if (action === 'mat-policy') ui().navigate('policy', { task: taskId, id: taskById(taskId)?.policyId });
    else if (action === 'mat-version') ui().navigate('version', { id: versionId });
    else if (action === 'mat-section') {
      const editor = document.querySelector(`#mat-section-${Number(button.dataset.sectionIndex)}`);
      editor?.focus({ preventScroll: true });
      editor?.closest('.mat-editor-section')?.scrollIntoView({ block: 'start', behavior: 'auto' });
    } else if (action === 'mat-generate') {
      const task = taskById(taskId);
      if (!task || !templateSections(task).length) { ui().toast('取得申报模板后才能按章节组稿。'); return true; }
      if (!checkAssemblyPrerequisites(task)) return true;
      const draft = draftFor(task);
      if (draft.sections.some((section) => String(section.body || '').trim()) && !window.confirm('重新组稿将替换当前未保存的编辑。是否继续？')) return true;
      draft.sections = assemble(task);
      draft.generated = true;
      ui().refresh();
      ui().toast('已按现有资料整理，请逐章核对待补内容与来源。');
    } else if (action === 'mat-edit-version') {
      const version = versionById(versionId);
      const task = version && taskById(version.taskId);
      if (!task) { ui().toast('没有找到对应任务。'); return true; }
      drafts.set(task.id, { sections: clone(sectionList(version)), note: '', baseVersionId: version.id, generated: true, policyId: task.policyId });
      ui().navigate('assembly', { task: task.id });
    } else if (action === 'mat-download') {
      const version = versionById(versionId);
      if (version) downloadVersion(version);
      else ui().toast('没有找到这个版本。');
    } else if (action === 'mat-confirm') {
      const version = versionById(versionId);
      const task = version && taskById(version.taskId);
      if (!version || !task) { ui().toast('没有找到对应版本或任务。'); return true; }
      if (isConfirmed(version)) { ui().toast('这个版本已经确认。'); return true; }
      const blockers = confirmationBlockers(version, task);
      if (blockers.length) { ui().toast(`暂时不能确认：${blockers[0]}${blockers.length > 1 ? `等 ${blockers.length} 项待处理` : ''}。`); return true; }
      if (store().confirmVersion(version.id) !== true) { ui().toast('当前资料尚未满足确认要求，请核对待补项。'); return true; }
      store().updateTask(task.id, { status: 'done', steps: { ...task.steps, review: true } });
      ui().refresh();
      ui().toast('已确认这个材料版本。');
    }
    return true;
  }

  function handleSubmit(form, event) {
    if (form?.id === 'version-compare-form') {
      event?.preventDefault();
      const values = new FormData(form);
      const left = versionById(values.get('leftId'));
      const right = versionById(values.get('rightId'));
      if (!left || !right || left.id === right.id || left.taskId !== right.taskId) { ui().toast('请选择同一任务的两个不同版本。'); return true; }
      ui().navigate('compare', { left: left.id, right: right.id });
      return true;
    }
    if (form?.id !== 'assembly-form') return false;
    event?.preventDefault();
    const task = taskById(form.dataset.materialTask);
    if (!task || !templateSections(task).length) { ui().toast('尚未提供可用的任务或模板。'); return true; }
    if (!checkAssemblyPrerequisites(task)) return true;
    const draft = draftFor(task);
    if (!draft.sections.some((section) => String(section.body || '').trim())) { ui().toast('请先按已有资料组稿，或填写章节内容。'); return true; }
    const sections = clone(draft.sections);
    const version = store().saveVersion(task.id, sections, draft.note.trim());
    if (!version?.id) { ui().toast('材料未保存，请重试。'); return true; }
    store().updateTask(task.id, { status: 'review', steps: { ...task.steps, assembly: true, review: false } });
    draft.baseVersionId = version.id;
    draft.note = '';
    ui().navigate('version', { id: version.id });
    return true;
  }

  document.addEventListener('input', (event) => {
    const input = event.target instanceof Element ? event.target : null;
    const form = input?.closest('#assembly-form');
    if (!form) return;
    const task = taskById(form.dataset.materialTask);
    if (!task) return;
    const draft = draftFor(task);
    if (input.hasAttribute('data-mat-section')) {
      const section = draft.sections[Number(input.dataset.matSection)];
      if (section) section.body = input.value;
    } else if (input.hasAttribute('data-mat-note')) draft.note = input.value;
  });

  window.PolicyMaterials = Object.freeze({ renderAssembly, renderLibrary, renderVersion, renderCompare, handleClick, handleSubmit });
})();
