
const DeepGrandchild = ({ parentState, childState }, { useState, useEffect, html }) => {
    const [grandchildState, setGrandchildState] = useState("Grandchild State");

    useEffect(() => {
        console.log("DeepGrandchild mounted");
        return () => {
            console.log("DeepGrandchild unmounted");
        };
    }, []);

    const updateGrandchildState = () => {
        setGrandchildState("Updated Grandchild State");
    };

    return html`
        <div class="grandchild-container">
            <h4>Grandchild Component</h4>
            <p>Grandchild State: ${grandchildState}</p>
            <p>Child State (received): ${childState}</p>
            <p>Parent State (received): ${parentState}</p>
            <button @click="${updateGrandchildState}">Update Grandchild State</button>
        </div>
    `;
};

export default DeepGrandchild;
