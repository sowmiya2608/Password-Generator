(() => {
  "use strict";

  const SETS = {
    upper: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
    lower: "abcdefghijklmnopqrstuvwxyz",
    numbers: "0123456789",
    symbols: "!@#$%^&*()-_=+[]{};:,.<>?/~"
  };
  const AMBIGUOUS = /[O0oIl1|]/g;

  const $ = (id) => document.getElementById(id);
  const out = $("password");
  const range = $("length");
  const num = $("length-num");
  const copyBtn = $("copy");
  const copyLabel = $("copy-label");
  const regen = $("regen");
  const bar = $("bar");
  const strengthText = $("strength-text");
  const toast = $("toast");
  const boxes = ["upper", "lower", "numbers", "symbols"].map((k) => ({ key: k, el: $(k) }));
  const ambiguous = $("ambiguous");

  let current = "";
  let toastTimer, copyTimer;

  // Unbiased random integer in [0, max) using rejection sampling
  function randomInt(max) {
    const limit = Math.floor(0x100000000 / max) * max;
    const buf = new Uint32Array(1);
    do { crypto.getRandomValues(buf); } while (buf[0] >= limit);
    return buf[0] % max;
  }

  function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = randomInt(i + 1);
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  function activePools() {
    return boxes
      .filter((b) => b.el.checked)
      .map((b) => (ambiguous.checked ? SETS[b.key].replace(AMBIGUOUS, "") : SETS[b.key]));
  }

  function clampLength(v) {
    v = parseInt(v, 10);
    if (isNaN(v)) v = 16;
    return Math.min(64, Math.max(4, v));
  }

  function generate() {
    const pools = activePools();
    if (!pools.length) return "";
    const length = Math.max(clampLength(num.value), pools.length);
    const all = pools.join("");
    // guarantee at least one character from every selected type
    const chars = pools.map((p) => p[randomInt(p.length)]);
    while (chars.length < length) chars.push(all[randomInt(all.length)]);
    return shuffle(chars).join("");
  }

  function rate(pw, poolSize) {
    if (!pw) return { label: "-", pct: 0, color: "var(--weak)" };
    const bits = pw.length * Math.log2(poolSize);
    if (bits < 40) return { label: "Weak", pct: 25, color: "var(--weak)" };
    if (bits < 60) return { label: "Fair", pct: 50, color: "var(--fair)" };
    if (bits < 90) return { label: "Good", pct: 75, color: "var(--good)" };
    return { label: "Strong", pct: 100, color: "var(--strong)" };
  }

  function render() {
    const pools = activePools();
    current = generate();
    const has = current.length > 0;

    out.textContent = has ? current : "Select at least one character type";
    out.classList.toggle("empty", !has);
    copyBtn.disabled = !has;
    regen.disabled = !has;

    const r = rate(current, pools.join("").length || 1);
    bar.style.width = r.pct + "%";
    bar.style.background = r.color;
    strengthText.innerHTML = "Strength: <strong>" + r.label + "</strong>" +
      (has ? " (" + Math.round(current.length * Math.log2(pools.join("").length)) + " bits)" : "");
  }

  function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("show"), 1800);
  }

  async function copy() {
    if (!current) return;
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(current);
      } else {
        const ta = document.createElement("textarea");
        ta.value = current;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        const ok = document.execCommand("copy");
        ta.remove();
        if (!ok) throw new Error("copy failed");
      }
      copyLabel.textContent = "Copied";
      clearTimeout(copyTimer);
      copyTimer = setTimeout(() => (copyLabel.textContent = "Copy password"), 1800);
      showToast("Password copied to clipboard");
    } catch (e) {
      showToast("Copy failed. Select the password and copy it manually.");
    }
  }

  // Keep slider and number input in sync
  range.addEventListener("input", () => { num.value = range.value; render(); });
  num.addEventListener("input", () => {
    if (num.value === "") return;
    range.value = clampLength(num.value);
    render();
  });
  num.addEventListener("blur", () => { num.value = clampLength(num.value); range.value = num.value; render(); });

  boxes.forEach((b) => b.el.addEventListener("change", render));
  ambiguous.addEventListener("change", render);
  copyBtn.addEventListener("click", copy);
  regen.addEventListener("click", () => {
    regen.classList.remove("spin");
    void regen.offsetWidth;
    regen.classList.add("spin");
    render();
  });

  render();
})();
