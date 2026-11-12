import { html, useEffect, useMemo, useState } from "../../core/dim.ts";

const Button = function ({ children, initialstate = 0 }, { html: h = html }) {
  const [count, setCount] = useState(parseInt(initialstate, 10) || 0);

  useEffect(() => {
    console.log("Button mounted");
    return () => {
      console.log("Button unmounted");
    };
  }, []);

  useEffect(() => {
    console.log("count effect triggered");
  }, [count]);

  const someCalculation = useMemo(() => {
    const result = count * 2;
    console.log("memo calculation triggered:", result);
    return result;
  }, [count]);

  return h`
    <button @click="${() => setCount(count + 1)}">
      ${children} ${count} ${someCalculation}
    </button>
  `;
};

export default Button;
