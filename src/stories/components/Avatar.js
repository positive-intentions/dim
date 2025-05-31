// Avatar.js - A simple avatar component
const Avatar = ({ src, alt, size = '48' }, { html }) => {
    const sizeNum = parseInt(size);
    const avatarSrc = src || `https://ui-avatars.com/api/?name=${alt}&size=${sizeNum}`;
    
    return html`
        <img 
            src="${avatarSrc}"
            alt="${alt}"
            style="width: ${sizeNum}px; height: ${sizeNum}px; border-radius: 50%; object-fit: cover;"
        />
    `;
};

export default Avatar;