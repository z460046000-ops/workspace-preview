/* 角色形象唯一来源：同一能力在首页、集市、事项卡和对话中保持一致。 */
(() => {
  'use strict';
  const atlas = Object.freeze({ src: 'assets/landing/policy-advisers.webp', columns: 3, rows: 2, backgroundSize: '300% 200%' });
  const definitions = {
    profile: { id: 'company-assistant', name: '企业资料助理', index: 0 },
    search: { id: 'policy-adviser', name: '政策匹配顾问', index: 3 },
    interpret: { id: 'policy-interpreter', name: '政策解读专家', index: 2 },
    diagnosis: { id: 'application-adviser', name: '申报诊断顾问', index: 5 },
    assembly: { id: 'material-editor', name: '材料组稿专员', index: 4 },
    guidance: { id: 'procedure-adviser', name: '办理指引顾问', index: 1 },
    review: { id: 'material-reviewer', name: '材料核对顾问', index: 5 },
    general: { id: 'policy-adviser', name: '政策顾问', index: 5 },
  };
  const roles = Object.fromEntries(Object.entries(definitions).map(([key, value]) => {
    const col = value.index % atlas.columns;
    const row = Math.floor(value.index / atlas.columns);
    return [key, Object.freeze({ ...value, key, col, row, x: col * 50, y: row * 100, asset: atlas.src })];
  }));
  // 项目“政策匹配”与前台“政策匹配顾问”使用同一位检索角色。
  roles.match = roles.search;
  Object.freeze(roles);
  window.PolicyPersonas = Object.freeze({ atlas, roles, get: key => Object.hasOwn(roles, key) ? roles[key] : roles.general });
})();
