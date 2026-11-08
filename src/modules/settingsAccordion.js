/**
 * Arc Tracker - Unified Settings Accordion Helper
 * Manages compact collapsible cards across the Settings view (#view-settings).
 * Maintains a persistent Set of expanded card IDs so dynamically re-rendered
 * cards remember their open/closed state.
 */

class ArcSettingsAccordionManager {
  constructor() {
    this.expandedCards = new Set();
  }

  isExpanded(cardId) {
    if (!cardId) return false;
    const actualId = typeof cardId === 'string' ? cardId : (cardId.id || '');
    return this.expandedCards.has(actualId);
  }

  toggle(cardId, forceState) {
    if (!cardId) return;
    const card = typeof cardId === 'string' ? document.getElementById(cardId) : cardId;
    if (!card) return;
    const actualId = card.id || (typeof cardId === 'string' ? cardId : '');

    const accordion = card.querySelector('.arc-fluid-accordion');
    const chevron = card.querySelector('.settings-chevron-icon') ||
                    card.querySelector('#faq-chevron-icon') ||
                    card.querySelector('#founder-chevron-icon');
    const arrowBtn = card.querySelector('.settings-arrow-btn') ||
                     card.querySelector('#faq-section-toggle-btn') ||
                     card.querySelector('#founder-toggle-btn');

    const currentlyExpanded = accordion
      ? accordion.classList.contains('expanded')
      : this.expandedCards.has(actualId);

    // Guard against rapid duplicate clicks (e.g., event bubbling from button to header)
    const now = Date.now();
    this._lastToggleTime = this._lastToggleTime || {};
    if (actualId && typeof forceState !== 'boolean') {
      if (now - (this._lastToggleTime[actualId] || 0) < 150) {
        return;
      }
      this._lastToggleTime[actualId] = now;
    }

    const willExpand = (typeof forceState === 'boolean') ? forceState : !currentlyExpanded;

    if (willExpand) {
      if (actualId) this.expandedCards.add(actualId);
      if (accordion) {
        accordion.classList.remove('hidden');
        void accordion.offsetWidth; // force reflow for smooth CSS spring transition
        accordion.classList.add('expanded');
      }
      if (chevron) {
        chevron.classList.add('rotate-180');
      }
      if (arrowBtn) {
        arrowBtn.setAttribute('aria-expanded', 'true');
      }
    } else {
      if (actualId) this.expandedCards.delete(actualId);
      if (accordion) {
        accordion.classList.remove('expanded');
        setTimeout(() => {
          if (!this.expandedCards.has(actualId) && accordion && !accordion.classList.contains('expanded')) {
            accordion.classList.add('hidden');
          }
        }, 350);
      }
      if (chevron) {
        chevron.classList.remove('rotate-180');
      }
      if (arrowBtn) {
        arrowBtn.setAttribute('aria-expanded', 'false');
      }
    }

    // Keep internal legacy states synchronized
    if (actualId === 'settings-additional-faq-card' && window.ArcFaq) {
      window.ArcFaq.isSectionExpanded = willExpand;
      if (typeof window.ArcFaq.updateSectionUI === 'function') {
        const toggleBtn = document.getElementById('faq-section-toggle-btn');
        if (toggleBtn) {
          toggleBtn.innerHTML = willExpand 
            ? `<span>Collapse FAQs</span> <i id="faq-chevron-icon" class="settings-chevron-icon fa-solid fa-chevron-down text-[10px] transition-transform duration-300 rotate-180"></i>`
            : `<span>View FAQs</span> <i id="faq-chevron-icon" class="settings-chevron-icon fa-solid fa-chevron-down text-[10px] transition-transform duration-300"></i>`;
        }
      }
    }
    if (actualId === 'settings-about-founder-card' && window.ArcAboutFounder) {
      window.ArcAboutFounder.isExpanded = willExpand;
      const toggleBtn = document.getElementById('founder-toggle-btn');
      if (toggleBtn) {
        toggleBtn.innerHTML = willExpand
          ? `<span>Collapse Story</span> <i id="founder-chevron-icon" class="settings-chevron-icon fa-solid fa-chevron-down text-[10px] transition-transform duration-300 rotate-180"></i>`
          : `<span>Read Story</span> <i id="founder-chevron-icon" class="settings-chevron-icon fa-solid fa-chevron-down text-[10px] transition-transform duration-300"></i>`;
      }
    }

    if (typeof window.playSfx === 'function') {
      try {
        window.playSfx('click');
      } catch (e) {}
    }

    return willExpand;
  }

  handleKeyDown(event, cardId) {
    if (!event) return;
    if (event.key === 'ArrowDown' || event.key === 'ArrowRight') {
      event.preventDefault();
      this.toggle(cardId, true);
    } else if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') {
      event.preventDefault();
      this.toggle(cardId, false);
    }
  }

  applyState(cardId) {
    if (!cardId) return;
    const card = typeof cardId === 'string' ? document.getElementById(cardId) : cardId;
    if (!card) return;
    const actualId = card.id || (typeof cardId === 'string' ? cardId : '');
    const isExp = this.expandedCards.has(actualId);

    const accordion = card.querySelector('.arc-fluid-accordion');
    const chevron = card.querySelector('.settings-chevron-icon') ||
                    card.querySelector('#faq-chevron-icon') ||
                    card.querySelector('#founder-chevron-icon');
    const arrowBtn = card.querySelector('.settings-arrow-btn') ||
                     card.querySelector('#faq-section-toggle-btn') ||
                     card.querySelector('#founder-toggle-btn');

    if (accordion) {
      if (isExp) {
        accordion.classList.remove('hidden');
        accordion.classList.add('expanded');
      } else {
        accordion.classList.remove('expanded');
        accordion.classList.add('hidden');
      }
    }
    if (chevron) {
      if (isExp) {
        chevron.classList.add('rotate-180');
      } else {
        chevron.classList.remove('rotate-180');
      }
    }
    if (arrowBtn) {
      arrowBtn.setAttribute('aria-expanded', isExp ? 'true' : 'false');
    }
  }
}

export const ArcSettingsAccordion = new ArcSettingsAccordionManager();

if (typeof window !== 'undefined') {
  window.ArcSettingsAccordion = ArcSettingsAccordion;
}
