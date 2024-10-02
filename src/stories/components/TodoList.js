import ListItem from "./ListItem.js";

const TodoList = ({ todos, onRemove }, { useScope, useEffect, html }) => {
    useScope({
        "list-item": ListItem,
    });

    useEffect(() => {
        console.log("todos list updated");
    }, [todos]);

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