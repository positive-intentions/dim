import React from 'react';
import { WebComponent, HTMLStory } from './utils/StoryWrapper.js';
import { define } from '../core/dim.js';
import Avatar from './components/Avatar.js';
import SimpleUserCard from './components/SimpleUserCard.js';
import ProductCard from './components/ProductCard.js';
import Container from './components/Container.js';

// Define working components
define({ tag: 'comp-avatar', component: Avatar });
define({ tag: 'comp-simple-user', component: SimpleUserCard });
define({ tag: 'comp-product', component: ProductCard });
define({ tag: 'comp-container', component: Container });

export default {
    title: 'Example/Direct Component Composition',
    parameters: {
        layout: 'centered',
    },
};

const sampleUser = {
    name: 'Jane Doe',
    email: 'jane@example.com',
    bio: 'Full-stack developer who loves building with Web Components',
    avatar: 'https://i.pravatar.cc/150?img=1'
};

export const SimpleUserCardExample = () => {
    return <WebComponent tag="comp-simple-user" props={{ user: sampleUser }} />;
};

export const ProductCardExample = () => {
    return <WebComponent 
        tag="comp-product"
        props={{
            product: {
                name: 'Wireless Headphones',
                price: '79.99',
                description: 'Premium sound quality with active noise cancellation',
                image: 'https://picsum.photos/200/200?random=1'
            }
        }}
    />;
};

export const ContainerExample = () => {
    return <HTMLStory html={`
        <comp-container title="Container Example">
            <p>This content goes into the slot.</p>
            <button onclick="alert('Clicked!')">Click Me</button>
        </comp-container>
    `} />;
};

export const AvatarComponent = () => {
    return <HTMLStory html={`
        <comp-avatar src="https://i.pravatar.cc/150?img=5" alt="John Smith" size="80"></comp-avatar>
    `} />;
};

export const CompositionPatterns = () => {
    return <HTMLStory html={`
        <div style="width: 1000px; padding: 20px;">
            <h1>Component Composition Patterns</h1>
                <p>This demonstrates how separately defined components can be composed together</p>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 30px;">
                    <div style="background: #f5f5f5; padding: 20px; border-radius: 8px;">
                        <h3>Pattern 1: Simple Composition</h3>
                        <p>Avatar → used by → UserProfile</p>
                        <pre style="font-size: 12px; overflow: auto;">
// UserProfile imports and uses Avatar
import Avatar from './Avatar.js';

useScope({ 'user-avatar': Avatar });

return html\`
  <user-avatar .props="\${props}">
  </user-avatar>
\`;</pre>
                    </div>
                    
                    <div style="background: #f5f5f5; padding: 20px; border-radius: 8px;">
                        <h3>Pattern 2: Multiple Components</h3>
                        <p>Card + Avatar → used by → UserProfile</p>
                        <pre style="font-size: 12px; overflow: auto;">
// UserProfile imports multiple components
import Card from './Card.js';
import Avatar from './Avatar.js';

useScope({ 
  'user-card': Card,
  'user-avatar': Avatar 
});</pre>
                    </div>
                    
                    <div style="background: #f5f5f5; padding: 20px; border-radius: 8px;">
                        <h3>Pattern 3: Deep Composition</h3>
                        <p>Multiple levels of nesting</p>
                        <pre style="font-size: 12px; overflow: auto;">
// Dashboard uses UserProfile
// UserProfile uses Card + Avatar
// Result: Dashboard → UserProfile → Card + Avatar</pre>
                    </div>
                    
                    <div style="background: #f5f5f5; padding: 20px; border-radius: 8px;">
                        <h3>Pattern 4: Conditional Rendering</h3>
                        <p>Components rendered based on state</p>
                        <pre style="font-size: 12px; overflow: auto;">
\${showProfile ? html\`
  <user-profile .props="\${props}">
  </user-profile>
\` : ''}</pre>
                    </div>
                </div>
                
                <div style="margin-top: 40px;">
                    <h2>Live Examples</h2>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                        <div style="border: 2px solid #4caf50; border-radius: 8px; padding: 20px;">
                            <h3>Simple User Card</h3>
                            <comp-simple-user id="user-card-demo"></comp-simple-user>
                        </div>
                        <div style="border: 2px solid #2196f3; border-radius: 8px; padding: 20px;">
                            <h3>Product Card</h3>
                            <comp-product id="product-card-demo"></comp-product>
                        </div>
                    </div>
                </div>
            </div>
            <script>
                // Set props after elements are created
                setTimeout(() => {
                    const userCard = document.getElementById('user-card-demo');
                    if (userCard) {
                        userCard.props = { 
                            user: {
                                name: 'Jane Doe',
                                email: 'jane@example.com',
                                bio: 'Full-stack developer who loves building with Web Components',
                                avatar: 'https://i.pravatar.cc/150?img=1'
                            }
                        };
                    }
                    
                    const productCard = document.getElementById('product-card-demo');
                    if (productCard) {
                        productCard.props = {
                            product: {
                                name: 'Smart Watch',
                                price: '199.99',
                                description: 'Track your fitness and stay connected',
                                image: 'https://picsum.photos/200/200?random=2'
                            }
                        };
                    }
                }, 100);
            </script>
    `} />;
};