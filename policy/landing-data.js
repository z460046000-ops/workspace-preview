/* 落地页模拟数据。企业、项目、金额与政策条件均为虚构，不对应真实申报机会。 */
(() => {
  'use strict';
  const snapshot = Object.freeze({
    date: '2026-10-30', timeZone: 'Asia/Shanghai', asOf: '2026-10-30T12:00:00+08:00',
    isMock: true, label: '模拟数据', countingUnit: '项目批次',
    definition: '仅将统计日处于申报起止日期内的申报通知计为申报中；公告、公示及日期待明确项不计入当前机会。',
  });
  const regions = ['浙江省', '广东省', '北京市', '江苏省', '上海市', '全国'];
  const industries = ['软件信息', '先进制造', '新能源', '生命健康', '现代服务'];
  const supportTypes = ['研发支持', '人才奖励', '数字化改造', '资质培育', '税收优惠'];
  // 日期是本演示场景的固定日期，不随访问时间改写。项目与批次一一对应，避免重复统计。
  const rows = [
    ['zj-rd', '研发协同创新支持计划', '浙江省', ['软件信息', '先进制造'], '研发支持', '2026-10-12', '2026-10-19', '2026-11-20', 'innovation-support'],
    ['gd-digital', '制造企业数字协作提升计划', '广东省', ['先进制造', '软件信息'], '数字化改造', '2026-10-08', '2026-10-15', '2026-11-16', 'digital-upgrade'],
    ['bj-talent', '产业技术人才成长支持项目', '北京市', ['软件信息', '生命健康'], '人才奖励', '2026-10-16', '2026-10-21', '2026-11-27', 'growth-consulting'],
    ['js-green', '绿色工艺研发协同计划', '江苏省', ['新能源', '先进制造'], '研发支持', '2026-10-14', '2026-10-20', '2026-11-18', 'innovation-support'],
    ['sh-health', '健康技术成果应用培育计划', '上海市', ['生命健康'], '资质培育', '2026-10-15', '2026-10-22', '2026-11-25', 'growth-consulting'],
    ['cn-data', '跨区域数据协作应用计划', '全国', ['软件信息', '现代服务'], '数字化改造', '2026-10-10', '2026-10-16', '2026-11-30', 'digital-upgrade'],
    ['zj-service', '服务企业创新能力培育项目', '浙江省', ['现代服务'], '资质培育', '2026-10-19', '2026-10-26', '2026-11-23', 'growth-consulting'],
    ['gd-newenergy', '新能源部件研发验证支持计划', '广东省', ['新能源', '先进制造'], '研发支持', '2026-10-20', '2026-10-27', '2026-11-24', 'innovation-support'],
    ['bj-workflow', '企业业务流程数字化提升计划', '北京市', ['现代服务', '软件信息'], '数字化改造', '2026-10-09', '2026-10-15', '2026-11-12', 'digital-upgrade'],
    ['js-talent', '先进制造技术骨干培养项目', '江苏省', ['先进制造'], '人才奖励', '2026-10-13', '2026-10-19', '2026-11-19', 'growth-consulting'],
    ['sh-rd', '生物技术研发记录规范化计划', '上海市', ['生命健康', '软件信息'], '研发支持', '2026-10-18', '2026-10-23', '2026-11-26', 'innovation-support'],
    ['cn-growth', '创新型服务企业成长培育计划', '全国', ['现代服务', '软件信息'], '资质培育', '2026-10-11', '2026-10-18', '2026-11-21', 'growth-consulting'],
    ['zj-tax', '研发活动税惠资料辅导项目', '浙江省', ['软件信息', '生命健康'], '税收优惠', '2026-10-21', '2026-10-28', '2026-11-28', 'innovation-support'],
    ['gd-talent', '产业软件人才实践支持项目', '广东省', ['软件信息'], '人才奖励', '2026-10-22', '2026-10-29', '2026-11-29', 'growth-consulting'],
    ['bj-energy', '能源管理应用试点培育计划', '北京市', ['新能源', '现代服务'], '资质培育', '2026-10-17', '2026-10-24', '2026-11-17', 'growth-consulting'],
    ['js-tax', '制造研发税惠资料规范项目', '江苏省', ['先进制造', '新能源'], '税收优惠', '2026-10-23', '2026-10-29', '2026-11-22', 'innovation-support'],
    ['sh-service', '专业服务数字协同支持计划', '上海市', ['现代服务'], '数字化改造', '2026-10-24', '2026-10-30', '2026-11-30', 'digital-upgrade'],
    ['cn-green', '低碳技术联合验证支持项目', '全国', ['新能源'], '研发支持', '2026-10-25', '2026-10-30', '2026-12-04', 'innovation-support'],
    ['zj-next', '新材料企业数字管理提升计划', '浙江省', ['先进制造'], '数字化改造', '2026-10-27', '2026-11-05', '2026-12-05', 'digital-upgrade'],
    ['gd-next', '生命健康青年研发人才支持项目', '广东省', ['生命健康'], '人才奖励', '2026-10-28', '2026-11-09', '2026-12-09', 'growth-consulting'],
    ['bj-closed', '软件产品研发试验支持项目', '北京市', ['软件信息'], '研发支持', '2026-09-18', '2026-09-25', '2026-10-23', 'innovation-support'],
    ['js-pending', '企业创新能力提升储备项目', '江苏省', ['先进制造', '现代服务'], '资质培育', '2026-10-29', null, null, 'growth-consulting'],
    ['sh-notice', '数字化项目材料整理规范说明', '上海市', ['软件信息', '现代服务'], '数字化改造', '2026-10-28', null, null, 'digital-upgrade', '政策公告'],
    ['cn-results', '联合创新培育项目入选结果', '全国', ['新能源', '生命健康'], '资质培育', '2026-10-29', null, null, 'growth-consulting', '结果公示'],
  ];
  const explanations = {
    '研发支持': { summary: '围绕研发项目记录、知识产权与费用资料，演示候选政策筛选及申报准备。', condition: '可提供研发项目过程记录与对应成果资料。', material: '研发项目记录、知识产权证明、研发费用归集资料' },
    '人才奖励': { summary: '围绕岗位、人员与项目经历，演示人才类项目的条件核对及资料准备。', condition: '可提供项目人员、任职与相关实践经历的证明资料。', material: '岗位与人员情况、项目经历记录、相关证明资料' },
    '数字化改造': { summary: '围绕业务应用场景、实施过程与投入依据，演示数字化项目材料准备。', condition: '可说明数字化应用场景，并提供实施过程记录。', material: '应用场景说明、项目实施记录、投入凭证清单' },
    '资质培育': { summary: '围绕企业成长、技术能力和成果资料，演示培育类项目的准备情况核对。', condition: '可提供经营方向、项目能力与成果说明资料。', material: '企业简介、能力与成果说明、相关资质证明' },
    '税收优惠': { summary: '围绕研发活动及归集口径，演示税惠相关资料的整理；不提供真实税务结论。', condition: '可提供研发活动记录与对应费用资料，具体口径待人工核对。', material: '研发活动记录、费用归集表、年度财务资料' },
  };
  const policies = rows.map(([id, title, region, sectors, supportType, publishedAt, applicationStart, applicationEnd, policyDemoId, category = '申报通知'], index) => {
    const copy = explanations[supportType];
    return {
      id, projectId: `demo-project-${id}`, batchId: `${id}-2026-01`, title, region,
      industries: sectors, supportType, agency: '演示政策库', publishedAt,
      applicationStart, applicationEnd, category,
      summary: category === '结果公示' ? '展示模拟项目的入选结果信息，不作为新的申报机会。' : category === '政策公告' ? '展示模拟材料规范说明；当前未公布申报窗口。' : copy.summary,
      conditions: [region === '全国' ? '地区适用范围在本演示中为全国，仍需核对其他条件。' : `企业注册地区需与${region}的演示适用范围一致。`, copy.condition, '正式资格与办理要求需依据官方原文逐项确认。'],
      materials: ['企业基本信息与营业执照', copy.material, '按申报模板补充的其他资料'],
      featured: index < 4, policyDemoId,
    };
  });
  const experts = [
    { id: 'enterprise-specialist', title: '企业资料助理', headline: '先把企业情况理清楚', description: '整理地区、行业、项目与资质信息，标出还需要补充的资料。', deliverables: ['企业画像', '资料缺口'], portraitIndex: 0, serviceId: 'profile' },
    { id: 'policy-matcher', title: '政策匹配顾问', headline: '找到值得进一步核对的政策', description: '围绕企业画像筛选候选项目，把地区、行业与项目方向的匹配原因说清楚。', deliverables: ['候选政策', '匹配原因'], portraitIndex: 1, serviceId: 'search' },
    { id: 'policy-interpreter', title: '政策解读专家', headline: '把申报条件讲明白', description: '拆解适用条件、申报时间与材料要求，留下需要人工确认的问题。', deliverables: ['条件摘要', '材料清单'], portraitIndex: 2, serviceId: 'interpret' },
    { id: 'application-adviser', title: '申报诊断顾问', headline: '还差什么，先补什么', description: '对照现有资料查找缺口，区分资料缺失、信息待核实与条件不满足。', deliverables: ['差距诊断', '补充建议'], portraitIndex: 3, serviceId: 'diagnosis' },
    { id: 'material-editor', title: '材料组稿专员', headline: '把已有资料整理进模板', description: '引用企业提供的资料组织章节，缺失内容明确留待补充，并保存修改版本。', deliverables: ['有来源的草稿', '版本对比'], portraitIndex: 4, serviceId: 'assembly' },
    { id: 'submission-guide', title: '办理指引助手', headline: '提交前，再逐项核对', description: '整理办理步骤与提交前检查事项，将需要企业确认的内容单独列出。', deliverables: ['办理步骤', '核对清单'], portraitIndex: 5, serviceId: 'guidance' },
  ];
  const teams = [
    { id: 'company-checkup', title: '企业政策体检团', headline: '看看企业适合申请什么，还差什么', serviceIds: ['profile', 'search', 'interpret', 'diagnosis'], portraitIndices: [0, 1, 3], steps: ['建立企业画像', '查找候选政策', '核对条件差距'], deliverables: ['候选政策清单', '条件核对结果', '补充建议'] },
    { id: 'application-preparation', title: '申报材料准备团', headline: '把资料整理成一份可核对的申报草稿', serviceIds: ['profile', 'search', 'interpret', 'diagnosis', 'assembly', 'guidance'], portraitIndices: [2, 4, 5], steps: ['解读材料要求', '补齐企业资料', '按模板组稿', '人工确认版本'], deliverables: ['材料草稿', '章节来源', '历史版本'] },
  ];
  const cases = [
    { id: 'case-chengchuan', company: '澄川数字科技', industry: '软件信息', region: '浙江省', project: '研发协同创新支持计划', supportLabel: '研发项目支持', amountLabel: '30万元', status: '获批', isMock: true, steps: ['核对企业画像', '补充研发费用资料', '按模板整理材料'], story: '通过平台整理研发记录与成果资料，发现并补齐费用归集资料缺口，形成可核对的申报材料。该企业与获批结果均为虚构演示。', taskId: 'task-innovation' },
    { id: 'case-yuanji', company: '源际精密制造', industry: '先进制造', region: '广东省', project: '制造企业数字协作提升计划', supportLabel: '数字化改造支持', amountLabel: '20万元', status: '到账', isMock: true, steps: ['筛选候选项目', '梳理应用与实施记录', '核对材料版本'], story: '通过平台梳理数字化应用场景和实施资料，按要求组织章节并比较修改版本。到账金额仅用于展示案例形式，不代表真实服务成果。', taskId: 'task-digital' },
    { id: 'case-qinghe', company: '青禾健康技术', industry: '生命健康', region: '上海市', project: '健康技术成果应用培育计划', supportLabel: '成长培育资格', amountLabel: '入选培育名单', status: '资质认定', isMock: true, steps: ['解读培育条件', '整理成果证明', '人工核对材料'], story: '通过平台归集成果与企业资料，按清单准备培育项目材料。此案例演示非现金支持，不折算为补贴金额。', taskId: 'task-review' },
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
