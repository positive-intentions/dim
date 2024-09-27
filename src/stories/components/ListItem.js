const ListItem = ({ todo, onRemove }, { useEffect, html }) => {
    useEffect(() => {
        console.log("List item mounted");
        return () => {
            console.log("List item unmounted");
        };
    }, []);

    return html`
    <li>
        ${todo}
        <button @click="${onRemove}">Remove</button>
    </li>
  `;
};

export default ListItem;