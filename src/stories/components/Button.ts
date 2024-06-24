import { useState, useEffect, useMemo } from './dim.ts';
import { html } from 'lit';

const Button = function({ children, initialstate = 0 }) {
    const [count, setCount] = useState(parseInt(initialstate), 'test-state');

    useEffect(() => {
        console.log("Button mounted");
        return () => {
            console.log("Button unmounted");
        };
    }, [], 'test-mount-effect');

    useEffect(() => {
        console.log("count effect triggered");
    }, [count()], 'test-effect');

    const someCalculation = useMemo(() => {
        const result = count() * 2;
        console.log("memo calculation triggered:", result);
        return result;
    }, [count()], 'test-memo');

    return html`
        <button @click="${() => setCount(count() + 1)}">
            ${children}
            ${count()}
            ${someCalculation}
        </button>
    `;
}

export default Button;