/**
 * Arc Tracker - About the Founder & Mission Manifesto Engine
 * Handles the expandable/contracted state of the Founder section,
 * detailing the journey, goals, vision, and the 100% Free Manifesto.
 */

export class ArcAboutFounderEngine {
  constructor() {
    this.isExpanded = false; // Contracted by default as requested
  }

  init() {
    this.updateUI();
  }

  toggle(forceState) {
    if (typeof forceState === 'boolean') {
      this.isExpanded = forceState;
    } else {
      this.isExpanded = !this.isExpanded;
    }
    this.updateUI();
  }

  updateUI() {
    const content = document.getElementById('founder-expandable-content');
    const toggleBtn = document.getElementById('founder-toggle-btn');
    const chevron = document.getElementById('founder-chevron-icon');
    const summaryText = document.getElementById('founder-summary-hint');

    if (!content) return;

    if (this.isExpanded) {
      content.classList.remove('hidden');
      if (toggleBtn) {
        toggleBtn.innerHTML = `<span>Collapse Story</span> <i class="fa-solid fa-chevron-up text-[10px]"></i>`;
        toggleBtn.title = 'Click to collapse founder details';
      }
      if (chevron) {
        chevron.className = 'fa-solid fa-chevron-up text-[10px]';
      }
      if (summaryText) {
        summaryText.textContent = 'How the journey started • Goals & uncompromised vision • Why Arc Tracker is 100% free • Tap to collapse';
      }
    } else {
      content.classList.add('hidden');
      if (toggleBtn) {
        toggleBtn.innerHTML = `<span>Read Story</span> <i class="fa-solid fa-chevron-down text-[10px]"></i>`;
        toggleBtn.title = 'Click to read how the journey started & vision';
      }
      if (chevron) {
        chevron.className = 'fa-solid fa-chevron-down text-[10px]';
      }
      if (summaryText) {
        summaryText.textContent = 'How the journey started • Goals & uncompromised vision • Why Arc Tracker is 100% free • Tap to expand';
      }
    }
  }
}

export const arcAboutFounder = new ArcAboutFounderEngine();

if (typeof window !== 'undefined') {
  window.ArcAboutFounder = arcAboutFounder;
}
