// Container.js - A component that properly handles child content
const Container = ({ title, style = '' }, { html }) => {
    return html`
        <div style="border: 1px solid #ddd; border-radius: 8px; padding: 16px; margin: 8px 0; ${style}">
            ${title ? html`<h3 style="margin-top: 0;">${title}</h3>` : ''}
            <div>
                <slot></slot>
            </div>
        </div>
    `;
};

export default Container;