import "./styles/main.css";
import { mountAppShell } from "./shell.js";

// 1. Mount DOM synchronously so all IDs exist immediately
mountAppShell();

// 2. Import core storage & hardware gatekeeper
import "./storage.js";
import "./hardware.js";

// 3. Import core & feature modules (they bind global handlers and wait for init/DOMContentLoaded)
import "./modules/audioFxEngine.js";
import "./modules/coreTrackerEngine.js";
import "./apptracker.js";
import "./screentime.js";
import "./terms.js";
import "./notifications.js";
import "./faq.js";
import "./founder.js";
import "./modules/leaderboardGroups.js";
import "./modules/twoFactorAuth.js";
import "./modules/securityEcosystem.js";
import "./modules/pp12Engine.js";
import "./modules/pro13Engine.js";
import "./modules/polishA11y.js";
import "./modules/settingsEngine.js";
import "./modules/summerArcVault.js";
import "./modules/axHeavenlyP20.js";
import "./modules/rpgKnowledgeEngine.js";
import "./modules/easterEggsEngine.js";
import "./modules/googleSyncComparison.js";
import "./modules/mobilePermissions.js";

async function bootstrapArcTracker() {
  try {
    if (window.ArcStorage && typeof window.ArcStorage.init === "function") {
      await window.ArcStorage.init();
    }
    if (typeof window.initApp === "function") {
      window.initApp();
    }
  } catch (err) {
    console.error("[ArcMain] Bootstrap error:", err);
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", bootstrapArcTracker, { once: true });
} else {
  bootstrapArcTracker();
}
