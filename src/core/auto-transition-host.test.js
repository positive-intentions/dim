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
    expect(th._sharedRects).toBeNull();
  });
});
