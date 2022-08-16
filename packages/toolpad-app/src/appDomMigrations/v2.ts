import invariant from 'invariant';
import { AppDom } from '../appDom';

export default {
  up(dom: AppDom) {
    invariant(dom.version === 1, 'Can only migrate dom of version 1');
    return dom;
  },
  down(dom: AppDom) {
    invariant(dom.version === 2, 'Can only migrate dom of version 2');
    return dom;
  },
};
