import { html, css, expandSelfClosingTags } from "./mini-lit.js";
import {
    define,
    useState,
    useEffect,
    useMemo,
    useScope,
    useStyle,
    lazy,
    useLazy,
    useLazyScope,
    useStore
} from "./dim.ts";

import AddItemForm from "./AddItemForm.js";
import TodoList from "./TodoList.js";

// export const Button = (
//     { children, initialstate = 3 },
//     { useState, useEffect, useMemo, useStyle, html, css }
// ) => {
//     const [count, setCount] = useState(parseInt(initialstate));

//     const someCalculation = useMemo(() => {
//         const result = count * 2;
//         console.log("memo calculation triggered:", result);
//         return result;
//     }, [count]);

//     const updateCount = () => {
//         setCount(count + 1);
//     };

//     return html`
//     <button @click="${updateCount}">
//         ${children} ${count} ${someCalculation}
//     </button>
//   `;
// };

// const NewButton = new Function(`return ${Button.toString()}`)();

const Todo = ({ }, {
    useState,
    useEffect,
    useMemo,
    useScope,
    useStore,
    html,
}) => {
    // const LazyButton = useLazyScope(
    //     "lazy-button",
    //     new Promise((resolve) => {
    //         setTimeout(() => {
    //             resolve(Button.toString());
    //         }, 2000);
    //     })
    // );

    // const [todos, setTodos] = useState([]);

    const {
        todos: [todos, setTodos]
    } = useStore({
        todos: useState(['aaa', 'bbb', 'ccc']),
        settings: {
            showCompleted: useState(false)
        }
    });

    useScope({
        "add-item-form": AddItemForm,
        "todo-list": TodoList,
        // "some-button": Button,
        // "new-button": NewButton,
        // "lazy-button": LazyButton,
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

    const addTodo = (inputValue) => {
        console.log("adding new item");
        setTodos([...todos, inputValue]);
    };

    const removeTodo = (index) => {
        console.log("removing item", index);
        setTodos(todos.filter((_, i) => i !== index));
    };

    return html`
    <div>
        <h1>Todo List</h1>
        <add-item-form .props="${{ onAdd: addTodo }}"></add-item-form>
        <p>Number of todo items: ${numberOfTodoItems}</p>
        <todo-list .props="${{ todos, onRemove: removeTodo }}"></todo-list>
    </div>
    `;
};

// define({ tag: "todo-app", component: Todo }); // commented out because it is defined in storybook preview.js
export default Todo;
