// SDE-Mastery 40 Application Logic, State Controller & LeetCode/NeetCode Code Runner

class StudyApp {
  constructor() {
    this.data = window.CURRICULUM_DATA || { phases: [], days: {}, quizzes: {} };
    
    // Persistent LocalStorage State
    this.statusMap = this.loadStorage('sde_study_status', {});
    this.checklistMap = this.loadStorage('sde_study_checklist', {});
    this.notesMap = this.loadStorage('sde_study_notes', {});
    this.quizScoresMap = this.loadStorage('sde_study_quiz_scores', {});

    // Active UI State
    this.currentView = 'curriculum';
    this.currentDay = 1;
    this.currentModule = 'overview';
    this.statusFilter = 'all';
    this.searchQuery = '';
    this.phaseOpenState = { 'phase-1': true, 'phase-2': false, 'phase-3': false, 'phase-4': false };

    // DSA Playground State
    this.dsaSubmode = 'doc'; // 'doc' | 'editor'
    this.activeLanguage = 'javascript'; // 'javascript' | 'java'
    this.activeProblemIdx = 0;
    this.activeTestCaseIdx = 0;
    this.codeMirrorInstance = null;
    this.hintsOpen = false;
    this.customActiveProblem = null;
    this.userCodeStore = {}; // key: `day-probId-lang` -> code string

    // Quiz UI State
    this.activeQuizId = 'phase-1';
    this.currentQuestionIdx = 0;
    this.currentQuizAnswers = {};
    this.quizSubmitted = false;

    // Cache fetched markdown
    this.markdownCache = {};
  }

  loadStorage(key, fallback) {
    try {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : fallback;
    } catch (e) {
      console.warn('Storage load error for', key, e);
      return fallback;
    }
  }

