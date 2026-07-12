(() => {
  "use strict";
  if ("serviceWorker" in navigator && location.protocol !== "file:") {
    addEventListener("load", () => navigator.serviceWorker.register("./sw.js", {scope: "./"}).catch(() => {}));
  }
  document.querySelector("#retry-connection")?.addEventListener("click",()=>location.reload());
})();
