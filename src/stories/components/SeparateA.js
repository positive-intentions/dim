import ComponentB from './SeparateB.js';

// Component A - Top level component that renders B
const ComponentA = ({ message }, { useScope, useState, html }) => {
    const [aState, setAState] = useState('State A');
    
    // Register Component B
    useScope({ 'separate-b': ComponentB });
    
    return html`
        <div style="border: 3px solid red; padding: 15px; margin: 10px;">
            <h2>Component A (Separate)</h2>
            <p>Message: ${message}</p>
            <p>A State: ${aState}</p>
            <button @click="${() => setAState('A Updated: ' + Date.now())}">Update A</button>
            
            <!-- Render B as a child -->
            <separate-b .props="${{ fromA: message, aState }}"></separate-b>
        </div>
    `;
};

export default ComponentA;