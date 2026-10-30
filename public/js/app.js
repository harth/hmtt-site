import { firebaseConfig } from "./firebase-config.js";
import { defaultServices, defaultJobs, SECTORS } from "./content.js";

const FB = "https://www.gstatic.com/firebasejs/10.14.1";
const $ = (s, r = document) => r.querySelector(s);
const configured = Boolean(firebaseConfig.apiKey);

const state = {
  services: withIds(defaultServices, "svc"),
  jobs: withIds(defaultJobs, "job"),
  usingDefaults: true,
  admin: false,
  filter: "All"
};

let fb = null; // { db, auth, fs, au } once loaded

document.documentElement.classList.add("js");

/* ---------------- Utilities ---------------- */

function withIds(list, prefix) {
  return list.map((d, i) => ({ id: `${prefix}-${i}`, order: i + 1, ...d }));
}

function el(tag, attrs = {}, ...children) {
  const n = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v == null || v === false) continue;
    if (k === "class") n.className = v;
    else if (k === "dataset") Object.assign(n.dataset, v);
    else if (k.startsWith("on")) n.addEventListener(k.slice(2), v);
    else n.setAttribute(k, v === true ? "" : v);
  }
  for (const c of children.flat()) {
    if (c == null || c === false) continue;
    n.append(c instanceof Node ? c : document.createTextNode(String(c)));
  }
  return n;
}

function svg(path) {
  const s = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  s.setAttribute("viewBox", "0 0 24 24");
  s.setAttribute("class", "chev");
  s.setAttribute("aria-hidden", "true");
  s.innerHTML = path;
  return s;
}

let toastTimer;
function toast(msg, isError = false, ms = 3200) {
  const t = $("#toast");
  t.textContent = msg;
  t.classList.toggle("error", isError);
  t.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove("show"), ms);
}

const byOrder = (a, b) => (a.order ?? 0) - (b.order ?? 0);

/* ---------------- Rendering ---------------- */

function renderServices() {
  const list = $("#services-list");
  const items = [...state.services].sort(byOrder);
  list.replaceChildren(
    ...items.map((s, i) =>
      el("article", { class: "service reveal" },
        el("div", { class: "service-num" }, String(i + 1).padStart(2, "0")),
        el("h3", {}, s.title),
        el("p", {}, s.summary),
        s.tags?.length ? el("ul", { class: "tags" }, s.tags.map(t => el("li", {}, t))) : null,
        adminActions("services", s, i, items.length)
      )
    )
  );
  observeReveals(list);
}

function renderFilter() {
  const wrap = $("#sector-filter");
  const counts = state.jobs.reduce((m, j) => (m[j.sector] = (m[j.sector] || 0) + 1, m), {});
  const sectors = ["All", ...SECTORS.filter(s => counts[s])];
  if (!sectors.includes(state.filter)) state.filter = "All";
  wrap.replaceChildren(
    ...sectors.map(s =>
      el("button", {
        class: "chip", type: "button", "aria-pressed": String(s === state.filter),
        onclick: () => { state.filter = s; renderFilter(); applyFilter(); }
      }, s, el("span", { class: "count" }, s === "All" ? state.jobs.length : counts[s]))
    )
  );
}

function applyFilter() {
  for (const li of $("#jobs-list").children) {
    li.hidden = state.filter !== "All" && li.dataset.sector !== state.filter;
  }
}

