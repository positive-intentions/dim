// Component C - Leaf component with slot for nested content
const ComponentCWithSlot = ({ fromA, aState, bState }, { useState, html }) => {
    const [cState, setCState] = useState('State C');
    
    return html`
        <div style="border: 3px solid blue; padding: 15px; margin: 10px; background: #e3f2fd;">
            <h4>Component C (With Slot)</h4>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                <div>
                    <h5>Component C State:</h5>
                    <p>From A: ${fromA}</p>
                    <p>A State: ${aState}</p>
                    <p>B State: ${bState}</p>
                    <p>C State: ${cState}</p>
                    <button @click="${() => setCState('C Updated: ' + Date.now())}">
                        Update C
                    </button>
                </div>
                
                <div style="border-left: 2px solid #2196f3; padding-left: 15px;">
                    <h5>Nested Content:</h5>
                    <!-- This slot will render any content passed from parent -->
                    <slot></slot>
                </div>
            </div>
        </div>
    `;
};

export default ComponentCWithSlot;