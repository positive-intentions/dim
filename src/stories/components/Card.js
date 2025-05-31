// Card.js - A reusable card component
const Card = ({ title }, { html }) => {
    return html`
        <div style="border: 1px solid #ddd; border-radius: 8px; padding: 16px; margin: 8px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h3 style="margin-top: 0; color: #333;">${title}</h3>
            <div style="color: #666;">
                <slot></slot>
            </div>
        </div>
    `;
};

export default Card;