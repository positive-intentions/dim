import { AutoTransitionHost } from './auto-transition-host.js';
import { html } from './dim.ts';

function makeHost() {
  const host = document.createElement('div');
  const shadow = host.attachShadow({ mode: 'open' });
  return {
    host: {
      shadowRoot: shadow,
      updateComplete: Promise.resolve(),
    },
    shadow,
  };
}

describe('AutoTransitionHost', () => {
  test('wrapRender returns a stable single-layer wrapper when not transitioning', () => {
    const { host } = makeHost();
    const th = new AutoTransitionHost(host);
    const autoTransition = {
      isTransitioning: false,
      getTransitionStyles: () => ({}),
    };
    const tpl = th.wrapRender(autoTransition, html`<span>x</span>`, html);
    expect(tpl).not.toBeNull();
    expect(tpl.strings.join('')).toContain('auto-transition-wrapper');
    expect(tpl.strings.join('')).not.toContain('vt-layer');
  });

  test('onUpdated skips shared FLIP when _sharedRects is empty', () => {
    const { host } = makeHost();
    const th = new AutoTransitionHost(host);
    th._isTransitioningNow = true;
    th._sharedRects = {};
    th._flipPlayed = false;

    const flipSpy = jest.spyOn(th, '_runSharedElementFlip');
    th.onUpdated();
    expect(flipSpy).not.toHaveBeenCalled();
    flipSpy.mockRestore();
  });

  test('cleanupTransitionEffects clears overlay and wrapper resize state', () => {
    const { host, shadow } = makeHost();
    const th = new AutoTransitionHost(host);

    const wrapper = document.createElement('div');
    wrapper.className = 'auto-transition-wrapper vt-resizing';
    wrapper.style.height = '100px';
    const overlayContainer = document.createElement('div');
    overlayContainer.className = 'vt-shared-overlays';
    overlayContainer.innerHTML = '<div class="vt-shared-overlay"></div>';
    wrapper.appendChild(overlayContainer);
    shadow.appendChild(wrapper);

    const hidden = document.createElement('span');
    hidden.className = 'vt-shared-hidden';
    hidden.style.visibility = 'hidden';
    shadow.appendChild(hidden);

    th._sharedOverlayContainer = overlayContainer;
    const cancelFn = jest.fn();
    th._wrapperHeightAnimation = { cancel: cancelFn };
    th._sharedRects = { key: { left: 0, top: 0, width: 1, height: 1 } };

    th.cleanupTransitionEffects();

    expect(cancelFn).toHaveBeenCalled();
    expect(wrapper.classList.contains('vt-resizing')).toBe(false);
    expect(wrapper.style.height).toBe('');
    expect(overlayContainer.innerHTML).toBe('');
    expect(shadow.querySelector('.vt-shared-hidden')).toBeNull();
    expect(hidden.style.visibility).toBe('');
    expect(th._sharedRects).toBeNull();
  });

  test('_applyFlipVisualStyles copies flex layout onto the clone', () => {
    const { host } = makeHost();
    const th = new AutoTransitionHost(host);

    const source = document.createElement('div');
    const clone = document.createElement('div');
    const gcs = window.getComputedStyle;
    window.getComputedStyle = jest.fn(() => ({
      textAlign: 'center',
      boxSizing: 'border-box',
      font: '16px sans-serif',
      lineHeight: 'normal',
      letterSpacing: 'normal',
      padding: '0px',
      border: 'none',
      borderRadius: '12px',
      background: 'rgb(227, 242, 253)',
      boxShadow: 'none',
      color: 'rgb(0, 0, 0)',
      fontSize: '16px',
      fontWeight: '400',
      whiteSpace: 'normal',
      overflow: 'visible',
      textOverflow: 'clip',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      alignContent: 'normal',
      flexDirection: 'row',
      flexWrap: 'nowrap',
      gap: '0px',
      rowGap: '0px',
      columnGap: '0px',
    }));

    try {
      th._applyFlipVisualStyles(source, clone);
      expect(clone.style.display).toBe('flex');
      expect(clone.style.alignItems).toBe('center');
      expect(clone.style.justifyContent).toBe('center');
      expect(clone.style.background).toContain('227');
    } finally {
      window.getComputedStyle = gcs;
    }
  });

  test('_runSharedElementFlip uses uniform height scale for wide-old/narrow-new', () => {
    const { host, shadow } = makeHost();
    const th = new AutoTransitionHost(host);

    const wrapper = document.createElement('div');
    wrapper.className = 'auto-transition-wrapper';
    const incoming = document.createElement('div');
    incoming.className = 'vt-layer vt-incoming';
    const shared = document.createElement('div');
    shared.setAttribute('data-vt-shared', 'name-1');
    shared.textContent = 'Wireless Headphones';
    incoming.appendChild(shared);
    wrapper.appendChild(incoming);
    shadow.appendChild(wrapper);

    // Back-nav case: old detail title is full column width; card name is narrow.
    th._sharedRects = {
      'name-1': { left: 20, top: 200, width: 400, height: 40 },
    };

    const gbcr = Element.prototype.getBoundingClientRect;
    Element.prototype.getBoundingClientRect = jest.fn(function mockGbcr() {
      if (this.classList?.contains('auto-transition-wrapper')) {
        return { left: 0, top: 0, width: 800, height: 600 };
      }
      if (this.hasAttribute?.('data-vt-shared')) {
        return { left: 40, top: 300, width: 160, height: 24 };
      }
      return { left: 0, top: 0, width: 0, height: 0 };
    });

    const gcs = window.getComputedStyle;
    window.getComputedStyle = jest.fn(() => ({
      textAlign: 'left',
      boxSizing: 'border-box',
      font: '16px sans-serif',
      lineHeight: 'normal',
      letterSpacing: 'normal',
      padding: '0px',
      border: 'none',
      borderRadius: '0',
      background: 'transparent',
      boxShadow: 'none',
      color: 'rgb(0, 0, 0)',
      fontSize: '16px',
      fontWeight: '600',
      whiteSpace: 'normal',
      overflow: 'visible',
      textOverflow: 'clip',
      display: 'block',
      alignItems: 'normal',
      justifyContent: 'normal',
      alignContent: 'normal',
      flexDirection: 'row',
      flexWrap: 'nowrap',
      gap: '0px',
      rowGap: '0px',
      columnGap: '0px',
    }));

    const hadAnimate = typeof Element.prototype.animate === 'function';
    if (!hadAnimate) {
      Element.prototype.animate = () => ({});
    }
    const animateSpy = jest
      .spyOn(Element.prototype, 'animate')
      .mockImplementation(() => ({}));

    try {
      th._runSharedElementFlip(500, 'ease');
      const overlay = shadow.querySelector('.vt-shared-overlay');
      expect(overlay).not.toBeNull();
      expect(overlay.style.transformOrigin).toBe('center center');
      // Centers: old (220,220) vs new (120,312) => translate(100, -92).
      // Height ratio 40/24 ≈ 1.666...; must be uniform, not scale(2.5, 1.666).
      expect(overlay.style.transform).toMatch(
        /translate\(100px, -92px\) scale\(1\.666/
      );
      expect(overlay.style.transform).not.toMatch(/scale\([^)]+,/);
      expect(animateSpy).toHaveBeenCalled();
      const end = animateSpy.mock.calls[0][0][1].transform;
      expect(end).toBe('translate(0px, 0px) scale(1)');
    } finally {
      Element.prototype.getBoundingClientRect = gbcr;
      window.getComputedStyle = gcs;
      animateSpy.mockRestore();
      if (!hadAnimate) {
        delete Element.prototype.animate;
      }
    }
  });
});
