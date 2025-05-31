import ComponentC from './SeparateC.js';

// Component B - Middle component that renders C
const ComponentB = ({ fromA, aState }, { useScope, useState, html }) => {
    const [bState, setBState] = useState('State B');
    
    // Register Component C
    useScope({ 'separate-c': ComponentC });
    
    return html`
        <div style="border: 3px solid green; padding: 15px; margin: 10px;">
            <h3>Component B (Separate)</h3>
            <p>From A: ${fromA}</p>
            <p>A State: ${aState}</p>
            <p>B State: ${bState}</p>
            <button @click="${() => setBState('B Updated: ' + Date.now())}">Update B</button>
            
            <!-- Render C as a child -->
            <separate-c .props="${{ fromA, aState, bState }}"></separate-c>
        </div>
    `;
};

export default ComponentB;