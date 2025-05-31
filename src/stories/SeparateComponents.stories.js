import React from 'react';
import { WebComponent, HTMLStory } from './utils/StoryWrapper.js';
import { define } from '../core/dim.js';
import ComponentA from './components/SeparateA.js';
import ComponentB from './components/SeparateB.js';
import ComponentC from './components/SeparateC.js';

// Define only the root component - A will register B, B will register C
define({ tag: 'separate-a', component: ComponentA });

// Also define B and C separately for individual testing
define({ tag: 'separate-b-standalone', component: ComponentB });
define({ tag: 'separate-c-standalone', component: ComponentC });

export default {
    title: 'Example/Separate Components',
    parameters: {
        layout: 'centered',
    },
};

export const NestedABC = () => {
    return <WebComponent 
        tag="separate-a"
        props={{
            message: 'Hello from root!'
        }}
    />;
};

export const StandaloneB = () => {
    return <WebComponent 
        tag="separate-b-standalone"
        props={{
            fromA: 'Direct prop to B',
            aState: 'Mock A State'
        }}
    />;
};

export const StandaloneC = () => {
    return <WebComponent 
        tag="separate-c-standalone"
        props={{
            fromA: 'Direct prop to C',
            aState: 'Mock A State',
            bState: 'Mock B State'
        }}
    />;
};

export const ComparisonDemo = () => {
    return <HTMLStory html={`
        <div style="display: flex; flex-direction: column; gap: 40px; width: 800px;">
            <div>
                <h1>Separate vs Inline Component Definition</h1>
                    <p>This demonstrates the difference between separately defined components and inline definitions</p>
                </div>
                
                <div style="border: 2px solid #ccc; padding: 20px; border-radius: 8px;">
                    <h2>Separately Defined Components (A→B→C)</h2>
                    <p>Each component is in its own file and imports its children:</p>
                    <ul>
                        <li>SeparateA.js imports and uses SeparateB.js</li>
                        <li>SeparateB.js imports and uses SeparateC.js</li>
                        <li>Props flow down through the component tree</li>
                    </ul>
                    <separate-a id="demo-separate"></separate-a>
                </div>
                
                <div style="border: 2px solid #ccc; padding: 20px; border-radius: 8px;">
                    <h2>Code Structure</h2>
                    <pre style="background: #f5f5f5; padding: 10px; overflow: auto;">
// SeparateA.js
import ComponentB from './SeparateB.js';

const ComponentA = (props, { useScope, html }) => {
    useScope({ 'separate-b': ComponentB });
    return html\`<separate-b .props="\${props}"></separate-b>\`;
};

// SeparateB.js  
import ComponentC from './SeparateC.js';

const ComponentB = (props, { useScope, html }) => {
    useScope({ 'separate-c': ComponentC });
    return html\`<separate-c .props="\${props}"></separate-c>\`;
};

// SeparateC.js
const ComponentC = (props, { html }) => {
    return html\`<div>Leaf component</div>\`;
};
                    </pre>
                </div>
            </div>
            <script>
                // Set props after element is created
                setTimeout(() => {
                    const demo = document.getElementById('demo-separate');
                    if (demo) {
                        demo.props = { message: 'Separate Components Demo' };
                    }
                }, 100);
            </script>
    `} />;
};