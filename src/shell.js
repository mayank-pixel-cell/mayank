import { renderHeaderNav } from "./components/headerNav.js";
import { renderTrackerView } from "./views/trackerView.js";
import { renderRulesView } from "./views/rulesView.js";
import { renderResultsView } from "./views/resultsView.js";
import { renderProgressionView } from "./views/progressionView.js";
import { renderSettingsView } from "./views/settingsView.js";
import { renderScreentimeView } from "./views/screentimeView.js";
import { renderBlockerModals } from "./components/blockerModals.js";
import { renderNotificationsView } from "./views/notificationsView.js";
import { renderFooterHud } from "./components/footerHud.js";
import { renderShowcaseEasterModals } from "./components/showcaseEasterModals.js";
import { renderSystemModals } from "./components/systemModals.js";

/**
 * Synchronously mounts the complete DOM structure into #app-shell before any
 * legacy or modular script executes querySelector / getElementById.
 */
export function mountAppShell() {
  const shell = document.getElementById("app-shell");
  if (!shell || shell.dataset.mounted === "true") return;

  shell.innerHTML = [
    renderHeaderNav(),
    `<main class="relative z-10 max-w-7xl mx-auto w-full px-3 sm:px-6 lg:px-8 py-4 sm:py-6 flex-grow">`,
    renderTrackerView(),
    renderRulesView(),
    renderResultsView(),
    renderProgressionView(),
    renderSettingsView(),
    renderScreentimeView(),
    renderBlockerModals(),
    renderNotificationsView(),
    `</main>`,
    renderFooterHud(),
    renderShowcaseEasterModals(),
    renderSystemModals()
  ].join("\n");

  shell.dataset.mounted = "true";
}
