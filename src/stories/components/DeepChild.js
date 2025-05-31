
import DeepGrandchild from "./DeepGrandchild.js";

const DeepChild = ({ parentState }, { useScope, useState, useEffect, html }) => {
    const [childState, setChildState] = useState("Child State");
    
    useScope({
        "deep-grandchild": DeepGrandchild,
    });

    useEffect(() => {
        console.log("DeepChild mounted");
        return () => {
            console.log("DeepChild unmounted");
        };
    }, []);

    const updateChildState = () => {
        setChildState("Updated Child State");
    };

    return html`
        <div class="child-container">
            <h3>Child Component</h3>
            <p>Child State: ${childState}</p>
            <p>Parent State (received): ${parentState}</p>
            <button @click="${updateChildState}">Update Child State</button>
            <deep-grandchild .props="${{ parentState, childState }}"></deep-grandchild>
        </div>
    `;
};

export default DeepChild;
