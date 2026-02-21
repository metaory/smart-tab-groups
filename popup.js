// [iconFile, label] — id = iconFile without .svg
const OPTIONS = [
  ["automatic.svg", "Automatic"],
  ["groupBySubdomain.svg", "Subdomain"],
  ["sortAlphabetically.svg", "Sort A–Z"],
  ["ignorePinnedTabs.svg", "Skip pinned"],
  ["collapseInactive.svg", "Collapse inactive"],
  ["avoidDuplicates.svg", "No duplicates"],
];

// [id, action, iconFile?]
const BUTTONS = [
  ["groupNow", "groupNow"],
  ["ungroupAll", "ungroupAll"],
  ["shortcuts", null, "shortcuts.svg"],
];

const ext = typeof chrome !== "undefined" && chrome.runtime?.id;

const toId = (iconFile) => iconFile.replace(/\.svg$/i, "");

const iconUrl = (name) =>
  `assets/icons/${name.endsWith(".svg") ? name : `${name}.svg`}`;

const getIconFile = (key) =>
  OPTIONS.find(([iconFile]) => toId(iconFile) === key)?.[0] ??
  BUTTONS.find(([id]) => id === key)?.[2];

const injectIcon = (slot, key) => {
  const file = getIconFile(key);
  if (!file) return;
  fetch(iconUrl(file))
    .then((r) => r.text())
    .then((html) => {
      const svg = new DOMParser().parseFromString(
        html,
        "image/svg+xml",
      ).documentElement;
      svg.setAttribute("width", "1em");
      svg.setAttribute("height", "1em");
      svg.setAttribute("aria-hidden", "true");
      slot.replaceChildren(svg);
    });
};

const container = document.getElementById("options");
for (const [iconFile, label] of OPTIONS) {
  const id = toId(iconFile);
  const row = document.createElement("label");
  row.className = "option";
  const iconSlot = document.createElement("span");
  iconSlot.dataset.icon = id;
  const input = Object.assign(document.createElement("input"), {
    type: "checkbox",
    id,
    className: "toggle",
  });
  row.append(
    iconSlot,
    input,
    Object.assign(document.createElement("span"), {
      className: "short",
      textContent: label,
    }),
  );
  container.appendChild(row);
}

const injectAllIcons = () => {
  for (const slot of document.querySelectorAll("[data-icon]"))
    injectIcon(slot, slot.dataset.icon);
};

const OPTION_IDS = OPTIONS.map(([iconFile]) => toId(iconFile));
const DEFAULTS = { automatic: true };

if (ext && chrome.storage.sync) {
  chrome.storage.sync.get(OPTION_IDS, (opts) => {
    for (const [iconFile] of OPTIONS) {
      const id = toId(iconFile);
      const el = document.getElementById(id);
      if (el) el.checked = DEFAULTS[id] === true ? opts[id] !== false : opts[id] === true;
    }
    injectAllIcons();
  });
} else injectAllIcons();

for (const [iconFile] of OPTIONS) {
  const id = toId(iconFile);
  const el = document.getElementById(id);
  el?.addEventListener("change", () => {
    if (!ext) return;
    chrome.storage.sync.set({ [id]: el.checked });
    const automatic = document.getElementById("automatic")?.checked;
    if (automatic) chrome.runtime.sendMessage({ action: "groupNow" });
  });
}

for (const [id, action] of BUTTONS) {
  const el = document.getElementById(id === "shortcuts" ? "shortcutsLink" : id);
  el?.addEventListener("click", (e) => {
    if (id === "shortcuts") {
      e.preventDefault();
      if (ext) {
        const shortcutsUrl = /Firefox/.test(navigator.userAgent) ? "about:addons" : "chrome://extensions/shortcuts";
        chrome.tabs.create({ url: shortcutsUrl });
      }
      return;
    }
    if (ext) chrome.runtime.sendMessage({ action });
  });
}
