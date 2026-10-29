/* 学习中心本地演示：阅读课程、课节位置和学习记录，仅保存于当前页面内存。 */
(() => {
  'use strict';

  const courses = [
    {
      id: 'poster-brief', title: '把活动资料整理成海报需求', category: 'design', image: 'editorial',
      description: '先写清内容、尺寸和素材，让海报第一稿更接近你的要求。',
      lessons: [
        { title: '先说清海报给谁看', body: '海报首先要解决信息传达。把活动目标写成一句话，再列出读者看完后要做的动作，例如扫码报名或了解新品。选择一个主要动作，避免所有信息都抢占标题。', checklist: ['读者是谁，在哪里看到海报？', '最希望读者记住哪一句话？', '活动时间、地点和报名方式是否齐全？'] },
        { title: '准备尺寸与品牌素材', body: '相同内容发到公众号、朋友圈和线下展架，所需比例不同。先确定主要使用位置，再提供准确尺寸。把品牌标志、产品图片和不能修改的文案放在一起，减少后续补充。', checklist: ['写明使用平台和宽高尺寸。', '区分必须保留的内容与可以调整的内容。', '说明参考图里具体想借鉴的配色或排版。'] },
        { title: '检查初稿再提出修改', body: '先检查事实，再讨论风格。确认时间、价格、地址和二维码无误后，再看标题层级与阅读顺序。一次反馈围绕具体位置说明问题，比“再高级一点”更容易执行。', checklist: ['逐项核对活动信息。', '缩小图片检查主要文字是否仍可读。', '用“位置＋问题＋希望怎么改”写反馈。'] },
      ],
    },
    {
      id: 'video-script', title: '写出能拍摄的短视频脚本', category: 'marketing', image: 'launch',
      description: '从一个卖点开始，把画面、旁白和时长写清楚。',
      lessons: [
        { title: '确定一条核心信息', body: '短视频的时长有限。先说明目标观众、发布渠道和观看场景，再选一个最重要的卖点。没有证据的效果、排名或承诺不要写进脚本。', checklist: ['谁会看这条视频？', '看完应记住哪个卖点？', '产品资料能否支持每个具体说法？'] },
        { title: '分开写画面与旁白', body: '每一段脚本写明时间、画面和旁白。画面描述使用可执行的动作，例如“手部打开包装展示配件”。旁白补充画面无法直接说明的信息，避免只是重复镜头内容。', checklist: ['每段只有一个主要动作。', '说明所需人物、产品与场地。', '试读旁白，核对能否在规定时长内说完。'] },
        { title: '按素材检查可执行性', body: '把脚本与现有素材逐段对照。缺少拍摄条件的镜头，先考虑能否用产品细节、图文或简单演示替代。交付前写明哪些镜头已具备素材、哪些还需要补拍。', checklist: ['标记可直接使用的素材。', '列出待补拍镜头和负责人。', '检查结尾行动提示是否符合发布场景。'] },
      ],
    },
    {
      id: 'campaign-plan', title: '做一份可执行的活动方案', category: 'marketing', image: 'nature',
      description: '把目标、时间、分工和物料列成一份可以推进的计划。',
      lessons: [
        { title: '把活动目标写具体', body: '先确认活动要推动什么结果，例如让已有客户报名体验新品。把目标人群、时间范围和观察指标放在同一句描述中。没有历史数据时，目标数字应标为待讨论，不能当成既定结果。', checklist: ['说明活动为谁解决什么问题。', '区分期望目标与已确认约束。', '只保留与目标相关的指标。'] },
        { title: '列出时间与分工', body: '从活动日期向前倒排准备工作，给每件事补充负责人、截止时间和依赖事项。例如海报需要先等文案确认，发布需要先准备报名入口。交接条件应明确到可检查的材料。', checklist: ['每个任务有一个负责联系人。', '重要审核预留时间。', '依赖事项有明确交付内容。'] },
        { title: '活动前检查关键路径', body: '正式发布前，按用户实际路径走一次：看到内容、打开入口、填写信息、收到反馈。把发现的问题列成待办，优先处理会阻止报名或造成误解的环节。', checklist: ['核对活动文案与报名规则。', '检查各个链接和表单字段。', '确认异常情况由谁跟进。'] },
      ],
    },
    {
      id: 'weekly-report', title: '用工作记录整理一份周报', category: 'office', image: 'minimal',
      description: '从原始记录中找出结果、进展和需要协调的问题。',
      lessons: [
        { title: '先收集可核对的记录', body: '周报应以本周发生的工作为依据。准备会议结论、任务更新和交付链接，给每条记录补充日期。对于没有证据的结果，保留为待核实事项，不靠印象补齐数字。', checklist: ['确定本周的起止时间。', '保留结果对应的文件或记录链接。', '区分已完成、进行中和计划事项。'] },
        { title: '用结果组织内容', body: '把同一项目的零散动作合并，先写带来了什么变化，再补充必要的过程。例如“确认活动排期，物料已进入制作”比罗列多次沟通更容易理解。涉及未完成的工作，说明当前停在哪里。', checklist: ['同一项目只保留必要信息。', '明确已经确认的结果。', '写清阻塞问题及需要谁协助。'] },
        { title: '发送前核对边界', body: '逐条检查人名、日期、数字和链接。预览、测试通过、用户验收和正式上线是不同阶段，应按真实状态表达。最后确认下周计划有明确目标，不重复本周总结。', checklist: ['删除重复和没有信息量的表述。', '检查结果状态是否准确。', '给需要协调的事项补充下一步。'] },
      ],
    },
    {
      id: 'meeting-notes', title: '把会议讨论整理成行动清单', category: 'office', image: 'coffee',
      description: '区分结论、待办与尚未确定的问题，方便会后接着做。',
      lessons: [
        { title: '先找结论与未决事项', body: '会议里提出的想法不一定已经通过。阅读记录时，把已明确的决定和仍在讨论的问题分开。存在歧义时标注待确认，保留相关上下文，不替参会人做决定。', checklist: ['哪些决定已有明确共识？', '哪些方案还需要补充信息？', '是否存在相互矛盾的表述？'] },
        { title: '让待办可以直接执行', body: '每条待办写清要做什么、由谁负责、何时完成。没有明确负责人的事项标为待分配，时间未确认的事项标为待排期。尽量使用可以检查的交付动作。', checklist: ['避免只写“跟进一下”。', '写出可检查的交付内容。', '保留时间与负责人的确认状态。'] },
        { title: '发送前做一次复核', body: '把行动清单与会议结论逐项对应，确认没有把个人建议写成团队决定。涉及关键承诺时，请相关负责人核对后再分发。会议纪要的价值是帮助下一步工作继续推进。', checklist: ['决策与待办能对应起来。', '关键承诺已有确认依据。', '未决问题有明确后续安排。'] },
      ],
    },
    {
      id: 'brand-assets', title: '准备一份好用的品牌素材包', category: 'design', image: 'recruit',
      description: '整理标志、图片与常用文案，让制作时少反复找资料。',
      lessons: [
        { title: '收齐常用素材', body: '先收集正在使用的品牌标志、产品图片、标准名称和对外介绍。只保留来源明确、允许用于当前工作的文件。旧版本先标注用途，避免与现行素材混淆。', checklist: ['标志有清晰版本和适用背景。', '产品图片能对应到具体型号。', '常用名称和联系方式准确。'] },
        { title: '给素材补充使用说明', body: '文件名应能说明内容、用途与版本。对于有固定裁切范围、不可更改文案或使用期限的素材，把说明放在一起。不要让接手的人只凭文件名猜测规则。', checklist: ['标明不可修改的元素。', '写清图片来源和允许的用途。', '说明哪些文件是当前有效版本。'] },
        { title: '按一次真实任务检查', body: '用一次海报或宣传页制作需求检查素材包是否足够。记录仍需反复询问的信息，再补充到说明中。素材包应随着实际使用维护，而不是一次整理后长期不更新。', checklist: ['接手的人能找到主要素材。', '关键问题能从说明中得到答案。', '过期内容有明确替换方式。'] },
      ],
    },
  ];
  courses.forEach((course) => {
    const characters = course.lessons.reduce((total, lesson) => total + [...(lesson.body + lesson.checklist.join('')).replace(/\s/g, '')].length, 0);
    course.minutes = Math.max(1, Math.ceil(characters / 250));
  });
  const labels = { all: '全部', office: '办公', marketing: '营销', design: '设计' };
  const escape = (value) => String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
  const findCourse = (id) => courses.find((course) => course.id === id);
  const emptyData = () => ({ progress: new Map(), history: [] });
  const seedData = () => {
    const data = emptyData();
    const now = Date.now();
    data.progress.set('poster-brief', { completed: new Set([0]), current: 1, updated: now - 12 * 60000 });
    data.progress.set('weekly-report', { completed: new Set([0]), current: 1, updated: now - 70 * 60000 });
    data.history = [
      { courseId: 'poster-brief', lesson: 1, time: now - 12 * 60000, completed: false },
      { courseId: 'weekly-report', lesson: 0, time: now - 70 * 60000, completed: true },
      { courseId: 'poster-brief', lesson: 0, time: now - 90 * 60000, completed: true },
    ];
    return data;
  };
  const state = {
    mode: 'populated', dataMode: 'populated', filter: 'all', search: '', expanded: false, catalogueExpanded: false, continueExpanded: false,
    activeCourse: null, lesson: 0, populated: seedData(), new: emptyData(),
  };
  const data = () => state[state.dataMode];
  const isComplete = (course, progress) => Boolean(progress && progress.completed.size === course.lessons.length);
  const cover = (course, className = '') => `<img class="learn-cover ${className}" src="assets/posters/${course.image}.webp" alt="" loading="lazy" width="640" height="360">`;
  const meta = (course) => `${labels[course.category]} · 入门 · ${course.lessons.length} 节 · 约 ${course.minutes} 分钟`;

  function init() {
    const root = document.querySelector('#learn-view');
    const content = document.querySelector('#learn-content');
    const detail = document.querySelector('#learn-course-view');
    if (!root || !content || !detail) return;
    if (['new', 'loading', 'error'].includes(document.body.dataset.previewState)) {
      state.mode = document.body.dataset.previewState;
      if (state.mode === 'new') state.dataMode = 'new';
    }

    function courseCard(course) {
      return `<article class="learn-course-card"><button class="learn-course-link" type="button" data-learn-open="${course.id}">${cover(course)}<span class="learn-course-card-title">${escape(course.title)}</span><span class="learn-course-meta">${meta(course)}</span></button></article>`;
    }

    function courseRow(course, progress) {
      const position = progress ? `第 ${progress.current + 1} 节 · ${course.lessons[progress.current].title} · 已学 ${progress.completed.size}/${course.lessons.length}` : meta(course);
      return `<article class="learn-course-row">${cover(course, 'learn-row-cover')}<div class="learn-row-copy"><h3>${escape(course.title)}</h3><p title="${escape(position)}">${escape(position)}</p></div><button type="button" class="learn-text-button learn-row-action" data-learn-open="${course.id}"${progress ? ` data-learn-lesson="${progress.current}"` : ''}>${progress ? '继续学习' : '查看课程'}</button></article>`;
    }

    function renderHistory() {
      const node = content.querySelector('#learn-history-list');
      if (!node) return;
      const history = data().history;
      const items = state.expanded ? history : history.slice(0, 3);
      node.innerHTML = items.length ? `<div class="learn-history-table">${items.map((item) => {
        const course = findCourse(item.courseId);
        const time = new Date(item.time);
        return `<article class="learn-history-row"><div><button type="button" class="learn-title-button" data-learn-open="${course.id}" data-learn-lesson="${item.lesson}">${escape(course.title)}</button><p>第 ${item.lesson + 1} 节 · ${escape(course.lessons[item.lesson].title)}</p></div><time datetime="${time.toISOString()}">${time.toLocaleString('zh-CN', { timeZone: 'Asia/Tokyo', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false })}</time><span class="learn-history-status${item.completed ? ' learn-history-done' : ''}">${item.completed ? '本节已学' : '学习中'}</span></article>`;
      }).join('')}</div>` : '<div class="learn-empty"><h3>还没有学习记录</h3><p>打开一门课程后，课节位置会保留在这里。</p></div>';
      const toggle = content.querySelector('#learn-history-toggle');
      toggle.hidden = history.length <= 3;
      toggle.textContent = state.expanded ? '收起记录' : `查看全部 ${history.length} 条`;
      toggle.setAttribute('aria-expanded', String(state.expanded));
    }

    function renderPanels() {
      const query = state.search.trim().toLocaleLowerCase();
      const matches = courses.filter((course) => (state.filter === 'all' || course.category === state.filter) && `${course.title} ${course.description}`.toLocaleLowerCase().includes(query));
      const filtered = Boolean(query || state.filter !== 'all');
      const visible = state.catalogueExpanded || filtered ? matches : matches.slice(0, 3);
      const grid = content.querySelector('#learn-course-grid');
      grid.innerHTML = visible.length ? visible.map(courseCard).join('') : '<div class="learn-empty learn-empty-wide"><h3>没有找到相关课程</h3><p>换个关键词，或选择“全部”看看。</p></div>';
      const catalogueToggle = content.querySelector('#learn-catalogue-toggle');
      catalogueToggle.hidden = filtered || matches.length <= 3;
      catalogueToggle.textContent = state.catalogueExpanded ? '收起课程' : '全部课程';
      catalogueToggle.setAttribute('aria-expanded', String(state.catalogueExpanded));
      const active = [...data().progress.entries()].map(([id, progress]) => ({ course: findCourse(id), progress })).filter(({ course, progress }) => !isComplete(course, progress)).sort((a, b) => b.progress.updated - a.progress.updated);
      const shownActive = state.continueExpanded ? active : active.slice(0, 2);
      content.querySelector('#learn-continue-list').innerHTML = shownActive.length ? shownActive.map(({ course, progress }) => courseRow(course, progress)).join('') : '<div class="learn-empty"><h3>还没有在学课程</h3><button class="learn-text-button" type="button" data-learn-catalogue>选择一门课程</button></div>';
      const continueToggle = content.querySelector('#learn-continue-toggle');
      continueToggle.hidden = active.length <= 2;
      continueToggle.textContent = state.continueExpanded ? '收起' : `查看全部 ${active.length} 门`;
      continueToggle.setAttribute('aria-expanded', String(state.continueExpanded));
      const excluded = new Set([...visible.map((course) => course.id), ...active.map(({ course }) => course.id)]);
      const recommendations = courses.filter((course) => !excluded.has(course.id) && !isComplete(course, data().progress.get(course.id))).slice(0, 2);
      content.querySelector('#learn-recommendations').innerHTML = recommendations.length ? recommendations.map((course) => courseRow(course)).join('') : '<p class="learn-recommendation-empty">更多课程见上方目录。</p>';
      renderHistory();
    }

    function renderContent() {
      const unavailable = state.mode === 'loading' || state.mode === 'error';
      content.innerHTML = unavailable ? (state.mode === 'loading' ? '<section class="learn-state" role="status"><span class="learn-loading-bar" aria-hidden="true"></span><h2>正在加载课程</h2></section>' : '<section class="learn-state" role="alert"><h2>课程暂时没有加载出来</h2><p>学习进度已保留。</p><button type="button" class="learn-primary-button" data-learn-retry>重新加载</button></section>') : `<section class="learn-section" aria-label="课程目录"><div class="learn-catalogue-toolbar"><div class="learn-filters" role="group" aria-label="课程分类">${Object.entries(labels).map(([key, label]) => `<button type="button" class="learn-filter${key === state.filter ? ' learn-filter-active' : ''}" data-learn-filter="${key}" aria-pressed="${key === state.filter}">${label}</button>`).join('')}</div><label class="learn-search-label"><span class="learn-visually-hidden">搜索课程</span><input id="learn-search" type="search" maxlength="80" placeholder="搜索课程" value="${escape(state.search)}"></label></div><div class="learn-course-grid" id="learn-course-grid"></div><div class="learn-catalogue-footer"><button type="button" class="learn-text-button" id="learn-catalogue-toggle" aria-controls="learn-course-grid" aria-expanded="${state.catalogueExpanded}">全部课程</button></div></section><div class="learn-columns"><section class="learn-section" aria-labelledby="learn-continue-title"><div class="learn-section-header"><h2 id="learn-continue-title">继续学习</h2></div><div id="learn-continue-list"></div><button type="button" class="learn-text-button" id="learn-continue-toggle" aria-controls="learn-continue-list" aria-expanded="${state.continueExpanded}">查看全部</button></section><aside class="learn-section" aria-labelledby="learn-recommend-title"><div class="learn-section-header"><h2 id="learn-recommend-title">推荐课程</h2></div><div id="learn-recommendations"></div></aside></div><section class="learn-section learn-history-section" aria-labelledby="learn-history-title"><div class="learn-section-header"><h2 id="learn-history-title">学习记录</h2><button type="button" class="learn-text-button" id="learn-history-toggle" aria-controls="learn-history-list" aria-expanded="${state.expanded}">查看全部记录</button></div><div id="learn-history-list"></div></section>`;
      if (!unavailable) renderPanels();
    }

    function remember(course, lesson, completed = false) {
      const currentData = data();
      let progress = currentData.progress.get(course.id);
      if (!progress) {
        progress = { completed: new Set(), current: lesson, updated: Date.now() };
        currentData.progress.set(course.id, progress);
      }
      progress.current = lesson;
      progress.updated = Date.now();
      if (completed) progress.completed.add(lesson);
      currentData.history = currentData.history.filter((item) => item.courseId !== course.id || item.lesson !== lesson);
      currentData.history.unshift({ courseId: course.id, lesson, time: progress.updated, completed: progress.completed.has(lesson) });
      return progress;
    }

    function renderCourse(focusTitle = false) {
      const course = findCourse(state.activeCourse);
      if (!course) return;
      const lesson = course.lessons[state.lesson];
      const progress = data().progress.get(course.id);
      const completed = progress.completed.has(state.lesson);
      detail.innerHTML = `<button class="learn-back-button" type="button" data-learn-back>← 返回学习中心</button><div class="learn-course-heading"><p class="learn-course-meta">阅读课程 · ${meta(course)}</p><h2>${escape(course.title)}</h2><p>已学 ${progress.completed.size}/${course.lessons.length} 节${isComplete(course, progress) ? ' · 已完成' : ''}</p></div><div class="learn-reader-layout"><nav class="learn-lesson-navigation" aria-label="课节目录"><h3>课节目录</h3><ol>${course.lessons.map((item, index) => `<li><button type="button" class="learn-lesson-button${index === state.lesson ? ' learn-lesson-active' : ''}" data-learn-lesson-select="${index}"${index === state.lesson ? ' aria-current="step"' : ''}><span>${index + 1}. ${escape(item.title)}</span><small>${progress.completed.has(index) ? '已学' : '未学'}</small></button></li>`).join('')}</ol></nav><article class="learn-reader"><p class="learn-course-meta">第 ${state.lesson + 1} 节 / 共 ${course.lessons.length} 节</p><h3 class="learn-reader-title" tabindex="-1">${escape(lesson.title)}</h3><p class="learn-reader-body">${escape(lesson.body)}</p><div class="learn-practice"><h4>试着检查这几项</h4><ul>${lesson.checklist.map((item) => `<li>${escape(item)}</li>`).join('')}</ul></div><div class="learn-reader-actions"><button class="learn-primary-button" type="button" data-learn-complete${completed ? ' disabled' : ''}>${completed ? '本节已学' : '标记本节已学'}</button><span class="learn-reader-feedback" role="status">${isComplete(course, progress) ? '课程已学完。' : completed ? '进度已保存。' : '阅读完成后，标记本节已学。'}</span></div><div class="learn-reader-pagination"><button type="button" class="learn-secondary-button" data-learn-step="-1"${state.lesson === 0 ? ' disabled' : ''}>上一节</button><button type="button" class="learn-secondary-button" data-learn-step="1"${state.lesson === course.lessons.length - 1 ? ' disabled' : ''}>下一节</button></div></article></div>`;
      if (focusTitle) detail.querySelector('.learn-reader-title')?.focus({ preventScroll: true });
    }

    function showOverview(focusTitle = false) {
      state.activeCourse = null;
      detail.hidden = true;
      content.hidden = false;
      renderContent();
      if (focusTitle) document.querySelector('#learn-title')?.focus({ preventScroll: true });
    }

    function openCourse(id, lessonIndex) {
      const course = findCourse(id);
      if (!course || state.mode === 'error' || state.mode === 'loading') return;
      const saved = data().progress.get(id);
      const requested = Number.isInteger(lessonIndex) ? lessonIndex : (saved?.current || 0);
      state.activeCourse = id;
      state.lesson = Math.max(0, Math.min(course.lessons.length - 1, requested));
      remember(course, state.lesson);
      content.hidden = true;
      detail.hidden = false;
      renderCourse(true);
      detail.scrollIntoView({ block: 'start', behavior: 'instant' });
    }

    content.addEventListener('input', (event) => {
      if (event.target.id !== 'learn-search') return;
      state.search = event.target.value;
      renderPanels();
    });
    root.addEventListener('click', (event) => {
      const button = event.target instanceof Element ? event.target.closest('button') : null;
      if (!button || !root.contains(button) || button.disabled) return;
      if (button.hasAttribute('data-learn-open')) {
        openCourse(button.dataset.learnOpen, button.hasAttribute('data-learn-lesson') ? Number(button.dataset.learnLesson) : undefined);
      } else if (button.hasAttribute('data-learn-filter')) {
        state.filter = button.dataset.learnFilter;
        content.querySelectorAll('[data-learn-filter]').forEach((item) => {
          const selected = item.dataset.learnFilter === state.filter;
          item.setAttribute('aria-pressed', String(selected));
          item.classList.toggle('learn-filter-active', selected);
        });
        renderPanels();
      } else if (button.id === 'learn-catalogue-toggle') {
        state.catalogueExpanded = !state.catalogueExpanded;
        renderPanels();
      } else if (button.id === 'learn-continue-toggle') {
        state.continueExpanded = !state.continueExpanded;
        renderPanels();
      } else if (button.id === 'learn-history-toggle') {
        state.expanded = !state.expanded;
        renderHistory();
      } else if (button.hasAttribute('data-learn-back')) showOverview(true);
      else if (button.hasAttribute('data-learn-retry')) window.WorkspacePreview?.setMode(state.dataMode);
      else if (button.hasAttribute('data-learn-catalogue')) content.querySelector('[data-learn-filter]')?.focus();
      else if (button.hasAttribute('data-learn-lesson-select')) openCourse(state.activeCourse, Number(button.dataset.learnLessonSelect));
      else if (button.hasAttribute('data-learn-step')) openCourse(state.activeCourse, state.lesson + Number(button.dataset.learnStep));
      else if (button.hasAttribute('data-learn-complete')) {
        remember(findCourse(state.activeCourse), state.lesson, true);
        renderCourse();
        detail.querySelector('.learn-reader-feedback')?.setAttribute('tabindex', '-1');
        detail.querySelector('.learn-reader-feedback')?.focus({ preventScroll: true });
      }
    });
    document.addEventListener('workspace:view', (event) => {
      if (event.detail?.name === 'learn') showOverview();
    });
    document.addEventListener('workspace:preview-state', (event) => {
      const mode = event.detail?.mode;
      if (!['populated', 'new', 'loading', 'error'].includes(mode)) return;
      state.mode = mode;
      if (mode === 'populated' || mode === 'new') state.dataMode = mode;
      showOverview();
    });
    showOverview();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
