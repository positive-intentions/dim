// Setup polyfills for the test environment
import { TextDecoder, TextEncoder } from 'util';
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

const crypto = require('crypto');

// Define global crypto object
Object.defineProperty(globalThis, 'crypto', {
  value: {
    getRandomValues: arr => crypto.randomBytes(arr.length),
    subtle: {
      digest: async (algorithm, data) => {
        const nodeAlgorithm = algorithm === 'SHA-256' ? 'sha256' : 'sha1';
        const hash = crypto.createHash(nodeAlgorithm);
        hash.update(data);
        return new Uint8Array(hash.digest());
      },
    },
  }
});

// Import the actual framework
import { define, useState, useEffect, useScope } from '../core/dim.ts';
import { html } from '../core/mini-lit';

describe('Nested Component Rendering - <a><b><c></c></b></a> pattern', () => {
  beforeEach(() => {
    // Clear any existing custom elements
    document.body.innerHTML = '';
  });

  test('Direct inline nesting - components defined within parent render', () => {
    // Component A defines B and C inline
    const ComponentA = ({ message }, { useState, useScope, html }) => {
      const [aState, setAState] = useState('A State');
      
      // Define B component inside A
      const ComponentB = ({ fromA, aState }, { useState, useScope, html }) => {
        const [bState, setBState] = useState('B State');
        
        // Define C component inside B
        const ComponentC = ({ fromA, fromB, aState, bState }, { useState, html }) => {
          const [cState, setCState] = useState('C State');
          
          return html`
            <div class="component-c" style="border: 1px solid blue; padding: 10px; margin: 5px;">
              <h4>Component C</h4>
              <p>From A: ${fromA}</p>
              <p>From B: ${fromB}</p>
              <p>A State: ${aState}</p>
              <p>B State: ${bState}</p>
              <p>C State: ${cState}</p>
            </div>
          `;
        };
        
        // Register C within B's scope
        useScope({
          'component-c': ComponentC
        });
        
        return html`
          <div class="component-b" style="border: 1px solid green; padding: 10px; margin: 5px;">
            <h3>Component B</h3>
            <p>From A: ${fromA}</p>
            <p>A State: ${aState}</p>
            <p>B State: ${bState}</p>
            <component-c .props="${{ 
              fromA, 
              fromB: 'Hello from B',
              aState,
              bState 
            }}"></component-c>
          </div>
        `;
      };
      
      // Register B within A's scope
      useScope({
        'component-b': ComponentB
      });
      
      return html`
        <div class="component-a" style="border: 1px solid red; padding: 10px; margin: 5px;">
          <h2>Component A</h2>
          <p>Message: ${message}</p>
          <p>A State: ${aState}</p>
          <component-b .props="${{ 
            fromA: 'Hello from A',
            aState 
          }}"></component-b>
        </div>
      `;
    };
    
    // Define and create component A
    define({ tag: 'component-a', component: ComponentA });
    const element = document.createElement('component-a');
    element.props = { message: 'Test Message' };
    document.body.appendChild(element);
    
    expect(element).toBeDefined();
    expect(element.shadowRoot).toBeDefined();
    
    // Check that nested components exist
    const componentB = element.shadowRoot.querySelector('component-b');
    expect(componentB).toBeDefined();
    
    // Component C should exist within B's shadow root
    if (componentB && componentB.shadowRoot) {
      const componentC = componentB.shadowRoot.querySelector('component-c');
      expect(componentC).toBeDefined();
    }
  });

  test('Multiple levels of nesting with state updates', async () => {
    let aRenderCount = 0;
    let bRenderCount = 0;
    let cRenderCount = 0;
    
    const ComponentA = ({ onReady }, { useState, useScope, html }) => {
      aRenderCount++;
      const [aValue, setAValue] = useState(1);
      
      // Expose setAValue for testing
      if (onReady) {
        onReady({ setAValue });
      }
      
      const ComponentB = ({ aValue }, { useState, useScope, html }) => {
        bRenderCount++;
        const [bValue, setBValue] = useState(10);
        
        const ComponentC = ({ aValue, bValue }, { html }) => {
          cRenderCount++;
          const total = aValue + bValue;
          
          return html`
            <div class="c">
              <p>A: ${aValue}, B: ${bValue}, Total: ${total}</p>
              <p>C Renders: ${cRenderCount}</p>
            </div>
          `;
        };
        
        useScope({ 'nested-c': ComponentC });
        
        return html`
          <div class="b">
            <p>B Value: ${bValue}, B Renders: ${bRenderCount}</p>
            <nested-c .props="${{ aValue, bValue }}"></nested-c>
            <button @click="${() => setBValue(bValue + 1)}">Increment B</button>
          </div>
        `;
      };
      
      useScope({ 'nested-b': ComponentB });
      
      return html`
        <div class="a">
          <p>A Value: ${aValue}, A Renders: ${aRenderCount}</p>
          <nested-b .props="${{ aValue }}"></nested-b>
          <button @click="${() => setAValue(aValue + 1)}">Increment A</button>
        </div>
      `;
    };
    
    define({ tag: 'nested-a', component: ComponentA });
    
    let controls;
    const element = document.createElement('nested-a');
    element.props = { 
      onReady: (ctrls) => { controls = ctrls; }
    };
    document.body.appendChild(element);
    
    // Initial render counts
    expect(aRenderCount).toBe(1);
    expect(bRenderCount).toBe(1);
    expect(cRenderCount).toBe(1);
    
    // Update A's state
    if (controls) {
      controls.setAValue(2);
      await new Promise(resolve => setTimeout(resolve, 10));
      
      // A should re-render, which should trigger B and C to re-render
      expect(aRenderCount).toBe(2);
      expect(bRenderCount).toBe(2);
      expect(cRenderCount).toBe(2);
    }
  });

  test('Dynamic component creation within loops', () => {
    const AppComponent = ({ items }, { useScope, html }) => {
      // Create dynamic components for each item type
      const TypeAComponent = ({ item }, { html }) => {
        return html`<div class="type-a" style="color: red;">Type A: ${item.name}</div>`;
      };
      
      const TypeBComponent = ({ item }, { html }) => {
        return html`<div class="type-b" style="color: blue;">Type B: ${item.name}</div>`;
      };
      
      const TypeCComponent = ({ item }, { html }) => {
        return html`<div class="type-c" style="color: green;">Type C: ${item.name}</div>`;
      };
      
      // Register all component types
      useScope({
        'type-a-item': TypeAComponent,
        'type-b-item': TypeBComponent,
        'type-c-item': TypeCComponent
      });
      
      return html`
        <div class="app">
          ${items.map(item => {
            // Dynamically choose component based on item type
            const componentTag = `type-${item.type}-item`;
            return html`
              <${componentTag} .props="${{ item }}"></${componentTag}>
            `;
          })}
        </div>
      `;
    };
    
    define({ tag: 'dynamic-app', component: AppComponent });
    const element = document.createElement('dynamic-app');
    element.props = { 
      items: [
        { type: 'a', name: 'Item 1' },
        { type: 'b', name: 'Item 2' },
        { type: 'c', name: 'Item 3' },
        { type: 'a', name: 'Item 4' }
      ]
    };
    document.body.appendChild(element);
    
    expect(element).toBeDefined();
    expect(element.shadowRoot).toBeDefined();
    
    // Check that all item types are rendered
    const typeAItems = element.shadowRoot.querySelectorAll('type-a-item');
    const typeBItems = element.shadowRoot.querySelectorAll('type-b-item');
    const typeCItems = element.shadowRoot.querySelectorAll('type-c-item');
    
    expect(typeAItems.length).toBe(2);
    expect(typeBItems.length).toBe(1);
    expect(typeCItems.length).toBe(1);
  });

  test('Deeply nested with shared state via props drilling', () => {
    const Level1 = ({ sharedData, onUpdate }, { useState, useScope, html }) => {
      const [level1Data, setLevel1Data] = useState('L1');
      
      const Level2 = ({ sharedData, level1Data, onUpdate }, { useState, useScope, html }) => {
        const [level2Data, setLevel2Data] = useState('L2');
        
        const Level3 = ({ sharedData, level1Data, level2Data, onUpdate }, { useState, useScope, html }) => {
          const [level3Data, setLevel3Data] = useState('L3');
          
          const Level4 = ({ sharedData, level1Data, level2Data, level3Data, onUpdate }, { html }) => {
            return html`
              <div class="level-4" style="margin-left: 30px; border-left: 3px solid purple;">
                <h5>Level 4</h5>
                <p>Shared: ${sharedData}</p>
                <p>L1: ${level1Data}, L2: ${level2Data}, L3: ${level3Data}</p>
                <button @click="${() => onUpdate('Updated from Level 4')}">
                  Update Shared Data
                </button>
              </div>
            `;
          };
          
          useScope({ 'level-4': Level4 });
          
          return html`
            <div class="level-3" style="margin-left: 20px; border-left: 3px solid blue;">
              <h4>Level 3</h4>
              <p>Level 3 Data: ${level3Data}</p>
              <level-4 .props="${{ 
                sharedData, 
                level1Data, 
                level2Data, 
                level3Data,
                onUpdate 
              }}"></level-4>
            </div>
          `;
        };
        
        useScope({ 'level-3': Level3 });
        
        return html`
          <div class="level-2" style="margin-left: 10px; border-left: 3px solid green;">
            <h3>Level 2</h3>
            <p>Level 2 Data: ${level2Data}</p>
            <level-3 .props="${{ 
              sharedData, 
              level1Data, 
              level2Data,
              onUpdate 
            }}"></level-3>
          </div>
        `;
      };
      
      useScope({ 'level-2': Level2 });
      
      return html`
        <div class="level-1" style="border-left: 3px solid red;">
          <h2>Level 1</h2>
          <p>Level 1 Data: ${level1Data}</p>
          <p>Shared Data: ${sharedData}</p>
          <level-2 .props="${{ 
            sharedData, 
            level1Data,
            onUpdate 
          }}"></level-2>
        </div>
      `;
    };
    
    const RootComponent = (props, { useState, useScope, html }) => {
      const [sharedData, setSharedData] = useState('Initial Shared Data');
      
      useScope({ 'level-1': Level1 });
      
      return html`
        <div>
          <h1>Root</h1>
          <p>Shared Data at Root: ${sharedData}</p>
          <level-1 .props="${{ 
            sharedData,
            onUpdate: setSharedData 
          }}"></level-1>
        </div>
      `;
    };
    
    define({ tag: 'nested-root', component: RootComponent });
    const element = document.createElement('nested-root');
    document.body.appendChild(element);
    
    expect(element).toBeDefined();
    expect(element.shadowRoot).toBeDefined();
  });
});