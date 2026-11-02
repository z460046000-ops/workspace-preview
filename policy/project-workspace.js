/* 项目工作区：状态由已保存事实推导，不模拟后台并行执行。 */
(() => {
  'use strict';
  const definitions = [
    ['profile','企业档案',window.PolicyPersonas.get('profile').name],
    ['match','政策匹配',window.PolicyPersonas.get('match').name],
    ['diagnosis','差距诊断',window.PolicyPersonas.get('diagnosis').name],
    ['assembly','材料组稿',window.PolicyPersonas.get('assembly').name],
    ['review','人工确认',window.PolicyPersonas.get('review').name],
  ];
  const ranks = {waiting:0,review:0,ready:1,blocked:2,done:3};
  const orders = new Map();
  const S = () => window.PolicyStore;
  const U = () => window.PolicyUI;
  const capabilityDefinitions = [['profile','企业档案'],['match','政策匹配'],['interpret','条件解读'],['diagnosis','差距诊断'],['assembly','材料组稿'],['guidance','办理指引']];
  const validWork = value => definitions.some(([id]) => id === value) || ['interpret','guidance'].includes(value);
  const versionsFor = task => S().getState().versions.filter(v => v.taskId === task.id).sort((a,b) => b.number-a.number);

  function workItems(task) {
    const gaps = task.requirements.filter(item => item.status !== 'ready');
    const latest = versionsFor(task)[0];
    const stale = latest && (latest.policyId !== task.policyId || latest.companyName !== task.company.name || latest.sections.some(section => section.sourceQuotes.some(quote => {
      const current = task.sources.find(source => source.id === quote.id);
      return !current?.provided || current.text !== quote.text || current.name !== quote.name;
    })));
    const pending = latest && (!latest.sections.length || latest.sections.some(section => !section.body.trim() || /[【\[]待(?:补(?:充)?|核对)[】\]]/.test(section.body)));
    const states = {
      profile: task.steps.profile ? ['done','已确认','企业信息与资料来源已确认。'] : ['waiting','待你核对','确认企业地区、行业和资料来源。'],
      match: !task.steps.profile ? ['blocked','等待企业档案','企业信息确认后，可进行针对性匹配。'] : task.steps.match ? ['done','已匹配','候选政策与适用条件可查看。'] : ['ready','可查找政策','按企业画像查找候选政策。'],
      diagnosis: !task.steps.profile || !task.steps.match ? ['blocked','等待政策匹配','先明确企业画像和候选政策。'] : !task.steps.diagnosis ? ['ready','可核对差距','对照政策要求检查企业资料。'] : gaps.length ? ['waiting','等你补资料',`诊断已出，${gaps.length} 项资料或条件待处理。`] : ['done','缺口已补齐','清单已具备，正文仍需人工核对。'],
      assembly: !task.steps.profile || !task.steps.match || !task.steps.diagnosis ? ['blocked','等待差距诊断','核对资料后，按模板组织材料。'] : task.steps.assembly ? ['done','草稿已保存',latest ? `最新材料 V${latest.number}，可继续修改。` : '材料已整理，可查看保存记录。'] : ['ready','可整理草稿',gaps.length ? '已有资料可先组稿，缺口保留待补。' : '按模板组稿，核对引用后保存。'],
      review: task.steps.review ? ['done','已由你确认','材料准备已确认，后续按官方渠道办理。'] : !latest ? ['blocked','等待材料版本','先保存一版材料，再核对和确认。'] : gaps.length ? ['blocked','等待补齐资料',`尚有 ${gaps.length} 项资料或条件待处理。`] : stale ? ['blocked','需重新组稿','企业信息或来源已变更，请保存新版本。'] : pending ? ['blocked','等待草稿完善','当前版本仍有待补或待核对内容。'] : !task.steps.profile || !task.steps.match || !task.steps.diagnosis ? ['blocked','等待前置核对','先核对企业、政策和资料清单。'] : ['review','待你核对',`逐段核对 V${latest.number} 的正文和来源。`],
    };
    return definitions.map(([id,title,owner]) => {
      const [status,label,reason] = states[id];
      return {id,title,owner,status,label,reason,rank:ranks[status],done:task.steps[id] === true,blocked:status === 'blocked'};
    });
  }
  function selectedWork(task, requested) {
    if (validWork(requested)) return requested;
    if (validWork(task.selectedWorkId)) return task.selectedWorkId;
    return [...workItems(task)].sort((a,b) => a.rank-b.rank)[0].id;
  }
  function orderedItems(task) {
    const items = workItems(task);
    const previous = orders.get(task.id);
    if (previous) return previous.map(id => items.find(item => item.id === id));
    const sorted = [...items].sort((a,b) => a.rank-b.rank || definitions.findIndex(([id]) => id === a.id)-definitions.findIndex(([id]) => id === b.id));
    orders.set(task.id,sorted.map(item => item.id));
    return sorted;
  }
  function leave(taskId) { orders.delete(taskId); }
  function capabilityItems(task) {
    const base=workItems(task);
    return capabilityDefinitions.map(([id,title]) => {
      const existing=base.find(item=>item.id===id);
      if (existing) return existing;
      const hasPolicy=task.steps.match;
      return {id,title,owner:window.PolicyPersonas.get(id).name,status:'ready',label:id==='interpret' ? (hasPolicy?'可解读条件':'先了解要求') : '可咨询办理',reason:id==='interpret'?'逐项说明政策条件与材料要求。':'核对办理步骤、签章与官方提交渠道。',rank:1,done:false,blocked:false};
    });
  }
  function contentDestination(task, workId) {
    if (workId === 'review') {
      const latest = versionsFor(task)[0];
      return latest ? {route:'version',id:latest.id} : {route:'assembly'};
    }
    return {route:{profile:'profile',match:'policy',interpret:'policy',diagnosis:'diagnosis',assembly:'assembly',guidance:'guidance'}[workId] || 'profile'};
  }
  function documentContent(html) {
    const template = document.createElement('template');
    template.innerHTML = html;
    const header = template.content.querySelector('.page-header,.mat-header');
    if (header) {
      header.classList.add('workspace-document-heading');
      const title = header.querySelector('h1');
      if (title) { const replacement = document.createElement('h2'); replacement.textContent = title.textContent; title.replaceWith(replacement); }
      header.querySelectorAll('[data-route="task"],[data-route="dashboard"]').forEach(button => button.remove());
    }
    return template.innerHTML;
  }
  function renderContext(task, item, {content='',route='task',capabilities=false}={}) {
    const E=U().escape,I=U().icon;
    const versions=versionsFor(task);
    const policy=window.PolicyData.policies.find(p=>p.id === task.policyId);
    const ready=task.requirements.filter(r=>r.status === 'ready').length;
    const count=definitions.filter(([id])=>task.steps[id]).length;
    const persona=window.PolicyPersonas.get(item.id);
    const isDocumentOpen=!['task','expert'].includes(route);
    const routeButton=(route,label,id='') => `<button class="text-button" data-route="${route}" data-task="${E(task.id)}" data-work="${item.id}"${capabilities?' data-experts="1"':''}${id ? ` data-id="${E(id)}"` : ''}>${E(label)} ${I('arrow')}</button>`;
    let result='';
    if (item.id === 'profile') result=`<p>${task.steps.profile ? '企业档案已确认' : '企业档案待你确认'}</p>${routeButton('profile','查看企业档案')}`;
    else if (item.id === 'match') result=`<p>${task.steps.match ? E(policy?.title || '候选政策已就绪') : '尚未查找候选政策'}</p>${routeButton('policy','查看候选政策')}`;
    else if (item.id === 'interpret') result=task.steps.match ? `<p>${E(policy?.title || '')}</p><ul>${(policy?.conditions || []).map(condition=>`<li>${E(condition)}</li>`).join('')}</ul>${routeButton('policy','查看条件与材料')}` : `<p>先明确候选政策，再逐条解读适用对象、条件和材料要求。</p>${routeButton('policy','查看候选政策')}`;
    else if (item.id === 'guidance') result=`<p>核对申报批次、截止时间、签章及材料版本。</p>${routeButton('guidance','查看办理清单')}${versions[0]?routeButton('version',`查看 V${versions[0].number}`,versions[0].id):''}`;
    else if (item.id === 'diagnosis') result=task.steps.diagnosis ? `<p>已具备 ${ready}/${task.requirements.length} 项</p><ul>${task.requirements.filter(r=>r.status !== 'ready').map(r=>`<li>${E(r.label)}</li>`).join('') || '<li>清单已具备，待核对正文。</li>'}</ul>${routeButton('diagnosis','查看差距清单')}` : `<p>对照政策核对后，将在这里显示缺口。</p>${routeButton('diagnosis','核对申报差距')}`;
    else if (item.id === 'assembly') result=`<p>${versions.length ? `已保存 ${versions.length} 个版本` : '尚未保存材料版本'}</p>${routeButton('assembly','打开组稿编辑器')}`;
    else result=versions[0] ? `<p>V${versions[0].number} · ${versions[0].status === 'confirmed' ? '已确认' : '待核对'}</p>${routeButton('version','核对正文与来源',versions[0].id)}${routeButton('guidance','查看办理指引')}` : `<p>保存材料首版后，在这里核对。</p>${routeButton('assembly','整理材料')}`;
    const sourceList=[...task.sources].sort((a,b)=>Number(a.provided)-Number(b.provided));
    let documentHTML='';
    if (isDocumentOpen) {
      const template=document.createElement('template');
      template.innerHTML=content;
      const title=template.content.querySelector('h1,h2')?.textContent?.trim() || item.title;
      documentHTML=`<section class="workspace-document" aria-label="${E(title)}"><header class="workspace-document-toolbar"><button class="text-button" data-route="${capabilities?'expert':'task'}" data-task="${E(task.id)}" data-work="${item.id}"${capabilities?' data-experts="1"':''}>${I('arrow')} 返回项目资料</button><h2>${E(title)}</h2></header><div class="workspace-content" tabindex="0">${documentContent(content)}</div></section>`;
    }
    return `<aside class="workspace-context" tabindex="0" aria-label="项目资料与成果">
      <div class="workspace-context-index"${isDocumentOpen ? ' hidden' : ''}>
        <section class="context-card workspace-summary"><h2>项目摘要</h2><p class="context-company">${E(task.company.name || '企业档案待填写')}</p><dl><div><dt>地区</dt><dd>${E(task.company.region || '待填写')}</dd></div><div><dt>申报政策</dt><dd>${task.steps.match ? E(policy?.title || '待选择') : '待匹配'}</dd></div><div><dt>资料准备</dt><dd>${task.requirements.length ? `${ready}/${task.requirements.length} 项已具备` : '尚未建立准备清单'}</dd></div></dl><section class="project-progress" aria-label="整体项目进度"><div><span>整体项目进度</span><strong>${Math.round(count/5*100)}<small>%</small></strong></div><progress value="${count}" max="5" aria-label="${count}/5 项工作已完成"></progress><small>${count}/5 项工作已完成</small></section></section>
        <section class="context-card workspace-result" data-result-work="${item.id}"><header class="workspace-result-heading"><span class="context-expert-avatar" aria-hidden="true" style="--expert-x:${persona.x}%;--expert-y:${persona.y}%"></span><div><h2>${E(persona.name)}</h2><p>${E(item.title)} · ${E(item.label)}</p></div></header><div class="workspace-result-body">${result}</div></section>
        <section class="context-card workspace-source-list"><header class="context-card-heading"><h2>项目资料</h2><span>${task.sources.filter(source=>source.provided).length}/${task.sources.length} 已提供</span></header>${sourceList.length ? sourceList.map(source=>`<button data-action="view-source" data-provided="${source.provided}" data-task="${E(task.id)}" data-id="${E(source.id)}" data-work="${item.id}">${I('file')}<span>${E(source.name)}<small>${source.provided ? '已提供' : '待补充'}</small></span>${I('arrow')}</button>`).join('') : '<p class="muted">尚未提供资料</p>'}<div class="workspace-related-links">${routeButton('profile','企业档案')}${routeButton('policy','候选政策')}${routeButton('assembly','申报草稿')}</div><section class="workspace-version-list"><h3>材料版本</h3>${versions.length ? versions.map(version=>routeButton('version',`V${version.number} · ${version.status === 'confirmed' ? '已确认' : '待核对'}`,version.id)).join('') : '<p class="muted">尚未保存</p>'}</section></section>
      </div>${documentHTML}
    </aside>`;
  }
  function render(taskId,{workId,content='',route='task',capabilities=false}={}) {
    const task=S().getTask(taskId);
    if (!task) return '<div class="empty-state"><h1>没有找到这个项目</h1><button class="button button-secondary" data-route="dashboard">查看所有项目</button></div>';
    const E=U().escape,I=U().icon;
    const selected=selectedWork(task,workId);
    capabilities=capabilities || ['interpret','guidance'].includes(selected);
    const items=capabilities ? capabilityItems(task) : orderedItems(task);
    // 旧的材料核对会话保留独立身份，即使从六专家视图打开历史版本。
    const item=items.find(i=>i.id === selected) || workItems(task).find(i=>i.id===selected);
    const cards = items.map(work => {
      const persona = window.PolicyPersonas.get(work.id);
      const avatar = `<span class="work-expert-avatar" aria-hidden="true" style="--expert-x:${persona.x}%;--expert-y:${persona.y}%"></span>`;
      return `<button id="expert-tab-${work.id}" role="tab" aria-selected="${work.id === selected}" aria-controls="workspace-panel" tabindex="${work.id === selected ? '0' : '-1'}" class="work-status-card${work.id === selected ? ' is-selected' : ''}" data-status="${work.status}" data-action="workspace-expert" data-task="${E(task.id)}" data-work="${work.id}" aria-label="${E(work.owner)}，${E(work.title)}，${E(work.label)}" title="${E(work.reason)}"><div class="work-status-top"><span>${E(work.title)}</span><span>${E(work.label)}</span></div><div class="work-expert-identity">${avatar}<h2>${E(work.owner)}</h2></div></button>`;
    }).join('');
    const panel=window.PolicyChat.render(task.id,selected,{statusLabel:item.label});
    const panelLabel=items.some(i=>i.id===selected) ? `aria-labelledby="expert-tab-${selected}"` : `aria-label="${E(window.PolicyPersonas.get(selected).name)}对话"`;
    return `<div class="project-workspace" data-task="${E(task.id)}" data-work="${selected}" data-capabilities="${capabilities}" data-view-route="${E(route)}"><div class="workspace-body${!['task','expert'].includes(route) ? ' is-document-open' : ''}">
      <section class="workspace-main" aria-label="项目专家工作区">
        <header class="project-workspace-header"><div class="project-heading"><button class="icon-button" data-route="dashboard" aria-label="查看所有项目">${I('arrow')}</button><div><h1 title="${E(task.title)}">${E(task.title)}</h1><p class="muted">${E(task.company.name || '企业档案待填写')}</p></div></div></header>
        <section class="workspace-conversation" aria-label="专家协作"><div class="workspace-expert-strip"><button class="expert-scroll-control" type="button" data-action="workspace-expert-scroll" data-direction="-1" aria-label="向左查看更多专家" hidden disabled>${I('arrow')}</button><nav class="workspace-status-grid${capabilities?' is-capability-grid':''}" role="tablist" aria-label="项目专家与负责事项">${cards}</nav><button class="expert-scroll-control" type="button" data-action="workspace-expert-scroll" data-direction="1" aria-label="向右查看更多专家" hidden disabled>${I('arrow')}</button></div><section id="workspace-panel" class="workspace-panel" role="tabpanel" ${panelLabel}>${panel}</section></section>
      </section>${renderContext(task,item,{content,route,capabilities})}
    </div></div>`;
  }
  window.PolicyWorkspace=Object.freeze({workItems,selectedWork,orderedItems,contentDestination,leave,render});
})();
