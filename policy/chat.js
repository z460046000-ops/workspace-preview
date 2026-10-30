/* 基于当前任务状态的演示对话，不调用模型，不假装执行后台任务。 */
(() => {
  const S=()=>window.PolicyStore,U=()=>window.PolicyUI;
  function answer(task,message='') {
    const gaps=task.requirements.filter(item=>item.status !== 'ready');
    if(/成功|概率|几率|获批/.test(message))return '演示中的预估成功率固定为78%，没有接入预测模型。补齐资料只改变准备度，不能据此判断真实获批机会。';
    if(/版本|历史|保存/.test(message))return `当前项目已保存${S().getState().versions.filter(item=>item.taskId===task.id).length}个材料版本。进入申报材料库可以查看正文、引用来源和版本变化。`;
    if(!task.steps.profile)return '先核对企业档案。确认地区与行业后，再查找适用项目。';
    if(!task.steps.match)return '企业档案已确认，可以开始查找适用的演示政策。';
    if(!task.steps.diagnosis)return '已选好申报项目。下一步对照材料要求，核对企业还缺哪些资料。';
    if(/政策|条件|适合/.test(message))return `当前选择的是“${window.PolicyData.policies.find(item=>item.id===task.policyId)?.title}”。可在政策条件页核对适用范围和材料要求。演示政策不提供真实申报判断。`;
    if(gaps.length)return `还有${gaps.length}项需要补充或核对：${gaps.map(item=>item.label).join('、')}。可以先整理草稿，缺口保留待补，补齐并核对后才能确认版本。`;
    return '资料清单已具备，可以进入材料组稿。把已有资料整理到模板章节后，请核对来源，再保存新版本。';
  }
  function render(taskId) {
    const task=S().getTask(taskId),E=U().escape,I=U().icon;
    const gaps=task.requirements.some(item=>item.status !== 'ready');
    const next=!task.steps.profile?'profile':!task.steps.match?'policy':!task.steps.diagnosis || gaps?'diagnosis':'assembly';
    return `<section class="adviser-card" aria-label="政策顾问对话"><header><span class="adviser-mark">${I('book')}</span><h2>政策顾问</h2><span class="muted">演示对话</span></header><div class="chat-messages" aria-live="polite"><p class="chat-message chat-assistant">${E(answer(task))}</p>${(task.messages||[]).map(message=>`<p class="chat-message chat-${message.role}"><span class="sr-only">${message.role==='user'?'你：':'政策顾问：'}</span>${E(message.text)}</p>`).join('')}</div><div class="chat-suggestions"><button data-action="chat-prompt" data-task="${E(task.id)}" data-prompt="还缺哪些资料？">还缺哪些资料</button><button data-action="chat-prompt" data-task="${E(task.id)}" data-prompt="可以开始组稿吗？">可以开始组稿吗</button><button class="chat-next" data-route="${next}" data-task="${E(task.id)}">处理下一步 ${I('arrow')}</button></div><form id="adviser-chat-form" data-task="${E(task.id)}"><label class="sr-only" for="adviser-message">向政策顾问提问</label><textarea id="adviser-message" name="message" rows="2" maxlength="2000" required placeholder="问问政策条件、资料缺口或组稿进度……"></textarea><button type="submit" class="icon-button chat-send" aria-label="发送问题">${I('arrow')}</button></form></section>`;
  }
  function send(taskId,message) {
    const task=S().getTask(taskId);if(!task || !message.trim())return;
    S().updateTask(task.id,{messages:[...(task.messages||[]),{role:'user',text:message.trim().slice(0,2000)},{role:'assistant',text:answer(task,message)}].slice(-40)});
    U().refresh();const list=document.querySelector('.chat-messages');if(list)list.scrollTop=list.scrollHeight;
    document.querySelector('#adviser-message')?.focus({preventScroll:true});
  }
  window.PolicyChat=Object.freeze({render,
    handleClick(target){if(target.dataset.action!=='chat-prompt')return false;send(target.dataset.task,target.dataset.prompt);return true;},
    handleSubmit(form,event){if(form.id!=='adviser-chat-form')return false;event.preventDefault();send(form.dataset.task,new FormData(form).get('message')||'');return true;}
  });
})();
