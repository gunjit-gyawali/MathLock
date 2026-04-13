var currentHost = "";

// get the active tab's hostname
chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
  if (!tabs || !tabs[0] || !tabs[0].url) return;
  try {
    var url = tabs[0].url;
    if (!url.startsWith("http")) return;
    currentHost = new URL(url).hostname.replace(/^www\./, "");
    var el = document.getElementById("current-host");
    el.textContent = currentHost;
    el.classList.remove("empty");
    refreshBlockBtn();
  } catch(e) {}
});

function refreshBlockBtn() {
  chrome.storage.local.get(["blockedSites"], function(data) {
    var sites = data.blockedSites || [];
    var btn = document.getElementById("block-btn");
    if (!currentHost) { btn.disabled = true; return; }

    if (sites.includes(currentHost)) {
      btn.textContent = "Blocked ✓";
      btn.disabled = true;
    } else {
      btn.textContent = "+ Block";
      btn.disabled = false;
    }
  });
}

document.getElementById("block-btn").onclick = function() {
  if (currentHost) addSite(currentHost);
};

function renderList() {
  chrome.storage.local.get(["blockedSites"], function(data) {
    var sites = data.blockedSites || [];
    var list = document.getElementById("sites-list");
    list.innerHTML = "";

    if (sites.length === 0) {
      list.innerHTML = '<div class="empty-msg">nothing blocked yet<br>add a site below</div>';
      refreshBlockBtn();
      return;
    }

    sites.forEach(function(site) {
      var row = document.createElement("div");
      row.className = "site-row";

      var name = document.createElement("span");
      name.className = "name";
      name.textContent = site;

      var rm = document.createElement("button");
      rm.className = "rm";
      rm.textContent = "×";
      rm.onclick = function() { removeSite(site); };

      row.appendChild(name);
      row.appendChild(rm);
      list.appendChild(row);
    });

    refreshBlockBtn();
  });
}

function addSite(raw) {
  var site = raw.trim().toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .split("/")[0];

  if (!site || !site.includes(".")) {
    showToast("need a valid domain", true);
    return;
  }

  chrome.storage.local.get(["blockedSites"], function(data) {
    var sites = data.blockedSites || [];
    if (sites.includes(site)) {
      showToast("already blocked", true);
      return;
    }
    sites.push(site);
    chrome.storage.local.set({ blockedSites: sites }, function() {
      document.getElementById("add-input").value = "";
      renderList();
      showToast("blocked " + site);
    });
  });
}

function removeSite(site) {
  chrome.storage.local.get(["blockedSites"], function(data) {
    var sites = (data.blockedSites || []).filter(function(s) { return s !== site; });
    chrome.storage.local.set({ blockedSites: sites }, function() {
      renderList();
      showToast("removed " + site, true);
    });
  });
}

var toastTimer;
function showToast(msg, isErr) {
  var t = document.getElementById("toast");
  t.textContent = msg;
  t.className = isErr ? "err" : "";
  t.style.display = "block";
  clearTimeout(toastTimer);
  toastTimer = setTimeout(function() { t.style.display = "none"; }, 2000);
}

document.getElementById("add-btn").onclick = function() {
  addSite(document.getElementById("add-input").value);
};

document.getElementById("add-input").onkeydown = function(e) {
  if (e.key === "Enter") addSite(this.value);
};

renderList();
 