# Quickstart

<p class="description">Learn the fundamentals of building with Toolpad by creating and deploying a simple application.</p>

This guide will walk you through the process of creating a basic Toolpad application.
You'll use the MUI X DataGrid component to display a list of dog breeds from the [Dog API](https://dog.ceo/dog-api/).
When you click on the name of a breed, its photo will be displayed using the Material UI Image component.

## Purpose

This Quickstart guide is intended to introduce you to the fundamentals of building with Toolpad.
By the end, you should be able to:

- set up a new Toolpad app
- navigate through your workspace
- add components, data sources, and queries to an app
- bind data sources and components
- deploy a Toolpad app

## Prerequisites

This guide assumes that you have [Docker](https://www.docker.com/) installed on your machine.

Make sure you have a running Toolpad instance.

1. Download the docker compose file

   ```sh
   curl -LO https://raw.githubusercontent.com/mui/mui-toolpad/master/docker/compose/docker-compose.yml
   ```

1. Start the docker compose services

   ```sh
   docker-compose -f docker-compose.yml up -d
   ```

Toolpad will be accessible under `http://localhost:3000/`.

## Building your first application

### Create a new app

1. Open Toolpad by navigating to [http://localhost:3000/](http://localhost:3000/). It should look like this:

   <img src="/static/toolpad/docs/quickstart/apps-overview.png" alt="Apps overview" width="1512px" />

1. Click **CREATE NEW** and name your application. Confirm by clicking **CREATE**. You'll then be taken to the workspace for your new app, which looks like this:

   <img src="/static/toolpad/docs/quickstart/step-1.png" alt="Toolpad overview" width="1512px" />

### Assemble the UI

1. Hover over **Component library** and drag DataGrid and Image components into **Canvas**

   <img src="/static/toolpad/docs/quickstart/step-2.png" alt="Drag components" width="1512px" />

   Congratulations, you are done building the UI! Now all you need to do is connect it with a data source.

1. Click anywhere inside **Canvas** (except on the components that you just added) to deselect added components

1. Locate **ADD QUERY** button inside **Inspector** and press that to start configuring our data source

   <img src="/static/toolpad/docs/quickstart/step-3.png" alt="Add query" width="284px" />

1. This time you are going to use simple fetch datasource to query your data. Choose and press **CREATE QUERY**

   <img src="/static/toolpad/docs/quickstart/step-4.png" alt="Fetch datasource" width="590px" />

1. Fetch some data about dogs from `https://dog.ceo/dog-api`:

   Use `https://dog.ceo/api/breeds/list/all` as a GET query **URL**

   Give a unique name to this query i.e. **dogQuery**

   <img src="/static/toolpad/docs/quickstart/step-5.png" alt="Fetch URL" width="1441px" />

1. Now because data comes in different shapes and forms you can provide a quick and convenient way to **transform response** data - **enable** option and use `return data.message` expression

   <img src="/static/toolpad/docs/quickstart/step-6.png" alt="Transform response" width="698px" />

   In the response preview pane on the right you can see transformed data will be assigned to `dogQuery`

1. **SAVE** your changes and you will return to **Canvas**

1. Select DataGrid component by clicking on it

1. Then locate rows binding button in the **Inspector** and click to configure data binding

   <img src="/static/toolpad/docs/quickstart/step-7.png" alt="Bind data" width="295px" />

1. Use a `dogQuery` variable available in the scope as a binding expression. Because rows property expects array type value, you first need to convert `dogQuery.data` (which is object) to array:

   ```js
   Object.entries(dogQuery.data);
   ```

   and click **UPDATE BINDING**

   <img src="/static/toolpad/docs/quickstart/step-8.png" alt="dogQuery.data" width="1192px" />

1. You have finally connected data source to your UI component!

   <img src="/static/toolpad/docs/quickstart/step-9.png" alt="Connected data" width="1512px" />

1. You can make your app a bit more interactive by displaying an image of a selected breed. Create a dynamic query which reacts to the selection inside DataGrid component

   - **ADD QUERY** -> create fetch type
   - **name** -> **imageQuery**
   - Add new parameter named **breed**

   <img src="/static/toolpad/docs/quickstart/step-10.png" alt="Breed parameter" width="707px" />

   - Bind breed parameter value to `dataGrid.selection ? dataGrid.selection[0] : 'akita'` (grabs selected value from `dataGrid` or defaults to akita breed)

   <img src="/static/toolpad/docs/quickstart/step-11.png" alt="Breed binding" width="1191px" />

   - Then bind query **url** property to `https://dog.ceo/api/breed/${parameters.breed}/images/random`

   <img src="/static/toolpad/docs/quickstart/step-12.png" alt="url binding" width="1191px" />

   - Last **transform responese** using `return data.message;` and click **SAVE**

1. Next you want to display a picture of a selected breed using Image component

   - select Image component

   - bind **src** prop to `imageQuery.data` and now you can preview pictures of a selected breed

   <img src="/static/toolpad/docs/quickstart/step-13.png" alt="Preview image" width="1511px" />

   Congratulations! 🎉 You now have an app fetching data from remote source and reacting to the user input!

## Deploying your application

In order to share your application with others you will want to deploy it

1. Click **DEPLOY** button in the top navigation:

   <img src="/static/toolpad/docs/quickstart/deploy-1.png" alt="Rocket button" width="212px" />

1. (Optional) Enter **description** of your choice

1. Click **DEPLOY** to confirm.

   <img src="/static/toolpad/docs/quickstart/deploy-2.png" alt="Deploy description" width="591px" />

Once deployed, the app will automatically open in a new browser tab.