function renderJobs() {
  const list = $("#jobs-list");
  const items = [...state.jobs].sort(byOrder);
  list.replaceChildren(
    ...items.map((j, i) => {
      const current = !j.end;
      const detailId = `job-detail-${j.id}`;
      const card = el("div", { class: "job-card" + (i === 0 ? " open" : "") });
      const toggle = el("button", {
        class: "job-toggle", type: "button", "aria-expanded": String(i === 0), "aria-controls": detailId,
        onclick: () => {
          const open = card.classList.toggle("open");
          toggle.setAttribute("aria-expanded", String(open));
        }
      },
        el("span", { class: "job-client" }, j.client),
        el("span", { class: "job-role" }, j.role),
        el("span", { class: "job-meta" }, el("span", { class: "sector" }, j.sector), svg('<path d="M6 9l6 6 6-6"/>'))
      );
      card.append(
        toggle,
        el("div", { class: "job-detail", id: detailId },
          el("div", {},
            el("div", { class: "job-detail-inner" },
              j.summary ? el("p", {}, j.summary) : null,
              j.highlights?.length ? el("ul", { class: "highlights" }, j.highlights.map(h => el("li", {}, h))) : null,
              j.tech?.length ? el("ul", { class: "tags" }, j.tech.map(t => el("li", {}, t))) : null,
              j.location ? el("p", { class: "job-loc", style: "margin:12px 0 0" }, j.location) : null
            )
          )
        ),
      );
      const actions = adminActions("jobs", j, i, items.length);
      if (actions) card.append(actions);
      return el("li", { class: "job reveal" + (current ? " current" : ""), dataset: { sector: j.sector || "Other" } },
        el("div", { class: "job-when" },
          el("div", {}, j.start),
          el("div", { class: current ? "now" : "" }, current ? "Present" : j.end)
        ),
        card
      );
    })
  );
  renderFilter();
  applyFilter();
  renderStatus();
  observeReveals(list);
}

function renderStatus() {
  const card = $("#status-card");
  const now = [...state.jobs].sort(byOrder).find(j => !j.end);
  if (!now) { card.hidden = true; return; }
  const rows = [["engagement", now.client], ["role", now.role.split("·")[0].trim()], ["since", now.start]];
  $(".status-body", card).replaceChildren(...rows.flatMap(([k, v]) => [el("dt", {}, k), el("dd", {}, v)]));
  card.hidden = false;
}

function renderAll() { renderServices(); renderJobs(); }

/* ---------------- Reveal + nav ---------------- */

const io = "IntersectionObserver" in window
  ? new IntersectionObserver(entries => {
      for (const e of entries) if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.05 })
  : null;

function observeReveals(root = document) {
  root.querySelectorAll(".reveal:not(.in)").forEach((n, i) => {
    if (!io) return n.classList.add("in");
    n.style.transitionDelay = `${Math.min(i, 6) * 50}ms`;
    io.observe(n);
  });
}

function setupChrome() {
  $("#year").textContent = new Date().getFullYear();

  const header = $(".site-header");
  const onScroll = () => header.classList.toggle("scrolled", window.scrollY > 8);
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // Highlight the nav link for the section in view
  const links = [...document.querySelectorAll(".nav a")];
  const spy = new IntersectionObserver(entries => {
    for (const e of entries) if (e.isIntersecting) {
      links.forEach(a => a.classList.toggle("active", a.getAttribute("href") === `#${e.target.id}`));
    }
  }, { rootMargin: "-45% 0px -50% 0px" });
  document.querySelectorAll("main section[id]").forEach(s => spy.observe(s));

  // Theme: system → opposite of system → back to system
  $("#theme-toggle").addEventListener("click", () => {
    const root = document.documentElement;
    const sysDark = matchMedia("(prefers-color-scheme: dark)").matches;
    const current = root.dataset.theme || (sysDark ? "dark" : "light");
    const next = current === "dark" ? "light" : "dark";
    root.dataset.theme = next;
    try { localStorage.setItem("hmtt-theme", next); } catch (e) {}
  });
}

/* ---------------- Firebase ---------------- */

async function loadFirebase() {
  const [{ initializeApp }, fs, au] = await Promise.all([
    import(`${FB}/firebase-app.js`),
    import(`${FB}/firebase-firestore.js`),
    import(`${FB}/firebase-auth.js`)
  ]);
  const app = initializeApp(firebaseConfig);
  fb = { db: fs.getFirestore(app), auth: au.getAuth(app), fs, au };
}

