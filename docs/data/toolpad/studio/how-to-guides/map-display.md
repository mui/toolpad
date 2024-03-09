# Create a map component

<p class="description">You can extend Toolpad Studio with custom code components.</p>

You can create a custom component to display any geographical map, like so:

{{"component": "modules/components/DocsImage.tsx", "src": "/static/toolpad/docs/studio/how-to-guides/custom-components/map/component.png", "alt": "Map component", "caption": "The map component"}}

## Creating the component

### In the Toolpad Studio editor

1. To get started creating this, hover over the component library and click on the **Create** button in the **Custom Components** section.

{{"component": "modules/components/DocsImage.tsx", "src": "/static/toolpad/docs/studio/how-to-guides/custom-components/create-custom.png", "alt": "Create custom component", "caption": "Create a custom component", "zoom": false }}

2. A dialog box appears asking you to name it. Name it "Map".

   :::warning
   You can use any name, as long as it is unique and complies with the [rules of naming](https://react.dev/learn/your-first-component) components in React
   :::

{{"component": "modules/components/DocsImage.tsx", "src": "/static/toolpad/docs/studio/how-to-guides/custom-components/map/display-name.png", "alt": "Name custom component", "caption": "Naming a custom component", "zoom": false, "width": 300 }}

3. A snackbar appears acknowledging the successful creation of the component. A starter file is created in `toolpad/components`. Use the **Open** button to open this file in your code editor:

{{"component": "modules/components/DocsImage.tsx", "src": "/static/toolpad/docs/studio/how-to-guides/custom-components/map/snackbar-open.png", "alt": "Open custom component", "caption": "Open the custom component", "zoom": false, "width": 400 }}

### In the code editor

1. A file with some sample code for a custom component is initialised for you. Replace its content with the following code:

```tsx
import * as React from 'react';
import { createComponent } from '@toolpad/studio/browser';
import * as L from 'leaflet';

export interface LeafletProps {
  lat: number;
  long: number;
  zoom: number;
}

async function createLeafletStyles(doc) {
  let styles = doc.getElementById('leaflet-css');
  if (styles) {
    return;
  }
  const res = await fetch('https://esm.sh/leaflet/dist/leaflet.css');
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: ${res.statusText}`);
  }
  const css = await res.text();
  styles = doc.createElement('style');
  styles.id = 'leaflet-css';
  styles.appendChild(doc.createTextNode(css));
  doc.head.appendChild(styles);
}

function Leaflet({ lat, long, zoom }: LeafletProps) {
  const root: any = React.useRef(null);
  const mapRef = React.useRef<any>();
  const [stylesInitialized, setStylesIitialized] = React.useState(false);
  const [error, setError] = React.useState<Error>();

  React.useEffect(() => {
    const doc = root.current.ownerDocument;
    createLeafletStyles(doc).then(
      () => setStylesIitialized(true),
      (err) => setError(err),
    );
  }, []);

  React.useEffect(() => {
    if (!mapRef.current && stylesInitialized) {
      mapRef.current = L.map(root.current);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap',
      }).addTo(mapRef.current);
    }

    if (mapRef.current) {
      mapRef.current.setView([lat, long], zoom);
    }
  }, [stylesInitialized, lat, long, zoom]);

  return (
    <div style={{ height: 400, width: 600 }}>
      {error ? (
        error.message
      ) : (
        <div style={{ width: '100%', height: '100%' }} ref={root} />
      )}
    </div>
  );
}

export default createComponent(Leaflet, {
  argTypes: {
    lat: {
      type: 'number',
      defaultValue: 51.505,
    },
    long: {
      type: 'number',
      defaultValue: -0.09,
    },
    zoom: {
      type: 'number',
      defaultValue: 13,
    },
  },
});
```

`label` and `value` are the props that you will make available for binding in the Toolpad Studio editor.

2. **MapDisplay** is now available as a custom component in the component library:

{{"component": "modules/components/DocsImage.tsx", "src": "/static/toolpad/docs/studio/how-to-guides/custom-components/map/in-library.png", "alt": "map component in library", "caption": "The map component appears in the component library", "width": 300, "zoom": false }}

## Using the component

1. Drag two of the map components on the canvas and select the first one. In the inspector, you'll see both the `label` and `value` properties available as bindable properties.

{{"component": "modules/components/DocsImage.tsx", "src": "/static/toolpad/docs/studio/how-to-guides/custom-components/map/components.png", "alt": "Use map components with numbers and labels", "caption": "Using the map component", "indent": 1 }}
