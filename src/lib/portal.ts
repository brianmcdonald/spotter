/**
 * Moves an element to <body>, so position: fixed is relative to the viewport
 * even inside a transformed parent (the detail sheet is transformed on desktop).
 */
export function portal(node: HTMLElement) {
  document.body.appendChild(node);
  return { destroy: () => node.remove() };
}
