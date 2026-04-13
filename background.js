chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {

  if (msg.type === "CHECK_URL") {
    chrome.storage.local.get(["blockedSites", "passedSites"], (data) => {
      var blocked = data.blockedSites || [];
      var passed = data.passedSites || {};
      var now = Date.now();

      var hostname = "";
      try {
        hostname = new URL(msg.url).hostname.replace(/^www\./, "");
      } catch(e) {
        sendResponse({ blocked: false });
        return;
      } 

      var isBlocked = blocked.some(s => hostname === s || hostname.endsWith("." + s));
      var passedUntil = passed[hostname];
      var isPassed = passedUntil && passedUntil > now;

      sendResponse({ blocked: isBlocked && !isPassed });
    });
    return true;
  }

  if (msg.type === "MARK_PASSED") {
    chrome.storage.local.get(["passedSites"], (data) => {
      var passed = data.passedSites || {};
      var now = Date.now();

      // remove old ones
      for (var k in passed) {
        if (passed[k] <= now) delete passed[k];
      }

      // 10 minutes pass
      passed[msg.hostname] = now + (10 * 60 * 1000);
      chrome.storage.local.set({ passedSites: passed }, () => {
        sendResponse({ ok: true });
      });
    });
    return true;
  }

});
