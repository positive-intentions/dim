import React from 'react';
import { WebComponent, HTMLStory } from './utils/StoryWrapper.js';
import { define } from '../core/dim.js';

// Component 1: Icon component
const Icon = ({ name, size = '24', color = '#000' }, { html }) => {
    const icons = {
        home: 'M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z',
        user: 'M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z',
        cart: 'M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z'
    };
    
    return html`
        <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="${color}">
            <path d="${icons[name] || icons.home}" />
        </svg>
    `;
};

// Component 2: Button with Icon
const IconButton = ({ icon, label, onClick }, { useScope, html }) => {
    useScope({ 'icon-component': Icon });
    
    return html`
        <button 
            @click="${onClick || (() => {})}"
            style="display: inline-flex; align-items: center; gap: 8px; padding: 8px 16px; 
                   border: 1px solid #ddd; border-radius: 4px; background: white; 
                   cursor: pointer; font-size: 14px;"
        >
            <icon-component name="${icon}" size="20" color="#666"></icon-component>
            <span>${label}</span>
        </button>
    `;
};

// Component 3: Card with Header
const InfoCard = ({ title, icon }, { useScope, html }) => {
    useScope({ 
        'card-icon': Icon 
    });
    
    return html`
        <div style="border: 1px solid #e0e0e0; border-radius: 8px; padding: 20px; background: white;">
            <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;">
                <card-icon name="${icon}" size="32" color="#2196f3"></card-icon>
                <h3 style="margin: 0; color: #333;">${title}</h3>
            </div>
            <div style="color: #666;">
                <slot></slot>
            </div>
        </div>
    `;
};

// Component 4: Navigation Menu
const NavMenu = ({ items }, { useScope, useState, html }) => {
    console.log('NavMenu props:', { items });
    const [activeIndex, setActiveIndex] = useState(0);
    
    useScope({ 
        'nav-button': IconButton 
    });
    
    return html`
        <nav style="display: flex; gap: 10px; padding: 20px; background: #f5f5f5; border-radius: 8px;">
            ${items.map((item, index) => html`
                <nav-button 
                    icon="${item.icon}"
                    label="${item.label}"
                    @click="${() => setActiveIndex(index)}"
                    style="${activeIndex === index ? 'background: #e3f2fd;' : ''}"
                ></nav-button>
            `)}
        </nav>
        <div style="padding: 20px; background: white; margin-top: 10px; border-radius: 8px;">
            Active: ${items[activeIndex]?.label}
        </div>
    `;
};

// Component 5: User List Item
const UserListItem = ({ user }, { useScope, html }) => {
    useScope({ 
        'user-icon': Icon 
    });
    
    return html`
        <div style="display: flex; align-items: center; gap: 16px; padding: 12px; 
                    border-bottom: 1px solid #eee;">
            <user-icon name="user" size="40" color="#666"></user-icon>
            <div style="flex: 1;">
                <div style="font-weight: bold; color: #333;">${user.name}</div>
                <div style="font-size: 14px; color: #666;">${user.role}</div>
            </div>
            <button style="padding: 6px 12px; border: 1px solid #ddd; 
                          border-radius: 4px; background: white;">
                View Profile
            </button>
        </div>
    `;
};

// Component 6: App Shell using multiple components
const AppShell = ({ title }, { useScope, useState, html }) => {
    console.log('AppShell props:', { title });
    const [showUsers, setShowUsers] = useState(true);
    
    const navItems = [
        { icon: 'home', label: 'Dashboard' },
        { icon: 'user', label: 'Users' },
        { icon: 'cart', label: 'Orders' }
    ];
    
    const users = [
        { name: 'Alice Johnson', role: 'Admin' },
        { name: 'Bob Smith', role: 'Developer' },
        { name: 'Carol White', role: 'Designer' }
    ];
    
    useScope({ 
        'app-nav': NavMenu,
        'app-card': InfoCard,
        'app-icon-button': IconButton,
        'app-user-item': UserListItem
    });
    
    return html`
        <div style="max-width: 800px; margin: 0 auto; padding: 20px;">
            <h1>${title}</h1>
            
            <app-nav .props="${{ items: navItems }}"></app-nav>
            
            <div style="margin-top: 30px; display: grid; gap: 20px;">
                <app-card title="Welcome" icon="home">
                    <p>This demonstrates multiple levels of component composition.</p>
                    <p>Each component imports and uses other components.</p>
                </app-card>
                
                <app-card title="User Management" icon="user">
                    <div style="margin-bottom: 16px;">
                        <app-icon-button 
                            .props="${{ 
                                icon: 'user',
                                label: showUsers ? 'Hide Users' : 'Show Users',
                                onClick: () => setShowUsers(!showUsers) 
                            }}"
                        ></app-icon-button>
                    </div>
                    
                    ${showUsers ? html`
                        <div style="border: 1px solid #eee; border-radius: 4px;">
                            ${users.map(user => html`
                                <app-user-item .props="${{ user }}"></app-user-item>
                            `)}
                        </div>
                    ` : html`
                        <p style="color: #999;">Click "Show Users" to display the user list.</p>
                    `}
                </app-card>
            </div>
        </div>
    `;
};

