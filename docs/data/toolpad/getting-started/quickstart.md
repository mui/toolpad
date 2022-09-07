# Quickstart

Get started building a Toolpad app!

<p class="description">
This page will guide you into creating your very first Toolpad application. You will create a "hello world" type of application that will ask for a name and print a greeting.
</p>

## Prerequisites

Make sure you have a running Toolpad instance.

1. Download the docker compose file

   ```sh
   curl -LO https://raw.githubusercontent.com/mui/mui-toolpad/master/docker/compose/docker-compose.yml
   ```

1. Start the docker compose services

   ```sh
   docker-compose -f docker/compose/docker-compose.yml up -d
   ```

Toolpad will be accessible under `http://localhost:3000/`.

## Building your first application

1. Open Toolpad by navigating to [http://localhost:3000/](http://localhost:3000/)

   ![Apps overview](/static/toolpad/apps-overview.png)

1. Click **CREATE NEW** and name your application. Confirm by clicking **CREATE**

   ![Toolpad overview](/static/toolpad/step-1.png)

1. Hover over **Component library** and drag DataGrid and Image components into **Canvas**

   ![Drag components](/static/toolpad/step-2.png)

   Congratulations, you are done building the UI! Now all you need to do is connect it with a data source.

1. Click anywhere inside **Canvas** (except on the components that you just added) to deselect added components

1. Locate **ADD QUERY** button inside **Inspector** and press that to start configuring our data source

   ![Add query](/static/toolpad/step-3.png)

1. This time you are going to use simple fetch datasource to query your data. Choose and press **CREATE QUERY**

   ![Fetch datasource](/static/toolpad/step-4.png)

1. Fetch some data about dogs from **https://dog.ceo/dog-api**:

   Use **https://dog.ceo/api/breeds/list/all** as a GET query **URL**

   Give a unique name to this query i.e. **dogQuery**

   ![Fetch URL](/static/toolpad/step-5.png)

1. Now because data comes in different shapes and forms you can provide a quick and convenient way to **transform response** data - **enable** option and use `return data.message` expression

   ![Transform response](/static/toolpad/step-6.png)

   In the response preview pane on the right you can see transformed data will be assigned to `dogQuery`

1. **SAVE** your changes and you will return to **Canvas**

1. Select DataGrid component by clicking on it

1. Then locate rows binding button in the **Inspector** and click to configure data binding

   ![Bind data](/static/toolpad/step-7.png)

1. Use a `dogQuery` variable available in the scope as a binding expression. Because rows property expects array type value, you first need to convert `dogQuery.data` (which is object) to array:

   ```js
   Object.entries(dogQuery.data);
   ```

   and click **UPDATE BINDING**

   ![dogQuery.data](/static/toolpad/step-8.png)

1. You have finally connected data source to your UI component!

   ![Connected data](/static/toolpad/step-9.png)

1. Make your app a bit more interactive. You want to display an image of a selected breed. Create a dynamic query which reacts to the selection inside DataGrid component

   - **ADD QUERY** -> create fetch type
   - **name** -> **imageQuery**
   - Add new parameter named **breed**

   ![Breed parameter](/static/toolpad/step-10.png)

   - Bind breed parameter value to `dataGrid.selection ? dataGrid.selection[0] : 'akita'` (grabs selected value from `dataGrid` or defaults to akita breed)

   ![Breed binding](/static/toolpad/step-11.png)

   - Then bind query **url** property to **https://dog.ceo/api/breed/${query.breed}/images/random**

   ![url binding](/static/toolpad/step-12.png)

   - Last **transform responese** using `return data.message;` and click **SAVE**

1. Next you want to display a picture of a selected breed using Image component

   - select Image component

   - bind **src** prop to `imageQuery.data` and now you can preview pictures of a selected breed

   ![Preview image](/static/toolpad/step-13.png)

   Congratulations! 🎉 You now have an app fetching data from remote source and reacting to the user input!

## Deploying your application

In order to share your application with others you will want to deploy it

1. Click **DEPLOY** button in the top navigation:

   ![Rocket button](/static/toolpad/deploy-1.png)

1. (Optional) Enter **description** of your choice

1. Click **DEPLOY** to confirm deployment

   ![Release description](/static/toolpad/deploy-2.png)

1. Your deployed app will automatically open in a new browser tab
