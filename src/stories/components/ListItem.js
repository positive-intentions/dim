import {
    useEffect,
    useState,
    useStore,
    html,
} from "../../core/dim.ts";

const ListItem = ({ todo, onRemove }) => {
    const {
        form: {
            input: [inputValue],
        },
    } = useStore({
        form: {
            input: useState(""),
        },
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