// Define all components
define({ tag: 'showcase-icon', component: Icon });
define({ tag: 'showcase-icon-button', component: IconButton });
define({ tag: 'showcase-info-card', component: InfoCard });
define({ tag: 'showcase-nav-menu', component: NavMenu });
define({ tag: 'showcase-user-item', component: UserListItem });
define({ tag: 'showcase-app-shell', component: AppShell });

export default {
    title: 'Example/Composition Showcase',
    parameters: {
        layout: 'centered',
    },
};

export const CompleteApp = () => {
    return <WebComponent 
        tag="showcase-app-shell" 
        props={{ title: 'Component Composition Demo' }} 
    />;
};

export const NavigationMenu = () => {
    return <WebComponent 
        tag="showcase-nav-menu"
        props={{
            items: [
                { icon: 'home', label: 'Home' },
                { icon: 'user', label: 'Profile' },
                { icon: 'cart', label: 'Shop' }
            ]
        }}
    />;
};

export const IconButtonStandalone = () => {
    return <WebComponent 
        tag="showcase-icon-button"
        props={{
            icon: 'cart',
            label: 'Add to Cart'
        }}
    />;
};

export const InfoCardStandalone = () => {
    return <HTMLStory html={`
        <showcase-info-card title="Statistics" icon="home">
            <p>This content is passed through a slot.</p>
            <ul>
                <li>Total Users: 1,234</li>
                <li>Active Sessions: 89</li>
                <li>Revenue: $12,345</li>
            </ul>
        </showcase-info-card>
    `} />;
};

export const CompositionDiagram = () => {
    return <HTMLStory html={`
        <div style="width: 1000px; padding: 40px;">
            <h1>Component Composition Hierarchy</h1>
                
                <div style="background: #f5f5f5; padding: 30px; border-radius: 8px; margin-bottom: 30px;">
                    <h2>Component Tree</h2>
                    <pre style="font-size: 14px; line-height: 1.6;">
AppShell
├── NavMenu
│   └── IconButton (multiple)
│       └── Icon
├── InfoCard
│   └── Icon
└── UserListItem (multiple)
    └── Icon
                    </pre>
                    
                    <p><strong>Total Depth:</strong> 3 levels (AppShell → NavMenu → IconButton → Icon)</p>
                    <p><strong>Component Reuse:</strong> Icon component is used in 4 different parent components</p>
                </div>
                
                <div style="background: white; border: 2px solid #ddd; border-radius: 8px; padding: 30px;">
                    <showcase-app-shell id="demo-app"></showcase-app-shell>
                </div>
                
                <div style="margin-top: 30px; display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                    <div style="background: #e8f5e9; padding: 20px; border-radius: 8px;">
                        <h3>✅ What's Working</h3>
                        <ul>
                            <li>Components import and use other components</li>
                            <li>Props flow down through multiple levels</li>
                            <li>State changes trigger re-renders</li>
                            <li>Event handlers work across component boundaries</li>
                            <li>Slots work for static content</li>
                        </ul>
                    </div>
                    
                    <div style="background: #ffebee; padding: 20px; border-radius: 8px;">
                        <h3>⚠️ Current Limitations</h3>
                        <ul>
                            <li>Complex props need .props syntax</li>
                            <li>Slots with dynamic content can be tricky</li>
                            <li>Attributes are strings (numbers need parsing)</li>
                        </ul>
                    </div>
                </div>
            </div>
            <script>
                // Set props after element is created
                setTimeout(() => {
                    const app = document.getElementById('demo-app');
                    if (app) {
                        app.props = { title: 'Live Demo - Click buttons to interact!' };
                    }
                }, 100);
            </script>
    `} />;
};