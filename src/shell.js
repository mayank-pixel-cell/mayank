import { renderHeaderNav } from "./components/headerNav.js";
import { renderUpdateModal, renderUpdateTopBanner } from "./components/updateModal.js";
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
import { renderMultiUserModal } from "./components/multiUserModal.js";

/**
 * Synchronously mounts the complete DOM structure into #app-shell before any
 * legacy or modular script executes querySelector / getElementById.
 */
export function mountAppShell() {
  let shell = document.getElementById("app-shell");
  if (!shell && typeof document !== "undefined" && document.body) {
    shell = document.createElement("div");
    shell.id = "app-shell";
    shell.className = "contents";
    document.body.prepend(shell);
  }
  if (!shell) return;
  if (shell.dataset.mounted === "true") return;

  shell.innerHTML = [
    renderHeaderNav(),
    renderUpdateTopBanner(),
    `<main class="relative z-10 max-w-7xl mx-auto w-full px-3 sm:px-6 lg:px-8 py-4 sm:py-6 pb-32 md:pb-24 flex-grow">`,
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
    renderSystemModals(),
    renderMultiUserModal(),
    renderUpdateModal()
  ].join("\n");

  shell.dataset.mounted = "true";
  console.log("[ArcShell] Application shell mounted into DOM.");
}

// Synchronously mount immediately when shell.js is evaluated
if (typeof document !== "undefined") {
  mountAppShell();
}
