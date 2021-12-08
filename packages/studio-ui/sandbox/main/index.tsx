import { Channel } from './channel.js';
import { HotModulesProvider } from './HotModulesProvider.js';

declare global {
  interface Window {
    __HMR?: HotModulesProvider;
  }
}

const channel = new Channel(window.parent);

const hotModulesProvider = new HotModulesProvider(channel);
// eslint-disable-next-line no-underscore-dangle
window.__HMR = hotModulesProvider;
hotModulesProvider.start();
