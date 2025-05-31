// Component C - Leaf component
const ComponentC = ({ fromA, aState, bState }, { useState, html }) => {
    const [cState, setCState] = useState('State C');
    
    return html`
        <div style="border: 3px solid blue; padding: 15px; margin: 10px;">
            <h4>Component C (Separate)</h4>
            <p>From A: ${fromA}</p>
            <p>A State: ${aState}</p>
            <p>B State: ${bState}</p>
            <p>C State: ${cState}</p>
            <button @click="${() => setCState('C Updated: ' + Date.now())}">Update C</button>
        </div>
    `;
};

export default ComponentC;