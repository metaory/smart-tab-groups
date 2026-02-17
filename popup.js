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
	const row = document.createElement('div');
	row.className = 'option';
	const lab = document.createElement('label');
	const switchWrap = document.createElement('span');
	switchWrap.className = 'switch';
	switchWrap.append(
		Object.assign(document.createElement('input'), { type: 'checkbox', id, className: 'toggle' }),
	);
	lab.append(switchWrap, Object.assign(document.createElement('span'), { className: 'short', textContent: shortLabel }));
	row.append(lab);
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
