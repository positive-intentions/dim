const AddItemForm = ({ }, { useState, useStyle, useStore, html, css, useRef }) => {
    // const [inputValue, setInputValue] = useState("");
    const {
        form: {
            input: [inputValue, setInputValue],
        },
        todos: [todos, setTodos],
    } = useStore({
        form: {
            input: useState(""),
        },
        todos: useState([]),
    })


    const onAdd = (inputValue) => {
        console.log("adding new item");
        setTodos([...todos, inputValue]);
    };

    useStyle(css`
        button {
            background-color: #029cfd;
            border: none;
            border-radius: 5px;
            color: white;
            padding: 5px 10px;
            text-align: center;
            text-decoration: none;
            display: inline-block;
            cursor: pointer;
        }

        button:disabled {
            background-color: #ccc;
            color: #666;
            cursor: not-allowed;
        }
    `);

    const handleInput = (e) => {
        e.preventDefault();
        setInputValue(e.target.value);
    };

    const clearInput = () => {
        setInputValue("");
    };

    const addTodo = () => {
        onAdd(inputValue);
        clearInput();
    };

    const ref = useRef();

    // Attach custom methods to the element instance
    ref.current = {
        checkValidity: () => {
            return inputValue.length > 3; // Example rule: valid if input length > 3
        },
    };

    return html`
    <input
        type="text"
        placeholder="Add todo"
        .value="${inputValue}"
        @input="${handleInput}"
    />
    <button .disabled="${inputValue ? false : true}" @click="${addTodo}">Add</button>
    <button @click="${clearInput}">Clear input</button>
  `;
};

export default AddItemForm;