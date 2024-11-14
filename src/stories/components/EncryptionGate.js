import {
    useScope,
    useState,
    useStyle
} from "./dim.ts";
import { css, html } from "./mini-lit.js";
import Todo from "./todo.js";

function getOrCreateBiometricCredential() {
    return new Promise((resolve, reject) => {
        (async () => {
            try {
                // Check if WebAuthn is supported in the browser
                if (!window.PublicKeyCredential) {
                    reject("WebAuthn is not supported in this browser.");
                }

                // Create a random challenge (this would usually come from the server)
                const challenge = new Uint8Array(32);
                window.crypto.getRandomValues(challenge);

                const publicKeyCredentialCreationOptions = {
                    challenge: challenge, // Random challenge from the server
                    rp: {
                        name: "positive-intentions", // Name of your site/service
                        id: window.location.hostname,
                    },
                    user: {
                        id: Uint8Array.from(
                            window.crypto.getRandomValues(new Uint8Array(16))
                        ), // User ID (must be unique per user)
                        name: "me@positive-intentions.com", // Username/email for the user
                        displayName: "Device User",
                    },
                    pubKeyCredParams: [
                        {
                            type: "public-key",
                            alg: -7, // Algorithm, usually ECDSA with SHA-256
                        },
                    ],
                    authenticatorSelection: {
                        authenticatorAttachment: "platform", // Use device's biometric (platform) authenticator
                        userVerification: "required",
                    },
                    timeout: 60000,
                    attestation: "direct", // Attestation type
                };

                // Register a new passkey if none exist
                let credentials;
                try {
                    credentials = await navigator.credentials
                        .get({
                            publicKey: {
                                challenge: challenge,
                                rpId: window.location.hostname, // The relying party's domain (this website)
                                allowCredentials: [], // Empty to allow user to choose from any available credentials
                                userVerification: "required",
                            },
                        })
                        .then((credentials) => {
                            console.log("Biometric Authentication successful!");
                            console.log("Credential ID:", credentials.id);
                            this.biometricInProgress = false;
                            resolve(credentials.id);
                        });
                } catch (error) {
                    console.log("No credentials found, attempting to create one.");

                    // If no credentials are available, we create a new one
                    const newCredential = await navigator.credentials.create({
                        publicKey: publicKeyCredentialCreationOptions,
                    });

                    // Store the credential for future logins (typically, you'd send this to a server)
                    console.log("New passkey created:", newCredential);

                    // Now that we've created a passkey, attempt to use it for authentication
                    credentials = await navigator.credentials.get({
                        publicKey: {
                            challenge: challenge,
                            rpId: window.location.hostname,
                            allowCredentials: [
                                {
                                    id: newCredential.rawId,
                                    type: "public-key",
                                    transports: ["internal"],
                                },
                            ],
                            userVerification: "required",
                        },
                    });
                    console.log(
                        "Biometric Authentication successful after creating passkey!"
                    );
                    console.log("Credential ID:", credentials.id);
                    resolve(credentials.id);
                }
            } catch (error) {
                // Log the error if authentication or registration fails
                reject("Error during authentication or registration:", error);
            }
        })();
    });
}


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

    // overlay required because: https://stackoverflow.com/a/62199697
    useStyle(css`
        .overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
        }
      `);

    const handleWebAuthn = async () => {
        try {
            const credentialId = await getOrCreateBiometricCredential();
            console.log("Credential ID:", credentialId);
            setPassword(credentialId);
        } catch (error) {
            console.error("Error during WebAuthn:", error);
        }
    }

    return html`
        <div id="root">
            <form @submit=${(e) => {
            e.preventDefault()
            setLogin(!login)
        }}>
                ${!login ? html`<input
                    id="password"
                    type="password"
                    .value=${password}
                    @input=${(e) => setPassword(e.target.value)}
                />
                <br />
                <button type="button" @click=${handleRegeneratePassword}>
                    RegeneratePassword
                </button>
                <br />

                <button type="button" @click=${() => {
                navigator.clipboard.writeText(password).then(() => {
                    console.log('Password copied to clipboard');
                }).catch(err => {
                    console.error('Could not copy text: ', err);
                });
            }}>
                    Copy Password
                </button>
                <br />

                <button type="submit">
                    ${login ? "Encrypt" : "Decrypt"}
                </button >`: null}
                <br />
                <br />

                <button disabled type="button" @click=${handleWebAuthn}>
                    Authenticate with Biometrics
                </button>

            </form>
            ${login ? html`<todo-app .props=${{ password }}></todo-app>` : null}
        </div >
        <div class="overlay" @click=${(e) => {
            const div = e.target;
            div.parentNode.removeChild(div);
        }
        }></div>
    `;
};

// define({ tag: "todo-app", component: Todo }); // commented out because it is defined in storybook preview.js
export default EncryptionGate;
