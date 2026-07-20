const PATHS = {
  IconHome: '<path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/><path d="M9.5 21v-6h5v6"/>',
  IconSearch: '<circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/>',
  IconMessage: '<path d="M3 5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H9l-5 4Z"/>',
  IconComment: '<rect x="3" y="5" width="18" height="12" rx="2"/><circle cx="8" cy="11" r="1"/><circle cx="12" cy="11" r="1"/><circle cx="16" cy="11" r="1"/>',
  IconHeart: '<path d="M12 20.5c-5-3.5-9-6.9-9-11A5 5 0 0 1 12 6a5 5 0 0 1 9 3.5c0 4.1-4 7.5-9 11Z"/>',
  IconAdd: '<circle cx="12" cy="12" r="9"/><path d="M12 8v8"/><path d="M8 12h8"/>',
  IconClose: '<path d="m6 6 12 12"/><path d="m18 6-12 12"/>',
  IconMore: '<circle cx="5" cy="12" r="1.4"/><circle cx="12" cy="12" r="1.4"/><circle cx="19" cy="12" r="1.4"/>',
  IconVerified: '<circle cx="12" cy="12" r="9"/><path d="m8 12.3 2.6 2.6L16 9.5"/>',
  Lock: '<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
  Fire: '<path d="M12 2c1 4-3 5-3 9a3 3 0 0 0 6 0c0-2-1-3-1-3s2 1 2 4a5 5 0 0 1-10 0c0-5 4-6 6-10Z"/>',
  Coin: '<circle cx="12" cy="12" r="9"/><path d="M12 7.5v9"/><path d="M9.5 9.6c0-1.1 1.1-1.9 2.5-1.9s2.5.8 2.5 1.9-1.1 1.6-2.5 1.9c-1.4.3-2.5.8-2.5 1.9s1.1 1.9 2.5 1.9 2.5-.8 2.5-1.9"/>',
  Bolt: '<path d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z"/>',
  Copy: '<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M15 4H5a2 2 0 0 0-2 2v10"/>',
  Delete: '<path d="M4 7h16"/><path d="M9 7V4h6v3"/><path d="M6.5 7 7.4 20a2 2 0 0 0 2 1.9h5.2a2 2 0 0 0 2-1.9L17.5 7"/><path d="M10 11v6"/><path d="M14 11v6"/>',
  ArrowBack: '<path d="M19 12H5"/><path d="m11 18-6-6 6-6"/>',
  Accessibility: '<circle cx="12" cy="4.5" r="2"/><path d="M4.5 9h15"/><path d="M12 9v6"/><path d="M8 21l4-6 4 6"/>',
  Settings: '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1"/>'
};

export const ICON_NAMES = Object.keys(PATHS);

export function iconSvg(name, size = 22) {
  const inner = PATHS[name];
  if (!inner) return "";
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${inner}</svg>`;
}
