// Example of nested component rendering: <a><b><c></c></b></a>

const NestedExample = (props, { useState, useScope, html }) => {
    const [rootState, setRootState] = useState('Root State');
    
    // Define component A
    const ComponentA = ({ rootState, rootMessage }, { useState, useScope, html }) => {
        const [aState, setAState] = useState('A State');
        
        // Define component B inside A
        const ComponentB = ({ rootState, aState, aMessage }, { useState, useScope, html }) => {
            const [bState, setBState] = useState('B State');
            
            // Define component C inside B
            const ComponentC = ({ rootState, aState, bState, cMessage }, { useState, html }) => {
                const [cState, setCState] = useState('C State');
                
                return html`
                    <div style="padding: 10px; margin: 5px; border: 1px solid #0066cc; background: #e6f2ff;">
                        <strong>Component C</strong>
                        <ul>
                            <li>Root State: ${rootState}</li>
                            <li>A State: ${aState}</li>
                            <li>B State: ${bState}</li>
                            <li>C State: ${cState}</li>
                            <li>C Message: ${cMessage}</li>
                        </ul>
                        <button @click="${() => setCState('C Updated: ' + Date.now())}">
                            Update C State
                        </button>
                    </div>
                `;
            };
            
            // Register C in B's scope
            useScope({ 'nested-c': ComponentC });
            
            return html`
                <div style="padding: 10px; margin: 5px; border: 1px solid #009900; background: #e6ffe6;">
                    <strong>Component B</strong>
                    <ul>
                        <li>Root State: ${rootState}</li>
                        <li>A State: ${aState}</li>
                        <li>B State: ${bState}</li>
                        <li>A Message: ${aMessage}</li>
                    </ul>
                    <button @click="${() => setBState('B Updated: ' + Date.now())}">
                        Update B State
                    </button>
                    <nested-c .props="${{ 
                        rootState, 
                        aState, 
                        bState,
                        cMessage: 'Hello from B to C'
                    }}"></nested-c>
                </div>
            `;
        };
        
        // Register B in A's scope
        useScope({ 'nested-b': ComponentB });
        
        return html`
            <div style="padding: 10px; margin: 5px; border: 1px solid #cc0000; background: #ffe6e6;">
                <strong>Component A</strong>
                <ul>
                    <li>Root State: ${rootState}</li>
                    <li>A State: ${aState}</li>
                    <li>Root Message: ${rootMessage}</li>
                </ul>
                <button @click="${() => setAState('A Updated: ' + Date.now())}">
                    Update A State
                </button>
                <nested-b .props="${{ 
                    rootState, 
                    aState,
                    aMessage: 'Hello from A to B'
                }}"></nested-b>
            </div>
        `;
    };
    
    // Register A in root scope
    useScope({ 'nested-a': ComponentA });
    
    return html`
        <div style="padding: 20px; border: 2px solid #000; background: #f5f5f5;">
            <h2>Nested Component Example</h2>
            <p>This demonstrates the pattern: &lt;root&gt;&lt;a&gt;&lt;b&gt;&lt;c&gt;&lt;/c&gt;&lt;/b&gt;&lt;/a&gt;&lt;/root&gt;</p>
            <ul>
                <li>Root State: ${rootState}</li>
            </ul>
            <button @click="${() => setRootState('Root Updated: ' + Date.now())}">
                Update Root State
            </button>
            <nested-a .props="${{ 
                rootState,
                rootMessage: 'Hello from Root'
            }}"></nested-a>
        </div>
    `;
};

export default NestedExample;