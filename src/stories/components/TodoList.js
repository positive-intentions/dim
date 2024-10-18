import {
    useState,
    useEffect,
    useScope,
    useStore,
} from "./dim.ts";
import { html } from "./mini-lit.js";

import ListItem from "./ListItem.js";

const TodoList = () => {
    useScope({
        "list-item": ListItem,
    });

    const {
        todos: [todos, setTodos],
    } = useStore({
        todos: useState([]),
    })

    useEffect(() => {
        console.log("todos list updated");
    }, [todos]);

    const onRemove = (index) => {
        console.log("removing item", index);
        setTodos(todos.filter((_, i) => i !== index));
    };

    return html`
        <ul>
            ${todos.map((todo, index) => {
        const handleRemove = () => {
            onRemove(index);
        };

        return html`
                    <list-item
                        .props="${{ todo, onRemove: handleRemove }}"
                    ></list-item>
                `;
    })}
        </ul>
    `;
};

export default TodoList;