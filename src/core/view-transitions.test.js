import { define, html, useState, useViewTransition } from './dim.ts';

// Registers the <view-transitions-gallery> custom element used by the
// regression test below.
import '../stories/components/ViewTransitionsGallery.js';
// Registers <simple-gallery> / <simple-image> for the auto-transition test.
import '../stories/components/SimpleGallery.js';
// Registers <navigation-example> / <page-content> for the pageData test.
import '../stories/components/NavigationExample.js';
import '../stories/components/messaging/MessagingAppDemo.js';
import '../stories/components/shopping/ShoppingAppDemo.js';

async function mount(tag) {
  const el = document.createElement(tag);
  document.body.appendChild(el);
  await el.updateComplete;
  return el;
}

// A small probe component that exposes the view-transition hook state in the
// DOM so tests can assert on lifecycle + helper class output.
const HookProbe = () => {
  const [i, setI] = useState(0);
  const t = useViewTransition(i.toString(), { duration: 500 });
  return html`
    <button id="inc" @click=${() => setI(i + 1)}>inc</button>
    <button id="dec" @click=${() => setI(i - 1)}>dec</button>
    <span id="trans">${t.isTransitioning ? 'yes' : 'no'}</span>
    <span id="dir">${t.direction}</span>
    <span id="prev">${t.previousId == null ? 'null' : t.previousId}</span>
    <span id="incoming">${t.getIncomingClass('layer')}</span>
    <span id="outgoing">${t.getOutgoingClass('layer')}</span>
  `;
};
define({ tag: 'vt-hook-probe', component: HookProbe });

// A minimal child that receives transitionId via the reactive `.props`
// property, exercising the framework auto-transition wrapper in dim.ts.
const AutoChild = (props, { html }) => html`<div class="content">${props.label}</div>`;
define({ tag: 'vt-auto-child', component: AutoChild });

const get = (el, sel) => el.shadowRoot.querySelector(sel);
const txt = (el, sel) => get(el, sel).textContent.trim();

// Attribute-driven re-renders: MutationObserver (microtask) -> requestAnimationFrame.
async function flushMicrotasks() {
  await new Promise((r) => requestAnimationFrame(r));
  await Promise.resolve();
}

async function flushAnimationFrames() {
  await new Promise((r) => requestAnimationFrame(r));
  await new Promise((r) => requestAnimationFrame(r));
  await Promise.resolve();
}

function queryDeep(root, selector) {
  const found = [];
  const visit = (node) => {
    if (!node?.querySelectorAll) return;
    node.querySelectorAll(selector).forEach((el) => found.push(el));
    node.querySelectorAll('*').forEach((el) => {
      if (el.shadowRoot) visit(el.shadowRoot);
    });
  };
  visit(root);
  return found;
}

