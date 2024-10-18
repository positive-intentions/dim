const ListItem = ({ todo, onRemove }, { useEffect, useStore, useState, html }) => {
    const {
        form: {
            input: [inputValue, setInputValue],
        }
    } = useStore({
        form: {
            input: useState(""),
        }
    })
    useEffect(() => {
        console.log("List item mounted");
        return () => {
            console.log("List item unmounted");
        };
    }, []);

    return html`
    <li>
        ${todo}
        ${inputValue}
        <button @click="${onRemove}">Remove</button>
    </li>
  `;
};

export default ListItem;