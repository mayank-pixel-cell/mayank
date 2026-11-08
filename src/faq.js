/**
 * Arc Tracker - Additional Settings & Frequently Asked Questions (FAQ) Engine
 * Implements modern mutually exclusive accordions (<details name="arc-faq">)
 * with real-time text search and category filtering.
 */

export const FAQ_ITEMS = [
  {
    id: 'faq-notif',
    category: 'updates',
    categoryLabel: 'Updates & Alerts',
    icon: 'fa-solid fa-bell',
    question: 'How do the real-time notifications and corner updates tab work?',
    answer: 'The corner Notifications tab (located at the bottom-right corner and the top-right header) keeps you informed in real-time. Whenever a new app update, performance patch, or streak milestone arrives, Arc Tracker triggers an in-app toast banner, a crystal chime, and an optional desktop OS tray push alert. You can click the tab anytime to view release notes, check for updates, or mark notifications as read.'
  },
  {
    id: 'faq-seasons',
    category: 'habits',
    categoryLabel: 'Habits & Streaks',
    icon: 'fa-solid fa-snowflake',
    question: 'What are the Winter Arc and Summer Arc seasons, and can I customize the dates?',
    answer: 'Winter Arc runs from October 1 to December 31 (92 days of radical discipline and silent transformation), while Summer Arc runs from April 1 to June 30. You can customize your exact challenge window in Settings under "Arc & Timeline" by adjusting the start and end dates or selecting 30, 60, or 90-day quick length presets.'
  },
  {
    id: 'faq-miss-day',
    category: 'habits',
    categoryLabel: 'Habits & Streaks',
    icon: 'fa-solid fa-fire',
    question: 'What happens if I miss a day? How does the Streak Freeze work?',
    answer: 'Arc Tracker includes built-in Streak Freeze protection (1 free miss per calendar month) enabled under Habit Rules & Scoring. If you miss a day with an active freeze, your streak continues unbroken. If no freeze is available, your active streak resets to Day 1, but all your earned XP, historical calendar grades, and journal reflections remain permanently preserved in your archive.'
  },
  {
    id: 'faq-screentime',
    category: 'screentime',
    categoryLabel: 'Screen Time & Blocker',
    icon: 'fa-solid fa-hourglass-half',
    question: 'How does the Live Screen Time Matrix and Dopamine Blocker track my activity?',
    answer: 'Arc Tracker tracks screen time on both PC/Laptop and Mobile. On Desktop, it measures active window focus and Pomodoro blocks. On Mobile, it connects with system usage APIs. When an app on your restricted list is opened during a lock-in block, the Dopamine Shield intervenes with a lockout screen and warning buzzer to keep you focused.'
  },
  {
    id: 'faq-privacy',
    category: 'security',
    categoryLabel: 'Security & Privacy',
    icon: 'fa-solid fa-shield-halved',
    question: 'Is my habit, journal, and screen time data private and safe?',
    answer: 'Yes, 100%. Arc Tracker operates under a strict Zero-Exfiltration Airgap Privacy Policy. All your data is stored locally on your device in durable IndexedDB + Tauri Store. Our Content Security Policy blocks unauthorized outbound telemetry. Cloud syncing to Google Account is 100% optional and user-controlled, and you can export encrypted backups anytime.'
  },
  {
    id: 'faq-backup',
    category: 'security',
    categoryLabel: 'Security & Privacy',
    icon: 'fa-solid fa-database',
    question: 'How do I back up my data or transfer it to a new device or smartphone?',
    answer: 'Navigate to Settings ➔ Data & Storage and click "Export Backup (.json)" or "Encrypted Backup". Transfer the file to your other device and click "Import Backup". Arc Tracker\'s built-in Antivirus Sentinel scans and sanitizes the file automatically before restoring your data.'
  },
  {
    id: 'faq-rpg',
    category: 'rpg',
    categoryLabel: 'RPG & Rewards',
    icon: 'fa-solid fa-crown',
    question: 'How does the RPG Level, XP calculation, and Boss Raid combat system work?',
    answer: 'Every completed habit awards base XP multiplied by the habit\'s priority weight (1x to 5x). Every 100 XP levels up your Operative Rank (from Novice Operative up to Celestial Sovereign). Each check-off also deals damage to the seasonal raid boss in the Level/KB tab, with a 20% critical strike chance that awards double XP and a celestial chime!'
  },
  {
    id: 'faq-promotion',
    category: 'visuals',
    categoryLabel: 'Audio & Visuals',
    icon: 'fa-solid fa-bolt',
    question: 'How do I enable 120Hz ProMotion mode and customize audio soundscapes?',
    answer: 'If your display or phone supports high refresh rates (90Hz, 120Hz, or 144Hz), go to Settings ➔ Audio, Visuals & Performance and select "120 FPS" or "Max" under Frame Rate Cap. You can also tune particle density, enable snowfall crystals, and toggle heavenly body ambient soundscapes (binaural beats and brown noise).'
  },
  {
    id: 'faq-autostart',
    category: 'screentime',
    categoryLabel: 'Screen Time & Blocker',
    icon: 'fa-solid fa-power-off',
    question: 'Can Arc Tracker automatically launch when my computer or phone turns on?',
    answer: 'Yes! Toggle on "Launch When Device Turns On (Auto-Start)" in Settings. This registers Arc Tracker to auto-start in the background so your screen time sentinel and daily lock-in habit tracker are always running silently from the moment your operating system boots.'
  },
  {
    id: 'faq-shortcuts',
    category: 'visuals',
    categoryLabel: 'Audio & Visuals',
    icon: 'fa-solid fa-keyboard',
    question: 'What keyboard shortcuts are supported on Desktop?',
    answer: 'Press N to open Notifications & Updates, S to open Settings, M for Global Mute, P to start/pause the Focus Timer, Alt + B for Arc Gold B&W mode, Esc to close modals/drawers, and ? to reveal the full keyboard shortcuts cheat sheet.'
  }
];

