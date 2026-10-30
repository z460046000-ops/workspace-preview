/* 路由、表单和演示操作。没有真实政策检索、AI调用或政府申报请求。 */
(() => {
  'use strict';
  const S = window.PolicyStore;
  const D = window.PolicyData;
  const V = window.PolicyViews;
  const M = window.PolicyMaterials;
  const page = document.querySelector('#page-content');
  const paths = {
    plus:'M12 5v14M5 12h14', grid:'M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z',
    layers:'m12 3 9 5-9 5-9-5 9-5ZM3 12l9 5 9-5M3 16l9 5 9-5', folder:'M3 7V5h6l2 2h10v13H3V7Z',
    file:'M14 3H5v18h14V8l-5-5ZM14 3v6h5M8 13h8M8 17h6', check:'m5 12 4 4L19 6',
    arrow:'M5 12h14m-5-5 5 5-5 5', search:'m16 16 5 5M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Z',
    building:'M5 21V3h14v18M2 21h20M9 7h1m4 0h1M9 11h1m4 0h1M10 21v-5h4v5',
    book:'M12 5C9 3 5 3 2 4v15c3-1 7-1 10 1m0-15c3-2 7-2 10-1v15c-3-1-7-1-10 1V5Z',
    route:'M5 4h14v5H5zM12 9v6M4 20h16M4 20v-5h16v5M12 15v5',
    menu:'M4 6h16M4 12h16M4 18h16', close:'m6 6 12 12M6 18 18 6', clock:'M12 7v5l3 2M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z',
    download:'M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5', alert:'M12 8v5m0 4h.01M12 3 2 21h20L12 3Z',
  };
  const escape = (value = '') => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const icon = (name) => `<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="${paths[name] || paths.file}"/></svg>`;
  let toastTimer;
  function toast(message) {
    const target = document.querySelector('#toast');
    clearTimeout(toastTimer);
    target.textContent = message;
    target.hidden = false;
    toastTimer = setTimeout(() => { target.hidden = true; }, 5200);
  }
  const allowedRoutes = new Set(['dashboard','new','services','library','task','profile','policy','diagnosis','assembly','guidance','version','compare','source']);
  function currentRoute() {
    const [route, raw = ''] = location.hash.slice(1).split('?');
    return { route: allowedRoutes.has(route) ? route : 'dashboard', params: Object.fromEntries(new URLSearchParams(raw)) };
  }
  function closeMenu() {
    document.body.classList.remove('menu-open');
    document.querySelector('.sidebar-backdrop').hidden = true;
    document.querySelector('[data-action="open-menu"]').setAttribute('aria-expanded','false');
  }
  function navigate(route, params = {}) {
    if (!allowedRoutes.has(route)) return;
    const query = new URLSearchParams(Object.entries(params).filter(([,value]) => value !== undefined && value !== null && value !== ''));
    const hash = `${route}${query.size ? '?' + query : ''}`;
    closeMenu();
    if (location.hash.slice(1) === hash) render();
    else location.hash = hash;
  }
  function sidebar() {
    const state = S.getState();
    const {route} = currentRoute();
    document.querySelectorAll('[data-nav]').forEach(link => {
      const active = link.dataset.nav === route || link.dataset.nav === 'library' && ['assembly','version','compare'].includes(route);
      link.classList.toggle('is-active',active);
      if (active) link.setAttribute('aria-current','page'); else link.removeAttribute('aria-current');
    });
    document.querySelector('#recent-projects').innerHTML = state.tasks.slice(0,4).map(task => `<button class="recent-project" data-route="task" data-task="${escape(task.id)}" title="${escape(task.title)}">${escape(task.title)}</button>`).join('');
    document.querySelector('#storage-status').textContent = state.storageError || state.loadWarning || '';
  }
  function renderSource(taskId, sourceId) {
    const task = S.getTask(taskId);
    const source = task?.sources.find(item => item.id === sourceId);
    if (!source) return '<div class="empty-state"><h1>没有找到这份资料</h1><button class="button button-secondary" data-route="dashboard">返回工作台</button></div>';
    return `<div class="source-page"><header class="page-header"><div><h1>${escape(source.name)}</h1><p class="muted">${escape(task.company.name)}</p></div><button class="button button-secondary" data-route="profile" data-task="${escape(task.id)}">返回企业档案</button></header><p class="source-context">${source.provided ? '当前资料已用于准备清单。修改后请重新核对材料；历史版本的引用保持原样。' : '录入这份资料的内容，保存后会更新对应的准备项。'}</p><form id="source-form" data-task="${escape(task.id)}" data-source="${escape(source.id)}"><label class="form-field" for="source-text" style="margin-top:26px"><span>资料内容</span></label><textarea id="source-text" name="text" class="source-editor" maxlength="40000" required placeholder="粘贴已确认的资料内容……">${escape(source.text)}</textarea><div class="form-actions"><span class="muted">只使用已提供的企业事实。</span><button type="submit" class="button button-primary">保存资料</button></div></form></div>`;
  }
  function render() {
    const {route,params} = currentRoute();
    const taskId = params.task || (['task','profile','diagnosis','assembly','guidance'].includes(route) ? params.id : '') || S.getState().activeTaskId;
    if (taskId && S.getTask(taskId) && S.getState().activeTaskId !== taskId) S.setActiveTask(taskId);
    const renderers = {
      dashboard:() => V.dashboard(), new:() => V.newTask({intent:params.intent}), services:() => V.services({type:params.type,query:params.query}),
      library:() => M.renderLibrary(), task:() => V.task(taskId), profile:() => V.profile(taskId), policy:() => V.policy(taskId,params.policy || params.id),
      diagnosis:() => V.diagnosis(taskId), assembly:() => M.renderAssembly(taskId), guidance:() => V.guidance(taskId),
      version:() => M.renderVersion(params.id), compare:() => M.renderCompare(params.left,params.right), source:() => renderSource(taskId,params.id),
    };
    try {
      page.innerHTML = renderers[route]();
      if(route === 'task' && S.getTask(taskId)) {
        const panel=page.querySelector('.task-overview>.content-panel');
        if(panel)panel.outerHTML=window.PolicyChat.render(taskId);
      }
    }
    catch (error) {
      console.error('页面呈现失败',error);
      page.innerHTML = '<section class="empty-state"><h1>当前页面未能打开</h1><p>已保存的任务会保留，请返回工作台重试。</p><button class="button button-primary" data-route="dashboard">返回工作台</button></section>';
    }
    sidebar();
    const title = page.querySelector('h1')?.textContent || '惠企政策平台';
    document.title = `${title} · 惠企政策平台`;
    page.focus({preventScroll:true});
    window.scrollTo({top:0,behavior:'instant'});
  }
  window.PolicyUI = Object.freeze({escape,icon,navigate,toast,refresh:render});
  document.querySelectorAll('[data-icon]').forEach(element => {element.innerHTML = icon(element.dataset.icon);});
  S.subscribe(sidebar);
  window.addEventListener('hashchange',render);
  document.addEventListener('keydown', event => { if (event.key === 'Escape') closeMenu(); });

  const sampleTexts = {
    'research-expenses':'【虚构演示资料】研发费用归集表摘要：演示年度研发费用为128万元，归属于“企业协同数据管理工具”项目。分项账目、归集口径及审计结果须由企业财务负责人核对。本资料只用于演示组稿流程。',
    'annual-financial':'【虚构演示资料】年度财务报告摘要：演示年度营业收入为860万元，研发费用为128万元。报表、科目口径及签字盖章须由企业财务负责人核对。本资料只用于演示组稿流程。',
  };
  function updateSource(task, sourceId, text) {
    const provided = Boolean(text.trim());
    const sources = task.sources.map(source => source.id === sourceId ? {...source,text:text.trim(),provided} : source);
    const requirements = task.requirements.map(item => item.sourceId === sourceId && item.kind === 'material' ? {...item,status:provided ? 'ready':'missing',evidence:provided ? '已提供资料正文，需人工核对内容与有效性。':'尚未提供这份资料。'} : item);
    return S.updateTask(task.id,{sources,requirements,status:requirements.some(item=>item.status !== 'ready') ? 'needs-input':'processing',steps:{assembly:false,review:false}});
  }
  function useService(serviceId, taskId) {
    const task = S.getTask(taskId || S.getState().activeTaskId);
    if (!task) { navigate('new',{intent:serviceId}); return; }
    const destinations = {profile:'profile',search:'policy',interpret:'policy',diagnosis:'diagnosis',assembly:'assembly',guidance:'guidance'};
    if (!destinations[serviceId]) return;
    navigate(destinations[serviceId],{task:task.id,...(serviceId === 'interpret' && task.steps.match ? {policy:task.policyId}:{})});
  }
  document.addEventListener('click', event => {
    const target = event.target instanceof Element ? event.target.closest('[data-action],[data-route]') : null;
    if (!target) return;
    if(window.PolicyChat.handleClick(target)) return;
    if (M.handleClick(target)) return;
    if (target.dataset.route) {
      const params = {};
      if (target.dataset.task) params.task = target.dataset.task;
      if (target.dataset.id) {
        if (target.dataset.route === 'policy') params.policy = target.dataset.id;
        else params.id = target.dataset.id;
      }
      navigate(target.dataset.route,params);return;
    }
    const action = target.dataset.action;
    const task = S.getTask(target.dataset.task || S.getState().activeTaskId);
    if (action === 'open-menu') {
      document.body.classList.add('menu-open');
      document.querySelector('.sidebar-backdrop').hidden = false;
      target.setAttribute('aria-expanded','true');
      document.querySelector('.sidebar .brand').focus();
    } else if (action === 'close-menu') { closeMenu(); document.querySelector('[data-action="open-menu"]').focus(); }
    else if (action === 'prompt-fill') {
      const input = page.querySelector('#task-request');
      if (input) { const addition = target.dataset.prompt || '';input.value = `${input.value.trim()}${input.value.trim() ? '\n':''}${addition}`.slice(0,5000);S.saveTaskDraft(input.value);input.focus(); }
    } else if (action === 'service-tab') navigate('services',{type:target.dataset.id});
    else if (action === 'service-use') useService(target.dataset.id,target.dataset.task);
    else if (action === 'team-use') navigate('new',{intent:target.dataset.id});
    else if (action === 'load-demo' && task) {
      const demo = D.createTaskSeed({loadDemo:true});
      S.updateTask(task.id,{company:demo.company,sources:demo.sources,requirements:demo.requirements,status:'processing',steps:{profile:true,match:false,diagnosis:false,assembly:false,review:false}});
      render();toast('已载入虚构企业资料，可以继续检索政策。');
    } else if (action === 'run-match' && task) {
      if (!task.steps.profile || !task.company.region || !task.company.industry) {toast('请先确认企业名称、地区与行业。');navigate('profile',{task:task.id});return;}
      S.updateTask(task.id,{steps:{match:true},status:'processing'});render();toast('已按地区筛选演示政策，具体条件请逐项核对。');
    } else if (action === 'choose-policy' && task) {
      const policy = D.policies.find(item=>item.id === target.dataset.id);
      if (!policy || !task.steps.profile || !task.steps.match) {toast('请先确认档案并检索候选项目。');return;}
      if (task.policyId !== policy.id) S.updateTask(task.id,{policyId:policy.id,status:'processing',steps:{diagnosis:false,assembly:false,review:false}});
      navigate('diagnosis',{task:task.id});
    } else if (action === 'run-diagnosis' && task) {
      if (!task.steps.profile || !task.steps.match) {navigate('task',{task:task.id});return;}
      const requirements = task.requirements.map(item => {
        if (item.kind !== 'material' || item.status === 'unmet') return item;
        const source = task.sources.find(source=>source.id === item.sourceId);
        return {...item,status:source?.provided && source.text.trim() ? 'ready':'missing',evidence:source?.provided && source.text.trim() ? '已提供资料，可继续核对正文与有效性。':'未提供对应证明材料，暂不能判断条件是否满足。'};
      });
      S.updateTask(task.id,{requirements,steps:{diagnosis:true},status:requirements.some(item=>item.status !== 'ready') ? 'needs-input':'processing'});
      render();toast('已核对材料清单。');
    } else if (action === 'mark-ready' && task) {
      const requirement = task.requirements.find(item=>item.id === target.dataset.id);
      if (!requirement || requirement.kind !== 'material' || !requirement.sourceId) return;
      const text = sampleTexts[requirement.sourceId] || D.createTaskSeed({loadDemo:true}).sources.find(item=>item.id === requirement.sourceId)?.text;
      if (!text) {navigate('source',{task:task.id,id:requirement.sourceId});return;}
      updateSource(task,requirement.sourceId,text);render();toast('已补充虚构示例资料，材料组稿前请核对来源。');
    } else if (action === 'view-source' && task) navigate('source',{task:task.id,id:target.dataset.id});
  });
  document.addEventListener('input', event => {
    if (event.target?.id === 'task-request') S.saveTaskDraft(event.target.value);
  });
  function formError(form,message) {
    let box = form.querySelector('.form-error');
    if (!box) {box=document.createElement('p');box.className='form-error';box.setAttribute('role','alert');form.prepend(box);}
    box.textContent=message;toast(message);
  }
  document.addEventListener('submit', event => {
    const form = event.target;
    if (!(form instanceof HTMLFormElement)) return;
    if(window.PolicyChat.handleSubmit(form,event)) return;
    if (M.handleSubmit(form,event)) return;
    event.preventDefault();
    const values = new FormData(form);
    const value = name=>String(values.get(name) || '').trim();
    if (form.id === 'new-task-form') {
      const request=value('request'),name=value('companyName'),region=value('region'),industry=value('industry');
      if (!request || !name || !region || !industry) {formError(form,'请填写企业名称、地区、行业和申报目标。');return;}
      const title = request.replace(/[\n\r]+/g,' ').slice(0,36);
      const task = S.createTask({title,request,company:{name,region,industry}});
      if (!task) {formError(form,'任务没有创建成功，请检查填写内容。');return;}
      S.saveTaskDraft('');navigate('profile',{task:task.id});toast('任务已建立，请确认企业档案与资料。');
    } else if (form.id === 'profile-form') {
      const task=S.getTask(form.dataset.task);
      if (!task || !value('name') || !value('region') || !value('industry')) {formError(form,'请填写企业名称、地区和行业。');return;}
      const employees=value('employees') === '' ? '' : Number(value('employees'));
      if (employees !== '' && (!Number.isSafeInteger(employees) || employees < 0)) {formError(form,'员工人数请填写非负整数。');return;}
      const company={name:value('name'),region:value('region'),industry:value('industry'),established:value('established'),employees};
      const changed=Object.entries(company).some(([key,input])=>task.company[key] !== input);
      const patch={company,steps:{profile:true}};
      if (changed) {patch.steps={profile:true,match:false,diagnosis:false,assembly:false,review:false};patch.status='processing';}
      if (!S.updateTask(task.id,patch)) {formError(form,'档案保存失败，请重试。');return;}
      navigate('policy',{task:task.id});toast('企业档案已确认。');
    } else if (form.id === 'services-search-form') navigate('services',{type:form.dataset.type,query:value('query')});
    else if (form.id === 'source-form') {
      const task=S.getTask(form.dataset.task);
      if (!task || !value('text')) {formError(form,'请填写资料正文。');return;}
      if (!updateSource(task,form.dataset.source,value('text'))) {formError(form,'资料未能保存，请重试。');return;}
      navigate('diagnosis',{task:task.id});toast('资料已保存，请重新组稿后核对新版本。');
    }
  });
  render();
})();
