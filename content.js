(function() {
  var url = window.location.href;

  if (!url.startsWith("http")) return;
  if (url.includes(chrome.runtime.id)) return;

  chrome.runtime.sendMessage({ type: "CHECK_URL", url: url }, function(resp) {
    if (chrome.runtime.lastError) return;
    if (resp && resp.blocked) {
      var gateUrl = chrome.runtime.getURL("gate.html") + "?url=" + encodeURIComponent(url);
      window.location.replace(gateUrl);
    }
  });
})();