export class ArcFaqEngine {
  constructor() {
    this.searchQuery = '';
    this.activeCategory = 'all';
    this.isSectionExpanded = false; // Contracted by default to increase space
  }

  init() {
    this.render();
    this.updateSectionUI();
  }

  toggleSection(forceState) {
    if (typeof window !== 'undefined' && window.ArcSettingsAccordion && typeof window.ArcSettingsAccordion.toggle === 'function') {
      return window.ArcSettingsAccordion.toggle('settings-additional-faq-card', forceState);
    }
    if (typeof forceState === 'boolean') {
      this.isSectionExpanded = forceState;
    } else {
      this.isSectionExpanded = !this.isSectionExpanded;
    }
    this.updateSectionUI();
  }

  updateSectionUI() {
    const content = document.getElementById('faq-expandable-content');
    const toggleBtn = document.getElementById('faq-section-toggle-btn');
    const chevron = document.getElementById('faq-chevron-icon');
    const summaryText = document.getElementById('faq-summary-hint');

    if (!content) return;

    if (this.isSectionExpanded) {
      content.classList.remove('hidden');
      void content.offsetWidth; // force reflow
      content.classList.add('expanded');
      if (toggleBtn) {
        toggleBtn.innerHTML = `<span>Collapse FAQs</span> <i class="fa-solid fa-chevron-up text-[10px]"></i>`;
        toggleBtn.title = 'Click to collapse FAQ section';
      }
      if (chevron) {
        chevron.className = 'fa-solid fa-chevron-up text-[10px]';
      }
      if (summaryText) {
        summaryText.textContent = 'Habit scoring, offline airgap security, streak freeze & screen time rules • Tap to collapse';
      }
    } else {
      content.classList.remove('expanded');
      setTimeout(() => {
        if (!this.isSectionExpanded) content.classList.add('hidden');
      }, 440);
      if (toggleBtn) {
        toggleBtn.innerHTML = `<span>View FAQs</span> <i class="fa-solid fa-chevron-down text-[10px]"></i>`;
        toggleBtn.title = 'Click to view Frequently Asked Questions';
      }
      if (chevron) {
        chevron.className = 'fa-solid fa-chevron-down text-[10px]';
      }
      if (summaryText) {
        summaryText.textContent = 'Habit scoring, offline airgap security, streak freeze & screen time rules • Tap to expand';
      }
    }
  }

  filterSearch(query) {
    this.searchQuery = (query || '').trim().toLowerCase();
    if (this.searchQuery && !this.isSectionExpanded) {
      this.toggleSection(true);
    }
    this.render();
  }

  setCategory(cat) {
    this.activeCategory = cat || 'all';
    this.render();
  }

  toggleAll(shouldOpen) {
    const accordions = document.querySelectorAll('#faq-accordion-container details[name="arc-faq"]');
    accordions.forEach(acc => {
      acc.open = !!shouldOpen;
    });
  }

