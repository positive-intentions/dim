// ProductCard.js - A component that composes other components properly
import Container from './Container.js';
import Avatar from './Avatar.js';

const ProductCard = ({ product }, { useScope, html }) => {
    // Register components
    useScope({
        'product-container': Container,
        'product-image': Avatar
    });
    
    return html`
        <product-container title="${product.name}" style="max-width: 300px;">
            <div style="text-align: center;">
                <product-image 
                    src="${product.image}"
                    alt="${product.name}"
                    size="120"
                    style="margin-bottom: 10px;"
                ></product-image>
                <p style="font-size: 24px; font-weight: bold; margin: 10px 0;">
                    $${product.price}
                </p>
                <p style="color: #666; margin: 10px 0;">
                    ${product.description}
                </p>
                <button style="background: #2196f3; color: white; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer;">
                    Add to Cart
                </button>
            </div>
        </product-container>
    `;
};

export default ProductCard;