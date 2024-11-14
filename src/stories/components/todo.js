import {
    useEffect,
    useMemo,
    useScope,
    useState,
    useStore,
} from "./dim.ts";
import { html } from "./mini-lit.js";

import AddItemForm from "./AddItemForm.js";
import TodoList from "./TodoList.js";

const Todo = ({ password }) => {
    const {
        form: {
            input: [inputValue],
            counter: [counter, setCounter],
        },
        todos: [todos, setTodos],
        storeLoaded: [storeLoaded],
    } = useStore({
        form: {
            input: useState(""),
            counter: useState(1),
        },
        todos: useState([]),
    }, { password });

    // console.log("storeLoaded", storeLoaded);

    useScope({
        "add-item-form": AddItemForm,
        "todo-list": TodoList,
    });

    useEffect(() => {
        console.log("Todo mounted");
        return () => {
            console.log("Todo unmounted");
        };
    }, []);

    useEffect(() => {
        console.log("Todos changed");
    }, [todos]);

    const numberOfTodoItems = useMemo(() => {
        console.log("memo calculation triggered");
        return todos.length;
    }, [todos]);

    const removeTodo = (index) => {
        console.log("removing item", index);
        setTodos(todos.filter((_, i) => i !== index));
    };

    if (!storeLoaded) {
        return html`<div>decrypting...</div>`;
    }

    return html`
        <div>
            <h1>Todo List</h1>
                ${Array.from({ length: counter }, () => {
        return html`
                        <add-item-form></add-item-form><br/>
                    `;
    })}
                <br />
                <button @click="${() => setCounter(counter + 1)}">Add form</button>
                <button @click="${() => setCounter(counter - 1)}">remove form</button>
                <br />
            <p>Number of todo items: ${numberOfTodoItems}</p>
            <p>input value: ${inputValue}</p>
            <todo-list .props="${{ todos, onRemove: removeTodo }}"></todo-list>
        </div>
    `;
};

// define({ tag: "todo-app", component: Todo }); // commented out because it is defined in storybook preview.js
export default Todo;
