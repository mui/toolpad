# Create a 3D cube component

<p class="description">You can extend Toolpad Studio with custom code components, including from external packages.</p>

You can use any package available on `npm` to extend your Toolpad Studio application. This guide will render a cube using [`@react-three/fiber`](https://www.npmjs.com/package/@react-three/fiber):

{{"component": "modules/components/DocsImage.tsx", "src": "/static/toolpad/docs/studio/how-to-guides/custom-components/cube/component.png", "alt": "Cube component", "caption": "The cube component" }}

## Creating the component

### In the Toolpad Studio editor

1. To get started creating this, add the requisite libraries to your Toolpad Studio app, using

   ```bash
   yarn add three @react-three/fiber
   ```

2. Then, hover over the component library and click on the **Create** button in the **Custom Components** section.

{{"component": "modules/components/DocsImage.tsx", "src": "/static/toolpad/docs/studio/how-to-guides/custom-components/create-custom.png", "alt": "Create custom component", "caption": "Create a custom component", "zoom": false }}

3. A dialog box appears asking you to name it. Name it "Cube".

   :::warning
   You can use any name, as long as it is unique and complies with the [rules of naming](https://react.dev/learn/your-first-component) components in React
   :::

{{"component": "modules/components/DocsImage.tsx", "src": "/static/toolpad/docs/studio/how-to-guides/custom-components/cube/display-name.png", "alt": "Name custom component", "caption": "Naming the cube component", "width": 300, "zoom": false }}

4. A snackbar appears acknowledging the successful creation of the component. A starter file is created in `toolpad/components`. Use the **Open** button to open this file in your code editor:

{{"component": "modules/components/DocsImage.tsx", "src": "/static/toolpad/docs/studio/how-to-guides/custom-components/cube/snackbar-open.png", "alt": "Open custom component", "caption": "Open the cube component", "width": 400, "zoom": false }}

### In the code editor

1. A file with some sample code for a custom component is initialised for you. Replace its content with the following code:

   ```jsx
   import * as React from 'react';
   import { Canvas, useFrame } from '@react-three/fiber';
   import { createComponent } from '@toolpad/studio/browser';

   function Box({ position, color }) {
     // This reference gives us direct access to the THREE.Mesh object
     const ref = React.useRef();
     // Hold state for hovered and clicked events
     const [hovered, hover] = React.useState(false);
     const [clicked, click] = React.useState(false);
     // Subscribe this component to the render-loop, rotate the mesh every frame
     useFrame((state, delta) => {
       if (!ref.current) return;
       ref.current.rotation.x += delta;
     });
     // Return the view, these are regular Threejs elements expressed in JSX
     return (
       <mesh
         position={position}
         ref={ref}
         scale={clicked ? 1.5 : 1}
         onClick={(event) => click(!clicked)}
         onPointerOver={(event) => hover(true)}
         onPointerOut={(event) => hover(false)}
       >
         <boxGeometry args={[1, 1, 1]} />
         <meshStandardMaterial color={color ?? 'hotpink'} />
       </mesh>
     );
   }
   interface CubeProps {
     positionX: number;
     positionY: number;
     positionZ: number;
     color: string;
   }

   function Cube({ positionX, positionY, positionZ, color }: CubeProps) {
     return (
       <Canvas>
         <ambientLight />
         <pointLight position={[10, 10, 10]} />
         <Box position={[positionX, positionY, positionZ]} color={color} />
       </Canvas>
     );
   }

   export default createComponent(Cube, {
     argTypes: {
       positionX: {
         type: 'number',
         default: 0,
       },
       positionY: {
         type: 'number',
         default: 0,
       },
       positionZ: {
         type: 'number',
         default: 0,
       },

       color: {
         type: 'string',
         default: 'orange',
       },
     },
   });
   ```

`positionX`, `positionY`, `positionZ` and `color` are the props that you will make available for binding in the Toolpad Studio editor.

2. **Cube** will now be available as a custom component in the component library:

{{"component": "modules/components/DocsImage.tsx", "src": "/static/toolpad/docs/studio/how-to-guides/custom-components/cube/in-library.png", "alt": "custom component in library", "caption": "The cube component appears in the component library", "width": 300, "zoom": false }}

## Using the component

1. Drag a cube component on the canvas. In the inspector, you'll see the `position` property as a bindable property.

{{"component": "modules/components/DocsImage.tsx", "src": "/static/toolpad/docs/studio/how-to-guides/custom-components/cube/component.gif", "alt": "Use cube with its properties", "caption": "The cube component", "indent": 1 }}

<ul style="list-style-type: none">
<li>

:::info
Look at the `@react-three/fiber` [documentation](https://docs.pmnd.rs/react-three-fiber/getting-started/introduction) for more details on components and properties you can use.
:::

<li>
</ul>
