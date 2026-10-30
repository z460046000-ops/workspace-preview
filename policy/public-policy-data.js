/* 官方公开政策摘录，核对日2026-10-30；收录范围不代表全部政策，行业标签为平台整理。 */
(() => {
  'use strict';
  const policies = [
    {
      id: 'zj-tech-sme-2026', projectId: 'zj-tech-sme', batchId: 'binjiang-2026',
      title: '2026年度浙江省科技型中小企业申报通知',
      region: '浙江省', industries: ['软件信息', '先进制造', '新能源', '生命健康', '现代服务'], supportType: '资质培育',
      publishedAt: '2026-04-23', applicationStart: null, applicationEnd: '2026-10-31', deadlineOnly: true,
      category: '申报通知', agency: '杭州高新区（滨江）科技局',
      sourceUrl: 'https://www.hhtz.gov.cn/col/col1485818/art/2026/art_11ec09ec4a6e4be6adee68e40d0b6ad4.html',
      summary: '面向滨江区科技型中小企业，核对技术成果、研发投入与人员证明，截止10月31日。',
      conditions: ['滨江区注册满一年，具有技术成果与研发投入，科技人员占比原则上不低于10%。'],
      materials: ['营业执照、技术成果证明、研发投入材料、职工社保证明。'],
      applicationTimeNote: '原文仅列截止日期，未列明申报开始日。',
    },
    {
      id: 'gd-ai-2027', projectId: 'gd-ai-rd', batchId: '2027',
      title: '2027年度广东省重点领域研发计划“人工智能”专项申报通知',
      region: '广东省', industries: ['软件信息', '先进制造'], supportType: '研发支持',
      publishedAt: '2026-09-10', applicationStart: '2026-09-04', applicationEnd: '2026-10-05',
      deadlineAt: '2026-10-05T17:00:00+08:00', category: '申报通知', agency: '深圳市科技创新局',
      sourceUrl: 'https://stic.sz.gov.cn/gkmlpt/content/12/12975/post_12975014.html',
      summary: '深圳转发广东省人工智能专项申报通知，本批次集中申报已于10月5日17时结束。',
      conditions: ['项目资格和研究方向须继续核对省科技厅专项指南。'],
      materials: [],
      applicationTimeNote: '申报截止时间为2026年10月5日17:00。',
    },
    {
      id: 'cn-tech-commerce-2026', projectId: 'cn-tech-commerce', batchId: '2026-551',
      title: '商务部等9部门关于加快推进科技兴商的意见',
      region: '全国', industries: ['软件信息', '先进制造', '现代服务'], supportType: '数字化改造',
      publishedAt: '2026-10-19', issuedAt: '2026-10-13', applicationStart: null, applicationEnd: null,
      category: '政策公告', agency: '商务部等9部门',
      sourceUrl: 'https://www.mofcom.gov.cn/zwgk/zcfb/art/2026/art_787f0441da1f4c0e8b5bad10118247f3.html',
      summary: '推进商贸数字化与技术应用，涵盖智能消费、供应链和商业新场景；本意见不是单项申报通知。',
      conditions: ['具体支持项目须按后续配套安排核对。'], materials: [],
    },
    {
      id: 'cn-logistics-2026', projectId: 'cn-logistics-leaders', batchId: '2026-4',
      title: '加快培育交通物流领军企业、提升产业链供应链服务保障能力行动方案',
      region: '全国', industries: ['现代服务', '软件信息'], supportType: '数字化改造',
      publishedAt: '2026-01-21', issuedAt: '2026-01-16', applicationStart: null, applicationEnd: null,
      category: '政策公告', agency: '交通运输部等8部门',
      sourceUrl: 'https://xxgk.mot.gov.cn/jigou/ysfws/202601/t20260121_4198258.html',
      summary: '引导物流企业整合网络、提高供应链服务与数字协同能力，未在本文件设置统一申报窗口。',
      conditions: ['具体项目和试点资格按有关配套通知核对。'], materials: [],
    },
    {
      id: 'cn-finance-2025', projectId: 'cn-finance-five-areas', batchId: '2025-8',
      title: '国务院办公厅关于做好金融“五篇大文章”的指导意见',
      region: '全国', industries: ['软件信息', '先进制造', '新能源', '生命健康', '现代服务'], supportType: '金融支持',
      publishedAt: '2025-03-05', issuedAt: '2025-03-02', applicationStart: null, applicationEnd: null,
      category: '政策公告', agency: '国务院办公厅',
      sourceUrl: 'https://app.www.gov.cn/govdata/gov/202503/05/525163/article.html',
      summary: '提出科技、绿色、普惠等领域金融服务方向；并非企业可以直接申请的固定补贴项目。',
      conditions: ['融资产品与申请要求按对应金融机构及配套政策核对。'], materials: [],
    },
    {
      id: 'sh-smart-grid-2026', projectId: 'national-smart-grid', batchId: '2026-open-call',
      title: '智能电网国家科技重大专项专题攻关公开项目申报通知',
      region: '上海市', industries: ['新能源', '软件信息'], supportType: '研发支持',
      publishedAt: '2026-10-28', issuedAt: '2026-10-26', applicationStart: '2026-10-28', applicationEnd: '2026-12-07',
      category: '申报通知', agency: '上海市科学技术委员会',
      sourceUrl: 'https://stcsm.sh.gov.cn/zwgk/kyjhxm/xmsb/20261028/c956023f49094f1a939b92ada9a8d61e.html',
      summary: '上海组织智能电网专项申报，线上填报期为10月28日至12月7日，附件须上传扫描件。',
      conditions: ['项目与单位资格须依国家能源局该专项指南核对。'],
      materials: ['网上申报书及指南要求的电子扫描附件。'],
      applicationTimeNote: '此为上海组织推荐通知，国家项目资格仍按专项指南核对。',
    },
    {
      id: 'bj-application-scenarios-2026', projectId: 'bj-application-scenarios', batchId: '2026-second',
      title: '2026年第二批重点应用场景储备项目征集通知',
      region: '北京市', industries: ['软件信息', '生命健康'], supportType: '研发支持',
      publishedAt: '2026-10-28', applicationStart: '2026-10-29', applicationEnd: '2026-11-17',
      applicationStartAt: '2026-10-29T09:00:00+08:00', deadlineAt: '2026-11-17T18:00:00+08:00',
      category: '申报通知', agency: '北京市科委、中关村管委会',
      sourceUrl: 'https://www.beijing.gov.cn/zhengce/zhengcefagui/202610/t20261028_4921615.html',
      summary: '征集在京实施的技术应用场景，须明确需求方与供给方，申报截止11月17日18时。',
      conditions: ['需求方与供给方不得有关联关系，项目在京实施，并取得分园推荐资格。'],
      materials: ['在线申报信息、分园推荐函及系统要求的附件。'],
      applicationTimeNote: '申报期为10月29日09:00至11月17日18:00。',
    },
    {
      id: 'sz-incubator-extension-2026', projectId: 'sz-technology-incubator', batchId: '2026',
      title: '深圳市科技型企业孵化器认定及绩效评价申报延期通知',
      region: '广东省', industries: ['现代服务'], supportType: '资质培育',
      publishedAt: '2026-10-28', applicationStart: null, applicationEnd: '2026-11-05', deadlineOnly: true,
      deadlineAt: '2026-11-05T12:00:00+08:00', category: '申报通知', agency: '深圳市工业和信息化局',
      sourceUrl: 'https://gxj.sz.gov.cn/szsgyhxxhjwzgkml/szsgyhxxhjwzgkml/qt/tzgg/content/post_13044624.html',
      summary: '新申请截止延至11月5日12时；此前已提交后被退回的材料，可修改重提至次日12时。',
      conditions: ['本通知只延长期限，申报对象与材料仍须核对原申报通知。'], materials: [],
      applicationTimeNote: '11月6日12:00只适用于已提交后被退回修改的材料，不是新申请截止日。',
    },
  ];
  const deepFreeze = value => {
    if (value && typeof value === 'object' && !Object.isFrozen(value)) {
      Object.values(value).forEach(deepFreeze);
      Object.freeze(value);
    }
    return value;
  };
  window.PolicyPublicPolicies = deepFreeze(policies);
})();
