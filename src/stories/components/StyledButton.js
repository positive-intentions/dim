import { buttonStyles, layoutStyles } from '../../core/shared-styles';

export const StyledButton = ({ 
  onClick, 
  disabled,
  variant = 'primary' 
}, { html, css, useStyle, unsafeCSS }) => {
  
  // Convert string "true"/"false" to boolean
  const isDisabled = disabled === 'true' || disabled === true;
  
  // Combine shared styles with component-specific styles
  const componentStyles = css`
    ${buttonStyles}
    ${layoutStyles}
    
    /* Component-specific overrides */
    :host {
      --button-bg: ${unsafeCSS(variant === 'primary' ? '#007bff' : '#6c757d')};
      --button-hover-bg: ${unsafeCSS(variant === 'primary' ? '#0056b3' : '#5a6268')};
    }
    
    .button-icon {
      margin-right: 8px;
    }
  `;
  
  useStyle(componentStyles);
  
  const handleClick = (e) => {
    if (!isDisabled && onClick) {
      onClick(e);
    }
  };
  
  return html`
    <button 
      class="button flex flex-center gap-2" 
      @click=${handleClick}
      ?disabled=${isDisabled}
    >
      <slot></slot>
    </button>
  `;
};