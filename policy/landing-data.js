/* 公开政策来源、角色分工与申报应用场景。 */
(() => {
  'use strict';
  const snapshot = Object.freeze({ date:'2026-10-30', timeZone:'Asia/Shanghai', asOf:'2026-10-30T12:00:00+08:00', countingUnit:'项目批次' });
  const policies = window.PolicyPublicPolicies || [];
  const regions = [...new Set(policies.map(item=>item.region))];
  const industries = ['物流行业','人工智能','金融行业','软件信息','先进制造','新能源','生命健康','现代服务'];
  const supportTypes = [...new Set(policies.map(item=>item.supportType))];
  const experts = [
    { id: 'enterprise-specialist', title: '企业资料助理', headline: '先把企业情况理清楚', description: '整理地区、行业、项目与资质信息，标出还需要补充的资料。', deliverables: ['企业画像', '资料缺口'], portraitIndex: 0, serviceId: 'profile' },
    { id: 'policy-matcher', title: '政策匹配顾问', headline: '找到值得进一步核对的政策', description: '围绕企业画像筛选候选项目，把地区、行业与项目方向的匹配原因说清楚。', deliverables: ['候选政策', '匹配原因'], portraitIndex: 1, serviceId: 'search' },
    { id: 'policy-interpreter', title: '政策解读专家', headline: '把申报条件讲明白', description: '拆解适用条件、申报时间与材料要求，留下需要人工确认的问题。', deliverables: ['条件摘要', '材料清单'], portraitIndex: 2, serviceId: 'interpret' },
    { id: 'application-adviser', title: '申报诊断顾问', headline: '还差什么，先补什么', description: '对照现有资料查找缺口，区分资料缺失、信息待核实与条件不满足。', deliverables: ['差距诊断', '补充建议'], portraitIndex: 3, serviceId: 'diagnosis' },
    { id: 'material-editor', title: '材料组稿专员', headline: '把已有资料整理进模板', description: '引用企业提供的资料组织章节，缺失内容明确留待补充，并保存修改版本。', deliverables: ['有来源的草稿', '版本对比'], portraitIndex: 4, serviceId: 'assembly' },
    { id: 'submission-guide', title: '办理指引助手', headline: '提交前，再逐项核对', description: '整理办理步骤与提交前检查事项，将需要企业确认的内容单独列出。', deliverables: ['办理步骤', '核对清单'], portraitIndex: 5, serviceId: 'guidance' },
  ];
  experts.forEach(expert => { expert.portraitIndex = window.PolicyPersonas.get(expert.serviceId).index; });
  const teams = [
    { id: 'company-checkup', title: '企业政策体检团', headline: '看看企业适合申请什么，还差什么', serviceIds: ['profile', 'search', 'interpret', 'diagnosis'], portraitIndices: [0, 3, 5], steps: ['建立企业画像', '查找候选政策', '核对条件差距'], deliverables: ['候选政策清单', '条件核对结果', '补充建议'] },
    { id: 'application-preparation', title: '申报材料准备团', headline: '把资料整理成一份可核对的申报草稿', serviceIds: ['profile', 'search', 'interpret', 'diagnosis', 'assembly', 'guidance'], portraitIndices: [2, 4, 1], steps: ['解读材料要求', '补齐企业资料', '按模板组稿', '人工确认版本'], deliverables: ['材料草稿', '章节来源', '历史版本'] },
  ];
  const cases = [
    {id:'software-research',title:'软件企业研发申报',industry:'软件信息',direction:'研发与创新',outcome:'研发资料有据可查',description:'把项目记录、成果证明与费用资料，整理到同一份申报任务。',steps:['查找研发类候选政策','补齐费用归集与财务资料','按模板组稿，保留引用来源'],taskId:'task-innovation'},
    {id:'manufacturing-upgrade',title:'制造企业数字化改造',industry:'先进制造',direction:'数字化转型',outcome:'项目投入逐项归集',description:'从应用场景、实施过程到投入凭证，把改造项目说清楚。',steps:['梳理改造项目与应用场景','核对实施记录和投入凭证','保存材料版本，比较修改内容'],taskId:'task-digital'},
    {id:'business-qualification',title:'科技企业资质培育',industry:'科技服务',direction:'企业成长',outcome:'申报条件逐项核对',description:'对照培育要求，归集企业资质与成果证明，找到下一步。',steps:['解读培育条件与申报要求','整理企业与技术成果证明','逐项核对正文、附件和办理步骤'],taskId:'task-review'},
  ];
  const deepFreeze = (value) => {
    if (value && typeof value === 'object' && !Object.isFrozen(value)) {
      Object.values(value).forEach(deepFreeze);
      Object.freeze(value);
    }
    return value;
  };
  window.PolicyLandingData = deepFreeze({ snapshot, regions, industries, supportTypes, policies, experts, teams, cases });
})();
