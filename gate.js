(function() {

  var params = new URLSearchParams(window.location.search);
  var returnUrl = params.get("url") || "about:blank";

  var hostname = "";
  try {
    hostname = new URL(returnUrl).hostname.replace(/^www\./, "");
  } catch(e) {}

  document.getElementById("site-label").textContent = hostname;

  function rand(a, b) {
    return Math.floor(Math.random() * (b - a + 1)) + a;
  }


  var generators = [
    function() { var a=rand(2,12), b=rand(2,12); return { q: a+" × "+b+" = ?", ans: a*b }; },
    function() { var a=rand(10,99), b=rand(10,99); return { q: a+" + "+b+" = ?", ans: a+b }; },
    function() { var a=rand(20,99), b=rand(5,40); return { q: a+" − "+b+" = ?", ans: a-b }; },
    function() { var n=rand(5,12); return { q: n+"² = ?", ans: n*n }; },
    function() {
      var squares = [9,16,25,36,49,64,81,100];
      var n = squares[rand(0, squares.length-1)];
      return { q: "√"+n+" = ?", ans: Math.sqrt(n) };
    },
    function() { var a=rand(3,9), b=rand(2,5), c=rand(1,10); return { q: "("+a+"+"+b+") × "+c+" = ?", ans:(a+b)*c }; },
  ];

  var answer;

  function load() {
    var gen = generators[rand(0, generators.length-1)]();
    answer = gen.ans;

    document.getElementById("question").textContent = gen.q;
    document.getElementById("feedback").textContent = "";
    document.getElementById("feedback").className = "";


    var opts = [answer];
    var seen = new Set([answer]);
    var tries = 0;
    while (opts.length < 4 && tries < 60) {
      var off = rand(1, Math.max(3, Math.round(Math.abs(answer) * 0.3)));
      var wrong = answer + (Math.random() < 0.5 ? off : -off);
      if (!seen.has(wrong) && wrong >= 0) {
        opts.push(wrong);
        seen.add(wrong);
      }
      tries++;
    }

    while (opts.length < 4) opts.push(answer + opts.length * 7);

    // shuffle
    opts.sort(function() { return Math.random() - 0.5; });

    var container = document.getElementById("options");
    container.innerHTML = "";
    opts.forEach(function(val) {
      var btn = document.createElement("button");
      btn.className = "opt";
      btn.textContent = val;
      btn.onclick = function() { check(val, btn); };
      container.appendChild(btn);
    });
  }

  function check(val, btn) {

    document.querySelectorAll(".opt").forEach(function(b) {
      b.classList.add("dim");
    });
    btn.classList.remove("dim");

    if (val === answer) {
      btn.classList.add("correct");
      document.getElementById("feedback").textContent = "correct! going there...";
      document.getElementById("feedback").className = "ok";

      chrome.runtime.sendMessage({ type: "MARK_PASSED", hostname: hostname }, function() {
        setTimeout(function() {
          window.location.replace(returnUrl);
        }, 700);
      });
    } else {
      btn.classList.add("wrong");
      document.getElementById("feedback").textContent = "nope, try again";
      document.getElementById("feedback").className = "err";
      setTimeout(load, 1200);
    }
  }

  document.getElementById("skip-btn").onclick = load;

  load();

})();
