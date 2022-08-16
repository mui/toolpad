import invariant from 'invariant';
import { AppDom } from '../appDom';

export default {
  up(dom: AppDom) {
    invariant(!dom.version || dom.version === 0, 'Can only migrate dom of version 0');
    return dom;
  },
};
