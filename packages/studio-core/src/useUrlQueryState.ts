import * as React from 'react';

function getLocationUrl() {
  return new URL((window.top ?? window).location.href);
}

export default function useUrlQueryState(
  param: string,
  defaultValue: string = '',
): [string, React.Dispatch<React.SetStateAction<string>>] {
  const [value, setValue] = React.useState(defaultValue);
  const isInitialized = React.useRef(false);

  React.useEffect(() => {
    const url = getLocationUrl();
    const currentUrlValue = url.searchParams.get(param);
    if (isInitialized.current) {
      if (currentUrlValue !== value) {
        if (currentUrlValue === defaultValue) {
          url.searchParams.delete(param);
        } else {
          url.searchParams.set(param, value);
        }
        window.history.pushState(null, '', String(url));
      }
    } else {
      if (typeof currentUrlValue === 'string') {
        setValue(currentUrlValue);
      }
      isInitialized.current = true;
    }
  }, [param, value, defaultValue]);

  React.useEffect(() => {
    const handlePopState = () => {
      const url = getLocationUrl();
      const urlQueryValue = url.searchParams.get(param);
      setValue(urlQueryValue ?? defaultValue);
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [param, defaultValue]);

  return [value, setValue];
}
