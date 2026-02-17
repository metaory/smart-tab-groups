const OPTIONS = [
	{ id: 'groupBySubdomain', short: 'Subdomain' },
	{ id: 'sortAlphabetically', short: 'Sort A–Z' },
	{ id: 'ignorePinnedTabs', short: 'Skip pinned' },
	{ id: 'collapseInactive', short: 'Collapse inactive' },
	{ id: 'avoidDuplicates', short: 'No duplicates' },
];

const BUTTONS = [
	{ id: 'groupNow', action: 'groupNow' },
	{ id: 'ungroupAll', action: 'ungroupAll' },
];

const container = document.getElementById('options');
OPTIONS.forEach(({ id, short: shortLabel }) => {
	const row = document.createElement('label');
	row.className = 'option';
	const input = Object.assign(document.createElement('input'), { type: 'checkbox', id, className: 'toggle' });
	row.append(input, Object.assign(document.createElement('span'), { className: 'short', textContent: shortLabel }));
	container.appendChild(row);
});

chrome.storage.sync.get(
	OPTIONS.map((o) => o.id),
	(opts) =>
		OPTIONS.forEach(({ id }) => {
			const el = document.getElementById(id);
			if (el) el.checked = opts[id] === true;
		}),
);

OPTIONS.forEach(({ id }) => {
	const el = document.getElementById(id);
	el?.addEventListener('change', () => {
		chrome.storage.sync.set({ [id]: el.checked });
		chrome.runtime.sendMessage({ action: 'groupNow' });
	});
});

BUTTONS.forEach(({ id, action }) => {
	document
		.getElementById(id)
		?.addEventListener('click', () => chrome.runtime.sendMessage({ action }));
});

document.getElementById('shortcutsLink')?.addEventListener('click', (e) => {
	e.preventDefault();
	chrome.tabs.create({ url: 'chrome://extensions/shortcuts' });
});