  render() {
    const container = document.getElementById('faq-accordion-container');
    if (!container) return;

    // Filter items
    const filtered = FAQ_ITEMS.filter(item => {
      const matchesCat = (this.activeCategory === 'all') || (item.category === this.activeCategory);
      if (!matchesCat) return false;

      if (!this.searchQuery) return true;
      const haystack = (item.question + ' ' + item.answer + ' ' + item.categoryLabel).toLowerCase();
      return haystack.includes(this.searchQuery);
    });

    // Update count display
    const countEl = document.getElementById('faq-results-count');
    if (countEl) {
      countEl.textContent = `${filtered.length} of ${FAQ_ITEMS.length} questions`;
    }

    // Update category pills styling
    const pills = document.querySelectorAll('.faq-category-pill');
    pills.forEach(p => {
      const isSelected = p.dataset.faqCat === this.activeCategory;
      if (isSelected) {
        p.className = 'faq-category-pill px-3 py-1.5 rounded-xl text-xs font-bold transition bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm';
      } else {
        p.className = 'faq-category-pill px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-900 border border-slate-800 hover:border-slate-700 transition';
      }
    });

    if (filtered.length === 0) {
      container.innerHTML = `
        <div class="text-center py-8 px-4 rounded-xl bg-slate-950/40 border border-slate-800 space-y-2">
          <div class="w-10 h-10 mx-auto rounded-full bg-cyan-500/10 text-cyan-400 flex items-center justify-center text-sm border border-cyan-500/20">
            <i class="fa-solid fa-magnifying-glass"></i>
          </div>
          <div class="text-xs font-bold text-slate-300">No matching questions found</div>
          <p class="text-[11px] text-slate-400 max-w-sm mx-auto">Try a different keyword or reset the category filter to view all questions.</p>
          <button type="button" onclick="ArcFaq.filterSearch(''); document.getElementById('faq-search-input').value = ''; ArcFaq.setCategory('all')" class="mt-2 text-xs text-cyan-400 hover:text-cyan-300 font-semibold underline">
            Reset Filters
          </button>
        </div>
      `;
      return;
    }

    // Generate Mutually Exclusive <details name="arc-faq"> accordions
    container.innerHTML = filtered.map((item, index) => {
      // First item opens by default if query is empty and viewing all
      const isOpen = index === 0 && !this.searchQuery && this.activeCategory === 'all';
      
      const categoryBadgeColors = {
        updates: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
        habits: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
        screentime: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
        security: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
        rpg: 'bg-yellow-500/15 text-yellow-300 border-yellow-500/30',
        visuals: 'bg-pink-500/15 text-pink-300 border-pink-500/30'
      };
      const badgeStyle = categoryBadgeColors[item.category] || 'bg-slate-800 text-slate-300 border-slate-700';

      return `
        <details name="arc-faq" ${isOpen ? 'open' : ''} class="faq-item group rounded-xl border border-slate-800/90 bg-slate-950/70 transition-all duration-200 hover:border-cyan-500/40 select-text overflow-hidden">
          <summary class="cursor-pointer list-none flex items-center justify-between gap-3 p-3.5 sm:p-4 text-xs sm:text-sm font-bold text-slate-200 group-hover:text-cyan-300 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400">
            <div class="flex items-center gap-2.5 min-w-0">
              <span class="w-6 h-6 rounded-lg bg-slate-900 border border-slate-800 text-cyan-400 flex items-center justify-center text-xs shrink-0 group-hover:border-cyan-500/30 transition-colors">
                <i class="${item.icon}"></i>
              </span>
              <span class="truncate">${item.question}</span>
            </div>
            <div class="flex items-center gap-2 shrink-0">
              <span class="hidden sm:inline text-[9px] font-mono font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${badgeStyle}">${item.categoryLabel}</span>
              <span class="faq-chevron w-5 h-5 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-[10px] text-slate-400 group-hover:text-cyan-400 transition-transform duration-200">
                <i class="fa-solid fa-chevron-down"></i>
              </span>
            </div>
          </summary>
          <div class="px-4 pb-4 pt-1 text-xs text-slate-300 leading-relaxed border-t border-slate-900/80 bg-slate-900/40 space-y-2">
            <p>${item.answer}</p>
          </div>
        </details>
      `;
    }).join('');
  }
}

export const arcFaq = new ArcFaqEngine();

if (typeof window !== 'undefined') {
  window.ArcFaq = arcFaq;
}
