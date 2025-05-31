import ComponentC from './SeparateC.js';

// Extra component to render inside C
const InnerComponent = ({ message, count }, { useState, html }) => {
    const [innerState, setInnerState] = useState(0);
    
    return html`
        <div style="background: #fffacd; padding: 8px; margin: 8px; border: 1px dashed #f0e68c;">
            <h5>Inner Component</h5>
            <p>Message from parent: ${message}</p>
            <p>Count from parent: ${count}</p>
            <p>Inner state: ${innerState}</p>
            <button @click="${() => setInnerState(innerState + 1)}">
                Increment Inner (${innerState})
            </button>
        </div>
    `;
};

// Component B - Middle component that renders C with nested content
const ComponentBWithNesting = ({ fromA, aState }, { useScope, useState, html }) => {
    const [bState, setBState] = useState('State B');
    const [itemCount, setItemCount] = useState(3);
    
    // Register both Component C and the inner component
    useScope({ 
        'separate-c': ComponentC,
        'inner-component': InnerComponent
    });
    
    return html`
        <div style="border: 3px solid green; padding: 15px; margin: 10px;">
            <h3>Component B (With Nesting)</h3>
            <p>From A: ${fromA}</p>
            <p>A State: ${aState}</p>
            <p>B State: ${bState}</p>
            <p>Item Count: ${itemCount}</p>
            
            <div style="margin: 10px 0;">
                <button @click="${() => setBState('B Updated: ' + Date.now())}">
                    Update B State
                </button>
                <button @click="${() => setItemCount(itemCount + 1)}">
                    Add Item (${itemCount})
                </button>
            </div>
            
            <!-- Render C as a child with nested components inside -->
            <separate-c .props="${{ fromA, aState, bState }}">
                <!-- These components will be rendered inside separate-c -->
                <div style="background: #f0f8ff; padding: 12px; margin: 8px;">
                    <h4>Content inside C</h4>
                    <p>This content is passed as children to Component C</p>
                    
                    <!-- Render multiple inner components -->
                    ${Array.from({ length: itemCount }, (_, i) => html`
                        <inner-component 
                            message="Hello from B #${i + 1}"
                            count="${i + 1}"
                        ></inner-component>
                    `)}
                    
                    <div style="margin-top: 10px; padding: 8px; background: #f5f5f5;">
                        <strong>Dynamic content from B:</strong>
                        <ul>
                            ${Array.from({ length: itemCount }, (_, i) => html`
                                <li>Item ${i + 1} - B State: ${bState}</li>
                            `)}
                        </ul>
                    </div>
                </div>
            </separate-c>
        </div>
    `;
};

export default ComponentBWithNesting;