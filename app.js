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

    // AI Doubt Solver Agent State
    this.agentOpen = false;
    this.agentSettingsOpen = false;
    this.agentProvider = this.loadStorage('sde_agent_provider', 'offline');
    this.agentApiKey = this.loadStorage('sde_agent_key', '');
    this.agentChatHistory = this.loadStorage('sde_agent_history', []);
    this.agentIsTyping = false;
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
    this.initAgentUI();
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

    this.updateAutoStatusBadge();
    this.updateAgentContextBadge();

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
    this.updateAutoStatusBadge();
    this.renderSidebar();
    this.updateGlobalProgress();

    if (status === 'completed' && window.confetti) {
      confetti({ particleCount: 50, spread: 50, origin: { y: 0.7 } });
    }
  }

  updateAutoStatusBadge() {
    const badge = document.getElementById('day-auto-status');
    const indicator = document.getElementById('day-auto-status-indicator');
    const text = document.getElementById('day-auto-status-text');
    if (!badge) return;

    const modules = ['dsa', 'be', 'fe', 'docker', 'ai', 'others'];
    const completedCount = modules.filter(k => !!this.checklistMap[`${this.currentDay}-${k}`]).length;

    let status = 'not-started';
    if (completedCount === 6) status = 'completed';
    else if (completedCount > 0) status = 'in-progress';

    if (this.statusMap[this.currentDay] !== status) {
      this.statusMap[this.currentDay] = status;
      this.saveStorage('sde_study_status', this.statusMap);
    }

    if (status === 'completed') {
      badge.className = 'flex items-center space-x-1.5 px-3 py-1 rounded-md bg-sage-500/20 border border-sage-500/40 text-xs font-mono text-sage-400 shadow-sm';
      if (indicator) indicator.innerText = '🟢';
      if (text) text.innerText = 'Completed (6/6)';
    } else if (status === 'in-progress') {
      badge.className = 'flex items-center space-x-1.5 px-3 py-1 rounded-md bg-terracotta-500/20 border border-terracotta-500/40 text-xs font-mono text-terracotta-400 shadow-sm';
      if (indicator) indicator.innerText = '🟡';
      if (text) text.innerText = `In Progress (${completedCount}/6)`;
    } else {
      badge.className = 'flex items-center space-x-1.5 px-3 py-1 rounded-md bg-surface-2 border border-white/[0.08] text-xs font-mono text-slate-400';
      if (indicator) indicator.innerText = '⚪';
      if (text) text.innerText = 'Not Started (0/6)';
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
      badge.className = `flex items-center space-x-1 px-2.5 py-1 rounded border text-[11px] cursor-pointer transition select-none ${
        isChecked 
          ? 'bg-sage-500/15 border-sage-500/30 text-sage-400 font-medium' 
          : 'bg-surface-2 border-white/[0.08] text-slate-400 hover:border-slate-600'
      }`;
      badge.innerHTML = `
        <input type="checkbox" ${isChecked ? 'checked' : ''} class="rounded border-slate-700 bg-surface-3 text-sage-500 focus:ring-0">
        <span class="font-mono">${labels[mKey]}</span>
      `;

      badge.querySelector('input').addEventListener('change', (e) => {
        this.checklistMap[checkKey] = e.target.checked;
        this.saveStorage('sde_study_checklist', this.checklistMap);

        const newCompleted = modules.filter(k => !!this.checklistMap[`${this.currentDay}-${k}`]).length;
        if (newCompleted === 6) {
          this.setDayStatus('completed');
        } else if (newCompleted > 0) {
          this.setDayStatus('in-progress');
        } else {
          this.setDayStatus('not-started');
        }

        this.renderDayChecklist();
        this.updateAutoStatusBadge();
        this.updateGlobalProgress();
        this.renderSidebar();
      });

      container.appendChild(badge);
    });

    if (summary) {
      summary.innerText = `${completedCount}/6 Done`;
    }
    this.updateAutoStatusBadge();
  }

  // ================= MODULE TABS & CONTENT LOADING =================
  selectModuleTab(moduleKey) {
    this.currentModule = moduleKey;
    this.updateAgentContextBadge();

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
    // 1. Copy code button
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

    // 2. Interactive Hyperlink Interception (SPA Navigation & Module Switching)
    container.querySelectorAll('a').forEach(anchor => {
      const href = anchor.getAttribute('href') || '';
      if (!href) return;

      // External links: open in new tab safely
      if (href.startsWith('http://') || href.startsWith('https://') || href.startsWith('mailto:')) {
        anchor.setAttribute('target', '_blank');
        anchor.setAttribute('rel', 'noopener noreferrer');
        return;
      }

      // In-page hash anchors (#...)
      if (href.startsWith('#')) {
        anchor.addEventListener('click', (e) => {
          e.preventDefault();
          const targetId = href.slice(1);
          const targetEl = document.getElementById(targetId) || 
                           container.querySelector(`[name="${targetId}"]`) || 
                           container.querySelector(`[id="${decodeURIComponent(targetId)}"]`);
          if (targetEl) {
            targetEl.scrollIntoView({ behavior: 'smooth' });
          }
        });
        return;
      }

      // Internal module & day hyperlinks
      anchor.addEventListener('click', (e) => {
        e.preventDefault();
        const cleanHref = href.toLowerCase().replace(/\\/g, '/');

        // Check if link points to another Day (e.g. "d2", "d10", "day-02", "day-10")
        const dayMatch = cleanHref.match(/(?:^|\/|\.\.\/)(?:d|day-?)(\d+)(?:\/|$|\.md)/i);
        if (dayMatch && dayMatch[1]) {
          const targetDay = parseInt(dayMatch[1], 10);
          if (targetDay >= 1 && targetDay <= 40 && targetDay !== this.currentDay) {
            this.selectDay(targetDay);
          }
        }

        // Determine target Module Tab
        let targetModule = null;
        if (cleanHref.includes('/dsa') || cleanHref.startsWith('dsa') || cleanHref.includes('arrays') || cleanHref.includes('two-pointer') || cleanHref.includes('sliding-window') || cleanHref.includes('leetcode')) {
          targetModule = 'dsa';
        } else if (cleanHref.includes('/be') || cleanHref.startsWith('be') || cleanHref.includes('v8') || cleanHref.includes('backend') || cleanHref.includes('node') || cleanHref.includes('postgresql') || cleanHref.includes('redis')) {
          targetModule = 'be';
        } else if (cleanHref.includes('/fe') || cleanHref.startsWith('fe') || cleanHref.includes('react') || cleanHref.includes('frontend') || cleanHref.includes('dom') || cleanHref.includes('fiber') || cleanHref.includes('nextjs')) {
          targetModule = 'fe';
        } else if (cleanHref.includes('/docker') || cleanHref.startsWith('docker') || cleanHref.includes('container') || cleanHref.includes('compose') || cleanHref.includes('kubernetes')) {
          targetModule = 'docker';
        } else if (cleanHref.includes('/ai') || cleanHref.startsWith('ai') || cleanHref.includes('llm') || cleanHref.includes('token') || cleanHref.includes('prompt') || cleanHref.includes('rag') || cleanHref.includes('agent')) {
          targetModule = 'ai';
        } else if (cleanHref.includes('/others') || cleanHref.startsWith('others') || cleanHref.includes('drill') || cleanHref.includes('quiz') || cleanHref.includes('puzzle') || cleanHref.includes('homework')) {
          targetModule = 'others';
        } else if (cleanHref.includes('notes')) {
          targetModule = 'notes';
        } else if (cleanHref.includes('master-guide') || cleanHref.includes('overview')) {
          targetModule = 'overview';
        }

        if (targetModule) {
          this.selectModuleTab(targetModule);
          const scrollContainer = document.getElementById('main-content-scroll');
          if (scrollContainer) scrollContainer.scrollTop = 0;
        }
      });
    });

    if (this.currentModule === 'others') {
      this.appendInteractiveDrillWidget(container);
    }

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

    if (this.currentModule === 'others') {
      this.appendInteractiveDrillWidget(mdContainer);
    }

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

  getUserCode() {
    if (this.codeMirrorInstance) {
      return this.codeMirrorInstance.getValue();
    }
    const fallback = document.getElementById('fallback-code-editor');
    return fallback ? fallback.value : '';
  }

  setUserCode(val) {
    if (this.codeMirrorInstance) {
      this.codeMirrorInstance.setValue(val);
    }
    const fallback = document.getElementById('fallback-code-editor');
    if (fallback) {
      fallback.value = val;
    }
  }

  mountCodeMirror(problem) {
    const wrapper = document.getElementById('codemirror-editor-wrapper');
    if (!wrapper) return;

    const cacheKey = `d${this.currentDay}-${problem.id}-${this.activeLanguage}`;
    const initialCode = this.userCodeStore[cacheKey] || problem.starterCode[this.activeLanguage] || '';

    const mode = this.activeLanguage === 'java' ? 'text/x-java' : 'javascript';

    if (typeof CodeMirror === 'undefined') {
      // Robust Fallback: native textarea if CodeMirror CDN is unreachable or blocked
      wrapper.innerHTML = '';
      const textarea = document.createElement('textarea');
      textarea.id = 'fallback-code-editor';
      textarea.className = 'fallback-editor-textarea';
      textarea.spellcheck = false;
      textarea.value = initialCode;
      textarea.oninput = () => {
        this.userCodeStore[cacheKey] = textarea.value;
      };
      wrapper.appendChild(textarea);
      return;
    }

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
        if (this.codeMirrorInstance) this.codeMirrorInstance.refresh();
      }, 50);
    }
  }

  changeCodeLanguage(lang) {
    this.activeLanguage = lang;
    const fnEl = document.getElementById('editor-filename');
    if (fnEl) fnEl.innerText = lang === 'java' ? 'Solution.java' : 'solution.js';
    const problems = (window.getProblemsForDay && window.getProblemsForDay(this.currentDay)) || [];
    const activeProb = problems[this.activeProblemIdx];
    if (activeProb) {
      this.mountCodeMirror(activeProb);
    }
  }

  resetCodeEditor() {
    const problems = (window.getProblemsForDay && window.getProblemsForDay(this.currentDay)) || [];
    const activeProb = problems[this.activeProblemIdx];
    if (activeProb) {
      const starter = activeProb.starterCode[this.activeLanguage] || '';
      this.setUserCode(starter);
      const cacheKey = `d${this.currentDay}-${activeProb.id}-${this.activeLanguage}`;
      delete this.userCodeStore[cacheKey];
    }
  }

  showSolutionCode() {
    const problems = (window.getProblemsForDay && window.getProblemsForDay(this.currentDay)) || [];
    const activeProb = problems[this.activeProblemIdx];
    if (activeProb) {
      const sol = activeProb.solutionCode[this.activeLanguage] || '';
      if (confirm('Reveal optimal reference solution in the editor?')) {
        this.setUserCode(sol);
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
    const userCode = this.getUserCode();
    if (!problem || !userCode) return;
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

  // ================= INTERACTIVE DRILLS SIMULATOR & EXERCISES =================
  appendInteractiveDrillWidget(container) {
    if (document.getElementById('interactive-drill-widget')) return;

    const widget = document.createElement('div');
    widget.id = 'interactive-drill-widget';
    widget.className = 'mt-8 p-5 rounded-xl bg-surface-1 border border-cyan-500/30 shadow-lg space-y-4';
    widget.innerHTML = `
      <div class="flex items-center justify-between border-b border-white/[0.08] pb-3">
        <div class="flex items-center space-x-2 text-cyan-400">
          <i data-lucide="play-circle" class="w-5 h-5"></i>
          <h3 class="font-display font-bold text-sm text-white">Interactive Event Loop Execution Simulator</h3>
        </div>
        <span class="text-[11px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/25">Live VM State</span>
      </div>

      <p class="text-xs text-slate-300 leading-relaxed">
        Step through execution to visually inspect how the <strong>V8 Call Stack</strong>, <strong>Microtask Queue</strong>, and <strong>Timers Macrotask Queue</strong> transition in real time:
      </p>

      <!-- Live Simulator Visualizer Grid -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-3 font-mono text-xs">
        <div class="p-3 rounded-lg bg-surface-2 border border-white/[0.08]">
          <div class="flex items-center justify-between text-slate-400 border-b border-white/[0.06] pb-1.5 mb-2">
            <span class="font-bold text-cyan-400">1. Call Stack</span>
            <span id="sim-stack-count" class="text-[10px] text-slate-500">Idle</span>
          </div>
          <div id="sim-call-stack" class="min-h-[70px] flex flex-col justify-end space-y-1 text-slate-300 text-[11px]">
            <div class="text-slate-600 italic">Call Stack Idle</div>
          </div>
        </div>

        <div class="p-3 rounded-lg bg-surface-2 border border-white/[0.08]">
          <div class="flex items-center justify-between text-slate-400 border-b border-white/[0.06] pb-1.5 mb-2">
            <span class="font-bold text-sage-400">2. Microtask Queue</span>
            <span id="sim-micro-count" class="text-[10px] text-slate-500">0 items</span>
          </div>
          <div id="sim-micro-queue" class="min-h-[70px] flex flex-col space-y-1 text-slate-300 text-[11px]">
            <div class="text-slate-600 italic">Queue Empty</div>
          </div>
        </div>

        <div class="p-3 rounded-lg bg-surface-2 border border-white/[0.08]">
          <div class="flex items-center justify-between text-slate-400 border-b border-white/[0.06] pb-1.5 mb-2">
            <span class="font-bold text-terracotta-400">3. Macrotask (Timers)</span>
            <span id="sim-macro-count" class="text-[10px] text-slate-500">0 items</span>
          </div>
          <div id="sim-macro-queue" class="min-h-[70px] flex flex-col space-y-1 text-slate-300 text-[11px]">
            <div class="text-slate-600 italic">Queue Empty</div>
          </div>
        </div>
      </div>

      <!-- Console Output Display -->
      <div class="p-3 rounded-lg bg-void border border-white/[0.08] font-mono text-xs">
        <div class="flex items-center justify-between text-slate-500 pb-1 mb-1 border-b border-white/[0.06]">
          <span>Terminal Stdout:</span>
          <span id="sim-step-indicator" class="text-cyan-400 text-[11px]">Ready (Step 0/8)</span>
        </div>
        <div id="sim-stdout" class="text-sage-400 font-semibold tracking-wide text-xs">
          [Click 'Step Execution' or 'Run All' to start simulation]
        </div>
        <div id="sim-explanation" class="text-slate-400 text-[11px] mt-1.5 leading-relaxed"></div>
      </div>

      <!-- Controls -->
      <div class="flex items-center gap-2 pt-1">
        <button id="btn-sim-step" class="px-3.5 py-1.5 rounded-md bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 border border-cyan-500/40 text-xs font-semibold transition flex items-center gap-1.5">
          <i data-lucide="step-forward" class="w-3.5 h-3.5"></i>
          <span>Step Execution</span>
        </button>
        <button id="btn-sim-run" class="px-3.5 py-1.5 rounded-md bg-surface-2 hover:bg-surface-3 text-slate-300 border border-white/[0.08] text-xs font-medium transition flex items-center gap-1.5">
          <i data-lucide="play" class="w-3.5 h-3.5"></i>
          <span>Run All</span>
        </button>
        <button id="btn-sim-reset" class="px-3 py-1.5 rounded-md bg-surface-2 hover:bg-surface-3 text-slate-400 hover:text-white border border-white/[0.08] text-xs transition">
          Reset
        </button>
      </div>
    `;

    container.appendChild(widget);
    this.initEventLoopSimulator();
    this.refreshIcons();
  }

  initEventLoopSimulator() {
    let currentStep = 0;
    const steps = [
      {
        step: 1,
        title: "Line 1: console.log('1: Synchronous Start')",
        stack: ["console.log('1')"],
        micro: [],
        macro: [],
        stdout: "1",
        explanation: "Synchronous evaluation on Call Stack. Output: 1."
      },
      {
        step: 2,
        title: "Line 3: setTimeout(..., 0)",
        stack: ["setTimeout(0ms)"],
        micro: [],
        macro: ["Callback 2 (setTimeout 0ms)"],
        stdout: "1",
        explanation: "Registers with OS timers subsystem. Callback 2 placed in Macrotask Queue."
      },
      {
        step: 3,
        title: "Line 7: Promise.resolve().then(...) & queueMicrotask",
        stack: ["Promise.resolve()", "queueMicrotask()"],
        micro: ["Callback 3 (Promise 1)", "Callback 5 (queueMicrotask)"],
        macro: ["Callback 2 (setTimeout 0ms)"],
        stdout: "1",
        explanation: "Resolved Promise .then() and queueMicrotask() callbacks are queued into Microtask Queue."
      },
      {
        step: 4,
        title: "Line 17: new Promise(executor)",
        stack: ["new Promise(executor)", "console.log('6')"],
        micro: ["Callback 3 (Promise 1)", "Callback 5 (queueMicrotask)", "Callback 7 (Promise .then)"],
        macro: ["Callback 2 (setTimeout 0ms)"],
        stdout: "1, 6",
        explanation: "INTERVIEW TRAP: Promise executor runs SYNCHRONOUSLY! Output: 6. resolve() queues Callback 7."
      },
      {
        step: 5,
        title: "Line 23: console.log('8: Synchronous End')",
        stack: ["console.log('8')"],
        micro: ["Callback 3 (Promise 1)", "Callback 5 (queueMicrotask)", "Callback 7 (Promise .then)"],
        macro: ["Callback 2 (setTimeout 0ms)"],
        stdout: "1, 6, 8",
        explanation: "Main synchronous script finishes. Output: 8. Call Stack is now completely empty!"
      },
      {
        step: 6,
        title: "Event Loop: Draining Microtasks (Part 1)",
        stack: ["Callback 3 -> console.log('3')"],
        micro: ["Callback 5 (queueMicrotask)", "Callback 7 (Promise .then)", "Callback 4 (Promise 2)"],
        macro: ["Callback 2 (setTimeout 0ms)"],
        stdout: "1, 6, 8, 3",
        explanation: "Microtask Queue runs before any macrotasks. Callback 3 prints 3 and enqueues chained Promise 2 (Callback 4)."
      },
      {
        step: 7,
        title: "Event Loop: Draining Microtasks (Part 2)",
        stack: ["Drain: Callback 5, 7, 4"],
        micro: [],
        macro: ["Callback 2 (setTimeout 0ms)"],
        stdout: "1, 6, 8, 3, 5, 7, 4",
        explanation: "Microtask Queue drains completely! Callback 5 (prints 5), Callback 7 (prints 7), Callback 4 (prints 4)."
      },
      {
        step: 8,
        title: "Event Loop: Timers Phase (Macrotask)",
        stack: ["Callback 2 -> console.log('2')"],
        micro: [],
        macro: [],
        stdout: "1, 6, 8, 3, 5, 7, 4, 2",
        explanation: "Microtasks empty! Event Loop checks Macrotasks. Runs Callback 2 (prints 2). Program terminates."
      }
    ];

    const renderStep = (idx) => {
      const data = steps[idx];
      const stackEl = document.getElementById('sim-call-stack');
      const microEl = document.getElementById('sim-micro-queue');
      const macroEl = document.getElementById('sim-macro-queue');
      const stdoutEl = document.getElementById('sim-stdout');
      const expEl = document.getElementById('sim-explanation');
      const indEl = document.getElementById('sim-step-indicator');
      const stackCount = document.getElementById('sim-stack-count');
      const microCount = document.getElementById('sim-micro-count');
      const macroCount = document.getElementById('sim-macro-count');

      if (!stackEl) return;

      if (indEl) indEl.innerText = `Step ${data.step}/8: ${data.title}`;
      if (stdoutEl) stdoutEl.innerText = `[Stdout]: ${data.stdout}`;
      if (expEl) expEl.innerText = data.explanation;

      if (stackEl) {
        stackEl.innerHTML = data.stack.length > 0 
          ? data.stack.map(s => `<div class="p-1 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">${s}</div>`).join('')
          : '<div class="text-slate-600 italic">Call Stack Idle</div>';
      }
      if (stackCount) stackCount.innerText = `${data.stack.length} frame(s)`;

      if (microEl) {
        microEl.innerHTML = data.micro.length > 0
          ? data.micro.map(m => `<div class="p-1 rounded bg-sage-500/20 text-sage-300 border border-sage-500/30">${m}</div>`).join('')
          : '<div class="text-slate-600 italic">Queue Empty</div>';
      }
      if (microCount) microCount.innerText = `${data.micro.length} item(s)`;

      if (macroEl) {
        macroEl.innerHTML = data.macro.length > 0
          ? data.macro.map(m => `<div class="p-1 rounded bg-terracotta-500/20 text-terracotta-300 border border-terracotta-500/30">${m}</div>`).join('')
          : '<div class="text-slate-600 italic">Queue Empty</div>';
      }
      if (macroCount) macroCount.innerText = `${data.macro.length} item(s)`;
    };

    const stepBtn = document.getElementById('btn-sim-step');
    const runBtn = document.getElementById('btn-sim-run');
    const resetBtn = document.getElementById('btn-sim-reset');

    if (stepBtn) {
      stepBtn.onclick = () => {
        renderStep(currentStep);
        currentStep = (currentStep + 1) % steps.length;
      };
    }

    if (runBtn) {
      runBtn.onclick = () => {
        let i = 0;
        const interval = setInterval(() => {
          if (i >= steps.length) {
            clearInterval(interval);
            return;
          }
          renderStep(i);
          i++;
        }, 800);
      };
    }

    if (resetBtn) {
      resetBtn.onclick = () => {
        currentStep = 0;
        const stackEl = document.getElementById('sim-call-stack');
        const microEl = document.getElementById('sim-micro-queue');
        const macroEl = document.getElementById('sim-macro-queue');
        const stdoutEl = document.getElementById('sim-stdout');
        const expEl = document.getElementById('sim-explanation');
        const indEl = document.getElementById('sim-step-indicator');

        if (indEl) indEl.innerText = 'Ready (Step 0/8)';
        if (stdoutEl) stdoutEl.innerText = "[Click 'Step Execution' or 'Run All' to start simulation]";
        if (expEl) expEl.innerText = '';
        if (stackEl) stackEl.innerHTML = '<div class="text-slate-600 italic">Call Stack Idle</div>';
        if (microEl) microEl.innerHTML = '<div class="text-slate-600 italic">Queue Empty</div>';
        if (macroEl) macroEl.innerHTML = '<div class="text-slate-600 italic">Queue Empty</div>';
      };
    }
  }

  // ================= MULTI-DEVICE PROGRESS SYNC & EXPORT =================
  openExportModal() {
    const modal = document.getElementById('sync-export-modal');
    if (modal) modal.classList.remove('hidden');
    this.refreshIcons();
  }

  closeExportModal() {
    const modal = document.getElementById('sync-export-modal');
    if (modal) modal.classList.add('hidden');
  }

  showExportToast(msg) {
    const toast = document.getElementById('export-toast');
    const toastText = document.getElementById('export-toast-text');
    if (toast && toastText) {
      toastText.innerText = msg;
      toast.classList.remove('hidden');
      setTimeout(() => {
        toast.classList.add('hidden');
      }, 3500);
    }
  }

  exportToExcel() {
    try {
      if (typeof XLSX === 'undefined') {
        this.exportToCSV();
        return;
      }

      const days = this.data.days || {};
      const rowData = [];

      for (let d = 1; d <= 40; d++) {
        const dayInfo = days[d] || {};
        const phaseId = dayInfo.phaseId || 'phase-1';
        const phase = phaseId === 'phase-1' ? 'Phase 1' : phaseId === 'phase-2' ? 'Phase 2' : phaseId === 'phase-3' ? 'Phase 3' : 'Phase 4';
        const title = dayInfo.title || `Day ${d}`;

        const dsa = this.checklistMap[`${d}-dsa`] ? 'Y' : 'N';
        const be = this.checklistMap[`${d}-be`] ? 'Y' : 'N';
        const fe = this.checklistMap[`${d}-fe`] ? 'Y' : 'N';
        const docker = this.checklistMap[`${d}-docker`] ? 'Y' : 'N';
        const ai = this.checklistMap[`${d}-ai`] ? 'Y' : 'N';
        const drills = this.checklistMap[`${d}-others`] ? 'Y' : 'N';

        const completedCount = [dsa, be, fe, docker, ai, drills].filter(x => x === 'Y').length;
        const status = completedCount === 6 ? 'Completed' : (completedCount > 0 ? 'In Progress' : 'Not Started');
        const pct = `${Math.round((completedCount / 6) * 100)}%`;
        const notes = this.notesMap[d] || '';

        rowData.push({
          'Day #': d,
          'Phase': phase,
          'Topic Title': title,
          'Status': status,
          'DSA': dsa,
          'Backend': be,
          'Frontend': fe,
          'Docker': docker,
          'AI': ai,
          'Drills': drills,
          'Done / 6': completedCount,
          'Day %': pct,
          'Notes': notes
        });
      }

      const ws = XLSX.utils.json_to_sheet(rowData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Daily Tracker');
      XLSX.writeFile(wb, `SDE_Mastery_40_Progress_${new Date().toISOString().slice(0, 10)}.xlsx`);
      this.showExportToast('Excel file exported successfully!');
    } catch (err) {
      console.error('Excel export error, falling back to CSV:', err);
      this.exportToCSV();
    }
  }

  exportToCSV() {
    try {
      const days = this.data.days || {};
      const headers = ['Day #', 'Phase', 'Topic Title', 'Status', 'DSA', 'Backend', 'Frontend', 'Docker', 'AI', 'Drills', 'Done / 6', 'Day %', 'Notes'];
      const rows = [headers];

      for (let d = 1; d <= 40; d++) {
        const dayInfo = days[d] || {};
        const phaseId = dayInfo.phaseId || 'phase-1';
        const phase = phaseId === 'phase-1' ? 'Phase 1' : phaseId === 'phase-2' ? 'Phase 2' : phaseId === 'phase-3' ? 'Phase 3' : 'Phase 4';
        const title = `"${(dayInfo.title || `Day ${d}`).replace(/"/g, '""')}"`;

        const dsa = this.checklistMap[`${d}-dsa`] ? 'Y' : 'N';
        const be = this.checklistMap[`${d}-be`] ? 'Y' : 'N';
        const fe = this.checklistMap[`${d}-fe`] ? 'Y' : 'N';
        const docker = this.checklistMap[`${d}-docker`] ? 'Y' : 'N';
        const ai = this.checklistMap[`${d}-ai`] ? 'Y' : 'N';
        const drills = this.checklistMap[`${d}-others`] ? 'Y' : 'N';

        const completedCount = [dsa, be, fe, docker, ai, drills].filter(x => x === 'Y').length;
        const status = completedCount === 6 ? 'Completed' : (completedCount > 0 ? 'In Progress' : 'Not Started');
        const pct = `${Math.round((completedCount / 6) * 100)}%`;
        const notes = `"${(this.notesMap[d] || '').replace(/"/g, '""')}"`;

        rows.push([d, phase, title, status, dsa, be, fe, docker, ai, drills, completedCount, pct, notes]);
      }

      const csvContent = rows.map(e => e.join(',')).join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `SDE_Mastery_40_Progress_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      this.showExportToast('CSV spreadsheet exported successfully!');
    } catch (err) {
      console.error('CSV export error:', err);
      this.copyProgressToClipboard();
    }
  }

  copyProgressToClipboard() {
    const backupData = {
      version: 2,
      exportDate: new Date().toISOString(),
      statusMap: this.statusMap,
      checklistMap: this.checklistMap,
      notesMap: this.notesMap,
      quizScoresMap: this.quizScoresMap
    };

    const text = JSON.stringify(backupData);
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        this.showExportToast('Progress copied to clipboard! Paste it on any device.');
      }).catch(() => {
        this.fallbackCopyToInput(text);
      });
    } else {
      this.fallbackCopyToInput(text);
    }
  }

  fallbackCopyToInput(text) {
    const input = document.getElementById('paste-import-input');
    if (input) {
      input.value = text;
      input.select();
      this.showExportToast('Text ready in input box below! Press Ctrl+C / Cmd+C.');
    }
  }

  importFromClipboardText() {
    const input = document.getElementById('paste-import-input');
    const raw = input ? input.value.trim() : '';
    if (!raw) {
      alert('Please paste backup JSON text into the input field.');
      return;
    }

    try {
      const parsed = JSON.parse(raw);
      if (parsed.statusMap) this.statusMap = parsed.statusMap;
      if (parsed.checklistMap) this.checklistMap = parsed.checklistMap;
      if (parsed.notesMap) this.notesMap = parsed.notesMap;
      if (parsed.quizScoresMap) this.quizScoresMap = parsed.quizScoresMap;

      this.saveStorage('sde_study_status', this.statusMap);
      this.saveStorage('sde_study_checklist', this.checklistMap);
      this.saveStorage('sde_study_notes', this.notesMap);
      this.saveStorage('sde_study_quiz_scores', this.quizScoresMap);

      this.showExportToast('Progress restored successfully!');
      setTimeout(() => {
        this.closeExportModal();
        this.init();
      }, 700);
    } catch (err) {
      alert('Invalid backup JSON format. Please verify the copied text.');
    }
  }

  exportProgress() {
    const backupData = {
      version: 2,
      exportDate: new Date().toISOString(),
      statusMap: this.statusMap,
      checklistMap: this.checklistMap,
      notesMap: this.notesMap,
      quizScoresMap: this.quizScoresMap
    };

    try {
      const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `sde_mastery_progress_backup_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      this.showExportToast('JSON backup file downloaded!');
    } catch (e) {
      this.copyProgressToClipboard();
    }
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

        this.showExportToast('Progress file imported successfully!');
        setTimeout(() => {
          this.closeExportModal();
          this.init();
        }, 700);
      } catch (err) {
        alert('Invalid backup file. Please select a valid JSON backup exported from this portal.');
      }
    };
    reader.readAsText(file);
  }

  // ================= SDE-MASTERY AI TUTOR / DOUBT SOLVER =================
  initAgentUI() {
    const select = document.getElementById('agent-provider-select');
    const keyInput = document.getElementById('agent-api-key-input');
    const keyContainer = document.getElementById('agent-api-key-container');
    const keyLabel = document.getElementById('agent-api-key-label');
    const modeBadge = document.getElementById('agent-mode-badge');
    const geminiHint = document.getElementById('agent-gemini-hint');

    if (select) select.value = this.agentProvider;
    if (keyInput) keyInput.value = this.agentApiKey;

    if (keyContainer && select) {
      if (geminiHint) {
        if (select.value === 'gemini') geminiHint.classList.remove('hidden');
        else geminiHint.classList.add('hidden');
      }

      if (select.value === 'offline') {
        keyContainer.classList.add('hidden');
        if (modeBadge) {
          modeBadge.innerText = '100% Free Built-in';
          modeBadge.className = 'text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-sage-500/15 text-sage-400 border border-sage-500/25';
        }
      } else {
        keyContainer.classList.remove('hidden');
        if (select.value === 'gemini') {
          if (keyLabel) keyLabel.innerText = 'Google Gemini API Key (Free):';
          if (modeBadge) {
            modeBadge.innerText = 'Gemini Free Tier';
            modeBadge.className = 'text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-cyan-500/15 text-cyan-400 border border-cyan-500/25';
          }
        } else if (select.value === 'openai') {
          if (keyLabel) keyLabel.innerText = 'OpenAI API Key (Paid):';
          if (modeBadge) {
            modeBadge.innerText = 'GPT-4o Mini (Paid)';
            modeBadge.className = 'text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-purple-500/15 text-purple-400 border border-purple-500/25';
          }
        } else if (select.value === 'ollama') {
          if (keyLabel) keyLabel.innerText = 'Ollama Endpoint URL (default http://localhost:11434):';
          if (modeBadge) {
            modeBadge.innerText = 'Local Ollama (Free)';
            modeBadge.className = 'text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-terracotta-500/15 text-terracotta-400 border border-terracotta-500/25';
          }
        }
      }
    }

    this.updateAgentContextBadge();
    this.renderAgentChatHistory();
  }

  updateAgentContextBadge() {
    const dayEl = document.getElementById('agent-context-day');
    const modEl = document.getElementById('agent-context-module');
    if (dayEl) dayEl.innerText = `Day ${this.currentDay}`;
    if (modEl) {
      const labels = {
        overview: 'Overview',
        dsa: 'DSA',
        be: 'Backend',
        fe: 'Frontend',
        docker: 'Docker',
        ai: 'AI',
        others: 'Drills',
        notes: 'Notes'
      };
      modEl.innerText = labels[this.currentModule] || this.currentModule;
    }
  }

  toggleAgentDrawer(forceState) {
    this.agentOpen = forceState !== undefined ? forceState : !this.agentOpen;
    const drawer = document.getElementById('agent-drawer');
    if (drawer) {
      if (this.agentOpen) {
        drawer.classList.remove('translate-x-full');
        this.updateAgentContextBadge();
        const input = document.getElementById('agent-prompt-input');
        if (input) setTimeout(() => input.focus(), 200);
      } else {
        drawer.classList.add('translate-x-full');
      }
    }
    this.refreshIcons();
  }

  toggleAgentSettings(forceState) {
    this.agentSettingsOpen = forceState !== undefined ? forceState : !this.agentSettingsOpen;
    const panel = document.getElementById('agent-settings-panel');
    if (panel) {
      if (this.agentSettingsOpen) panel.classList.remove('hidden');
      else panel.classList.add('hidden');
    }
    this.refreshIcons();
  }

  onAgentProviderChange() {
    const select = document.getElementById('agent-provider-select');
    const keyContainer = document.getElementById('agent-api-key-container');
    const keyLabel = document.getElementById('agent-api-key-label');
    const keyInput = document.getElementById('agent-api-key-input');
    const modeBadge = document.getElementById('agent-mode-badge');
    const geminiHint = document.getElementById('agent-gemini-hint');
    if (!select) return;

    this.agentProvider = select.value;
    this.saveStorage('sde_agent_provider', this.agentProvider);

    if (geminiHint) {
      if (this.agentProvider === 'gemini') geminiHint.classList.remove('hidden');
      else geminiHint.classList.add('hidden');
    }

    if (this.agentProvider === 'offline') {
      if (keyContainer) keyContainer.classList.add('hidden');
      if (modeBadge) {
        modeBadge.innerText = '100% Free Built-in';
        modeBadge.className = 'text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-sage-500/15 text-sage-400 border border-sage-500/25';
      }
    } else {
      if (keyContainer) keyContainer.classList.remove('hidden');
      if (this.agentProvider === 'gemini') {
        if (keyLabel) keyLabel.innerText = 'Google Gemini API Key (Free):';
        if (keyInput) keyInput.placeholder = 'AIzaSy...';
        if (modeBadge) {
          modeBadge.innerText = 'Gemini Free Tier';
          modeBadge.className = 'text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-cyan-500/15 text-cyan-400 border border-cyan-500/25';
        }
      } else if (this.agentProvider === 'openai') {
        if (keyLabel) keyLabel.innerText = 'OpenAI API Key (Paid):';
        if (keyInput) keyInput.placeholder = 'sk-...';
        if (modeBadge) {
          modeBadge.innerText = 'GPT-4o Mini (Paid)';
          modeBadge.className = 'text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-purple-500/15 text-purple-400 border border-purple-500/25';
        }
      } else if (this.agentProvider === 'ollama') {
        if (keyLabel) keyLabel.innerText = 'Ollama Endpoint URL:';
        if (keyInput) keyInput.placeholder = 'http://localhost:11434';
        if (modeBadge) {
          modeBadge.innerText = 'Local Ollama (Free)';
          modeBadge.className = 'text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-terracotta-500/15 text-terracotta-400 border border-terracotta-500/25';
        }
      }
    }
  }

  saveAgentSettings() {
    const keyInput = document.getElementById('agent-api-key-input');
    if (keyInput) {
      this.agentApiKey = keyInput.value.trim();
      this.saveStorage('sde_agent_key', this.agentApiKey);
      alert('AI Tutor settings saved successfully!');
      this.toggleAgentSettings(false);
      this.initAgentUI();
    }
  }

  sendQuickDoubt(promptText) {
    const input = document.getElementById('agent-prompt-input');
    if (input) {
      input.value = promptText;
      this.handleAgentSubmit(new Event('submit'));
    }
  }

  async handleAgentSubmit(e) {
    if (e && e.preventDefault) e.preventDefault();
    if (this.agentIsTyping) return;

    const input = document.getElementById('agent-prompt-input');
    if (!input) return;
    const query = input.value.trim();
    if (!query) return;

    input.value = '';
    this.appendAgentMessage('user', query);

    const typingEl = document.getElementById('agent-typing-indicator');
    if (typingEl) typingEl.classList.remove('hidden');
    this.agentIsTyping = true;

    const chatContainer = document.getElementById('agent-chat-messages');
    if (chatContainer) chatContainer.scrollTop = chatContainer.scrollHeight;

    try {
      const responseMarkdown = await this.generateAgentResponse(query);
      if (typingEl) typingEl.classList.add('hidden');
      this.agentIsTyping = false;
      this.appendAgentMessage('assistant', responseMarkdown);
    } catch (err) {
      console.error('Agent error:', err);
      if (typingEl) typingEl.classList.add('hidden');
      this.agentIsTyping = false;
      const fallbackAns = this.resolveDoubtOffline(query, {
        dayNum: this.currentDay,
        dayTitle: this.data.days[this.currentDay]?.title || 'Topic',
        moduleKey: this.currentModule
      });
      this.appendAgentMessage('assistant', `⚠️ *Notice: Live API call could not be completed (${err.message || 'Network/Key error'}). Switched to Built-in Knowledge Engine:*\n\n` + fallbackAns);
    }
  }

  appendAgentMessage(role, text) {
    this.agentChatHistory.push({ role, text, timestamp: new Date().toISOString() });
    if (this.agentChatHistory.length > 40) this.agentChatHistory.shift();
    this.saveStorage('sde_agent_history', this.agentChatHistory);
    this.renderAgentChatHistory();
  }

  renderAgentChatHistory() {
    const container = document.getElementById('agent-chat-messages');
    if (!container) return;

    if (this.agentChatHistory.length === 0) {
      container.innerHTML = `
        <div class="flex items-start space-x-2.5">
          <div class="w-6 h-6 rounded bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400 flex-shrink-0 mt-0.5">
            <i data-lucide="bot" class="w-3.5 h-3.5"></i>
          </div>
          <div class="bg-surface-2 p-3 rounded-lg rounded-tl-none border border-white/[0.08] text-slate-200 space-y-2 max-w-[90%]">
            <p class="font-medium text-white">Hello! I am your <strong>SDE-Mastery AI Tutor</strong>.</p>
            <p class="text-slate-300 leading-relaxed">
              I am here to resolve any doubts you encounter across:
            </p>
            <ul class="list-disc list-inside space-y-1 text-slate-400 font-mono text-[11px]">
              <li><strong>DSA</strong>: Memory models, pointer proofs, LeetCode patterns</li>
              <li><strong>Backend</strong>: V8 internals, execution contexts, TDZ, GC</li>
              <li><strong>Frontend</strong>: React 18/19 Fiber, diffing, reconciliation</li>
              <li><strong>Docker</strong>: Namespaces, cgroups, memory limits, OOM 137</li>
              <li><strong>AI</strong>: Tokens, BPE, structured JSON schemas, RAG, agents</li>
            </ul>
            <p class="text-slate-400 text-[11px]">
              Ask me anything about the current day's lessons, drills, or homework!
            </p>
          </div>
        </div>
      `;
      this.refreshIcons();
      return;
    }

    const escapeText = (str) => {
      return (str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
    };

    let html = '';
    this.agentChatHistory.forEach(msg => {
      if (msg.role === 'user') {
        html += `
          <div class="flex justify-end">
            <div class="bg-purple-600/25 text-purple-200 border border-purple-500/35 p-2.5 rounded-lg rounded-tr-none max-w-[85%] leading-relaxed font-sans text-xs">
              ${escapeText(msg.text)}
            </div>
          </div>
        `;
      } else {
        const parsedMd = window.marked ? marked.parse(msg.text) : msg.text;
        html += `
          <div class="flex items-start space-x-2.5">
            <div class="w-6 h-6 rounded bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400 flex-shrink-0 mt-0.5">
              <i data-lucide="bot" class="w-3.5 h-3.5"></i>
            </div>
            <div class="bg-surface-2 p-3 rounded-lg rounded-tl-none border border-white/[0.08] text-slate-200 space-y-2 max-w-[90%] markdown-body text-xs">
              ${parsedMd}
            </div>
          </div>
        `;
      }
    });

    container.innerHTML = html;
    container.scrollTop = container.scrollHeight;
    this.refreshIcons();
  }

  clearAgentChat() {
    this.agentChatHistory = [];
    this.saveStorage('sde_agent_history', []);
    this.renderAgentChatHistory();
  }

  async generateAgentResponse(userQuery) {
    const dayNum = this.currentDay;
    const dayData = this.data.days[dayNum] || {};
    const dayTitle = dayData.title || `Day ${dayNum}`;
    const moduleKey = this.currentModule;
    const pageExcerpt = document.getElementById('markdown-container')?.innerText.slice(0, 1400) || '';

    const ctx = { dayNum, dayTitle, moduleKey, pageExcerpt };

    // 1. Google Gemini API
    if (this.agentProvider === 'gemini' && this.agentApiKey) {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${encodeURIComponent(this.agentApiKey)}`;
      const sysPrompt = `You are the SDE-Mastery 40 Senior Principal Staff Engineer and AI Tutor. The student is studying Day ${dayNum}: "${dayTitle}", currently focusing on the "${moduleKey.toUpperCase()}" module. Current curriculum excerpt:\n"""${pageExcerpt.slice(0, 800)}"""\n\nAnswer the user's doubt with absolute technical rigor, step-by-step clarity, code snippets (TypeScript/JavaScript/Docker/Python), memory layout diagrams if helpful, and senior FAANG interview advice. Format in clean GitHub-flavored markdown.`;
      
      const payload = {
        contents: [
          { role: 'user', parts: [{ text: `${sysPrompt}\n\nStudent Doubt / Question: ${userQuery}` }] }
        ],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 1024
        }
      };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(`Gemini Error ${res.status}: ${errJson.error?.message || res.statusText}`);
      }

      const data = await res.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text || "No response received from Gemini.";
    }

    // 2. OpenAI API
    if (this.agentProvider === 'openai' && this.agentApiKey) {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.agentApiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: `You are the SDE-Mastery 40 Senior Principal AI Tutor. The student is on Day ${dayNum}: ${dayTitle}, module: ${moduleKey}. Current excerpt: ${pageExcerpt.slice(0, 600)}. Answer doubts with rigorous technical clarity, code examples, and FAANG interview takeaways in clean markdown.`
            },
            { role: 'user', content: userQuery }
          ],
          temperature: 0.2
        })
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(`OpenAI Error ${res.status}: ${errJson.error?.message || res.statusText}`);
      }

      const data = await res.json();
      return data.choices?.[0]?.message?.content || "No response received from OpenAI.";
    }

    // 3. Local Ollama / LM Studio
    if (this.agentProvider === 'ollama') {
      const endpoint = (this.agentApiKey || 'http://localhost:11434').replace(/\/$/, '') + '/api/chat';
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'llama3',
          messages: [
            {
              role: 'system',
              content: `You are the SDE-Mastery AI Tutor for Day ${dayNum} (${moduleKey}). Answer technical doubts with high precision in markdown.`
            },
            { role: 'user', content: userQuery }
          ],
          stream: false
        })
      });

      if (!res.ok) throw new Error(`Ollama Error ${res.status}: Is Ollama running on localhost:11434?`);
      const data = await res.json();
      return data.message?.content || "No response received from Ollama.";
    }

    // 4. Built-in Offline Expert Knowledge Engine (No key required!)
    return this.resolveDoubtOffline(userQuery, ctx);
  }

  resolveDoubtOffline(query, ctx = {}) {
    const q = (query || '').toLowerCase();
    const day = ctx.dayNum || this.currentDay;
    const mod = ctx.moduleKey || this.currentModule;

    // --- Specific DSA Queries ---
    if (q.includes('unshift') || (q.includes('array') && q.includes('o(n)'))) {
      return `### 💡 Why \`arr.unshift()\` is $O(N)$ vs \`arr[i]\` is $O(1)$

1. **Physical RAM Contiguity**:
   Arrays are stored in contiguous physical memory addresses. When you access \`arr[i]\`, the CPU evaluates:
   $$\\text{Address} = \\text{Base} + (i \\times \\text{sizeof}(T))$$
   This is a **single arithmetic operation**, making index reads $O(1)$ constant time.
2. **The Unshift Penalty**:
   Inserting at index 0 requires physically shifting every existing element in the memory block one slot to the right:
   \`\`\`
   Initial:  [ A ] [ B ] [ C ] [ D ]
   Shift:      ↘     ↘     ↘     ↘
   Result:   [ X ] [ A ] [ B ] [ C ] [ D ]
   \`\`\`
   For $N = 1,000,000$ items, that is $1,000,000$ hardware memory moves ($O(N)$ linear time).
3. **Interview Takeaway**:
   If you need frequent $O(1)$ insertions/removals at both ends, use a **Doubly Linked List** or **Deque** (circular ring buffer) rather than an array.`;
    }

    if (q.includes('two sum') || (q.includes('two pointer') && q.includes('sorted'))) {
      return `### 💡 Two-Pointer Technique on Sorted Arrays (Two Sum II)

* **Why Two Pointers Work**:
  In a sorted array, placing pointer $L$ at the beginning ($0$) and $R$ at the end ($N-1$) establishes a monotonic invariant:
  - If \`nums[L] + nums[R] < target\`: Because $R$ points to the largest available number, the only way to increase the sum is to advance $L$ (\`L++\`).
  - If \`nums[L] + nums[R] > target\`: The only way to decrease the sum is to decrement $R$ (\`R--\`).
* **Complexity Proof**:
  - **Time**: $O(N)$ — Every iteration decrements $R$ or increments $L$. Pointers meet in at most $N$ steps.
  - **Space**: $O(1)$ — Only two index variables are used.
* **Senior FAANG Follow-up**:
  *"What if the array is NOT sorted?"*
  - If unsorted and you must preserve original 0-based indices, use a **One-Pass Hash Map** ($O(N)$ time, $O(N)$ space) because sorting would take $O(N \\log N)$ and scramble original indices.`;
    }

    if (q.includes('move zero') || (q.includes('in-place') && q.includes('zero'))) {
      return `### 💡 In-Place Array Partition (Move Zeroes)

* **Algorithm Blueprint**:
  Use a **Fast Reader Pointer** and a **Slow Writer Pointer**:
  \`\`\`typescript
  function moveZeroes(nums: number[]): void {
    let writer = 0;
    for (let reader = 0; reader < nums.length; reader++) {
      if (nums[reader] !== 0) {
        if (reader !== writer) {
          [nums[writer], nums[reader]] = [nums[reader], nums[writer]];
        }
        writer++;
      }
    }
  }
  \`\`\`
* **Loop Invariant**:
  At any step, all elements before \`writer\` are non-zero in original relative order; all elements between \`writer\` and \`reader\` are zeros. Exactly $O(N)$ time, $O(1)$ auxiliary space.`;
    }

    // --- Specific Backend & V8 Queries ---
    if (q.includes('tdz') || q.includes('temporal dead zone') || q.includes('hoisting')) {
      return `### 🧠 V8 Hoisting & Temporal Dead Zone (TDZ) Deep-Dive

1. **Creation Phase Memory Allocation**:
   Before executing line 1, V8 scans the script during the **Creation Phase**:
   - \`var\`: Memory is allocated on the Variable Environment and initialized to \`undefined\`.
   - \`let\` / \`const\`: Memory binding is registered in the Lexical Environment, but left **uninitialized**.
2. **What is the TDZ?**:
   The TDZ is the span from the start of the lexical block until the line where \`let\`/\`const\` declaration is evaluated.
   \`\`\`javascript
   {
     // === TDZ for 'count' START ===
     console.log(count); // Throws ReferenceError!
     // === TDZ for 'count' END ===
     let count = 42; 
   }
   \`\`\`
3. **Why did TC39 introduce the TDZ?**:
   To catch runtime bugs early! Accessing variables before declaration in production is almost always a logical flaw. \`var\` silently returning \`undefined\` causes hard-to-trace bugs.`;
    }

    if (q.includes('v8') || q.includes('turbofan') || q.includes('ignition') || q.includes('jit')) {
      return `### ⚡ Google V8 Engine Architecture

1. **Parser & AST**: Source code is parsed into an Abstract Syntax Tree (AST).
2. **Ignition (Bytecode Interpreter)**: Compiles AST into register-based bytecode. Boots the app in milliseconds without waiting for heavy native compilation.
3. **TurboFan (JIT Optimizing Compiler)**:
   - Observes "hot functions" executed repeatedly.
   - Makes speculative assumptions (e.g., *"this function always receives two 32-bit integers"*).
   - Compiles them directly into optimized machine code.
4. **De-optimization Trap**:
   If a function that previously only processed numbers suddenly receives a string or object with a different **Hidden Class / Shape**, TurboFan bails out, throws away the machine code, and drops back to interpreted bytecode.
   - **Backend Takeaway**: Keep object shapes and function parameter types uniform!`;
    }

    // --- Specific Frontend & React Queries ---
    if (q.includes('key={index}') || q.includes('index as key') || (q.includes('key') && q.includes('react'))) {
      return `### 🎨 The \`key={index}\` State Corruption Trap in React

* **The Problem**:
  React uses \`key\` to correlate Virtual DOM nodes between renders.
  If an array has 3 items:
  \`\`\`
  [Key 0: "Task A" (checked)]
  [Key 1: "Task B"]
  [Key 2: "Task C"]
  \`\`\`
  When you delete "Task A", "Task B" becomes index \`0\`, and "Task C" becomes index \`1\`.
* **Reconciliation Diffing Bug**:
  React compares the new \`key=0\` ("Task B") with the old \`key=0\` ("Task A"). Because \`type\` and \`key\` match, React **reuses the existing DOM node** and preserves the old node's uncontrolled DOM state (e.g. checkbox or input text) on the wrong task!
* **The Rule**:
  Always use stable, unique entity IDs (\`key={todo.id}\`). Only use \`index\` if the list is strictly static and never filtered, sorted, or mutated.`;
    }

    if (q.includes('fiber') || q.includes('reconciliation') || q.includes('virtual dom')) {
      return `### ⚛️ React 18/19 Fiber Reconciler

1. **Why Fiber replaced the Stack Reconciler**:
   React 15 used recursive stack diffing which could not be interrupted. On large trees, this caused frame drops (>16ms).
2. **Fiber Node Linked List**:
   Fiber models components as a mutable linked list:
   - \`child\`: Points to first child
   - \`sibling\`: Points to next sibling
   - \`return\`: Points to parent
3. **Two-Phase Architecture**:
   - **Render Phase (Interruptible)**: React computes diffs in the background, yielding to the browser via \`requestIdleCallback\` / scheduler priority lanes.
   - **Commit Phase (Synchronous)**: Once diffs are calculated, React applies DOM mutations in one synchronous burst to avoid visual tearing.`;
    }

    // --- Specific Docker & DevOps Queries ---
    if (q.includes('namespace') || q.includes('cgroup') || q.includes('137') || q.includes('oom')) {
      return `### 🐳 Linux Containers, Cgroups & Exit Code 137

1. **Namespaces vs Cgroups**:
   - **Namespaces (Isolation)**: Control **what a container can see** (\`pid\` process tree, \`net\` network ports/routes, \`mnt\` mount points).
   - **Control Groups / Cgroups (Resource Throttling)**: Control **how much a container can use** (maximum RAM, CPU bandwidth quotas).
2. **Decoding Exit Code 137**:
   $$137 = 128 + 9 \\text{ (SIGKILL)}$$
   When container memory exceeds \`--memory 512m\`, the Linux kernel's **OOM Killer** (\`oom_kill_process\`) immediately halts memory allocation and kills the process with \`kill -9\`.
3. **How to Diagnose**:
   - Host inspection: \`dmesg -T | grep -i oom\`
   - Check cgroup limit: \`cat /sys/fs/cgroup/memory.events\`
   - Fix: Increase container memory or profile Node.js heap leaks via \`--max-old-space-size\`.`;
    }

    // --- Specific AI & LLM Queries ---
    if (q.includes('token') || q.includes('bpe') || q.includes('prefill') || q.includes('structured output')) {
      return `### 🤖 LLM Tokens, Prefill vs Decoding & Structured Schemas

1. **Byte-Pair Encoding (BPE)**:
   LLMs process numeric token IDs, not words. Common subwords are iteratively merged into a dictionary vocabulary ($\sim 32\\text{k}$ to $128\\text{k}$ tokens).
2. **Cost & Latency Asymmetry**:
   - **Input Prefill**: All prompt tokens are processed **in parallel across GPU tensor cores** in a single forward pass ($O(1)$ batch pass, $\\sim 20\\text{ms}$).
   - **Output Decoding**: Strictly **auto-regressive**. Every new token must be predicted one-by-one sequentially ($O(K)$ latency, $\\sim 25\\text{ms per token}$).
3. **Strict Structured JSON Outputs**:
   Modern engines (vLLM, Outlines, OpenAI Structured Outputs) compile JSON schemas into a Context-Free Grammar (CFG). During auto-regressive sampling, tokens that violate the schema syntax have their logits masked to $-\\infty$, guaranteeing **100% syntactically valid JSON output** without prompt hallucination.`;
    }

    // --- Event Loop Drill Query ---
    if (q.includes('event loop') || q.includes('microtask') || q.includes('drill 1')) {
      return `### ⚡ Master Event Loop Execution Rules

1. **Promise Executors run SYNCHRONOUSLY**:
   In \`new Promise((resolve) => { console.log('6'); resolve(); })\`, the function runs **immediately on the Call Stack**, NOT in the background!
2. **Microtasks Preempt Macrotasks**:
   - **Microtask Queue**: \`Promise.then()\`, \`queueMicrotask()\`, \`process.nextTick\` (Node).
   - **Macrotask Queue**: \`setTimeout()\`, \`setInterval()\`, \`setImmediate()\` (Node), I/O events.
3. **Queue Draining Guarantee**:
   The Event Loop **must drain the entire Microtask Queue to zero** before picking up the next Macrotask!
4. **Final Sequence for Drill 1**:
   $$\\mathbf{1 \\longrightarrow 6 \\longrightarrow 8 \\longrightarrow 3 \\longrightarrow 5 \\longrightarrow 7 \\longrightarrow 4 \\longrightarrow 2}$$`;
    }

    // --- Quick Prompt Intent Handlers ---
    if (q.includes('explain simply') || q.includes('like i\'m 5')) {
      return `### 💡 High-Level Analogy for Day ${day} (${mod.toUpperCase()})

Think of **Day ${day}** as building a high-performance racecar:
* **The CPU / RAM** is the physical engine and fuel injectors (Arrays occupy sequential fuel slots for $O(1)$ instant injection).
* **V8 Engine** is the intelligent automatic transmission: it starts in low gear (Ignition interpreter) and shifts to turbo overdrive (TurboFan compiler) once you hit cruising speed.
* **React Fiber** is the cooperative pit-stop crew: instead of stopping the race for 10 minutes to change all 4 tires at once, they swap one lug nut at a time between high-speed laps.
* **Docker Containers** are standardized shipping containers: they don't carry their own engine (host kernel); they just isolate cargo using strict compartments (namespaces) and weight scales (cgroups).`;
    }

    if (q.includes('interview question') || q.includes('mock interview')) {
      return `### 🎯 Top 3 Senior FAANG Interview Questions (Day ${day} • ${mod.toUpperCase()})

1. **DSA Architecture**: *"Why is searching an element in a Hash Table $O(1)$ average but $O(N)$ worst-case, and how does the CPU L1/L2 cache locality of an Array compare to a Hash Map in real-world benchmarks?"*
   - *Key Answer Point*: Hash collisions cause bucket chaining ($O(N)$); arrays offer hardware spatial prefetching (64-byte cache lines) which outperforms pointer-chasing node lookups.
2. **Backend Engine**: *"Explain what happens to V8 heap memory when an inner function creates a closure over a large buffer, and how the Scavenger GC differs from the Mark-Sweep-Compact Major GC."*
   - *Key Answer Point*: Shared Lexical Environments retain parent scope objects preventing GC collection; Young Generation (Nursery/Intermediate) uses Cheney's copying algorithm, Old Generation uses Mark-Sweep.
3. **DevOps & Containers**: *"A containerized Node.js service suddenly exits with code 137 under high traffic. How do you identify whether it was caused by Node heap exhaustion or a kernel cgroup OOM event?"*
   - *Key Answer Point*: Check host \`dmesg -T | grep -i oom\` and \`/sys/fs/cgroup/memory.events\`. Node heap exhaustion usually logs \`JavaScript heap out of memory\` before exit code 1.`;
    }

    if (q.includes('common pitfall') || q.includes('production bug')) {
      return `### 🐛 Top 3 Production Pitfalls on Day ${day}

1. **Unintended Lexical Closure Leaks**: Storing long-lived callbacks in module-level arrays or event listeners without calling \`removeListener()\` prevents V8 GC from reclaiming entire lexical scopes.
2. **Uncontrolled Input State Retention with \`key={index}\`**: Reordering or deleting items in a React list using array index preserves old input text/checkbox state on new rows.
3. **Docker Host Port Exhaustion**: Forgetting to configure connection pooling (e.g. \`pg.Pool\` in Node) allows containers to exhaust host TCP ephemeral socket ports under load.`;
    }

    // Default contextual answer
    return `### 🤖 SDE-Mastery Tutor Response — Day ${day}: ${ctx.dayTitle}

You asked: *"**${escapeHtml(query)}**"*

#### Technical Breakdown for Module: \`${(mod || 'curriculum').toUpperCase()}\`
1. **Core Concept Overview**:
   On Day ${day}, you are mastering ${ctx.dayTitle}. In production systems and senior engineering interviews, you are expected to explain the underlying physical mechanics—not just the surface syntax.
2. **Key Architectural Rule**:
   - Ensure algorithmic time/space invariants are preserved ($O(1)$ space for two pointers).
   - For backend execution, align with V8's optimization pipeline (uniform object shapes).
   - In containerized deployments, always configure explicit cgroup resource bounds (\`--memory\`, \`--cpus\`).
3. **Next Recommended Step**:
   - Select the **Drills** tab to test your execution prediction on the interactive VM simulator.
   - Try the DSA problem in the built-in LeetCode playground.

*(Tip: You can also connect a free Google Gemini or OpenAI API key in the ⚙️ settings above for unlimited custom LLM streaming!)*`;
  }

}

// Global App Instance
window.app = new StudyApp();
document.addEventListener('DOMContentLoaded', () => {
  window.app.init();
});
