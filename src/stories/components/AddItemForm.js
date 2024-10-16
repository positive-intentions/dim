const AddItemForm = ({ onAdd }, { useState, useStyle, html, css, useStore, useEffect }) => {
    // const [inputValue, setInputValue] = useState("");

    const {
        form: {
            input: [inputValue, setInputValue],
        }
    } = useStore({
        form: {
            input: useState("")
        }
    });

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

    useEffect(() => {
        if (!!inputValue) setInputValue(inputValue);
    }, [inputValue])

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