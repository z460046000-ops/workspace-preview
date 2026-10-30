/* 独立演示状态；持久化失败仍可在内存中操作，调用方读取 storageError 显示保存结果。 */
(() => {
  'use strict';
  const STORAGE_KEY = 'huiqi-policy-demo-v1';
  const DATA = window.PolicyData;
  if (!DATA) throw new Error('demo-data.js 必须在 store.js 之前加载');
  const subscribers = new Set();
  const clone = (value) => JSON.parse(JSON.stringify(value));
  const plain = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);
  const text = (value, fallback = '', limit = 20000) => typeof value === 'string' ? value.slice(0, limit) : fallback;
  const id = (value) => typeof value === 'string' && /^[a-zA-Z0-9_-]{1,100}$/.test(value) ? value : null;
  const timestamp = (value) => typeof value === 'string' && Number.isFinite(Date.parse(value)) ? new Date(value).toISOString() : null;
  const stepNames = ['profile', 'match', 'diagnosis', 'assembly', 'review'];
  const statuses = ['ready', 'missing', 'unmet', 'unknown'];
  const taskStatuses = ['needs-input', 'processing', 'review', 'done'];
  const policyExists = (value) => DATA.policies.some((policy) => policy.id === value);
  const freezeVersion = (version) => {
    version.sections.forEach((section) => {
      Object.freeze(section.sourceIds);
      section.sourceQuotes.forEach(Object.freeze);
      Object.freeze(section.sourceQuotes);
      Object.freeze(section);
    });
    Object.freeze(version.sections);
    return Object.freeze(version);
  };

  function normalizeCompany(value) {
    if (!plain(value)) return null;
    const employees = value.employees;
    const revenue = value.revenue;
    return {
      name: text(value.name, '', 300), region: text(value.region, '', 200), industry: text(value.industry, '', 300), established: text(value.established, '', 100),
      employees: typeof employees === 'number' && Number.isFinite(employees) && employees >= 0 ? employees : text(employees, '', 100),
      revenue: typeof revenue === 'number' && Number.isFinite(revenue) && revenue >= 0 ? revenue : (revenue === null ? null : text(revenue, '', 300)),
    };
  }

  function normalizeTask(value) {
    if (!plain(value) || !id(value.id) || !policyExists(value.policyId) || !plain(value.steps) || !Array.isArray(value.requirements) || !Array.isArray(value.sources)) return null;
    const company = normalizeCompany(value.company);
    const createdAt = timestamp(value.createdAt);
    const updatedAt = timestamp(value.updatedAt);
    if (!company || !createdAt || !updatedAt || !stepNames.every((name) => typeof value.steps[name] === 'boolean') || value.requirements.length > 100 || value.sources.length > 100) return null;
    const sourceIds = new Set();
    const sources = [];
    for (const source of value.sources) {
      if (!plain(source) || !id(source.id) || sourceIds.has(source.id) || typeof source.provided !== 'boolean') return null;
      sourceIds.add(source.id);
      sources.push({ id: source.id, name: text(source.name, '', 300), text: text(source.text, '', 100000), type: text(source.type, 'document', 100), provided: source.provided });
    }
    const requirementIds = new Set();
    const requirements = [];
    for (const requirement of value.requirements) {
      if (!plain(requirement) || !id(requirement.id) || requirementIds.has(requirement.id) || !statuses.includes(requirement.status) || !['material', 'condition'].includes(requirement.kind)) return null;
      if (requirement.sourceId && !sourceIds.has(requirement.sourceId)) return null;
      requirementIds.add(requirement.id);
      requirements.push({ id: requirement.id, label: text(requirement.label, '', 300), status: requirement.status, kind: requirement.kind, evidence: text(requirement.evidence, '', 10000), sourceId: text(requirement.sourceId, '', 100), action: text(requirement.action, '', 200) });
    }
    return {
      id: value.id, title: text(value.title, '未命名申报任务', 300), request: text(value.request), company, policyId: value.policyId,
      status: taskStatuses.includes(value.status) ? value.status : 'needs-input',
      steps: Object.fromEntries(stepNames.map((name) => [name, value.steps[name]])), requirements, sources,
      createdAt, updatedAt, notes: text(value.notes),
      messages: Array.isArray(value.messages) ? value.messages.filter(message=>plain(message) && ['user','assistant'].includes(message.role) && typeof message.text === 'string').slice(-40).map(message=>({role:message.role,text:text(message.text,'',5000)})) : [],
    };
  }

  function normalizeSections(value, task) {
    if (!Array.isArray(value) || !value.length || value.length > 100) return null;
    const sectionIds = new Set();
    const sourceIds = new Set(task.sources.map((source) => source.id));
    const sections = [];
    for (const section of value) {
      if (!plain(section) || !id(section.id) || sectionIds.has(section.id) || typeof section.body !== 'string' || !Array.isArray(section.sourceIds) || section.sourceIds.length > 100) return null;
      if (section.sourceIds.some((sourceId) => !sourceIds.has(sourceId))) return null;
      sectionIds.add(section.id);
      const quotes = section.sourceQuotes === undefined ? task.sources.filter((source) => section.sourceIds.includes(source.id)) : section.sourceQuotes;
      if (!Array.isArray(quotes) || quotes.length > 100) return null;
      const quoteIds = new Set();
      const sourceQuotes = [];
      for (const quote of quotes) {
        if (!plain(quote) || !id(quote.id) || quoteIds.has(quote.id) || !section.sourceIds.includes(quote.id) || typeof quote.provided !== 'boolean') return null;
        quoteIds.add(quote.id);
        sourceQuotes.push({ id: quote.id, name: text(quote.name, '', 300), text: text(quote.text, '', 100000), type: text(quote.type, 'document', 100), provided: quote.provided });
      }
      if (section.sourceIds.some((sourceId) => !quoteIds.has(sourceId))) return null;
      sections.push({ id: section.id, title: text(section.title, '', 300), body: text(section.body, '', 100000), sourceIds: [...new Set(section.sourceIds)], sourceQuotes });
    }
    return sections;
  }

  function normalizeVersion(value, tasks) {
    if (!plain(value) || !id(value.id) || !id(value.taskId) || !Number.isSafeInteger(value.number) || value.number < 1 || !['draft', 'confirmed'].includes(value.status)) return null;
    const task = tasks.find((item) => item.id === value.taskId);
    const createdAt = timestamp(value.createdAt);
    const sections = task && normalizeSections(value.sections, task);
    if (!task || !createdAt || !sections) return null;
    return freezeVersion({ id: value.id, taskId: value.taskId, policyId: policyExists(value.policyId) ? value.policyId : task.policyId, companyName: text(value.companyName,task.company.name,300), taskTitle: text(value.taskTitle,task.title,300), number: value.number, sections, note: text(value.note), createdAt, status: value.status });
  }

  function seedState() {
    const tasks = DATA.seedTasks.map((task) => normalizeTask(clone(task)));
    return {
      schemaVersion: 1, tasks, versions: DATA.seedVersions.map((version) => normalizeVersion(clone(version), tasks)), activeTaskId: tasks[0]?.id || null,
      draft: '', storageAvailable: true, storageError: '', dirty: false, loadWarning: '',
    };
  }

  let state = seedState();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw !== null) {
      if (raw.length > 5000000) throw new Error('保存内容超出可读取范围');
      const value = JSON.parse(raw);
      if (!plain(value) || value.schemaVersion !== 1 || !Array.isArray(value.tasks) || value.tasks.length > 500 || !Array.isArray(value.versions) || value.versions.length > 1000) throw new Error('保存内容格式不正确');
      const tasks = value.tasks.map(normalizeTask);
      if (tasks.some((task) => !task) || new Set(tasks.map((task) => task.id)).size !== tasks.length) throw new Error('任务记录校验未通过');
      const versions = value.versions.map((version) => normalizeVersion(version, tasks));
      if (versions.some((version) => !version) || new Set(versions.map((version) => version.id)).size !== versions.length || new Set(versions.map((version) => `${version.taskId}:${version.number}`)).size !== versions.length) throw new Error('材料版本校验未通过');
      state = { ...state, tasks, versions, activeTaskId: tasks.some((task) => task.id === value.activeTaskId) ? value.activeTaskId : tasks[0]?.id || null, draft: text(value.draft) };
    }
  } catch (error) {
    if (error?.name === 'SecurityError' || error?.name === 'InvalidStateError') {
      state.storageAvailable = false;
      state.storageError = '浏览器不允许保存到本机，当前内容仍可在本页使用。';
    } else {
      state.loadWarning = '本机保存的内容未通过校验，当前显示初始演示记录。';
    }
  }

  function publish() {
    state.dirty = true;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ schemaVersion: 1, tasks: state.tasks, versions: state.versions, activeTaskId: state.activeTaskId, draft: state.draft }));
      state.storageAvailable = true;
      state.storageError = '';
      state.dirty = false;
    } catch (error) {
      state.storageAvailable = false;
      state.storageError = error?.name === 'QuotaExceededError' ? '本机存储空间不足，最新修改仅保留在当前页面。' : '无法保存到本机，最新修改仅保留在当前页面。';
    }
    subscribers.forEach((subscriber) => {
      try { subscriber(state); } catch (error) { /* 一个视图失败不影响其他订阅者和写入结果。 */ }
    });
  }

  const getTask = (taskId) => state.tasks.find((task) => task.id === taskId) || null;
  let sequence = 0;
  const newId = (prefix) => `${prefix}-${Date.now().toString(36)}-${(++sequence).toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  function createTask(input = {}) {
    if (!plain(input)) return null;
    const task = normalizeTask(DATA.createTaskSeed({ ...input, id: newId('task'), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }));
    if (!task) return null;
    state.tasks = [task, ...state.tasks];
    state.activeTaskId = task.id;
    publish();
    return task;
  }

  function updateTask(taskId, patch) {
    const original = getTask(taskId);
    if (!original || !plain(patch)) return false;
    const merged = { ...original };
    ['title', 'request', 'policyId', 'status', 'requirements', 'sources', 'notes', 'messages'].forEach((key) => {
      if (Object.hasOwn(patch, key)) merged[key] = patch[key];
    });
    if (Object.hasOwn(patch, 'company')) {
      if (!plain(patch.company)) return false;
      merged.company = { ...original.company, ...patch.company };
    }
    if (Object.hasOwn(patch, 'steps')) {
      if (!plain(patch.steps)) return false;
      merged.steps = { ...original.steps, ...patch.steps };
    }
    merged.updatedAt = new Date().toISOString();
    const updated = normalizeTask(merged);
    if (!updated) return false;
    // 已保存版本的引用仍需可查看，不能通过替换来源数组使历史材料悬空。
    const nextSourceIds = new Set(updated.sources.map((source) => source.id));
    if (state.versions.some((version) => version.taskId === taskId && version.sections.some((section) => section.sourceIds.some((sourceId) => !nextSourceIds.has(sourceId))))) return false;
    state.tasks = state.tasks.map((task) => task.id === taskId ? updated : task);
    publish();
    return true;
  }

  function saveVersion(taskId, sections, note = '') {
    const task = getTask(taskId);
    if (!task) return null;
    const normalized = normalizeSections(sections, task);
    if (!normalized) return null;
    const number = Math.max(0, ...state.versions.filter((version) => version.taskId === taskId).map((version) => version.number)) + 1;
    const version = freezeVersion({ id: newId('version'), taskId, policyId:task.policyId, companyName:task.company.name, taskTitle:task.title, number, sections: normalized, note: text(note), createdAt: new Date().toISOString(), status: 'draft' });
    state.versions = [...state.versions, version];
    publish();
    return version;
  }

  function confirmVersion(versionId) {
    const version = state.versions.find((item) => item.id === versionId);
    if (!version) return false;
    if (version.status === 'confirmed') return true;
    const task = getTask(version.taskId);
    if (!task || !task.requirements.length || task.requirements.some((requirement) => requirement.status !== 'ready')) return false;
    if (!task.steps.profile || !task.steps.match || !task.steps.diagnosis || version.policyId !== task.policyId || version.companyName !== task.company.name) return false;
    if (!version.sections.length || version.sections.some((section) => !section.body.trim() || /[【\[]待(?:补(?:充)?|核对)[】\]]/.test(section.body))) return false;
    if (version.sections.some(section => section.sourceQuotes.some(quote => {
      const current = task.sources.find(source => source.id === quote.id);
      return !current || !current.provided || current.text !== quote.text || current.name !== quote.name;
    }))) return false;
    state.versions = state.versions.map((item) => item.id === versionId ? freezeVersion({ ...clone(item), status: 'confirmed' }) : item);
    publish();
    return true;
  }

  window.PolicyStore = Object.freeze({
    storageKey: STORAGE_KEY,
    getState: () => state,
    getTask,
    subscribe(fn) {
      if (typeof fn !== 'function') return () => {};
      subscribers.add(fn);
      return () => subscribers.delete(fn);
    },
    createTask, updateTask, saveVersion, confirmVersion,
    saveTaskDraft(value) {
      if (typeof value !== 'string') return false;
      state.draft = text(value);
      publish();
      return true;
    },
    getTaskDraft: () => state.draft,
    setActiveTask(taskId) {
      if (!getTask(taskId)) return false;
      state.activeTaskId = taskId;
      publish();
      return true;
    },
  });
})();
