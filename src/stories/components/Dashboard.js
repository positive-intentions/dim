// Dashboard.js - A component that composes multiple other components
import Card from './Card.js';
import UserProfile from './UserProfile.js';
import TodoList from './TodoList.js';

const Dashboard = ({ user }, { useScope, useState, html }) => {
    const [showProfile, setShowProfile] = useState(true);
    
    // Register all the components we'll use
    useScope({
        'dash-card': Card,
        'dash-profile': UserProfile,
        'dash-todos': TodoList
    });
    
    return html`
        <div style="max-width: 800px; margin: 0 auto; padding: 20px;">
            <h1>Dashboard</h1>
            
            <button @click="${() => setShowProfile(!showProfile)}">
                ${showProfile ? 'Hide' : 'Show'} Profile
            </button>
            
            ${showProfile ? html`
                <dash-profile .props="${{ user }}"></dash-profile>
            ` : ''}
            
            <dash-card title="My Tasks">
                <dash-todos></dash-todos>
            </dash-card>
            
            <dash-card title="Quick Stats">
                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; text-align: center;">
                    <div>
                        <h3 style="margin: 0; color: #2196f3;">12</h3>
                        <p style="margin: 4px 0; color: #666;">Tasks</p>
                    </div>
                    <div>
                        <h3 style="margin: 0; color: #4caf50;">8</h3>
                        <p style="margin: 4px 0; color: #666;">Completed</p>
                    </div>
                    <div>
                        <h3 style="margin: 0; color: #ff9800;">4</h3>
                        <p style="margin: 4px 0; color: #666;">Pending</p>
                    </div>
                </div>
            </dash-card>
        </div>
    `;
};

export default Dashboard;