import dynamic from 'next/dynamic';

// react-json-view uses `document` in the top-level scope, so can't be used in SSR context
export default dynamic(() => import('react-json-view'), { ssr: false });
