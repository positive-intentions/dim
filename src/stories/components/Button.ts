const Button = function ({ children, initialstate = 0 }, { html, useEffect, useMemo, useState }) {
  const [count, setCount] = useState(parseInt(initialstate));

  useEffect(() => {
    console.log("Button mounted");
    return () => {
      console.log("Button unmounted");
    };
  }, []);

  useEffect(() => {
    console.log("count effect triggered", count);
  }, [count]);

  const someCalculation = useMemo(() => {
    const result = count * 2;
    console.log("memo calculation triggered:", result);
    return result;
  }, [count]);

  return html`
    <button @click="${() => setCount(count + 1)}">
      ${children} Count: ${count} (x2 = ${someCalculation})
    </button>
  `;
};

export default Button;
