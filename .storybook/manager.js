import { addons } from '@storybook/manager-api';
import customTheme from './customTheme';

addons.setConfig({
  theme: customTheme,
  sidebar: {
    showRoots: true,
  },
  // Set the initial active story to the tutorial
  initialActive: 'getting-started-tutorial--interactive-tutorial',
  panel: {
    showPanel: false,
  },
  bottomPanelHeight: 0,
});