export const renderAvatar = (
  html,
  { emoji = "👤", className = "avatar", vtShared, label, style }
) => html`
  <div
    class="${className} emoji-avatar"
    ${vtShared ? html`data-vt-shared="${vtShared}"` : ""}
    ${label ? html`aria-label="${label}" role="img"` : ""}
    ${style ? html`style="${style}"` : ""}
  >
    ${emoji}
  </div>
`;