describe('view transitions', () => {
  beforeEach(() => {
    // Keep real rAF so dim's attribute debounce (MutationObserver -> rAF)
    // flushes under fake timers; only timeout-based transition durations are faked.
    jest.useFakeTimers({ doNotFake: ['requestAnimationFrame'] });
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
    document.body.innerHTML = '';
  });

  describe('useViewTransition lifecycle + direction', () => {
    test('forward change marks transitioning, direction right, previousId is prior id', async () => {
      const el = await mount('vt-hook-probe');
      expect(txt(el, '#trans')).toBe('no');

      get(el, '#inc').click();
      await el.updateComplete;

      expect(txt(el, '#trans')).toBe('yes');
      expect(txt(el, '#dir')).toBe('right');
      expect(txt(el, '#prev')).toBe('0');

      jest.advanceTimersByTime(500);
      await el.updateComplete;
      expect(txt(el, '#trans')).toBe('no');
    });

    test('backward change yields direction left', async () => {
      const el = await mount('vt-hook-probe');

      // Move forward to id 1 and let it settle.
      get(el, '#inc').click();
      await el.updateComplete;
      jest.advanceTimersByTime(500);
      await el.updateComplete;
      expect(txt(el, '#trans')).toBe('no');

      // Now move backward to id 0.
      get(el, '#dec').click();
      await el.updateComplete;
      expect(txt(el, '#trans')).toBe('yes');
      expect(txt(el, '#dir')).toBe('left');
      expect(txt(el, '#prev')).toBe('1');
    });
  });

  describe('layer class helpers', () => {
    test('incoming carries slide-in and never an exit class; outgoing carries opposite slide-out', async () => {
      const el = await mount('vt-hook-probe');
      get(el, '#inc').click();
      await el.updateComplete;

      const incoming = txt(el, '#incoming');
      const outgoing = txt(el, '#outgoing');

      // Incoming slides IN from the right and must NOT use the legacy hiding
      // exit classes ("transition-right" / "transitioning" / "slide-right").
      expect(incoming).toContain('layer');
      expect(incoming).toContain('slide-in-right');
      expect(incoming).not.toContain('transition-right');
      expect(incoming).not.toContain('transitioning');
      expect(incoming).not.toMatch(/(^|\s)slide-right(\s|$)/);

      // Outgoing leaves toward the opposite side.
      expect(outgoing).toContain('layer');
      expect(outgoing).toContain('slide-out-left');
    });

    test('after the transition completes the incoming class is just the base', async () => {
      const el = await mount('vt-hook-probe');
      get(el, '#inc').click();
      await el.updateComplete;
      jest.advanceTimersByTime(500);
      await el.updateComplete;

      expect(txt(el, '#incoming').trim()).toBe('layer');
    });
  });

  describe('ViewTransitionsGallery regression (two-layer slide)', () => {
    // Slides are emoji-in-div: index 0 = mountain, index 1 = ocean wave.
    const EMOJI_0 = '🏔️';
    const EMOJI_1 = '🌊';
    const emojiOf = (layer) => layer.querySelector('.slide-emoji').textContent.trim();

    test('renders two emoji layers during transition; incoming shows the new emoji and is not hidden', async () => {
      const el = await mount('view-transitions-gallery');

      // Initially a single layer (no transition in progress).
      expect(el.shadowRoot.querySelectorAll('.main-image').length).toBe(1);
      expect(emojiOf(get(el, '.main-image'))).toBe(EMOJI_0);

      // Trigger Next -> transition begins.
      get(el, '.next-button').click();
      await el.updateComplete;

      const mains = [...el.shadowRoot.querySelectorAll('.main-image')];
      expect(mains.length).toBe(2);

      const incoming = mains.find((m) => m.className.includes('slide-in'));
      const outgoing = mains.find((m) => m.className.includes('slide-out'));
      expect(incoming).toBeDefined();
      expect(outgoing).toBeDefined();

      // Incoming is the NEW slide, sliding in, never placed in a hidden exit
      // state (this is the exact bug being guarded against).
      expect(emojiOf(incoming)).toBe(EMOJI_1);
      expect(incoming.className).toContain('slide-in-right');
      expect(incoming.className).not.toContain('slide-out');
      expect(incoming.className).not.toContain('transition-right');

      // Outgoing is the OLD slide, sliding away.
      expect(emojiOf(outgoing)).toBe(EMOJI_0);
      expect(outgoing.className).toContain('slide-out-left');
    });

    test('keyed layers: the incoming node is a fresh element, not the reused previous node', async () => {
      const el = await mount('view-transitions-gallery');

      // Capture the original (stable) layer node before transitioning.
      const before = get(el, '.main-image');
      expect(emojiOf(before)).toBe(EMOJI_0);

      get(el, '.next-button').click();
      await el.updateComplete;

      const mains = [...el.shadowRoot.querySelectorAll('.main-image')];
      const incoming = mains.find((m) => m.className.includes('slide-in'));

      // Without keyed, lit would reuse `before` for the incoming slot and just
      // swap its content, leaving an old DOM node mid-animation. Keyed forces a
      // brand-new element for the new slide.
      expect(incoming).not.toBe(before);
      expect(emojiOf(incoming)).toBe(EMOJI_1);
    });

    test('collapses to a single new emoji with no animation classes after the duration', async () => {
      const el = await mount('view-transitions-gallery');

      get(el, '.next-button').click();
      await el.updateComplete;
      expect(el.shadowRoot.querySelectorAll('.main-image').length).toBe(2);

      // Advance only by the transition duration so the 4000ms autoplay never
      // fires and disturbs the assertion.
      jest.advanceTimersByTime(500);
      await el.updateComplete;

      const mains = [...el.shadowRoot.querySelectorAll('.main-image')];
      expect(mains.length).toBe(1);
      expect(emojiOf(mains[0])).toBe(EMOJI_1);
      expect(mains[0].className.trim()).toBe('main-image');
    });
  });

  describe('framework auto-transition wrapper', () => {
    test('renders two layers during a props-driven transition and collapses to one after', async () => {
      const child = document.createElement('vt-auto-child');
      child.props = { transitionId: 0, label: 'L0' };
      document.body.appendChild(child);
      await child.updateComplete;

      // Stable render: single layer.
      expect(child.shadowRoot.querySelectorAll('.vt-layer').length).toBe(0);
      expect(child.shadowRoot.querySelectorAll('.view-transition-item').length).toBe(1);
      expect(child.shadowRoot.textContent).toContain('L0');

      // Capture the stable content node so we can prove keyed gives the
      // incoming layer a fresh element rather than reusing the old content.
      const stableContent = child.shadowRoot.querySelector('.view-transition-item .content');
      expect(stableContent).not.toBeNull();

      // Change transitionId -> two layers (previous slides out, current in).
      child.props = { transitionId: 1, label: 'L1' };
      await child.updateComplete;

      const layers = [...child.shadowRoot.querySelectorAll('.vt-layer')];
      expect(layers.length).toBe(2);
      const outgoing = layers.find((l) => l.className.includes('slide-out'));
      const incoming = layers.find((l) => l.className.includes('slide-in'));
      expect(outgoing).toBeDefined();
      expect(incoming).toBeDefined();
      expect(outgoing.textContent).toContain('L0');
      expect(incoming.textContent).toContain('L1');

      // The incoming layer must stay in normal flow (vt-incoming -> position:
      // relative) so the wrapper keeps a real height during the slide; the
      // outgoing layer remains the absolute overlay. Without this the wrapper
      // collapses to zero height and the animation is invisible.
      expect(incoming.className).toContain('vt-incoming');
      expect(outgoing.className).not.toContain('vt-incoming');

      // Keyed identity: the incoming layer's content is a new node.
      const incomingContent = incoming.querySelector('.content');
      expect(incomingContent).not.toBe(stableContent);

      // After the duration, collapse back to a single layer showing the new content.
      jest.advanceTimersByTime(500);
      await child.updateComplete;
      expect(child.shadowRoot.querySelectorAll('.vt-layer').length).toBe(0);
      expect(child.shadowRoot.querySelectorAll('.view-transition-item').length).toBe(1);
      expect(child.shadowRoot.textContent).toContain('L1');
      expect(child.shadowRoot.textContent).not.toContain('L0');
    });

    test('does not create shared overlays when no data-vt-shared elements', async () => {
      const child = document.createElement('vt-auto-child');
      child.props = { transitionId: 0, label: 'L0' };
      document.body.appendChild(child);
      await child.updateComplete;

      child.props = { transitionId: 1, label: 'L1' };
      await child.updateComplete;

      expect(child.shadowRoot.querySelectorAll('.vt-layer').length).toBe(2);
      expect(child.shadowRoot.querySelector('.vt-shared-overlays')).toBeNull();
    });
  });

  describe('SimpleGallery automatic transitions (plain transitionId attribute)', () => {
    test('changing the index transitions the simple-image via attribute reactivity', async () => {
      const gallery = await mount('simple-gallery');
      const simpleImage = gallery.shadowRoot.querySelector('simple-image');
      expect(simpleImage).not.toBeNull();
      await simpleImage.updateComplete;

      // Initially a single (stable) layer showing the first slide.
      expect(simpleImage.shadowRoot.querySelectorAll('.vt-layer').length).toBe(0);
      expect(simpleImage.shadowRoot.textContent).toContain('🏔️');

      // Click "Next" -> parent re-renders -> simple-image's transitionId/emoji
      // attributes change -> MutationObserver triggers a re-render -> transition.
      const controls = [...gallery.shadowRoot.querySelectorAll('.control-button')];
      const nextBtn = controls[controls.length - 1];
      nextBtn.click();
      await gallery.updateComplete;
      // The attribute MutationObserver is delivered on a microtask, which Jest's
      // fake timers queue; drain microtasks + pending updates so the child's
      // attribute-driven re-render (and transition start) flushes.
      await flushMicrotasks();
      await simpleImage.updateComplete;

      const layers = [...simpleImage.shadowRoot.querySelectorAll('.vt-layer')];
      expect(layers.length).toBe(2);
      const incoming = layers.find((l) => l.className.includes('slide-in'));
      const outgoing = layers.find((l) => l.className.includes('slide-out'));
      expect(incoming).toBeDefined();
      expect(outgoing).toBeDefined();
      expect(incoming.textContent).toContain('🌊');
      expect(outgoing.textContent).toContain('🏔️');

      // After the 500ms duration, collapse to a single layer showing the new slide.
      jest.advanceTimersByTime(500);
      await simpleImage.updateComplete;
      expect(simpleImage.shadowRoot.querySelectorAll('.vt-layer').length).toBe(0);
      expect(simpleImage.shadowRoot.textContent).toContain('🌊');
    });
  });

  describe('PageContent object attribute (no double JSON.parse)', () => {
    test('renders content from a pageData attribute without throwing', async () => {
      const el = document.createElement('page-content');
      el.setAttribute(
        'pageData',
        JSON.stringify({
          color: '#ffffff',
          content: { heading: 'H', description: 'D', features: ['F1', 'F2'] },
        })
      );
      document.body.appendChild(el);

      // Regression: dim auto-parses the {..} attribute into an object, so
      // PageContent must NOT call JSON.parse on it again ("[object Object]"
      // is not valid JSON).
      await expect(el.updateComplete).resolves.not.toThrow();

      const txtContent = el.shadowRoot.textContent;
      expect(txtContent).toContain('H');
      expect(txtContent).toContain('D');
      expect(txtContent).toContain('F1');
      expect(txtContent).toContain('F2');

      // PageContent now styles itself (parent styles can't cross the shadow
      // boundary). Its own stylesheet must include a min-height so the content
      // has a real size to slide during the view transition.
      const styleText = [...el.shadowRoot.querySelectorAll('style')]
        .map((s) => s.textContent)
        .join('\n');
      expect(styleText).toContain('.page-heading');
      expect(styleText).toContain('min-height');
    });

    test('updates when the pageData attribute changes', async () => {
      const el = document.createElement('page-content');
      el.setAttribute(
        'pageData',
        JSON.stringify({ color: '#fff', content: { heading: 'First', description: 'd', features: [] } })
      );
      document.body.appendChild(el);
      await el.updateComplete;
      expect(el.shadowRoot.textContent).toContain('First');

      el.setAttribute(
        'pageData',
        JSON.stringify({ color: '#fff', content: { heading: 'Second', description: 'd', features: [] } })
      );
      await flushMicrotasks();
      await el.updateComplete;
      expect(el.shadowRoot.textContent).toContain('Second');
    });
  });

  describe('NavigationExample slide direction follows tab order', () => {
    // Tabs render in pageOrder: home(0), about(1), services(2), portfolio(3),
    // contact(4). Direction must come from tab position, not the page name.
    const incomingLayer = (pageContent) =>
      [...pageContent.shadowRoot.querySelectorAll('.vt-layer')].find((l) =>
        l.className.includes('slide-in')
      );

    test('selecting a later tab slides in from the right; an earlier tab slides in from the left', async () => {
      const app = await mount('navigation-example');
      const pageContent = app.shadowRoot.querySelector('page-content');
      expect(pageContent).not.toBeNull();
      await pageContent.updateComplete;

      // Home (index 0): stable, id reflects the tab index, not the name.
      expect(pageContent.getAttribute('transitionId')).toBe('0');
      expect(pageContent.shadowRoot.querySelectorAll('.vt-layer').length).toBe(0);

      const navItems = [...app.shadowRoot.querySelectorAll('.nav-item')];

      // Forward: home(0) -> services(2) should slide IN from the right.
      navItems[2].click();
      await app.updateComplete;
      await flushMicrotasks();
      await pageContent.updateComplete;

      let incoming = incomingLayer(pageContent);
      expect(incoming).toBeDefined();
      expect(incoming.className).toContain('slide-in-right');
      expect(incoming.className).not.toContain('slide-in-left');

      // Let the transition settle (600ms duration, well under the 6s autoplay).
      jest.advanceTimersByTime(600);
      await pageContent.updateComplete;
      expect(pageContent.shadowRoot.querySelectorAll('.vt-layer').length).toBe(0);

      // Backward: services(2) -> home(0) should slide IN from the left.
      navItems[0].click();
      await app.updateComplete;
      await flushMicrotasks();
      await pageContent.updateComplete;

      incoming = incomingLayer(pageContent);
      expect(incoming).toBeDefined();
      expect(incoming.className).toContain('slide-in-left');
      expect(incoming.className).not.toContain('slide-in-right');
    });
  });

  describe('shared-element (FLIP) transition', () => {
    // jsdom has no layout (getBoundingClientRect is 0) and no Web Animations
    // API, so these assertions are structural: the overlay clone is created,
    // the in-layer copies are hidden, and everything is torn down afterward.
    test('lifts the shared item into an overlay during the slide and cleans up after', async () => {
      const app = await mount('navigation-example');
      const pageContent = app.shadowRoot.querySelector('page-content');
      await pageContent.updateComplete;

      // Home renders the shared card.
      expect(
        pageContent.shadowRoot.querySelector('[data-vt-shared="shared-feature"]')
      ).not.toBeNull();
      // No overlay while stable.
      expect(
        pageContent.shadowRoot.querySelector('.vt-shared-overlay')
      ).toBeNull();

      // Switch to a different tab to trigger the transition.
      const navItems = [...app.shadowRoot.querySelectorAll('.nav-item')];
      navItems[2].click();
      await app.updateComplete;
      await flushMicrotasks();
      await pageContent.updateComplete;

      // During the transition there are two page layers...
      expect(pageContent.shadowRoot.querySelectorAll('.vt-layer').length).toBe(2);

      // ...and the shared element is lifted into an overlay clone.
      const wrapper = pageContent.shadowRoot.querySelector(
        '.auto-transition-wrapper'
      );
      const overlaysContainer = pageContent.shadowRoot.querySelector(
        '.vt-shared-overlays'
      );
      expect(overlaysContainer).not.toBeNull();
      expect(wrapper.contains(overlaysContainer)).toBe(true);
      // Overlay must not be a direct child of the shadow root (P0: tracks wrapper height).
      expect(
        [...pageContent.shadowRoot.children].some(
          (n) => n.classList?.contains('vt-shared-overlays')
        )
      ).toBe(false);

      const overlay = pageContent.shadowRoot.querySelector(
        '.vt-shared-overlays .vt-shared-overlay[data-vt-shared="shared-feature"]'
      );
      expect(overlay).not.toBeNull();

      // The in-layer copies are hidden so only the overlay travels.
      const hiddenIncoming = pageContent.shadowRoot.querySelector(
        '.vt-layer.vt-incoming [data-vt-shared="shared-feature"].vt-shared-hidden'
      );
      expect(hiddenIncoming).not.toBeNull();

      // After the 600ms duration, the transition settles and the overlay +
      // hidden markers are torn down.
      jest.advanceTimersByTime(600);
      await flushMicrotasks();
      await pageContent.updateComplete;

      expect(pageContent.shadowRoot.querySelectorAll('.vt-layer').length).toBe(0);
      expect(
        pageContent.shadowRoot.querySelector('.vt-shared-overlay')
      ).toBeNull();
      expect(
        pageContent.shadowRoot.querySelector('.vt-shared-hidden')
      ).toBeNull();
      // The settled page still shows the shared card in its new position.
      expect(
        pageContent.shadowRoot.querySelector('[data-vt-shared="shared-feature"]')
      ).not.toBeNull();
    });

    test('FLIP animation includes scale when old and new rects differ', async () => {
      const rectMocks = {
        wrapper: { left: 0, top: 0, width: 800, height: 600, right: 800, bottom: 600 },
        stable: { left: 10, top: 20, width: 200, height: 80, right: 210, bottom: 100 },
        incoming: { left: 50, top: 120, width: 300, height: 100, right: 350, bottom: 220 },
      };

      const gbcr = Element.prototype.getBoundingClientRect;
      Element.prototype.getBoundingClientRect = jest.fn(function mockGbcr() {
        if (this.classList?.contains('auto-transition-wrapper')) {
          return rectMocks.wrapper;
        }
        if (this.hasAttribute?.('data-vt-shared')) {
          return this.closest('.vt-incoming')
            ? rectMocks.incoming
            : rectMocks.stable;
        }
        return { left: 0, top: 0, width: 0, height: 0, right: 0, bottom: 0 };
      });

      const gcs = window.getComputedStyle;
      window.getComputedStyle = jest.fn(() => ({
        textAlign: 'center',
        boxSizing: 'border-box',
        font: '16px sans-serif',
        lineHeight: 'normal',
        letterSpacing: 'normal',
        padding: '24px',
        border: 'none',
        borderRadius: '12px',
        background: 'white',
        boxShadow: 'none',
        color: 'rgb(0, 0, 0)',
      }));

      const hadAnimate = typeof Element.prototype.animate === 'function';
      if (!hadAnimate) {
        Element.prototype.animate = () => ({});
      }
      const animateSpy = jest
        .spyOn(Element.prototype, 'animate')
        .mockImplementation(() => ({}));

      try {
        const app = await mount('navigation-example');
        const pageContent = app.shadowRoot.querySelector('page-content');
        await pageContent.updateComplete;

        const navItems = [...app.shadowRoot.querySelectorAll('.nav-item')];
        navItems[2].click();
        await app.updateComplete;
        await flushMicrotasks();
        await pageContent.updateComplete;

        const overlay = pageContent.shadowRoot.querySelector('.vt-shared-overlay');
        expect(overlay).not.toBeNull();
        // Invert step: transform must be on the element before WAAPI runs so
        // the first paint does not flash at the new size.
        expect(overlay.style.transform).toContain('scale(');
        expect(overlay.style.transform).toContain('translate(');
        expect(overlay.style.textAlign).toBe('center');
        expect(overlay.style.transformOrigin).toBe('top left');

        expect(animateSpy).toHaveBeenCalled();
        const keyframes = animateSpy.mock.calls[0][0];
        const options = animateSpy.mock.calls[0][1];
        expect(keyframes[0].transform).toBe(overlay.style.transform);
        expect(keyframes[0].transform).toContain('scale(');
        expect(keyframes[0].transform).toContain('translate(');
        expect(keyframes[1].transform).toBe('translate(0px, 0px) scale(1, 1)');
        expect(options.fill).toBe('both');
      } finally {
        Element.prototype.getBoundingClientRect = gbcr;
        window.getComputedStyle = gcs;
        animateSpy.mockRestore();
        if (!hadAnimate) {
          delete Element.prototype.animate;
        }
      }
    });

    test('animates wrapper height from old to new during transition', async () => {
      const OLD_H = 400;
      const NEW_H = 600;
      const offsetHeightDesc =
        Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'offsetHeight') ||
        Object.getOwnPropertyDescriptor(Element.prototype, 'offsetHeight');

      Object.defineProperty(HTMLElement.prototype, 'offsetHeight', {
        configurable: true,
        get() {
          if (
            this.classList?.contains('vt-layer') &&
            this.classList.contains('vt-incoming')
          ) {
            return NEW_H;
          }
          if (this.classList?.contains('auto-transition-wrapper')) {
            return OLD_H;
          }
          return 0;
        },
      });

      const hadAnimate = typeof Element.prototype.animate === 'function';
      if (!hadAnimate) {
        Element.prototype.animate = () => ({});
      }
      const animateSpy = jest
        .spyOn(Element.prototype, 'animate')
        .mockImplementation(() => ({}));

      try {
        const app = await mount('navigation-example');
        const pageContent = app.shadowRoot.querySelector('page-content');
        await pageContent.updateComplete;

        const navItems = [...app.shadowRoot.querySelectorAll('.nav-item')];
        navItems[2].click();
        await app.updateComplete;
        await flushMicrotasks();
        await pageContent.updateComplete;

        const wrapper = pageContent.shadowRoot.querySelector(
          '.auto-transition-wrapper'
        );
        expect(wrapper).not.toBeNull();
        expect(wrapper.classList.contains('vt-resizing')).toBe(true);
        expect(wrapper.style.height).toBe(`${OLD_H}px`);

        const heightCall = animateSpy.mock.calls.find(
          (call) => call[0]?.[0]?.height !== undefined
        );
        expect(heightCall).toBeDefined();
        expect(heightCall[0][0].height).toBe(`${OLD_H}px`);
        expect(heightCall[0][1].height).toBe(`${NEW_H}px`);
        expect(heightCall[1].fill).toBe('both');

        jest.advanceTimersByTime(600);
        await flushMicrotasks();
        await pageContent.updateComplete;

        expect(wrapper.classList.contains('vt-resizing')).toBe(false);
        expect(wrapper.style.height).toBe('');
      } finally {
        if (offsetHeightDesc) {
          Object.defineProperty(
            HTMLElement.prototype,
            'offsetHeight',
            offsetHeightDesc
          );
        }
        animateSpy.mockRestore();
        if (!hadAnimate) {
          delete Element.prototype.animate;
        }
      }
    });
  });

  describe('shopping app multi-shared FLIP', () => {
    test('catalog to product detail lifts image, name, and price overlays', async () => {
      const rectMocks = {
        wrapper: { left: 0, top: 0, width: 800, height: 600 },
        cardImage: { left: 40, top: 140, width: 80, height: 80 },
        heroImage: { left: 120, top: 80, width: 320, height: 240 },
        cardName: { left: 40, top: 230, width: 160, height: 22 },
        heroName: { left: 120, top: 340, width: 200, height: 28 },
        cardPrice: { left: 40, top: 280, width: 80, height: 24 },
        heroPrice: { left: 120, top: 400, width: 100, height: 32 },
      };

      const gbcr = Element.prototype.getBoundingClientRect;
      Element.prototype.getBoundingClientRect = jest.fn(function mockGbcr() {
        if (this.classList?.contains('auto-transition-wrapper')) {
          return rectMocks.wrapper;
        }
        const key = this.getAttribute?.('data-vt-shared') || '';
        if (key.startsWith('image-')) {
          return this.classList?.contains('hero')
            ? rectMocks.heroImage
            : rectMocks.cardImage;
        }
        if (key.startsWith('name-')) {
          return this.classList?.contains('detail-name')
            ? rectMocks.heroName
            : rectMocks.cardName;
        }
        if (key.startsWith('price-')) {
          return this.classList?.contains('detail-price')
            ? rectMocks.heroPrice
            : rectMocks.cardPrice;
        }
        return { left: 0, top: 0, width: 0, height: 0 };
      });

      const hadAnimate = typeof Element.prototype.animate === 'function';
      if (!hadAnimate) {
        Element.prototype.animate = () => ({});
      }

      try {
        const app = await mount('shopping-app-demo');
        const navView = app.shadowRoot.querySelector('shopping-navigation-view');
        await navView.updateComplete;

        const priorProps = navView.props || {};
        navView.setAttribute('transitionId', '202');
        navView.props = {
          ...priorProps,
          navStack: ['catalog', 'product:2'],
        };
        await navView.updateComplete;
        await flushMicrotasks();
        await flushAnimationFrames();
        await flushAnimationFrames();

        expect(queryDeep(navView.shadowRoot, '.vt-layer').length).toBe(2);

        const overlays = queryDeep(navView.shadowRoot, '.vt-shared-overlay');
        expect(overlays.length).toBeGreaterThanOrEqual(3);
      } finally {
        Element.prototype.getBoundingClientRect = gbcr;
        if (!hadAnimate) {
          delete Element.prototype.animate;
        }
      }
    });
  });

  describe('messaging app multi-shared FLIP', () => {
    test('list to chat lifts avatar, name, and lastMessage overlays', async () => {
      const rectMocks = {
        wrapper: { left: 0, top: 0, width: 800, height: 600 },
        listAvatar: { left: 24, top: 120, width: 40, height: 40 },
        headerAvatar: { left: 56, top: 12, width: 32, height: 32 },
        listName: { left: 80, top: 118, width: 140, height: 20 },
        headerName: { left: 96, top: 10, width: 120, height: 22 },
        listPreview: { left: 80, top: 142, width: 220, height: 18 },
        listBubble: { left: 80, top: 400, width: 260, height: 48 },
      };

      const gbcr = Element.prototype.getBoundingClientRect;
      Element.prototype.getBoundingClientRect = jest.fn(function mockGbcr() {
        if (this.classList?.contains('auto-transition-wrapper')) {
          return rectMocks.wrapper;
        }
        const key = this.getAttribute?.('data-vt-shared') || '';
        if (key.startsWith('avatar-')) {
          return this.closest?.('.chat-header')
            ? rectMocks.headerAvatar
            : rectMocks.listAvatar;
        }
        if (key.startsWith('name-')) {
          return this.closest?.('.chat-header')
            ? rectMocks.headerName
            : rectMocks.listName;
        }
        if (key.startsWith('lastMessage-')) {
          return this.classList?.contains('bubble')
            ? rectMocks.listBubble
            : rectMocks.listPreview;
        }
        return { left: 0, top: 0, width: 0, height: 0 };
      });

      const hadAnimate = typeof Element.prototype.animate === 'function';
      if (!hadAnimate) {
        Element.prototype.animate = () => ({});
      }

      try {
        const app = await mount('messaging-app-demo');
        const navView = app.shadowRoot.querySelector('navigation-view');
        await navView.updateComplete;

        const priorProps = navView.props || {};
        navView.setAttribute('transitionId', '202');
        navView.props = {
          ...priorProps,
          navStack: ['list', 'chat:2'],
        };
        await navView.updateComplete;
        await flushMicrotasks();
        await flushAnimationFrames();
        await flushAnimationFrames();

        expect(queryDeep(navView.shadowRoot, '.vt-layer').length).toBe(2);

        const overlays = queryDeep(navView.shadowRoot, '.vt-shared-overlay');
        expect(overlays.length).toBeGreaterThanOrEqual(3);
      } finally {
        Element.prototype.getBoundingClientRect = gbcr;
        if (!hadAnimate) {
          delete Element.prototype.animate;
        }
      }
    });
  });
});