async function fetchContent() {
  const { db, fs } = fb;
  const read = async name => {
    const snap = await fs.getDocs(fs.query(fs.collection(db, name), fs.orderBy("order")));
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  };
  const [services, jobs] = await Promise.all([read("services"), read("jobs")]);
  state.usingDefaults = services.length === 0 && jobs.length === 0;
  if (services.length) state.services = services;
  if (jobs.length) state.jobs = jobs;
  updateAdminBar();
}

/* ---------------- Admin ---------------- */

function adminActions(col, item, index, total) {
  if (!state.admin) return null;
  return el("div", { class: "admin-actions" },
    el("button", { type: "button", onclick: () => openEditor(col, item) }, "Edit"),
    el("button", { type: "button", disabled: index === 0, "aria-label": "Move up", onclick: () => move(col, index, -1) }, "↑"),
    el("button", { type: "button", disabled: index === total - 1, "aria-label": "Move down", onclick: () => move(col, index, 1) }, "↓"),
    el("button", { type: "button", class: "danger", onclick: () => remove(col, item) }, "Delete")
  );
}

function updateAdminBar() {
  const bar = $("#admin-bar");
  bar.hidden = !state.admin;
  document.body.classList.toggle("is-admin", state.admin);
  $("#seed-btn").hidden = !(state.admin && state.usingDefaults);
  if (state.admin) $("#admin-who").textContent = fb.auth.currentUser?.email || "";
}

function guardDefaults() {
  if (state.usingDefaults) {
    toast("Publish the default content first, then edit it.", true);
    return true;
  }
  return false;
}

async function seed() {
  const { db, fs } = fb;
  const batch = fs.writeBatch(db);
  defaultServices.forEach((s, i) => batch.set(fs.doc(fs.collection(db, "services")), { ...clean("services", s), order: i + 1, updatedAt: fs.serverTimestamp() }));
  defaultJobs.forEach((j, i) => batch.set(fs.doc(fs.collection(db, "jobs")), { ...clean("jobs", j), order: i + 1, updatedAt: fs.serverTimestamp() }));
  await batch.commit();
  await fetchContent();
  renderAll();
  toast("Default content published. You can now edit it.");
}

async function move(col, index, dir) {
  if (guardDefaults()) return;
  const items = [...state[col]].sort(byOrder);
  const a = items[index], b = items[index + dir];
  if (!a || !b) return;
  const { db, fs } = fb;
  const batch = fs.writeBatch(db);
  // Renumber everything so orders stay unique even after deletes
  [items[index], items[index + dir]] = [b, a];
  items.forEach((it, i) => {
    if (it.order !== i + 1) batch.update(fs.doc(db, col, it.id), { order: i + 1 });
    it.order = i + 1;
  });
  try { await batch.commit(); renderAll(); }
  catch (e) { console.error(e); toast("Couldn't reorder — " + e.code, true); }
}

async function remove(col, item) {
  if (guardDefaults()) return;
  const name = item.title || item.client;
  if (!confirm(`Delete "${name}"? This can't be undone.`)) return;
  const { db, fs } = fb;
  try {
    await fs.deleteDoc(fs.doc(db, col, item.id));
    state[col] = state[col].filter(x => x.id !== item.id);
    renderAll();
    toast("Deleted.");
  } catch (e) { console.error(e); toast("Couldn't delete — " + e.code, true); }
}