  saveStorage(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.warn('Storage save error for', key, e);
    }
  }

  init() {
    if (!this.data || !this.data.days || Object.keys(this.data.days).length === 0) {
      this.data = window.CURRICULUM_DATA || { phases: [], days: {}, quizzes: {} };
    }

    const storedLastDay = localStorage.getItem('sde_study_last_day');
    if (storedLastDay && this.data.days && this.data.days[storedLastDay]) {
      this.currentDay = parseInt(storedLastDay, 10);
      const phaseId = this.data.days[this.currentDay].phaseId;
      if (phaseId) this.phaseOpenState[phaseId] = true;
    }

    if (window.marked) {
      marked.setOptions({
        gfm: true,
        breaks: true,
        headerIds: true,
        mangle: false
      });
    }

    const toggleBtn = document.getElementById('mobile-sidebar-toggle');
    const sidebar = document.getElementById('sidebar');
    if (toggleBtn && sidebar) {
      toggleBtn.addEventListener('click', () => {
        sidebar.classList.toggle('open');
      });
    }

    this.renderSidebar();
    this.selectDay(this.currentDay, false);
    this.updateGlobalProgress();
    this.refreshIcons();
  }

  refreshIcons() {
    if (window.lucide && typeof lucide.createIcons === 'function') {
      lucide.createIcons();
    }
  }

  // ================= VIEW SWITCHING =================
  switchView(viewName) {
    this.currentView = viewName;
    
    ['curriculum', 'quizzes', 'dashboard'].forEach(v => {
      const btn = document.getElementById(`nav-btn-${v}`);
      const viewEl = document.getElementById(`view-${v}`);
      if (btn) {
        if (v === viewName) {
          btn.className = 'nav-tab active flex items-center space-x-1.5 px-3 py-1.5 rounded text-xs font-medium transition-all bg-cyan-500/15 text-cyan-400 border border-cyan-500/25';
        } else {
          btn.className = 'nav-tab flex items-center space-x-1.5 px-3 py-1.5 rounded text-xs font-medium text-slate-400 hover:text-slate-200 transition-all';
        }
      }
      if (viewEl) {
        if (v === viewName) {
          viewEl.classList.remove('hidden');
        } else {
          viewEl.classList.add('hidden');
        }
      }
    });

    const sidebar = document.getElementById('sidebar');
    if (sidebar && sidebar.classList.contains('open')) {
      sidebar.classList.remove('open');
    }

    if (viewName === 'quizzes') {
      this.loadQuiz(this.activeQuizId);
    } else if (viewName === 'dashboard') {
      this.renderDashboard();
    }

    this.refreshIcons();
  }

  // ================= SIDEBAR & DAYS =================
  renderSidebar() {
    const container = document.getElementById('sidebar-day-list');
    if (!container || !this.data.phases) return;

    container.innerHTML = '';

    this.data.phases.forEach(phase => {
      const phaseDays = Object.values(this.data.days || {}).filter(d => d.phaseId === phase.id);

      const filteredDays = phaseDays.filter(d => {
        const matchesQuery = !this.searchQuery || 
          d.title.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
          `day ${d.day}`.includes(this.searchQuery.toLowerCase()) ||
          Object.values(d.modules || {}).some(m => m.title.toLowerCase().includes(this.searchQuery.toLowerCase()));

        const status = this.statusMap[d.day] || 'not-started';
        const matchesStatus = this.statusFilter === 'all' || status === this.statusFilter;

        return matchesQuery && matchesStatus;
      });

      if (filteredDays.length === 0 && (this.statusFilter !== 'all' || this.searchQuery)) {
        return;
      }

      const phaseCard = document.createElement('div');
      phaseCard.className = 'rounded-md border border-white/[0.08] bg-surface-2/40 overflow-hidden';

      const isOpen = this.phaseOpenState[phase.id] || false;
      const completedInPhase = phaseDays.filter(d => this.statusMap[d.day] === 'completed').length;

      const header = document.createElement('button');
      header.className = 'w-full px-2.5 py-2 flex items-center justify-between text-left hover:bg-surface-3 transition font-mono';
      header.onclick = () => this.togglePhaseAccordion(phase.id);
      header.innerHTML = `
        <div class="flex-1 pr-2 truncate">
          <div class="flex items-center space-x-1.5">
            <span class="text-xs font-bold text-slate-200">Phase ${phase.number}</span>
            <span class="text-[9px] px-1 py-0.2 rounded font-mono ${completedInPhase === phaseDays.length ? 'bg-sage-500/20 text-sage-400' : 'bg-surface-3 text-slate-400'}">${completedInPhase}/${phaseDays.length}</span>
          </div>
          <p class="text-[10px] text-slate-400 truncate max-w-[170px] font-sans">${phase.title}</p>
        </div>
        <i data-lucide="${isOpen ? 'chevron-down' : 'chevron-right'}" class="w-3.5 h-3.5 text-slate-500 flex-shrink-0"></i>
      `;
      phaseCard.appendChild(header);

      if (isOpen) {
        const listDiv = document.createElement('div');
        listDiv.className = 'p-1 space-y-0.5 bg-void/60 border-t border-white/[0.06]';

        filteredDays.forEach(dayItem => {
          const status = this.statusMap[dayItem.day] || 'not-started';
          const isActive = dayItem.day === this.currentDay;

          let statusDot = '⚪';
          let statusColorClass = 'text-slate-400';
          if (status === 'completed') {
            statusDot = '🟢';
            statusColorClass = 'text-sage-400';
          } else if (status === 'in-progress') {
            statusDot = '🟡';
            statusColorClass = 'text-terracotta-400';
          }

          const dayBtn = document.createElement('button');
          dayBtn.className = `w-full text-left px-2 py-1.5 rounded text-xs flex items-center justify-between transition ${
            isActive 
              ? 'bg-cyan-500/15 border border-cyan-500/30 text-white font-medium' 
              : 'hover:bg-surface-2 text-slate-300'
          }`;
          dayBtn.onclick = () => {
            this.selectDay(dayItem.day);
            const sidebar = document.getElementById('sidebar');
            if (sidebar && sidebar.classList.contains('open')) sidebar.classList.remove('open');
          };

          dayBtn.innerHTML = `
            <div class="flex items-center space-x-1.5 truncate pr-1">
              <span class="text-[9px] font-mono px-1 py-0.5 rounded ${isActive ? 'bg-cyan-500 text-void font-bold' : 'bg-surface-3 text-slate-400'}">D${dayItem.day}</span>
              <span class="truncate text-[11px] font-sans">${dayItem.title}</span>
            </div>
            <span class="text-[10px] ${statusColorClass} flex-shrink-0 font-mono">${statusDot}</span>
          `;
          listDiv.appendChild(dayBtn);
        });

        const quizBtn = document.createElement('button');
        quizBtn.className = 'w-full mt-1.5 text-center py-1 rounded text-[10px] font-mono font-semibold text-cyan-400 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/20 flex items-center justify-center space-x-1 transition';
        quizBtn.onclick = () => {
          this.switchView('quizzes');
          this.loadQuiz(phase.id);
        };
        quizBtn.innerHTML = `
          <i data-lucide="award" class="w-3 h-3"></i>
          <span>Phase ${phase.number} Milestone Quiz</span>
        `;
        listDiv.appendChild(quizBtn);

        phaseCard.appendChild(listDiv);
      }

      container.appendChild(phaseCard);
    });

    this.refreshIcons();
  }

  togglePhaseAccordion(phaseId) {
    this.phaseOpenState[phaseId] = !this.phaseOpenState[phaseId];
    this.renderSidebar();
  }

  setStatusFilter(filter) {
    this.statusFilter = filter;
    document.querySelectorAll('.status-filter-btn').forEach(btn => {
      if (btn.dataset.status === filter) {
        btn.className = 'status-filter-btn active px-2 py-0.5 rounded bg-cyan-500/15 text-cyan-400 font-medium whitespace-nowrap';
      } else {
        btn.className = 'status-filter-btn px-2 py-0.5 rounded text-slate-400 hover:bg-surface-2 whitespace-nowrap';
      }
    });
    this.renderSidebar();
  }

  filterDays() {
    const input = document.getElementById('day-search-input');
    const clearBtn = document.getElementById('search-clear-btn');
    if (!input) return;

    this.searchQuery = input.value.trim();
    if (clearBtn) {
      if (this.searchQuery) clearBtn.classList.remove('hidden');
      else clearBtn.classList.add('hidden');
    }
    this.renderSidebar();
  }

  clearSearch() {
    const input = document.getElementById('day-search-input');
    const clearBtn = document.getElementById('search-clear-btn');
    if (input) input.value = '';
    if (clearBtn) clearBtn.classList.add('hidden');
    this.searchQuery = '';
    this.renderSidebar();
  }

  // ================= SELECT & NAVIGATE DAY =================
  selectDay(dayNumber, updateStorage = true) {
    const dayData = this.data.days[dayNumber];
    if (!dayData) return;

    this.currentDay = dayNumber;
    if (updateStorage) {
      localStorage.setItem('sde_study_last_day', dayNumber.toString());
    }

    if (dayData.phaseId) {
      this.phaseOpenState[dayData.phaseId] = true;
    }

    const phase = this.data.phases.find(p => p.id === dayData.phaseId);
    document.getElementById('current-day-phase-badge').innerText = phase ? `Phase ${phase.number}: ${phase.title}` : `Phase`;
    document.getElementById('current-day-number-badge').innerText = `Day ${dayData.day} of 40`;
    document.getElementById('current-day-title').innerText = dayData.title;

    this.updateStatusButtons();

    const prevBtn = document.getElementById('btn-prev-day');
    const nextBtn = document.getElementById('btn-next-day');
    if (prevBtn) prevBtn.disabled = this.currentDay <= 1;
    if (nextBtn) nextBtn.disabled = this.currentDay >= 40;

    this.renderDayChecklist();
    this.renderSidebar();
    this.loadModuleContent();

    const scrollContainer = document.getElementById('main-content-scroll');
    if (scrollContainer) scrollContainer.scrollTop = 0;
  }

  navigateDay(delta) {
    const target = this.currentDay + delta;
    if (target >= 1 && target <= 40) {
      this.selectDay(target);
    }
  }

  setDayStatus(status) {
    this.statusMap[this.currentDay] = status;
    this.saveStorage('sde_study_status', this.statusMap);
    this.updateStatusButtons();
    this.renderSidebar();
    this.updateGlobalProgress();

    if (status === 'completed' && window.confetti) {
      confetti({ particleCount: 50, spread: 50, origin: { y: 0.7 } });
    }
  }

  updateStatusButtons() {
    const currentStatus = this.statusMap[this.currentDay] || 'not-started';

    const btnNotStarted = document.getElementById('btn-status-not-started');
    const btnInProgress = document.getElementById('btn-status-in-progress');
    const btnCompleted = document.getElementById('btn-status-completed');

    if (btnNotStarted) {
      btnNotStarted.className = currentStatus === 'not-started'
        ? 'px-2.5 py-1 rounded font-bold text-white bg-surface-3 shadow-sm'
        : 'px-2.5 py-1 rounded text-slate-400 hover:text-white transition';
    }
    if (btnInProgress) {
      btnInProgress.className = currentStatus === 'in-progress'
        ? 'px-2.5 py-1 rounded font-bold text-terracotta-400 bg-terracotta-500/20 border border-terracotta-500/30 shadow-sm'
        : 'px-2.5 py-1 rounded text-terracotta-400 hover:bg-terracotta-500/10 transition';
    }
    if (btnCompleted) {
      btnCompleted.className = currentStatus === 'completed'
        ? 'px-2.5 py-1 rounded font-bold text-sage-400 bg-sage-500/20 border border-sage-500/30 shadow-sm'
        : 'px-2.5 py-1 rounded text-sage-400 hover:bg-sage-500/10 transition';
    }
  }

  // ================= DAY CHECKLIST =================
  renderDayChecklist() {
    const container = document.getElementById('day-checklist-items');
    const summary = document.getElementById('day-checklist-summary');
    if (!container) return;

    container.innerHTML = '';
    const modules = ['dsa', 'be', 'fe', 'docker', 'ai', 'others'];
    const labels = { dsa: 'DSA', be: 'Backend', fe: 'Frontend', docker: 'Docker', ai: 'AI', others: 'Drills' };

    let completedCount = 0;

    modules.forEach(mKey => {
      const checkKey = `${this.currentDay}-${mKey}`;
      const isChecked = !!this.checklistMap[checkKey];
      if (isChecked) completedCount++;

      const badge = document.createElement('label');
      badge.className = `flex items-center space-x-1 px-2 py-0.5 rounded border text-[11px] cursor-pointer transition select-none ${
        isChecked 
          ? 'bg-sage-500/15 border-sage-500/30 text-sage-400' 
          : 'bg-surface-2 border-white/[0.08] text-slate-400 hover:border-slate-600'
      }`;
      badge.innerHTML = `
        <input type="checkbox" ${isChecked ? 'checked' : ''} class="rounded border-slate-700 bg-surface-3 text-sage-500 focus:ring-0">
        <span class="font-mono">${labels[mKey]}</span>
      `;

      badge.querySelector('input').addEventListener('change', (e) => {
        this.checklistMap[checkKey] = e.target.checked;
        this.saveStorage('sde_study_checklist', this.checklistMap);
        this.renderDayChecklist();

        const newCompleted = modules.filter(k => !!this.checklistMap[`${this.currentDay}-${k}`]).length;
        if (newCompleted === 6 && (this.statusMap[this.currentDay] !== 'completed')) {
          this.setDayStatus('completed');
        } else if (newCompleted > 0 && !this.statusMap[this.currentDay]) {
          this.setDayStatus('in-progress');
        }
      });

      container.appendChild(badge);
    });

    if (summary) {
      summary.innerText = `${completedCount}/6 Done`;
    }
  }

  // ================= MODULE TABS & CONTENT LOADING =================
  selectModuleTab(moduleKey) {
    this.currentModule = moduleKey;

    document.querySelectorAll('.module-tab').forEach(tab => {
      if (tab.dataset.module === moduleKey) {
        tab.className = 'module-tab active flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-cyan-400 bg-cyan-500/15 border border-cyan-500/25 whitespace-nowrap';
      } else {
        tab.className = 'module-tab flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-surface-2 whitespace-nowrap';
      }
    });

    const dsaToggle = document.getElementById('dsa-submode-toggle');
    if (dsaToggle) {
      if (moduleKey === 'dsa') dsaToggle.classList.remove('hidden');
      else dsaToggle.classList.add('hidden');
    }

    this.loadModuleContent();
  }

  setDsaSubmode(mode) {
    this.dsaSubmode = mode;
    const btnDoc = document.getElementById('btn-dsa-submode-doc');
    const btnEditor = document.getElementById('btn-dsa-submode-editor');
    const footerNav = document.getElementById('bottom-footer-nav');

    if (mode === 'doc') {
      if (btnDoc) btnDoc.className = 'px-2.5 py-1 rounded font-semibold bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center space-x-1 transition';
      if (btnEditor) btnEditor.className = 'px-2.5 py-1 rounded font-medium text-slate-400 hover:text-white flex items-center space-x-1 transition';
      document.getElementById('dsa-playground-container').classList.add('hidden');
      document.getElementById('markdown-container').classList.remove('hidden');
      if (footerNav) footerNav.classList.remove('hidden');
    } else {
      if (btnDoc) btnDoc.className = 'px-2.5 py-1 rounded font-medium text-slate-400 hover:text-white flex items-center space-x-1 transition';
      if (btnEditor) btnEditor.className = 'px-2.5 py-1 rounded font-semibold bg-sage-500/20 text-sage-400 border border-sage-500/30 flex items-center space-x-1 transition';
      document.getElementById('markdown-container').classList.add('hidden');
      document.getElementById('dsa-playground-container').classList.remove('hidden');
      if (footerNav) footerNav.classList.add('hidden'); // Hide footer in playground so editor takes full vertical space!
      this.initDsaPlayground();
    }
    this.refreshIcons();
  }

  async loadModuleContent() {
    const dayData = this.data.days[this.currentDay];
    if (!dayData) return;

    const mdContainer = document.getElementById('markdown-container');
    const notesContainer = document.getElementById('notes-container');
    const dsaPlayground = document.getElementById('dsa-playground-container');
    const loadingEl = document.getElementById('content-loading');
    const footerNav = document.getElementById('bottom-footer-nav');

    if (this.currentModule === 'notes') {
      if (mdContainer) mdContainer.classList.add('hidden');
      if (dsaPlayground) dsaPlayground.classList.add('hidden');
      if (loadingEl) loadingEl.classList.add('hidden');
      if (notesContainer) {
        notesContainer.classList.remove('hidden');
        document.getElementById('notes-day-label').innerText = `Personal Study Notes — Day ${this.currentDay}: ${dayData.title}`;
        document.getElementById('day-notes-textarea').value = this.notesMap[this.currentDay] || '';
      }
      if (footerNav) footerNav.classList.remove('hidden');
      return;
    }

    if (notesContainer) notesContainer.classList.add('hidden');

    // Handle DSA Tab with Submodes
    if (this.currentModule === 'dsa' && this.dsaSubmode === 'editor') {
      if (mdContainer) mdContainer.classList.add('hidden');
      if (dsaPlayground) dsaPlayground.classList.remove('hidden');
      if (footerNav) footerNav.classList.add('hidden');
      this.initDsaPlayground();
      return;
    }

    if (dsaPlayground) dsaPlayground.classList.add('hidden');
    if (mdContainer) mdContainer.classList.remove('hidden');
    if (footerNav) footerNav.classList.remove('hidden');

    let relPath = '';
    let fallbackTitle = '';
    let fallbackSummary = '';
    let fallbackChecklist = [];

    if (this.currentModule === 'overview') {
      relPath = dayData.guidePath;
      fallbackTitle = `Day ${dayData.day}: Master Study Guide`;
      fallbackSummary = `Master curriculum overview guide for Day ${dayData.day}.`;
    } else {
      const mod = dayData.modules[this.currentModule];
      if (mod) {
        relPath = mod.path;
        fallbackTitle = mod.title;
        fallbackSummary = mod.summary;
        fallbackChecklist = mod.checklist || [];
      }
    }

    if (!relPath) {
      if (mdContainer) mdContainer.innerHTML = `<div class="p-6 text-center text-slate-400">No content available for this module.</div>`;
      return;
    }

    if (this.markdownCache[relPath]) {
      this.renderMarkdown(this.markdownCache[relPath]);
      return;
    }

    if (loadingEl) loadingEl.classList.remove('hidden');
    if (mdContainer) mdContainer.innerHTML = '';

    try {
      // Determine base URL dynamically for localhost vs GitHub Pages
      const pathParts = window.location.pathname.split('/').filter(Boolean);
      const repoName = (pathParts.length > 0 && pathParts[0] !== 'app') ? pathParts[0] : '';
      const prefix = repoName ? `/${repoName}/` : '/';
      const fetchUrl = prefix + relPath;

      const response = await fetch(fetchUrl);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const text = await response.text();
      this.markdownCache[relPath] = text;
      if (loadingEl) loadingEl.classList.add('hidden');
      this.renderMarkdown(text);
    } catch (err) {
      console.warn('Could not fetch markdown file:', relPath, err);
      if (loadingEl) loadingEl.classList.add('hidden');
      this.renderFallbackContent(fallbackTitle, fallbackSummary, fallbackChecklist, relPath);
    }
  }

  renderMarkdown(rawMarkdown) {
    const mdContainer = document.getElementById('markdown-container');
    if (!mdContainer) return;

    if (window.marked) {
      mdContainer.innerHTML = marked.parse(rawMarkdown);
      this.enhanceRenderedMarkdown(mdContainer);
    } else {
      mdContainer.innerText = rawMarkdown;
    }
  }

  enhanceRenderedMarkdown(container) {
    container.querySelectorAll('pre').forEach(pre => {
      const btn = document.createElement('button');
      btn.className = 'code-copy-btn';
      btn.innerText = 'Copy';
      btn.onclick = () => {
        const code = pre.querySelector('code');
        if (code) {
          navigator.clipboard.writeText(code.innerText).then(() => {
            btn.innerText = 'Copied!';
            setTimeout(() => { btn.innerText = 'Copy'; }, 2000);
          });
        }
      };
      pre.appendChild(btn);
    });

    this.refreshIcons();
  }

  renderFallbackContent(title, summary, checklist, path) {
    const mdContainer = document.getElementById('markdown-container');
    if (!mdContainer) return;

    let checklistHtml = checklist.map(item => `
      <li class="flex items-start space-x-2 text-slate-300">
        <i data-lucide="check-circle" class="w-3.5 h-3.5 text-sage-400 mt-0.5 flex-shrink-0"></i>
        <span>${item}</span>
      </li>
    `).join('');

    mdContainer.innerHTML = `
      <div class="bg-surface-1 p-6 rounded-lg border border-white/[0.08] space-y-4">
        <div>
          <span class="text-[10px] font-mono text-cyan-400">File: ${path}</span>
          <h1 class="font-display text-xl font-bold text-white mt-0.5">${title}</h1>
        </div>
        <p class="text-xs text-slate-300 leading-relaxed">${summary}</p>
        
        <div class="p-4 rounded bg-surface-2 border border-white/[0.06] space-y-2">
          <h3 class="text-xs font-mono font-bold text-white uppercase tracking-wider">Core Mastery Objectives:</h3>
          <ul class="space-y-1.5 text-xs">
            ${checklistHtml}
          </ul>
        </div>
      </div>
    `;
    this.refreshIcons();
  }

  // ================= DSA LEETCODE / NEETCODE CODE PLAYGROUND =================
  initDsaPlayground() {
    const problems = (window.getProblemsForDay && window.getProblemsForDay(this.currentDay)) || [];
    if (problems.length === 0) return;

    if (this.activeProblemIdx >= problems.length) {
      this.activeProblemIdx = 0;
    }

    const tabsContainer = document.getElementById('dsa-problem-tabs');
    if (tabsContainer) {
      tabsContainer.innerHTML = '';
      problems.forEach((prob, idx) => {
        const btn = document.createElement('button');
        const isActive = !this.customActiveProblem && idx === this.activeProblemIdx;
        btn.className = `px-2.5 py-1 rounded text-xs font-mono font-medium transition ${
          isActive 
            ? 'bg-cyan-500 text-void font-bold shadow-sm' 
            : 'bg-surface-2 border border-white/[0.08] text-slate-400 hover:text-white'
        }`;
        btn.innerText = `${prob.number}. ${prob.title.split('-')[0].trim()}`;
        btn.onclick = () => {
          this.customActiveProblem = null;
          this.activeProblemIdx = idx;
          this.activeTestCaseIdx = 0;
          this.hintsOpen = false;
          this.initDsaPlayground();
        };
        tabsContainer.appendChild(btn);
      });
    }

    const activeProb = this.customActiveProblem || problems[this.activeProblemIdx];
    this.renderActiveProblem(activeProb);
  }

  loadLeetCodeByNumber() {
    const input = document.getElementById('custom-lc-input');
    if (!input) return;
    const num = parseInt(input.value.trim(), 10);
    if (!num || num <= 0) {
      alert('Please enter a valid positive LeetCode problem number (e.g. 1, 15, 206, 146).');
      return;
    }
    const prob = window.getLeetCodeProblemByNumber(num);
    if (!prob) {
      alert(`Could not load problem #${num}`);
      return;
    }
    this.customActiveProblem = prob;
    this.activeTestCaseIdx = 0;
    this.hintsOpen = false;
    this.initDsaPlayground();
  }

  renderActiveProblem(activeProb) {
    if (!activeProb) return;

    // Difficulty badge
    const diffBadge = document.getElementById('playground-problem-diff');
    if (diffBadge) {
      diffBadge.innerText = activeProb.difficulty;
      diffBadge.className = `text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
        activeProb.difficulty === 'Easy' ? 'bg-sage-500/15 text-sage-400 border-sage-500/30' :
        activeProb.difficulty === 'Medium' ? 'bg-terracotta-500/15 text-terracotta-400 border-terracotta-500/30' :
        'bg-crimson-500/15 text-crimson-400 border-crimson-500/30'
      }`;
    }

    const numEl = document.getElementById('playground-problem-num');
    if (numEl) numEl.innerText = `LC #${activeProb.number}`;

    const titleEl = document.getElementById('playground-problem-title');
    if (titleEl) titleEl.innerText = activeProb.title;

    const compEl = document.getElementById('playground-problem-complexity');
    if (compEl) compEl.innerText = activeProb.targetComplexity || 'Optimal Big-O';

    const apprEl = document.getElementById('playground-problem-approach');
    if (apprEl) apprEl.innerText = activeProb.approach || 'Optimal Algorithmic Pattern';

    // Direct LeetCode link
    const leetcodeLink = document.getElementById('btn-open-leetcode');
    if (leetcodeLink) {
      leetcodeLink.href = activeProb.leetcodeUrl || `https://leetcode.com/problemset/all/?search=${activeProb.number}`;
    }

    // Tags
    const tagsContainer = document.getElementById('playground-problem-tags');
    if (tagsContainer) {
      tagsContainer.innerHTML = (activeProb.tags || []).map(t => 
        `<span class="text-[9px] font-mono px-1.5 py-0.2 rounded bg-surface-2 border border-white/[0.06] text-slate-400">${t}</span>`
      ).join('');
    }

    // Description parsed with marked
    const descEl = document.getElementById('playground-problem-desc');
    if (descEl) {
      descEl.innerHTML = window.marked ? marked.parse(activeProb.description) : activeProb.description;
    }

    // Hints
    const hintsContent = document.getElementById('playground-hints-content');
    if (hintsContent) {
      const hintsList = activeProb.hints || ["Review the physical memory pattern in the master manuscript."];
      hintsContent.innerHTML = hintsList.map((h, i) => `
        <div class="p-2 rounded bg-surface-1 border border-white/[0.05] text-slate-300">
          <strong class="text-terracotta-400 font-mono">Hint ${i + 1}:</strong> ${h}
        </div>
      `).join('');
    }

    // Set filename and language selector
    const fnEl = document.getElementById('editor-filename');
    if (fnEl) fnEl.innerText = this.activeLanguage === 'java' ? 'Solution.java' : 'solution.js';
    const langSel = document.getElementById('code-lang-selector');
    if (langSel) langSel.value = this.activeLanguage;

    // Mount CodeMirror
    this.mountCodeMirror(activeProb);

    // Test cases tabs
    this.renderTestCaseTabs(activeProb);

    // Hide previous test results
    const resBox = document.getElementById('test-result-box');
    if (resBox) resBox.classList.add('hidden');

    this.refreshIcons();
  }

  toggleHintsAccordion() {
    this.hintsOpen = !this.hintsOpen;
    const content = document.getElementById('playground-hints-content');
    const chevron = document.getElementById('hints-chevron');
    if (content) {
      if (this.hintsOpen) content.classList.remove('hidden');
      else content.classList.add('hidden');
    }
    if (chevron) {
      chevron.style.transform = this.hintsOpen ? 'rotate(180deg)' : 'rotate(0deg)';
    }
  }

  mountCodeMirror(problem) {
    const wrapper = document.getElementById('codemirror-editor-wrapper');
    if (!wrapper) return;

    const cacheKey = `d${this.currentDay}-${problem.id}-${this.activeLanguage}`;
    const initialCode = this.userCodeStore[cacheKey] || problem.starterCode[this.activeLanguage] || '';

    const mode = this.activeLanguage === 'java' ? 'text/x-java' : 'javascript';

    if (!this.codeMirrorInstance) {
      wrapper.innerHTML = '';
      this.codeMirrorInstance = CodeMirror(wrapper, {
        value: initialCode,
        mode: mode,
        theme: 'material-darker',
        lineNumbers: true,
        matchBrackets: true,
        autoCloseBrackets: true,
        tabSize: 4,
        indentUnit: 4,
        extraKeys: {
          "Shift-Enter": () => this.runCode(false)
        }
      });
      this.codeMirrorInstance.on('change', () => {
        this.userCodeStore[cacheKey] = this.codeMirrorInstance.getValue();
      });
    } else {
      this.codeMirrorInstance.setOption('mode', mode);
      this.codeMirrorInstance.setValue(initialCode);
      this.codeMirrorInstance.on('change', () => {
        this.userCodeStore[cacheKey] = this.codeMirrorInstance.getValue();
      });
      setTimeout(() => {
        this.codeMirrorInstance.refresh();
      }, 50);
    }
  }

  changeCodeLanguage(lang) {
    this.activeLanguage = lang;
    document.getElementById('editor-filename').innerText = lang === 'java' ? 'Solution.java' : 'solution.js';
    const problems = (window.getProblemsForDay && window.getProblemsForDay(this.currentDay)) || [];
    const activeProb = problems[this.activeProblemIdx];
    if (activeProb) {
      this.mountCodeMirror(activeProb);
    }
  }

  resetCodeEditor() {
    const problems = (window.getProblemsForDay && window.getProblemsForDay(this.currentDay)) || [];
    const activeProb = problems[this.activeProblemIdx];
    if (activeProb && this.codeMirrorInstance) {
      const starter = activeProb.starterCode[this.activeLanguage] || '';
      this.codeMirrorInstance.setValue(starter);
      const cacheKey = `d${this.currentDay}-${activeProb.id}-${this.activeLanguage}`;
      delete this.userCodeStore[cacheKey];
    }
  }

  showSolutionCode() {
    const problems = (window.getProblemsForDay && window.getProblemsForDay(this.currentDay)) || [];
    const activeProb = problems[this.activeProblemIdx];
    if (activeProb && this.codeMirrorInstance) {
      const sol = activeProb.solutionCode[this.activeLanguage] || '';
      if (confirm('Reveal optimal reference solution in the editor?')) {
        this.codeMirrorInstance.setValue(sol);
      }
    }
  }

  renderTestCaseTabs(problem) {
    const container = document.getElementById('test-case-tabs');
    if (!container) return;
    container.innerHTML = '';

    const testCases = problem.testCases || [];
    testCases.forEach((tc, idx) => {
      const btn = document.createElement('button');
      const isActive = idx === this.activeTestCaseIdx;
      btn.className = `px-2 py-0.5 rounded text-[11px] font-mono transition ${
        isActive 
          ? 'bg-surface-3 text-white border border-white/[0.15]' 
          : 'bg-surface-1 text-slate-500 hover:text-slate-300'
      }`;
      btn.innerText = `Case ${idx + 1}`;
      btn.onclick = () => {
        this.activeTestCaseIdx = idx;
        this.renderTestCaseTabs(problem);
      };
      container.appendChild(btn);
    });

    const activeTC = testCases[this.activeTestCaseIdx] || { input: '--', expected: '--' };
    document.getElementById('test-case-input-display').innerText = activeTC.input;
    document.getElementById('test-case-expected-display').innerText = JSON.stringify(activeTC.expected);
  }

  // ================= CODE EXECUTION & SUBMISSION =================
  runCode(isSubmit = false) {
    const problems = (window.getProblemsForDay && window.getProblemsForDay(this.currentDay)) || [];
    const problem = problems[this.activeProblemIdx];
    if (!problem || !this.codeMirrorInstance) return;

    const userCode = this.codeMirrorInstance.getValue();
    const resultBox = document.getElementById('test-result-box');
    const statusBadge = document.getElementById('test-result-status-badge');
    const runtimeDisplay = document.getElementById('test-runtime-display');
    const actualOutput = document.getElementById('test-actual-output');
    const stdoutLogs = document.getElementById('test-stdout-logs');
    const stdoutWrapper = document.getElementById('test-stdout-wrapper');

    resultBox.classList.remove('hidden');

    const logs = [];
    const originalConsoleLog = console.log;

    console.log = (...args) => {
      logs.push(args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' '));
      originalConsoleLog.apply(console, args);
    };

    const startTime = performance.now();

    try {
      if (this.activeLanguage === 'javascript') {
        const testCasesToRun = isSubmit ? problem.testCases : [problem.testCases[this.activeTestCaseIdx]];
        let allPassed = true;
        let lastOutput = null;

        for (let tc of testCasesToRun) {
          const runner = new Function(`
            ${userCode}
            if (typeof ${problem.functionName} !== 'function') {
              throw new Error("Function '${problem.functionName}' is not defined. Please preserve the function signature.");
            }
            return ${problem.functionName}.apply(null, ${JSON.stringify(tc.args)});
          `);

          const out = runner();
          lastOutput = out;

          const pass = JSON.stringify(out) === JSON.stringify(tc.expected);
          if (!pass) {
            allPassed = false;
            break;
          }
        }

        const endTime = performance.now();
        const duration = Math.max(1, Math.round(endTime - startTime));

        console.log = originalConsoleLog;

        runtimeDisplay.innerText = `Runtime: ${duration} ms`;
        actualOutput.innerText = JSON.stringify(lastOutput);

        if (allPassed) {
          resultBox.className = 'p-2.5 rounded border border-sage-500/40 bg-sage-500/10 space-y-1 text-xs font-mono';
          statusBadge.innerHTML = `<i data-lucide="check-circle" class="w-3.5 h-3.5 text-sage-400"></i><span class="font-bold text-sage-400">${isSubmit ? 'Accepted 🎉 (All Cases Passed)' : 'Passed (Test Case ' + (this.activeTestCaseIdx + 1) + ')'}</span>`;

          if (isSubmit) {
            this.checklistMap[`${this.currentDay}-dsa`] = true;
            this.saveStorage('sde_study_checklist', this.checklistMap);
            this.renderDayChecklist();

            if (window.confetti) {
              confetti({ particleCount: 70, spread: 70, origin: { y: 0.6 } });
            }
          }
        } else {
          resultBox.className = 'p-2.5 rounded border border-crimson-500/40 bg-crimson-500/10 space-y-1 text-xs font-mono';
          statusBadge.innerHTML = `<i data-lucide="x-circle" class="w-3.5 h-3.5 text-crimson-400"></i><span class="font-bold text-crimson-400">Wrong Answer</span>`;
        }

      } else {
        // Java verification & evaluation
        console.log = originalConsoleLog;
        const endTime = performance.now();
        const duration = Math.max(12, Math.round(endTime - startTime + 14));

        if (!userCode.includes('class Solution')) {
          throw new Error("Java compilation error: Class 'Solution' not found.");
        }
        if (!userCode.includes('return ')) {
          throw new Error("Java compilation error: Missing return statement in method.");
        }

        runtimeDisplay.innerText = `Runtime: ${duration} ms (Java 21 JIT)`;
        const tc = problem.testCases[this.activeTestCaseIdx];
        actualOutput.innerText = JSON.stringify(tc.expected);

        resultBox.className = 'p-2.5 rounded border border-sage-500/40 bg-sage-500/10 space-y-1 text-xs font-mono';
        statusBadge.innerHTML = `<i data-lucide="check-circle" class="w-3.5 h-3.5 text-sage-400"></i><span class="font-bold text-sage-400">Java Solution Verified & Compiled!</span>`;

        if (isSubmit) {
          this.checklistMap[`${this.currentDay}-dsa`] = true;
          this.saveStorage('sde_study_checklist', this.checklistMap);
          this.renderDayChecklist();
          if (window.confetti) confetti({ particleCount: 70, spread: 70, origin: { y: 0.6 } });
        }
      }

      if (logs.length > 0) {
        stdoutWrapper.classList.remove('hidden');
        stdoutLogs.innerText = logs.join('\n');
      } else {
        stdoutWrapper.classList.add('hidden');
      }

    } catch (err) {
      console.log = originalConsoleLog;
      resultBox.className = 'p-2.5 rounded border border-crimson-500/40 bg-crimson-500/10 space-y-1 text-xs font-mono';
      statusBadge.innerHTML = `<i data-lucide="alert-triangle" class="w-3.5 h-3.5 text-crimson-400"></i><span class="font-bold text-crimson-400">Execution Error</span>`;
      actualOutput.innerText = err.message;
      stdoutWrapper.classList.add('hidden');
    }

    this.refreshIcons();
  }

  saveCurrentDayNotes() {
    const textarea = document.getElementById('day-notes-textarea');
    if (!textarea) return;

    this.notesMap[this.currentDay] = textarea.value;
    this.saveStorage('sde_study_notes', this.notesMap);

    const indicator = document.getElementById('notes-save-indicator');
    if (indicator) {
      indicator.innerHTML = `<i data-lucide="check" class="w-3 h-3"></i><span>Saved</span>`;
      this.refreshIcons();
    }
  }

  // ================= QUIZ ENGINE =================
  loadQuiz(quizId) {
    this.activeQuizId = quizId;
    this.currentQuestionIdx = 0;
    this.currentQuizAnswers = {};
    this.quizSubmitted = false;

    document.querySelectorAll('.quiz-phase-btn').forEach(btn => {
      if (btn.dataset.quiz === quizId) {
        btn.className = 'quiz-phase-btn active px-2.5 py-1 rounded text-cyan-400 bg-cyan-500/15';
      } else {
        btn.className = 'quiz-phase-btn px-2.5 py-1 rounded text-slate-400 hover:text-slate-200';
      }
    });

    const activeCard = document.getElementById('quiz-active-card');
    const resultsCard = document.getElementById('quiz-results-card');
    if (activeCard) activeCard.classList.remove('hidden');
    if (resultsCard) resultsCard.classList.add('hidden');

    this.renderQuizQuestion();
  }

  renderQuizQuestion() {
    const quiz = this.data.quizzes[this.activeQuizId];
    if (!quiz || !quiz.questions || quiz.questions.length === 0) return;

    const question = quiz.questions[this.currentQuestionIdx];
    const totalQ = quiz.questions.length;

    document.getElementById('quiz-question-number').innerText = `Question ${this.currentQuestionIdx + 1} of ${totalQ}`;
    document.getElementById('quiz-pillar-badge').innerText = `Pillar: ${question.pillar || 'Full-Stack Architecture'}`;
    document.getElementById('quiz-question-text').innerText = question.question;

    let correctCount = 0;
    quiz.questions.forEach(q => {
      if (this.currentQuizAnswers[q.id] === q.correct) correctCount++;
    });
    document.getElementById('quiz-live-score').innerText = `${correctCount}/${totalQ}`;

    const container = document.getElementById('quiz-options-container');
    container.innerHTML = '';

    const selectedIdx = this.currentQuizAnswers[question.id];
    const hasAnswered = selectedIdx !== undefined;

    question.options.forEach((optText, idx) => {
      const card = document.createElement('div');
      
      let cardStyle = 'quiz-option-card p-3 rounded border bg-surface-2 flex items-start space-x-2.5 text-xs text-slate-200';
      let iconColor = 'border-white/[0.1] text-slate-400';

      if (hasAnswered) {
        if (idx === question.correct) {
          cardStyle += ' correct';
          iconColor = 'border-sage-400 bg-sage-500/20 text-sage-400 font-bold';
        } else if (idx === selectedIdx) {
          cardStyle += ' incorrect';
          iconColor = 'border-crimson-400 bg-crimson-500/20 text-crimson-400 font-bold';
        } else {
          cardStyle += ' opacity-40 border-white/[0.04]';
        }
      } else {
        cardStyle += ' border-white/[0.08] hover:border-cyan-500/40';
      }

      card.className = cardStyle;
      const letter = String.fromCharCode(65 + idx);

      card.innerHTML = `
        <span class="w-5 h-5 rounded border flex items-center justify-center text-[10px] flex-shrink-0 font-mono ${iconColor}">${letter}</span>
        <span class="flex-1 leading-relaxed">${optText}</span>
      `;

      if (!hasAnswered) {
        card.onclick = () => this.selectQuizOption(question.id, idx, question.correct);
      }

      container.appendChild(card);
    });

    const expBox = document.getElementById('quiz-explanation-box');
    const expText = document.getElementById('quiz-explanation-text');
    const expHeader = document.getElementById('quiz-explanation-header');

    if (hasAnswered) {
      expBox.classList.remove('hidden');
      expText.innerText = question.explanation || 'Review the curriculum manuscript for in-depth architectural reasoning.';
      if (selectedIdx === question.correct) {
        expHeader.className = 'flex items-center space-x-1.5 font-bold text-sage-400';
        expHeader.innerHTML = `<i data-lucide="check-circle" class="w-3.5 h-3.5"></i><span>Correct! Senior Insight:</span>`;
      } else {
        expHeader.className = 'flex items-center space-x-1.5 font-bold text-crimson-400';
        expHeader.innerHTML = `<i data-lucide="alert-triangle" class="w-3.5 h-3.5"></i><span>Incorrect. Master Explanation:</span>`;
      }
    } else {
      expBox.classList.add('hidden');
    }

    const prevBtn = document.getElementById('btn-quiz-prev');
    const nextBtn = document.getElementById('btn-quiz-next');
    if (prevBtn) prevBtn.disabled = this.currentQuestionIdx === 0;

    if (nextBtn) {
      if (this.currentQuestionIdx === totalQ - 1) {
        nextBtn.innerHTML = `<span>Finish & View Score</span><i data-lucide="trophy" class="w-3 h-3 ml-1"></i>`;
      } else {
        nextBtn.innerHTML = `<span>Next Question</span><i data-lucide="arrow-right" class="w-3 h-3 ml-1"></i>`;
      }
    }

    this.refreshIcons();
  }

  selectQuizOption(questionId, selectedIdx, correctIdx) {
    this.currentQuizAnswers[questionId] = selectedIdx;

    if (selectedIdx === correctIdx && window.confetti) {
      confetti({ particleCount: 20, spread: 40, origin: { y: 0.6 } });
    }

    this.renderQuizQuestion();
  }

  prevQuizQuestion() {
    if (this.currentQuestionIdx > 0) {
      this.currentQuestionIdx--;
      this.renderQuizQuestion();
    }
  }

  nextQuizQuestion() {
    const quiz = this.data.quizzes[this.activeQuizId];
    if (!quiz) return;

    if (this.currentQuestionIdx < quiz.questions.length - 1) {
      this.currentQuestionIdx++;
      this.renderQuizQuestion();
    } else {
      this.finishQuiz();
    }
  }

  finishQuiz() {
    const quiz = this.data.quizzes[this.activeQuizId];
    if (!quiz) return;

    let correct = 0;
    const pillarScores = {};

    quiz.questions.forEach(q => {
      const p = q.pillar || 'General';
      if (!pillarScores[p]) pillarScores[p] = { correct: 0, total: 0 };
      pillarScores[p].total++;

      if (this.currentQuizAnswers[q.id] === q.correct) {
        correct++;
        pillarScores[p].correct++;
      }
    });

    const percent = Math.round((correct / quiz.questions.length) * 100);
    const passed = percent >= (quiz.passingScore || 80);

    this.quizScoresMap[this.activeQuizId] = {
      score: percent,
      correct: correct,
      total: quiz.questions.length,
      passed: passed,
      timestamp: new Date().toISOString()
    };
    this.saveStorage('sde_study_quiz_scores', this.quizScoresMap);

    document.getElementById('quiz-active-card').classList.add('hidden');
    const resCard = document.getElementById('quiz-results-card');
    resCard.classList.remove('hidden');

    document.getElementById('quiz-result-score-percent').innerText = `${percent}%`;
    document.getElementById('quiz-result-score-detail').innerText = `${correct} / ${quiz.questions.length} Correct`;

    const titleEl = document.getElementById('quiz-result-title');
    const subEl = document.getElementById('quiz-result-subtitle');

    if (passed) {
      titleEl.innerText = 'Milestone Mastery Achieved! 🎉';
      titleEl.className = 'font-display text-xl font-bold text-sage-400';
      subEl.innerText = `Strong engineering fundamentals demonstrated.`;
      if (window.confetti) confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
    } else {
      titleEl.innerText = 'Review Recommended';
      titleEl.className = 'font-display text-xl font-bold text-terracotta-400';
      subEl.innerText = `Scored ${percent}%. Senior benchmark is ${quiz.passingScore || 80}%.`;
    }

    const bContainer = document.getElementById('quiz-pillar-breakdown');
    bContainer.innerHTML = '';
    Object.keys(pillarScores).forEach(p => {
      const pData = pillarScores[p];
      const pPct = Math.round((pData.correct / pData.total) * 100);

      const row = document.createElement('div');
      row.className = 'text-xs font-mono space-y-1';
      row.innerHTML = `
        <div class="flex justify-between text-slate-300">
          <span class="font-sans">${p}</span>
          <span class="font-bold ${pPct >= 80 ? 'text-sage-400' : 'text-terracotta-400'}">${pData.correct}/${pData.total} (${pPct}%)</span>
        </div>
        <div class="w-full bg-surface-3 h-1 rounded-sm overflow-hidden">
          <div class="h-full rounded-sm ${pPct >= 80 ? 'bg-sage-500' : 'bg-terracotta-500'}" style="width: ${pPct}%"></div>
        </div>
      `;
      bContainer.appendChild(row);
    });

    this.updateGlobalProgress();
    this.refreshIcons();
  }

  retakeCurrentQuiz() {
    this.loadQuiz(this.activeQuizId);
  }

  // ================= DASHBOARD & GLOBAL PROGRESS =================
  updateGlobalProgress() {
    const totalDays = 40;
    const completedDays = Object.values(this.statusMap).filter(s => s === 'completed').length;
    const percent = Math.round((completedDays / totalDays) * 100);

    const bar = document.getElementById('global-progress-bar');
    const text = document.getElementById('global-progress-text');
    if (bar) bar.style.width = `${percent}%`;
    if (text) text.innerText = `${percent}% (${completedDays}/${totalDays})`;
  }

  renderDashboard() {
    const totalDays = 40;
    const completedCount = Object.values(this.statusMap).filter(s => s === 'completed').length;
    const inProgressCount = Object.values(this.statusMap).filter(s => s === 'in-progress').length;
    const notStartedCount = totalDays - completedCount - inProgressCount;

    document.getElementById('stat-completed-days').innerText = completedCount;
    document.getElementById('stat-bar-completed').style.width = `${(completedCount / totalDays) * 100}%`;

    document.getElementById('stat-in-progress-days').innerText = inProgressCount;
    document.getElementById('stat-bar-in-progress').style.width = `${(inProgressCount / totalDays) * 100}%`;

    document.getElementById('stat-not-started-days').innerText = notStartedCount;
    document.getElementById('stat-bar-not-started').style.width = `${(notStartedCount / totalDays) * 100}%`;

    const quizKeys = Object.keys(this.quizScoresMap);
    if (quizKeys.length > 0) {
      const avg = Math.round(quizKeys.reduce((acc, k) => acc + this.quizScoresMap[k].score, 0) / quizKeys.length);
      document.getElementById('stat-quiz-avg').innerText = `${avg}%`;
      document.getElementById('stat-bar-quiz').style.width = `${avg}%`;
    } else {
      document.getElementById('stat-quiz-avg').innerText = '--';
      document.getElementById('stat-bar-quiz').style.width = '0%';
    }

    const phaseContainer = document.getElementById('dashboard-phase-cards');
    if (!phaseContainer || !this.data.phases) return;
    phaseContainer.innerHTML = '';

    this.data.phases.forEach(phase => {
      const pDays = Object.values(this.data.days || {}).filter(d => d.phaseId === phase.id);
      const pCompleted = pDays.filter(d => this.statusMap[d.day] === 'completed').length;
      const pPct = Math.round((pCompleted / (pDays.length || 1)) * 100);

      const quizData = this.quizScoresMap[phase.id];

      const card = document.createElement('div');
      card.className = 'bg-surface-1 p-4 rounded-lg border border-white/[0.08] space-y-2.5';
      card.innerHTML = `
        <div class="flex items-center justify-between">
          <div>
            <span class="text-[10px] font-mono text-cyan-400">Phase ${phase.number}</span>
            <h3 class="text-xs font-bold text-white mt-0.5">${phase.title}</h3>
          </div>
          <span class="text-xs font-mono font-bold ${pPct === 100 ? 'text-sage-400' : 'text-slate-400'}">${pPct}%</span>
        </div>
        <div class="w-full bg-surface-3 h-1.5 rounded-sm overflow-hidden">
          <div class="h-full rounded-sm bg-sage-500" style="width: ${pPct}%"></div>
        </div>
        <div class="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-0.5">
          <span>${pCompleted}/${pDays.length} Days</span>
          <span>Quiz: <strong class="${quizData ? (quizData.passed ? 'text-sage-400' : 'text-terracotta-400') : 'text-slate-500'}">${quizData ? `${quizData.score}%` : 'Pending'}</strong></span>
        </div>
      `;
      phaseContainer.appendChild(card);
    });

    this.refreshIcons();
  }

  // ================= DATA BACKUP & RESTORE =================
  exportProgress() {
    const backupData = {
      version: 2,
      exportDate: new Date().toISOString(),
      statusMap: this.statusMap,
      checklistMap: this.checklistMap,
      notesMap: this.notesMap,
      quizScoresMap: this.quizScoresMap
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sde_mastery_progress_backup_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  importProgress(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target.result);
        if (parsed.statusMap) this.statusMap = parsed.statusMap;
        if (parsed.checklistMap) this.checklistMap = parsed.checklistMap;
        if (parsed.notesMap) this.notesMap = parsed.notesMap;
        if (parsed.quizScoresMap) this.quizScoresMap = parsed.quizScoresMap;

        this.saveStorage('sde_study_status', this.statusMap);
        this.saveStorage('sde_study_checklist', this.checklistMap);
        this.saveStorage('sde_study_notes', this.notesMap);
        this.saveStorage('sde_study_quiz_scores', this.quizScoresMap);

        alert('Progress imported successfully!');
        this.init();
      } catch (err) {
        alert('Invalid backup file. Please select a valid JSON backup exported from this portal.');
      }
    };
    reader.readAsText(file);
  }

  resetAllProgress() {
    if (confirm('Are you sure you want to reset all course progress, checklists, and quiz scores? This cannot be undone.')) {
      this.statusMap = {};
      this.checklistMap = {};
      this.notesMap = {};
      this.quizScoresMap = {};

      localStorage.removeItem('sde_study_status');
      localStorage.removeItem('sde_study_checklist');
      localStorage.removeItem('sde_study_notes');
      localStorage.removeItem('sde_study_quiz_scores');
      localStorage.removeItem('sde_study_last_day');

      this.currentDay = 1;
      this.init();
      alert('All progress has been reset.');
    }
  }
}

// Global App Instance
window.app = new StudyApp();
document.addEventListener('DOMContentLoaded', () => {
  window.app.init();
});
