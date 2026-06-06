import { define, html, useState, useEffect, useMemo, useRef } from './dim.ts';

// Mount a defined custom element and wait for its first render to complete.
async function mount(tag) {
  const el = document.createElement(tag);
  document.body.appendChild(el);
  await el.updateComplete;
  return el;
}

const text = (el) => el.shadowRoot.textContent.replace(/\s+/g, ' ').trim();

describe('Dim hooks', () => {
  describe('useState', () => {
    let renderCount = 0;

    beforeAll(() => {
      renderCount = 0;
      const Counter = () => {
        renderCount++;
        const [count, setCount] = useState(0);
        return html`
          <button id="inc" @click=${() => setCount(count + 1)}>inc</button>
          <button id="same" @click=${() => setCount(count)}>same</button>
          <span>count:${count}</span>
        `;
      };
      define({ tag: 'us-counter', component: Counter });
    });

    test('renders initial state and updates on setState', async () => {
      const el = await mount('us-counter');
      expect(text(el)).toContain('count:0');

      el.shadowRoot.querySelector('#inc').click();
      await el.updateComplete;
      expect(text(el)).toContain('count:1');
    });

    test('bails out of re-render when value is unchanged (Object.is)', async () => {
      const el = await mount('us-counter');
      await el.updateComplete;
      const before = renderCount;

      // Setting the same value should NOT trigger a re-render.
      el.shadowRoot.querySelector('#same').click();
      await el.updateComplete;

      expect(renderCount).toBe(before);
    });
  });

  describe('useEffect', () => {
    let effectRuns = 0;
    let cleanupRuns = 0;

    beforeAll(() => {
      effectRuns = 0;
      cleanupRuns = 0;
      const EffectComp = () => {
        const [n, setN] = useState(0);
        useEffect(() => {
          effectRuns++;
          return () => {
            cleanupRuns++;
          };
        }, []);
        return html`<button @click=${() => setN(n + 1)}>${n}</button>`;
      };
      define({ tag: 'ue-comp', component: EffectComp });
    });

    test('runs once on mount, not again on re-render, and cleans up once on disconnect', async () => {
      const el = await mount('ue-comp');
      expect(effectRuns).toBe(1);
      expect(cleanupRuns).toBe(0);

      // Force several re-renders; effect has empty deps so must not re-run.
      for (let i = 0; i < 3; i++) {
        el.shadowRoot.querySelector('button').click();
        await el.updateComplete;
      }
      expect(effectRuns).toBe(1);

      // Disconnect: cleanup must run exactly once (regression for the
      // controller-per-render leak that ran cleanup multiple times).
      el.remove();
      expect(cleanupRuns).toBe(1);
    });
  });

  describe('useMemo', () => {
    let memoCalcs = 0;

    beforeAll(() => {
      memoCalcs = 0;
      const MemoComp = () => {
        const [a, setA] = useState(0);
        const [b, setB] = useState(0);
        const doubled = useMemo(() => {
          memoCalcs++;
          return a * 2;
        }, [a]);
        return html`
          <button id="a" @click=${() => setA(a + 1)}>a</button>
          <button id="b" @click=${() => setB(b + 1)}>b</button>
          <span>doubled:${doubled}</span>
        `;
      };
      define({ tag: 'um-comp', component: MemoComp });
    });

    test('recomputes only when its dependency changes', async () => {
      const el = await mount('um-comp');
      expect(memoCalcs).toBe(1);
      expect(text(el)).toContain('doubled:0');

      // Changing an unrelated state must NOT recompute the memo.
      el.shadowRoot.querySelector('#b').click();
      await el.updateComplete;
      expect(memoCalcs).toBe(1);

      // Changing the dependency recomputes.
      el.shadowRoot.querySelector('#a').click();
      await el.updateComplete;
      expect(memoCalcs).toBe(2);
      expect(text(el)).toContain('doubled:2');
    });
  });

  describe('attribute reactivity', () => {
    beforeAll(() => {
      const AttrComp = (props) => html`<span>val:${props.label}</span>`;
      define({ tag: 'attr-comp', component: AttrComp });
    });

    test('re-renders when a plain attribute changes', async () => {
      const el = document.createElement('attr-comp');
      el.setAttribute('label', 'A');
      document.body.appendChild(el);
      await el.updateComplete;
      expect(text(el)).toContain('val:A');

      // Changing a non-reactive attribute must trigger a re-render via the
      // framework MutationObserver (regression for auto view transitions
      // driven by transitionId="${...}").
      el.setAttribute('label', 'B');
      await new Promise((r) => requestAnimationFrame(r));
      await el.updateComplete;
      expect(text(el)).toContain('val:B');

      el.remove();
    });

    test('coalesces multiple attribute changes into one re-render per frame', async () => {
      let renderCount = 0;
      const CountComp = (props) => {
        renderCount++;
        return html`<span>${props.a}-${props.b}</span>`;
      };
      define({ tag: 'attr-batch-comp', component: CountComp });

      const el = document.createElement('attr-batch-comp');
      document.body.appendChild(el);
      await el.updateComplete;
      const afterMount = renderCount;

      el.setAttribute('a', '1');
      el.setAttribute('b', '2');
      await new Promise((r) => requestAnimationFrame(r));
      await el.updateComplete;

      expect(renderCount).toBe(afterMount + 1);
      expect(text(el)).toContain('1-2');
      el.remove();
    });
  });

  describe('useRef', () => {
    beforeAll(() => {
      const RefComp = () => {
        const ref = useRef('initial-value');
        return html`<span>${ref.current}</span>`;
      };
      define({ tag: 'ur-comp', component: RefComp });

      const RefDefaultComp = () => {
        const ref = useRef();
        const label =
          ref.current && ref.current.tagName
            ? ref.current.tagName.toLowerCase()
            : 'none';
        return html`<span>${label}</span>`;
      };
      define({ tag: 'ur-default-comp', component: RefDefaultComp });
    });

    test('stores the provided initial value in current', async () => {
      const el = await mount('ur-comp');
      expect(text(el)).toContain('initial-value');
    });

    test('defaults current to the host element when no initial value is given', async () => {
      const el = await mount('ur-default-comp');
      expect(text(el)).toContain('ur-default-comp');
    });
  });
});
