import React from 'react';
import { WebComponent, HTMLStory } from './utils/StoryWrapper.js';
import { define } from '../core/dim.js';

// Define three separate components that work together

// Component C - The innermost component
const ComponentC = ({ cValue, bValue, aValue }, { html }) => {
    return html`
        <div style="border: 2px solid blue; padding: 10px; margin: 5px; background: #e3f2fd;">
            <h4>Component C</h4>
            <ul style="margin: 5px 0;">
                <li>C value: ${cValue}</li>
                <li>B value (from parent): ${bValue}</li>
                <li>A value (from grandparent): ${aValue}</li>
            </ul>
        </div>
    `;
};

// Component B - The middle component
const ComponentB = ({ bValue, aValue }, { useScope, html }) => {
    useScope({ 'working-c': ComponentC });
    
    return html`
        <div style="border: 2px solid green; padding: 10px; margin: 5px; background: #e8f5e9;">
            <h3>Component B</h3>
            <p>B value: ${bValue}</p>
            <p>A value (from parent): ${aValue}</p>
            <working-c 
                cValue="Hello from C"
                bValue="${bValue}"
                aValue="${aValue}"
            ></working-c>
        </div>
    `;
};

// Component A - The root component
const ComponentA = ({ aValue }, { useScope, useState, html }) => {
    const [counter, setCounter] = useState(0);
    useScope({ 'working-b': ComponentB });
    
    return html`
        <div style="border: 2px solid red; padding: 10px; margin: 5px; background: #ffebee;">
            <h2>Component A</h2>
            <p>A value: ${aValue}</p>
            <p>Counter: ${counter}</p>
            <button @click="${() => setCounter(counter + 1)}">Increment Counter</button>
            <working-b 
                bValue="Hello from B"
                aValue="${aValue} (counter: ${counter})"
            ></working-b>
        </div>
    `;
};

// Define the components
define({ tag: 'working-a', component: ComponentA });
define({ tag: 'working-b-solo', component: ComponentB });
define({ tag: 'working-c-solo', component: ComponentC });

export default {
    title: 'Example/Working Nesting Pattern',
    parameters: {
        layout: 'centered',
    },
};

export const CompleteNesting = () => {
    return <WebComponent tag="working-a" props={{ aValue: 'Hello from the top!' }} />;
};

export const JustB = () => {
    return <WebComponent 
        tag="working-b-solo"
        props={{
            bValue: 'Direct to B',
            aValue: 'Mock A value'
        }}
    />;
};

export const JustC = () => {
    return <WebComponent 
        tag="working-c-solo"
        props={{
            cValue: 'Direct to C',
            bValue: 'Mock B value',
            aValue: 'Mock A value'
        }}
    />;
};

export const ExplanationDemo = () => {
    return <HTMLStory html={`
        <div style="width: 900px; padding: 20px;">
            <h1>Working Nesting Pattern</h1>
                
                <div style="margin-bottom: 30px;">
                    <h2>How It Works</h2>
                    <ol>
                        <li>Each component is defined separately (can be in separate files)</li>
                        <li>Parent components import and register child components using <code>useScope</code></li>
                        <li>Props are passed using attributes (for primitives) or <code>.props</code> (for objects)</li>
                        <li>State updates in parent components trigger re-renders of children</li>
                    </ol>
                </div>
                
                <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
                    <h3>Live Example</h3>
                    <p>Click the increment button to see how state flows through the component tree:</p>
                    <working-a id="demo-working"></working-a>
                </div>
                
                <div style="background: #f0f0f0; padding: 15px; border-radius: 8px;">
                    <h3>Key Points</h3>
                    <ul>
                        <li>✅ Components are separately defined (not inline)</li>
                        <li>✅ Each component imports its children</li>
                        <li>✅ Props flow down the component tree</li>
                        <li>✅ State changes cause re-renders</li>
                        <li>✅ Works just like React components</li>
                    </ul>
                </div>
            </div>
            <script>
                // Set props after element is created
                setTimeout(() => {
                    const demo = document.getElementById('demo-working');
                    if (demo) {
                        demo.props = { aValue: 'Root Value' };
                    }
                }, 100);
            </script>
    `} />;
};