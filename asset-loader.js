(() => {
  'use strict';

  async function hydrateImage(img) {
    try {
      const response = await fetch(img.dataset.b64Src, { cache: 'no-cache' });
      if (!response.ok) throw new Error('Asset not found');
      const b64 = (await response.text()).trim();
      const mime = img.dataset.b64Type || 'image/webp';
      img.src = `data:${mime};base64,${b64}`;
    } catch (_) {
      img.style.display = 'none';
    }
  }

  async function hydrate() {
    const images = [...document.querySelectorAll('[data-b64-src]')];
    await Promise.all(images.map(hydrateImage));
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', hydrate, { once: true });
  } else {
    hydrate();
  }
})();
