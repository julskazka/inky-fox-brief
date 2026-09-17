(() => {
  'use strict';

  async function hydrate() {
    const img = document.querySelector('[data-b64-src]');
    if (!img) return;
    try {
      const response = await fetch(img.dataset.b64Src, { cache: 'force-cache' });
      if (!response.ok) throw new Error('Asset not found');
      const b64 = (await response.text()).trim();
      img.src = `data:image/webp;base64,${b64}`;
    } catch (_) {
      img.style.display = 'none';
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', hydrate, { once: true });
  } else {
    hydrate();
  }
})();
