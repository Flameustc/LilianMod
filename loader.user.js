// ==UserScript==
// @name LilianMod Loader
// @namespace https://www.bondageprojects.com/
// @version 0.3.0
// @description LilianMod auto loader
// @author Flameustc
// @match https://www.bondageprojects.elementfx.com/R*
// @run-at document-end
// @grant none
// ==/UserScript==

(function () {
  "use strict";
  const script = document.createElement("script");
  script.setAttribute("crossorigin", "anonymous");
  script.src = `https://flameustc.github.io/LilianMod/lilianmod.user.js?${Date.now()}`;
  document.head.appendChild(script);
})();
