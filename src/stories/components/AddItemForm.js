const AddItemForm = ({ onAdd }, { useState, useStyle, html, css }) => {
    console.log("AddItemForm", onAdd);
    const [inputValue, setInputValue] = useState("");

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

    return html`
    <input
        type="text"
        placeholder="Add todo"
        .value="${inputValue}"
        @change="${handleInput}"
    />
    <button @click="${addTodo}">Add</button>
    <button @click="${clearInput}">Clear</button>
  `;
};

export default AddItemForm;