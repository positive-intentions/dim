// SimpleUserCard.js - A simpler user card that avoids slot issues
import Avatar from './Avatar.js';

const SimpleUserCard = ({ user }, { useScope, html }) => {
    useScope({
        'simple-avatar': Avatar
    });
    
    return html`
        <div style="border: 1px solid #ddd; border-radius: 8px; padding: 20px; max-width: 400px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h3 style="margin-top: 0; color: #333;">User Profile</h3>
            <div style="display: flex; align-items: center; gap: 16px;">
                <simple-avatar 
                    src="${user.avatar}" 
                    alt="${user.name}"
                    size="80"
                ></simple-avatar>
                <div style="flex: 1;">
                    <h4 style="margin: 0; color: #222;">${user.name}</h4>
                    <p style="margin: 4px 0; color: #666; font-size: 14px;">${user.email}</p>
                    <p style="margin: 8px 0; color: #444; font-size: 14px;">${user.bio}</p>
                </div>
            </div>
        </div>
    `;
};

export default SimpleUserCard;