// UserProfile.js - A component that uses Card
import Card from './Card.js';
import Avatar from './Avatar.js';

const UserProfile = ({ user }, { useScope, html }) => {
    // Register the components we'll use
    useScope({
        'user-card': Card,
        'user-avatar': Avatar
    });
    
    return html`
        <user-card title="User Profile">
            <div style="display: flex; align-items: center; gap: 16px;">
                <user-avatar 
                    src="${user.avatar}" 
                    alt="${user.name}"
                    size="64"
                ></user-avatar>
                <div>
                    <h4 style="margin: 0;">${user.name}</h4>
                    <p style="margin: 4px 0; color: #888;">${user.email}</p>
                    <p style="margin: 4px 0;">${user.bio}</p>
                </div>
            </div>
        </user-card>
    `;
};

export default UserProfile;