const SCHEMA = {
  services: [
    { name: "title", label: "Title", required: true, max: 120 },
    { name: "summary", label: "Summary", type: "textarea", max: 800 },
    { name: "tags", label: "Tags", hint: "comma separated", type: "csv" }
  ],
  jobs: [
    { name: "client", label: "Client", required: true, max: 120 },
    { name: "role", label: "Role", required: true, max: 120 },
    { row: [
      { name: "start", label: "Start", hint: "e.g. Oct 2025", required: true, max: 40 },
      { name: "end", label: "End", hint: "blank = Present", max: 40 }
    ]},
    { row: [
      { name: "sector", label: "Sector", type: "select", options: SECTORS },
      { name: "location", label: "Location", max: 80 }
    ]},
    { name: "summary", label: "Summary", type: "textarea", max: 1000 },
    { name: "highlights", label: "Highlights", hint: "one per line", type: "lines" },
    { name: "tech", label: "Technologies", hint: "comma separated", type: "csv" }
  ]
};

const flatFields = col => SCHEMA[col].flatMap(f => f.row || [f]);

function clean(col, src) {
  const out = {};
  for (const f of flatFields(col)) {
    const v = src[f.name];
    if (f.type === "csv" || f.type === "lines") out[f.name] = Array.isArray(v) ? v.map(String) : [];
    else out[f.name] = (v ?? "").toString();
  }
  return out;
}

function fieldEl(f, value) {
  const id = `f-${f.name}`;
  let input;
  if (f.type === "textarea" || f.type === "lines") {
    input = el("textarea", { id, name: f.name, rows: f.type === "lines" ? 4 : 3, maxlength: f.max });
    input.value = Array.isArray(value) ? value.join("\n") : (value ?? "");
  } else if (f.type === "select") {
    input = el("select", { id, name: f.name }, f.options.map(o => el("option", { value: o, selected: o === value }, o)));
  } else {
    input = el("input", { id, name: f.name, type: "text", required: f.required, maxlength: f.max });
    input.value = Array.isArray(value) ? value.join(", ") : (value ?? "");
  }
  return el("div", { class: "field" },
    el("label", { for: id }, f.label, f.hint ? el("span", { class: "hint" }, ` (${f.hint})`) : null),
    input
  );
}

function openEditor(col, item = null) {
  if (item && guardDefaults()) return;
  if (!item && state.usingDefaults) { guardDefaults(); return; }
  const dlg = $("#editor");
  const noun = col === "services" ? "service" : "engagement";
  $("#editor-title").textContent = item ? `Edit ${noun}` : `Add ${noun}`;
  $("#editor-fields").replaceChildren(
    ...SCHEMA[col].map(f => f.row
      ? el("div", { class: "field-row" }, f.row.map(r => fieldEl(r, item?.[r.name])))
      : fieldEl(f, item?.[f.name]))
  );
  dlg.dataset.col = col;
  dlg.dataset.id = item?.id || "";
  dlg.showModal();
}

async function saveEditor() {
  const dlg = $("#editor");
  const col = dlg.dataset.col, id = dlg.dataset.id;
  const form = $("#editor-form");
  const data = {};
  for (const f of flatFields(col)) {
    const raw = form.elements[f.name].value.trim();
    if (f.type === "csv") data[f.name] = raw.split(",").map(s => s.trim()).filter(Boolean);
    else if (f.type === "lines") data[f.name] = raw.split("\n").map(s => s.trim()).filter(Boolean);
    else data[f.name] = raw;
  }
  const { db, fs } = fb;
  const items = state[col];
  if (!id) {
    // New services go to the end; new jobs go to the top (most recent first)
    data.order = col === "jobs"
      ? Math.min(1, ...items.map(x => x.order ?? 0)) - 1
      : Math.max(0, ...items.map(x => x.order ?? 0)) + 1;
  } else {
    data.order = items.find(x => x.id === id)?.order ?? 0;
  }
  data.updatedAt = fs.serverTimestamp();
  try {
    if (id) await fs.setDoc(fs.doc(db, col, id), data);
    else await fs.addDoc(fs.collection(db, col), data);
    await fetchContent();
    renderAll();
    toast("Saved.");
  } catch (e) {
    console.error(e);
    toast("Couldn't save — " + (e.code || e.message), true);
  }
}

