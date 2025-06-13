import React from "react";
import "./components/ViewTransitionsGallery.js";
import "./components/SimpleGallery.js";
import "./components/NavigationExample.js";

export default {
  title: "useTransition()",
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: `
# 🖼️ View Transitions Gallery

A beautiful image gallery demonstrating smooth sliding animations and view transitions using the Dim Framework.

## 🎯 Features

- **Smooth Sliding Animations** - CSS transitions with cubic-bezier easing
- **Multiple Navigation Methods** - Arrow keys, thumbnails, dots, and buttons
- **Auto-play Functionality** - Automatic slideshow with 4-second intervals
- **Responsive Design** - Adapts to different screen sizes
- **Touch-friendly** - Optimized for mobile interaction
- **Loading States** - Prevents rapid clicks during transitions

## 🚀 Animation Techniques

### CSS Transitions
- Uses \`transform: translateX()\` for smooth horizontal sliding
- \`cubic-bezier(0.4, 0, 0.2, 1)\` for natural easing
- Opacity transitions for fade effects

### Performance Optimizations
- Uses \`transform\` and \`opacity\` for GPU acceleration
- Prevents animation overlaps with transition state management
- Lazy loading for images

## 🎨 Interaction States

- **Hover Effects** - Scale and opacity changes on interactive elements
- **Active States** - Visual feedback for current selection
- **Disabled States** - Prevents actions during transitions
- **Loading States** - Smooth transitions between images

## 📱 Responsive Behavior

- Thumbnail grid adapts to screen width
- Touch-friendly button sizes on mobile
- Optimized image dimensions for different viewports
        `
      }
    }
  },
  tags: ["autodocs"],
};

export const ImageGallery = {
  render: () => React.createElement('view-transitions-gallery'),
  name: "Image Gallery with Sliding Transitions",
  parameters: {
    docs: {
      description: {
        story: `
A complete image gallery with smooth sliding animations. Features include:

- **Navigation**: Use arrow buttons, click thumbnails, or indicator dots
- **Auto-play**: Automatically advances every 4 seconds
- **Smooth Transitions**: CSS-powered sliding animations
- **Responsive**: Works on desktop and mobile devices

The gallery uses CSS transforms and transitions for smooth animations, with state management to prevent rapid-fire clicks during transitions.
        `
      }
    }
  }
};

export const AutomaticTransitions = {
  render: () => React.createElement('simple-gallery'),
  name: "🚀 Simple Automatic Transitions",
  parameters: {
    docs: {
      description: {
        story: `
**Framework Magic!** This gallery uses the new automatic view transitions feature.

### How it works:
1. Just add \`transitionId\` prop to any component
2. When the ID changes, transitions happen automatically
3. Direction is auto-calculated based on ID comparison
4. No manual CSS classes or state management needed!

### Example Syntax:
\`\`\`html
<simple-image 
  transitionId="\${currentIndex}"
  transitionDuration="500"
  src="\${image.src}"
  title="\${image.title}"
></simple-image>
\`\`\`

The framework automatically handles:
- Transition detection
- Direction calculation (left/right)
- CSS class application
- Wrapper elements
- Animation timing
        `
      }
    }
  }
};

export const PageNavigation = {
  render: () => React.createElement('navigation-example'),
  name: "🔥 Page Navigation Transitions",
  parameters: {
    docs: {
      description: {
        story: `
**Complex Navigation Made Simple!** This demonstrates automatic view transitions for multi-page navigation.

### Features Demonstrated:
- **Multi-page navigation** with automatic sliding
- **Smart direction detection** based on page order
- **Navigation history** with breadcrumb tracking
- **Responsive design** that works on mobile
- **Auto-advance demo** cycling through pages

### Framework Magic:
\`\`\`html
<page-content 
  transitionId="\${currentPage}"
  transitionDuration="600"
  pageData="\${JSON.stringify(pages[currentPage])}"
></page-content>
\`\`\`

### Automatic Behaviors:
- 🎯 **Direction Detection**: Slides left/right based on page order
- ⚡ **Smooth Transitions**: 600ms sliding animations
- 🔄 **History Tracking**: Breadcrumb navigation
- 📱 **Mobile Responsive**: Touch-friendly navigation
- 🎨 **Auto-styling**: No manual CSS classes needed

### Complex Navigation:
The example also includes a nested navigation component showing how view transitions work with:
- Sidebar navigation
- Sub-page routing
- Nested transition IDs (\`section-subpage\`)
- Multi-level content transitions

Perfect for dashboards, admin panels, and complex applications!
        `
      }
    }
  }
};

export const AdvancedNavigation = {
  render: () => React.createElement('advanced-navigation'),
  name: "🏗️ Nested Navigation",
  parameters: {
    docs: {
      description: {
        story: `
**Advanced Navigation Patterns** - Demonstrates nested transitions with complex routing.

### Features:
- **Sidebar + Sub-navigation** layout
- **Nested transition IDs** (e.g., \`dashboard-overview\`)
- **Two-level routing** with automatic transitions
- **State coordination** between sections and sub-pages

### Transition ID Strategy:
\`\`\`html
<nested-content 
  transitionId="\${currentSection}-\${currentSubPage}"
  transitionDuration="400"
></nested-content>
\`\`\`

This creates unique IDs like:
- \`dashboard-overview\`
- \`dashboard-analytics\`
- \`users-list\`
- \`settings-security\`

The framework automatically determines direction based on the combined ID comparison!
        `
      }
    }
  }
};

export const AnimationShowcase = {
  render: () => React.createElement('view-transitions-gallery'),
  name: "Manual View Transitions (Advanced)",
  parameters: {
    docs: {
      description: {
        story: `
This story shows the manual approach using the \`useViewTransition\` hook directly.

### Manual Hook Usage:
\`\`\`javascript
const transition = useViewTransition(currentIndex.toString(), {
  duration: 500,
  autoDirection: true
});
\`\`\`

### CSS Animations Used:
- \`transform: translateX()\` for slide transitions
- \`opacity\` changes for fade effects
- \`scale()\` transforms for hover states
- \`cubic-bezier\` easing for natural motion

### Performance Considerations:
- GPU-accelerated properties (\`transform\`, \`opacity\`)
- Transition state management prevents animation conflicts
- Efficient re-renders with useState hooks

### User Experience:
- Visual feedback for all interactive elements
- Disabled states during transitions
- Auto-play with manual override
- Multiple navigation methods for accessibility
        `
      }
    }
  }
};