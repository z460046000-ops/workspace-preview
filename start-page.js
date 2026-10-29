/* 开始页引导：随机展示六个任务提示；海报参考通过既有入口更新草稿。 */
(() => {
  'use strict';

  const taskPools = {
    office: [
      { key: 'report', label: '工作汇报', placeholder: '根据本周工作记录整理一份汇报，说明完成了什么、进展如何、有哪些待协调事项……' },
      { key: 'minutes', label: '会议纪要', placeholder: '整理这份会议记录，列出主要结论、待办事项、负责人和截止时间……' },
      { key: 'summary', label: '资料总结', placeholder: '阅读我提供的资料，提炼重点，并保留需要核对的信息和来源……' },
      { key: 'proposal', label: '方案初稿', placeholder: '帮我整理一份方案初稿。我会提供背景、目标、使用对象和已有材料……' },
    ],
    marketing: [
      { key: 'campaign', label: '活动策划', placeholder: '帮我梳理一场活动的方案，先确认活动目标、面向人群、预算和时间……' },
      { key: 'copy', label: '推广文案', placeholder: '根据产品资料写一份推广文案，先确认卖点、发布渠道和文案长度……' },
      { key: 'script', label: '视频脚本', placeholder: '根据产品卖点写一份宣传视频脚本，包含画面建议与旁白。先确认时长和目标观众……' },
      { key: 'review', label: '活动复盘', placeholder: '根据活动记录和数据整理复盘，说明结果、问题和下一次可以改进的地方……' },
    ],
    design: [
      { key: 'poster', label: '制作海报', placeholder: '想做一张什么海报？说说主题、用途和尺寸，也可以添加资料，或选一张参考……' },
      { key: 'cover', label: '封面设计', placeholder: '为文章或视频设计一张封面，先确认标题、发布平台、画面比例和品牌素材……' },
      { key: 'invitation', label: '活动邀请函', placeholder: '根据活动资料设计一张邀请函，先确认主题、时间、地点、邀请对象和报名方式……' },
      { key: 'banner', label: '宣传横幅', placeholder: '设计一张宣传横幅，先确认使用位置、宽高尺寸、主要文案和必须保留的素材……' },
    ],
  };
  let selectedPoster = null;

  function shuffled(items) {
    const result = [...items];
    for (let index = result.length - 1; index > 0; index -= 1) {
      const swap = Math.floor(Math.random() * (index + 1));
      [result[index], result[swap]] = [result[swap], result[index]];
    }
    return result;
  }

  function init() {
    const options = document.querySelector('#start-task-options');
    const input = document.querySelector('#request-input');
    const gallery = document.querySelector('#poster-gallery');
    if (!options || !input) return;
    const tasks = shuffled(Object.values(taskPools).flatMap((pool) => shuffled(pool).slice(0, 2)));
    const posterCards = gallery ? [...gallery.querySelectorAll('[data-poster-style]')] : [];
    let selectedTask = null;
    let trackedPrompt = null;
    let observedValue = input.value;

    function clearPosterTracking() {
      trackedPrompt = null;
      selectedPoster = null;
      observedValue = input.value;
      syncPosterSelection();
    }

    function reconcilePosterText() {
      const current = input.value;
      if (trackedPrompt && current !== observedValue) {
        let start = 0;
        while (start < Math.min(current.length, observedValue.length) && current[start] === observedValue[start]) start += 1;
        let suffix = 0;
        while (suffix < Math.min(current.length, observedValue.length) - start && current[current.length - suffix - 1] === observedValue[observedValue.length - suffix - 1]) suffix += 1;
        const oldEnd = observedValue.length - suffix;
        // 改动碰到系统段后，视为用户自己的文字，不再替换它。
        if (start < trackedPrompt.end && oldEnd > trackedPrompt.start) {
          clearPosterTracking();
          return;
        }
        if (oldEnd <= trackedPrompt.start) {
          const delta = current.length - observedValue.length;
          trackedPrompt.start += delta;
          trackedPrompt.end += delta;
        }
        if (current.slice(trackedPrompt.start, trackedPrompt.end) !== trackedPrompt.text) {
          clearPosterTracking();
          return;
        }
      }
      observedValue = current;
    }

    function syncPosterSelection() {
      posterCards.forEach((card) => {
        const selected = card.dataset.posterStyle === selectedPoster;
        card.setAttribute('aria-pressed', String(selected));
        card.classList.toggle('is-selected', selected);
      });
    }

    function syncTaskSelection() {
      options.querySelectorAll('[data-start-task]').forEach((button) => {
        const selected = button.dataset.startTask === selectedTask;
        button.setAttribute('aria-pressed', String(selected));
        button.classList.toggle('is-selected', selected);
      });
    }

    // 仅初次加载抽取并渲染，回到首页时保持原来的六项与键盘焦点。
    options.replaceChildren(...tasks.map((task) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'start-task-chip';
      button.dataset.startTask = task.key;
      button.textContent = task.label;
      button.setAttribute('aria-pressed', 'false');
      return button;
    }));

    options.addEventListener('click', (event) => {
      const button = event.target instanceof Element ? event.target.closest('[data-start-task]') : null;
      if (!button || !options.contains(button)) return;
      const key = button.dataset.startTask;
      const task = tasks.find((item) => item.key === key);
      if (!task) return;
      selectedTask = key;
      input.placeholder = task.placeholder;
      syncTaskSelection();
    });

    gallery?.addEventListener('click', (event) => {
      const card = event.target instanceof Element ? event.target.closest('[data-poster-style]') : null;
      if (!card || !posterCards.includes(card) || card.disabled) return;
      const label = card.dataset.posterLabel;
      if (!label || typeof window.WorkspacePreview?.appendPrompt !== 'function') return;
      const prompt = `请参考「${label}」的视觉风格，为我制作一张海报。先确认主题、文案、尺寸和品牌素材。`;
      reconcilePosterText();
      const original = input.value;
      let nextValue;
      let nextStart;
      let owned = true;
      if (trackedPrompt?.owned) {
        nextStart = trackedPrompt.start;
        nextValue = original.slice(0, trackedPrompt.start) + prompt + original.slice(trackedPrompt.end);
      } else if (original.includes(prompt)) {
        nextValue = original;
        nextStart = original.indexOf(prompt);
        owned = false; // 用户已写过的同款提示不归系统所有。
      } else {
        const separator = original && !original.endsWith('\n') ? '\n' : '';
        nextStart = original.length + separator.length;
        nextValue = original + separator + prompt;
      }
      if (input.maxLength >= 0 && nextValue.length > input.maxLength) {
        window.WorkspacePreview.toast?.('输入空间不足，请先精简部分内容。原有要求和参考选择已保留。');
        return;
      }
      // 先放入完整候选文本，再复用原入口同步任务类型；它不会重复追加。
      input.value = nextValue;
      if (!window.WorkspacePreview.appendPrompt(prompt, 'poster')) {
        input.value = original;
        observedValue = original;
        return;
      }
      trackedPrompt = { text: prompt, start: nextStart, end: nextStart + prompt.length, owned };
      observedValue = input.value;
      selectedPoster = card.dataset.posterStyle;
      selectedTask = null;
      input.placeholder = taskPools.design.find((task) => task.key === 'poster').placeholder;
      syncTaskSelection();
      syncPosterSelection();
    });

    input.addEventListener('input', reconcilePosterText);
    document.addEventListener('workspace:view', (event) => {
      // 原表单成功提交时先清空输入，再切到详情；空提交不会触发这里。
      if (event.detail?.name === 'detail' && input.value === '') clearPosterTracking();
      if (event.detail?.name === 'home') {
        syncTaskSelection();
        syncPosterSelection();
      }
    });
    syncPosterSelection();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