const AUTH_HELP = {
  "auth/unauthorized-domain": "This domain isn't authorised. Add it under Authentication → Settings → Authorised domains.",
  "auth/operation-not-allowed": "Google sign-in isn't enabled. Turn it on under Authentication → Sign-in method.",
  "auth/configuration-not-found": "Authentication isn't set up. Open Authentication in the Firebase console and click Get started, then enable Google.",
  "auth/popup-blocked": "The sign-in popup was blocked. Allow popups for this site and try again.",
  "auth/invalid-api-key": "The apiKey in js/firebase-config.js is wrong. Copy the config again from Project settings.",
  "auth/api-key-not-valid.-please-pass-a-valid-api-key.": "The apiKey in js/firebase-config.js is wrong. Copy the config again from Project settings."
};

function setupAdmin() {
  $("#admin-link").addEventListener("click", async () => {
    if (!configured) return toast("Add your Firebase config to js/firebase-config.js to enable editing.", true);
    if (state.admin) return window.scrollTo({ top: 0, behavior: "smooth" });
    if (!fb) {
      // Firebase may still be loading, or may have failed to start
      if (fbError) return toast("Firebase didn't start: " + (fbError.code || fbError.message), true);
      toast("Still connecting — try again in a moment.");
      return;
    }
    const { auth, au } = fb;
    try {
      const provider = new au.GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });
      await au.signInWithPopup(auth, provider);
    } catch (e) {
      console.error("Sign-in failed:", e);
      if (e.code === "auth/popup-closed-by-user" || e.code === "auth/cancelled-popup-request") return;
      toast(AUTH_HELP[e.code] || "Sign-in failed — " + (e.code || e.message), true);
    }
  });

  $("#signout-btn").addEventListener("click", () => fb?.au.signOut(fb.auth));
  $("#seed-btn").addEventListener("click", async e => {
    e.target.disabled = true;
    try { await seed(); } catch (err) { console.error(err); toast("Couldn't publish — " + err.code, true); }
    e.target.disabled = false;
  });
  document.querySelectorAll("[data-add]").forEach(b => b.addEventListener("click", () => openEditor(b.dataset.add)));

  $("#editor-form").addEventListener("submit", e => {
    if (e.submitter?.value === "save") {
      if (!e.target.reportValidity()) { e.preventDefault(); return; }
      saveEditor();
    }
  });

}

function watchAuth() {
  fb.au.onAuthStateChanged(fb.auth, async user => {
    let allowed = false;
    if (user) {
      // Editors are listed in the Firestore `admins` collection by user ID
      try {
        const snap = await fb.fs.getDoc(fb.fs.doc(fb.db, "admins", user.uid));
        allowed = snap.exists();
      } catch (e) {
        console.error("Admin check failed:", e);
      }
    }
    if (user && !allowed) {
      console.info(`Not an editor. To allow this account, add a document with ID ${user.uid} to the "admins" collection in Firestore.`);
      toast(`${user.email} isn't an editor. User ID: ${user.uid}`, true, 15000);
      fb.au.signOut(fb.auth);
    }
    if (allowed && !state.admin) toast("Signed in — edit controls are on.");
    state.admin = allowed;
    updateAdminBar();
    renderAll();
  });
}

/* ---------------- Boot ---------------- */

let fbError = null;

setupChrome();
setupAdmin();          // wire up buttons straight away, before anything slow
renderAll();
observeReveals();

if (configured) {
  try {
    await loadFirebase();
    watchAuth();       // sign-in works even if the content load below fails
  } catch (e) {
    fbError = e;
    console.error("Firebase failed to start:", e);
  }
  if (fb) {
    try {
      await fetchContent();
      renderAll();
    } catch (e) {
      console.warn("Showing built-in content; Firestore unavailable:", e);
      if (/does not exist/i.test(e.message || "")) {
        console.warn("Create the database: Firebase console → Firestore Database → Create database.");
      }
    }
  }
}
