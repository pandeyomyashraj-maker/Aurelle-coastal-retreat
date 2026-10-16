// Paste this in DevTools Console after a hard reload to identify the LCP element.
new PerformanceObserver((list) => {
  const entries = list.getEntries();
  const latest = entries[entries.length - 1];
  if (!latest) return;
  console.table({
    element: latest.element?.tagName + (latest.element?.id ? `#${latest.element.id}` : '') + (latest.element?.className ? `.${String(latest.element.className).replace(/\s+/g, '.')}` : ''),
    url: latest.url || '(text / background)',
    renderTime: `${Math.round(latest.renderTime)} ms`,
    loadTime: `${Math.round(latest.loadTime)} ms`,
    size: `${latest.size} px`
  });
}).observe({ type: 'largest-contentful-paint', buffered: true });

// List every image and its decoded/rendered size.
console.table([...document.images].map((image) => ({
  src: image.currentSrc || image.src,
  loading: image.loading,
  fetchPriority: image.fetchPriority,
  natural: `${image.naturalWidth}×${image.naturalHeight}`,
  rendered: `${Math.round(image.getBoundingClientRect().width)}×${Math.round(image.getBoundingClientRect().height)}`
})));
