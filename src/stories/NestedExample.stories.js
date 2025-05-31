import React from 'react';
import { WebComponent, HTMLStory } from './utils/StoryWrapper.js';
import { define } from '../core/dim.js';
import NestedExample from './components/NestedExample.js';
import ComponentA from './components/SeparateA.js';

// Define the components
define({ tag: 'nested-example', component: NestedExample });
define({ tag: 'separate-root', component: ComponentA });

export default {
    title: 'Example/NestedRendering',
    parameters: {
        layout: 'centered',
    },
};

export const InlineDefinition = () => {
    return <WebComponent tag="nested-example" />;
};

export const SeparateDefinition = () => {
    return <WebComponent tag="separate-root" props={{ message: 'Components in separate files' }} />;
};

export const ComparisonView = () => {
    return <HTMLStory html={`
        <div style="display: flex; gap: 40px; width: 1200px;">
            <div style="flex: 1;">
                <h2>Inline Definition</h2>
                <p>Components defined inside parent's render function</p>
                <nested-example></nested-example>
            </div>
            <div style="flex: 1;">
                <h2>Separate Files</h2>
                <p>Each component in its own file, imported and used</p>
                <separate-root message="Hello!"></separate-root>
            </div>
        </div>
    `} />;
};