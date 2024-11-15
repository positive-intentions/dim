import {
    useEffect,
    useState,
    useStore,
} from "../../core/dim.ts";
import { html } from "../../core/mini-lit.js";

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