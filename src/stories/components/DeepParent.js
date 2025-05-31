
import DeepChild from "./DeepChild.js";

const DeepParent = (props, { useScope, useState, useEffect, useStore, html }) => {
    const [parentState, setParentState] = useState("Parent State");
    
    useScope({
        "deep-child": DeepChild,
    });

    useEffect(() => {
        console.log("DeepParent mounted");
        return () => {
            console.log("DeepParent unmounted");
        };
    }, []);

    const updateParentState = () => {
        setParentState("Updated Parent State");
    };

    return html`
        <div class="parent-container">
            <h2>Parent Component</h2>
            <p>Parent State: ${parentState}</p>
            <button @click="${updateParentState}">Update Parent State</button>
            <deep-child .props="${{ parentState }}"></deep-child>
        </div>
    `;
};

export default DeepParent;
