import {
    useScope,
    useState
} from "./dim.ts";
import { html } from "./mini-lit.js";
import Todo from "./todo.js";


const EncryptionGate = ({ children }) => {
    const [password, setPassword] = useState("");
    const [login, setLogin] = useState(false);

    const handleRegeneratePassword = () => {
        const newPassword = window.crypto.getRandomValues(new Uint8Array(16));
        const newPasswordString = Array.from(newPassword).map((x) => x.toString(16)).join("");
        console.log("newPassword", newPasswordString);
        setPassword(newPasswordString);
    }

    console.log({ password })


    useScope({
        "todo-app": Todo,
    });

    return html`
        <div>
            <form @submit=${(e) => {
            e.preventDefault()
            setLogin(!login)
        }}>
                ${!login ? html`<input
                    type="password"
                    value=${password}
                />

                <button type="button" @click=${handleRegeneratePassword}>
                    RegeneratePassword
                </button>

                <button type="submit">
                    ${login ? "Encrypt" : "Decrypt"}
                </button >`: null}
            </form>
            ${login ? html`<todo-app .props=${{ password }}></todo-app>` : null}
        </div >
    `;
};

// define({ tag: "todo-app", component: Todo }); // commented out because it is defined in storybook preview.js
export default EncryptionGate;
