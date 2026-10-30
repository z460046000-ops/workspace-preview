/* 项目与事项分开的本地对话；回答读取当前资料，业务执行只由明确按钮触发。 */
(() => {
  'use strict';
  const S = () => window.PolicyStore;
  const U = () => window.PolicyUI;
  const drafts = new Map();
  const experts = {
    profile: { id: 'company-assistant', name: '企业资料助理', subject: '企业档案', icon: 'building', portrait: [0, 0], prompts: ['企业档案还缺什么？', '哪些资料已经提供？'], placeholder: '补充企业情况，或问问档案还缺什么……' },
    match: { id: 'policy-adviser', name: '政策匹配顾问', subject: '政策匹配', icon: 'search', portrait: [1, 0], prompts: ['为什么匹配这个政策？', '申报条件是什么？'], placeholder: '问问匹配原因、政策条件或适用范围……' },
    diagnosis: { id: 'application-adviser', name: '申报诊断顾问', subject: '差距诊断', icon: 'check', portrait: [2, 0], prompts: ['还差哪些材料？', '应该先补什么？'], placeholder: '问问当前缺口，或需要补充哪些证明……' },
    assembly: { id: 'material-editor', name: '材料组稿专员', subject: '材料组稿', icon: 'file', portrait: [0, 1], prompts: ['现在可以开始组稿吗？', '材料正文依据什么？'], placeholder: '说明组稿要求，或问问章节和资料来源……' },
    review: { id: 'material-reviewer', name: '材料核对顾问', subject: '人工确认', icon: 'book', portrait: [1, 1], prompts: ['这个版本还要核对什么？', '有哪些历史版本？'], placeholder: '问问当前版本、引用来源或待核对内容……' },
    general: { id: 'policy-adviser', name: '政策顾问', subject: '项目沟通', icon: 'book', portrait: [1, 0], prompts: ['当前项目进展如何？', '接下来先处理什么？'], placeholder: '问问项目进度、资料缺口或材料版本……' },
  };
  const validWork = value => Object.hasOwn(experts, value) ? value : 'general';
  const versionsFor = task => S().getState().versions.filter(version => version.taskId === task.id).sort((a, b) => b.number - a.number);
  const policyFor = task => window.PolicyData.policies.find(policy => policy.id === task.policyId);
  const incomplete = task => task.requirements.filter(item => item.status !== 'ready');
  const keyFor = (taskId, workId) => `${taskId}:${workId}`;
  const summary = task => `${Object.values(task.steps).filter(Boolean).length}/5 项工作已完成；资料准备 ${task.requirements.filter(item => item.status === 'ready').length}/${task.requirements.length} 项。`;
  const gapsText = task => {
    const missing = task.requirements.filter(item => item.status === 'missing');
    const unknown = task.requirements.filter(item => item.status === 'unknown');
    const unmet = task.requirements.filter(item => item.status === 'unmet');
    const parts = [];
    if (missing.length) parts.push(`待补资料：${missing.map(item => item.label).join('、')}。`);
    if (unknown.length) parts.push(`待核实：${unknown.map(item => item.label).join('、')}。`);
    if (unmet.length) parts.push(`当前不满足的条件：${unmet.map(item => item.label).join('、')}。`);
    return parts.join('\n') || '资料清单已具备，正文和有效性仍需人工核对。';
  };

  function answer(task, message = '', requestedWork = 'general') {
    const workId = validWork(requestedWork);
    const policy = policyFor(task);
    const versions = versionsFor(task);
    const latest = versions[0];
    const gaps = incomplete(task);
    if (/成功|概率|几率|获批/.test(message)) return '当前展示的预估成功率为 78%（模拟值），尚未接入预测模型。资料准备度和获批概率是两回事，补齐资料不会自动改变这个数值。';
    if (/已经(?:查|匹配|保存|补)|帮我(?:查|匹配|保存|补|生成|组稿)|开始(?:查|匹配|组稿)|直接(?:查|保存|生成)/.test(message)) {
      return '可以。请使用下方的操作入口继续，对话本身不会检索政策、修改企业档案或保存材料版本。' + (workId === 'assembly' ? '\n进入组稿编辑器后可按资料整理章节，并保存新版本。' : '');
    }
    if (/版本|历史|保存/.test(message)) {
      return latest ? `本项目已保存 ${versions.length} 个材料版本，最新为 V${latest.number}（${latest.status === 'confirmed' ? '已确认' : '待核对'}）。每个版本保留当时的正文和引用资料，修改后需要另存新版本。` : '本项目还没有保存材料版本。先进入材料组稿，核对章节与来源后，再保存首版。';
    }
    if (/来源|依据|正文|引用/.test(message) && ['assembly', 'review'].includes(workId)) {
      const available = task.sources.filter(source => source.provided && source.text.trim());
      return `当前可用来源 ${available.length} 份：${available.map(source => source.name).join('、') || '尚未提供'}。组稿只组织这些资料，缺失事实保留待补；保存的版本会同时保留引用快照。`;
    }
    if (/进度|进展|处理什么|接下来/.test(message)) return `${summary(task)}\n${gapsText(task)}\n可以先处理需要你补充或核对的事项；已有资料支持的工作可以继续准备。`;
    if (workId === 'profile') {
      const fields = [['name', '企业名称'], ['region', '地区'], ['industry', '行业']].filter(([field]) => !String(task.company[field] || '').trim()).map(([, label]) => label);
      const available = task.sources.filter(source => source.provided && source.text.trim());
      if (/已经|哪些资料|已提供/.test(message)) return available.length ? `本项目目前有 ${available.length} 份资料：${available.map(source => source.name).join('、')}。可以打开资料正文核对，不能仅凭文件名称认定条件满足。` : '本项目尚未录入资料。请先核对企业名称、注册地区、行业，再补充对应的企业资料。';
      return fields.length ? `企业档案还缺：${fields.join('、')}。先补充这些基本信息，已有资料也可以同时整理。` : `${task.company.name}，${task.company.region}，${task.company.industry}。${task.steps.profile ? '企业档案已确认。' : '基本信息已录入，尚待你确认。'}当前可用资料 ${available.length} 份，修改企业事实后需要重新核对政策匹配。`;
    }
    if (workId === 'match') {
      if (!task.steps.profile) return '企业地区和行业尚未确认，可以先了解政策要求；针对企业的匹配需要先核对档案。';
      if (!task.steps.match) return `将按${task.company.region}、${task.company.industry}和申报目标筛选候选政策。请点击“查找候选政策”执行，当前尚未生成本轮匹配结果。`;
      if (/条件|范围|要求/.test(message)) return `${policy.title}\n${policy.conditions.join('\n')}\n以上条件来自当前政策模板，实际申报仍需核对正式文件。`;
      return `${policy.title}\n当前匹配依据：\n${policy.matchedReasons.join('\n')}\n这是候选项目，仍需结合具体条件和企业证明资料核对。`;
    }
    if (workId === 'diagnosis') {
      if (!task.steps.profile || !task.steps.match) return '差距核对需要已确认的企业档案和候选政策。你可以先了解材料要求，完成匹配后再对照企业资料。';
      if (!task.steps.diagnosis) return `已选政策：${policy.title}。请点击“核对申报差距”，对照资料清单生成当前结果。`;
      return `${gapsText(task)}\n缺少证明材料表示尚不能判断，不等于企业不符合条件。补充后可以继续核对。`;
    }
    if (workId === 'assembly') {
      if (!task.steps.profile || !task.steps.match || !task.steps.diagnosis) return '组稿前先确认企业档案、选择政策并核对材料清单。已有资料可以先整理，缺失资料不应编入正文。';
      if (!policy.template) return '当前项目没有申报模板，可先整理材料清单与填写指引。模板明确后再按章节组稿。';
      return gaps.length ? `${gapsText(task)}\n可用已有资料先整理草稿，缺口会保留待补。进入组稿编辑器后，核对章节和来源再保存。` : '资料清单已具备，可以按模板整理草稿。请在编辑器中核对章节、引用来源与企业事实，再保存新版本。';
    }
    if (workId === 'review') {
      if (!latest) return '当前尚无可核对的材料版本。先在组稿编辑器保存首版，再逐段核对正文与引用来源。';
      const pending = latest.sections.filter(section => /[【\[]待(?:补(?:充)?|核对)[】\]]/.test(section.body));
      if (latest.status === 'confirmed') return `V${latest.number} 已由你确认。可以查看正文和引用快照；后续修改请保存新版本。材料确认不代表已向政府提交或获批。`;
      return `待核对版本：V${latest.number}。${gaps.length ? `还有 ${gaps.length} 项资料或条件待处理。` : '准备清单已具备。'}${pending.length ? `其中 ${pending.length} 个章节保留待补或待核对标记。` : ''}\n请核对企业事实、财务口径与引用来源，最终确认由你完成。`;
    }
    if (!task.steps.profile) return '先核对企业档案，确认地区、行业和可用资料。政策资料可以同时了解，针对企业的判断需要这些基本信息。';
    if (!task.steps.match) return '企业档案已确认，可以查找候选政策，也可以继续补充企业资料。';
    if (!task.steps.diagnosis) return '候选政策已确定，可以核对申报条件和材料差距。';
    return `${summary(task)}\n${gapsText(task)}${gaps.length ? '\n可以先准备已有资料支持的章节，缺失部分继续补充。' : '\n可继续整理草稿，并由你核对材料版本。'}`;
  }

  function actionFor(task, workId) {
    const latest = versionsFor(task)[0];
    if (workId === 'profile') return { route: 'profile', label: '核对企业档案', detail: '确认企业信息，查看并补充资料来源。' };
    if (workId === 'match') {
      if (!task.steps.profile) return { route: 'profile', label: '先核对企业档案', detail: '企业地区与行业确认后，可以筛选候选政策。' };
      return task.steps.match ? { route: 'policy', label: '查看候选政策', detail: '查看匹配原因、适用条件和材料要求。' } : { action: 'run-match', label: '查找候选政策', detail: '根据当前企业档案筛选政策。' };
    }
    if (workId === 'diagnosis') {
      if (!task.steps.profile) return { route: 'profile', label: '先核对企业档案', detail: '诊断需要企业信息和资料依据。' };
      if (!task.steps.match) return { route: 'policy', label: '先选择候选政策', detail: '明确申报要求后，再核对企业差距。' };
      return task.steps.diagnosis ? { route: 'diagnosis', label: '查看并补充缺口', detail: '逐项补充资料，核对待确认的条件。' } : { action: 'run-diagnosis', label: '核对申报差距', detail: '对照政策要求，核对已有资料和缺口。' };
    }
    if (workId === 'review') return latest ? { route: 'version', id: latest.id, label: `核对 V${latest.number}`, detail: '查看正文与来源，由你确认材料版本。' } : { route: 'assembly', label: '先保存材料草稿', detail: '保存首版后，才能核对正文与来源快照。' };
    if (workId === 'assembly') return { route: 'assembly', label: '进入材料组稿', detail: '按模板整理已有资料，保存后形成新版本。' };
    const next = !task.steps.profile ? 'profile' : !task.steps.match ? 'match' : !task.steps.diagnosis ? 'diagnosis' : !task.steps.assembly ? 'assembly' : 'review';
    return actionFor(task, next);
  }

  function render(taskId, requestedWork = 'general') {
    const task = S().getTask(taskId);
    if (!task) return '';
    const E = U().escape, I = U().icon;
    const workId = validWork(requestedWork);
    const expert = experts[workId];
    const action = actionFor(task, workId);
    const messages = (task.messages || []).filter(message => validWork(message.workId) === workId);
    const history = workId === 'general' ? [] : (task.messages || []).filter(message => validWork(message.workId) === 'general');
    const messageHtml = message => `<p class="chat-message chat-${message.role}"><span class="sr-only">${message.role === 'user' ? '你：' : E(experts[validWork(message.workId)].name) + '：'}</span>${E(message.text)}</p>`;
    const attrs = `${action.route ? `data-route="${action.route}"` : `data-action="${action.action}"`} data-task="${E(task.id)}" data-work="${workId}"${action.id ? ` data-id="${E(action.id)}"` : ''}`;
    return `<section class="adviser-card" data-chat-work="${workId}" aria-label="${E(expert.name)}对话">
      <header><span class="role-avatar chat-expert-avatar" aria-hidden="true" style="--portrait-x:${expert.portrait[0] * 50}%;--portrait-y:${expert.portrait[1] * 100}%"></span><div><h2>${E(expert.name)}</h2><span class="muted">${E(expert.subject)}</span></div></header>
      <div class="chat-messages" aria-live="polite"><p class="chat-message chat-assistant chat-context">${E(answer(task, '', workId))}</p>${messages.map(messageHtml).join('')}</div>
      <div class="chat-work-action"><div><strong>${E(action.label)}</strong><p class="muted">${E(action.detail)}</p></div><button class="button button-primary" ${attrs}>${E(action.label)} ${I('arrow')}</button></div>
      ${history.length ? `<details class="chat-project-history"><summary>项目历史对话 <span>${history.length} 条</span></summary><div class="chat-messages">${history.map(messageHtml).join('')}</div></details>` : ''}
      <div class="chat-suggestions">${expert.prompts.map(prompt => `<button data-action="chat-prompt" data-task="${E(task.id)}" data-work="${workId}" data-prompt="${E(prompt)}">${E(prompt.replace(/[？?]$/, ''))}</button>`).join('')}</div>
      <form id="adviser-chat-form" data-task="${E(task.id)}" data-work="${workId}"><label class="sr-only" for="adviser-message">向${E(expert.name)}提问</label><textarea id="adviser-message" name="message" rows="2" maxlength="2000" required placeholder="${E(expert.placeholder)}">${E(drafts.get(keyFor(task.id, workId)) || '')}</textarea><button type="submit" class="icon-button chat-send" aria-label="发送问题">${I('arrow')}</button></form>
    </section>`;
  }

  function send(taskId, message, requestedWork = 'general') {
    const task = S().getTask(taskId);
    const workId = validWork(requestedWork);
    const value = typeof message === 'string' ? message.trim().slice(0, 2000) : '';
    if (!task || !value) return;
    const expertId = experts[workId].id;
    const saved = S().updateTask(task.id, { selectedWorkId: workId, messages: [...(task.messages || []), { role: 'user', text: value, workId, expertId }, { role: 'assistant', text: answer(task, value, workId), workId, expertId }] });
    if (!saved) { U().toast('对话未能保存，请重试。'); return; }
    drafts.delete(keyFor(task.id, workId));
    U().refresh();
    const list = document.querySelector('.adviser-card > .chat-messages');
    if (list) list.scrollTop = list.scrollHeight;
    document.querySelector('#adviser-message')?.focus({ preventScroll: true });
  }
  document.addEventListener('input', event => {
    if (event.target.id !== 'adviser-message') return;
    const form = event.target.closest('form');
    if (form?.dataset.task) drafts.set(keyFor(form.dataset.task, validWork(form.dataset.work)), event.target.value.slice(0, 2000));
  });
  window.PolicyChat = Object.freeze({ render,
    handleClick(target) {
      if (target.dataset.action !== 'chat-prompt') return false;
      send(target.dataset.task, target.dataset.prompt, target.dataset.work);
      return true;
    },
    handleSubmit(form, event) {
      if (form.id !== 'adviser-chat-form') return false;
      event.preventDefault();
      send(form.dataset.task, new FormData(form).get('message') || '', form.dataset.work);
      return true;
    },
  });
})();
