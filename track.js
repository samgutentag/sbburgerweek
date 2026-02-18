// Lightweight event tracker — sends fire-and-forget beacons to a Cloudflare Worker.
// Set THEME.trackUrl to the worker URL to enable, or leave null to disable.
(function () {
  var url = typeof THEME !== "undefined" && THEME.trackUrl;
  if (!url) return;

  window.track = function (action, label) {
    if (navigator.sendBeacon) {
      var blob = new Blob([JSON.stringify({ action: action, label: label })], { type: "application/json" });
      navigator.sendBeacon(url, blob);
    }
  };
})();
