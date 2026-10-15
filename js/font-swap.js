/* Swaps the Google Fonts <link> from media="print" to media="all" once loaded.
   Pulled into its own tiny external file (instead of an inline onload="")
   so the site can run under a strict Content-Security-Policy with no
   'unsafe-inline' in script-src. Safe to delete along with the <script> tag
   and the <noscript> fallback already covers no-JS visitors. */
(() => {
  const link = document.getElementById('gfonts-link');
  if (!link) return;
  if (link.sheet) { link.media = 'all'; return; }
  link.addEventListener('load', () => { link.media = 'all'; }, { once: true });
})();

