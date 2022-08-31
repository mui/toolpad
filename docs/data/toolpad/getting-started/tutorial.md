# Tutorial

<p class="description">Get started building a Toolpad app!</p>

This page will guide you into creating your very first Toolpad application. We will create a "hello world" type of application that will ask for a name and print a greeting.

## Prerequisites

Make sure you have a running Toolpad instance. If you don't know how to do that, please follow the [setup instructions](/toolpad/getting-started/setup/).

## Building your first application

1. Open Toolpad by navigating to [http://localhost:3000/](http://localhost:3000/) if you went through the docker setup, or otherwise, the URL Toolpad is hosted under. You'll be presented with an overview screen with all the applications available. If you've started from a fresh instance, there should be none present.

   ![Apps overview](/static/toolpad/apps-overview.png)

1. Click "create new" and choose a name for your application in the popup, then click "create". This will create a new Toolpad application and the page will navigate to the application editor.

   ![Editor overview](/static/toolpad/editor-overview.png)

1. In the left navigation bar, you will see all the objects that are present in this application. You'll see "connections", which represent credentials needed to connect to a data source. "APIs" allow you to query your data and make it available to pages. Next to the "pages" entry click + the icon to add a new page, give it a name, and click "create". The page designer will open.

   ![Page editor](/static/toolpad/page-editor.png)

1. You are now in the page designer. You can access the components catalog by hovering over the bar on the left side containing the word "components". When the catalog folds out, grab a "TextField" and drag it into the canvas over the green box that says "insert here". When the box highlights, drop the TextField. An MUI TextField will now appear on the page canvas and the component properties editor opens. This input will be used to enter the name of the person we want to greet. In the component editor, change the name to "nameInput". We will use this name, later on, to refer to this TextField, so that we can bind properties to their value.

   ![Added TextField](/static/toolpad/add-textfield.png)

1. Open the component catalog again and drag a "Typography" component on the page. This will contain our greeting. In the component editor on the right-hand side, locate the text field for the "value" property. Try typing in this field. You'll notice the text on the screen changes. We can also make this value dynamic. To do this, click the link icon to the right of the text field to open the binding editor.

   In the binding editor, you can write any JavaScript expression. For instance, try typing the javascript string `'Hello everybody!'` and click "update binding". You'll notice that the text on the screen changes to "Hello everybody!".

   Now, change the JavaScript expression to `` `Hello ${nameInput.value}!` ``. Notice how we refer to our textField by the name "nameInput" that we set before. Now click "update binding" and close the binding editor.

   ![Added TextField](/static/toolpad/updated-binding.png)

1. Select the TextField and try typing your name. See how the Text follows?

   ![Result](/static/toolpad/result.png)

## Deploying your first application

Now that we have our first simple application, let's make sure we can use it outside of the editor. We will deploy our application under a stable URL.

1. The first thing we need to do is to create a release for our application. When you create a release, the current state of the application is captured as a snapshot and stored. This snapshot will never change, we will always be able to access this snapshot and see the state of the application at the time that we took the snapshot. To create a release, click the launch icon in the top right corner of the menu bar. In the dialog that opens, write "Initial release" in the description field and click "create". You will be directed to the release's page. Here you'll get a list of all the pages present in this release. Go ahead and click the "open page" icon to see what your released page looks like.

   ![Release](/static/toolpad/release.png)

1. You just created a versioned release of your application. Click the "deploy" button to host this version under the production URL of your page. Navigate to Toolpad home to get an overview of your application and click the "open" button on the application you just deployed. You'll be presented with an overview of the pages available in this application. Click on a page to see the production version of the application.

   Now, go back to editing your application and change the binding of the Typography component to `` `Goodbye ${state.nameInput.value}!` ``. Create another release. After you've verified that the pages in this release are working correctly, click "deploy" to make this release the production version of your application.

## Data fetching

A Toolpad aplication wouldn't be useful if you couldn't import your data into it.

1. the first step is to make a connection to your data source. The connection holds the necessary credentials. In the case of a database, this may be the connection string, or in the case of a REST API this may contain an API token. For demo purposes, we will just create a dummy connection that we can use to make public HTTP requests. To get started, click on the plus button next to "Connections" in the left menu. In the popup that opens, select the "Fetch" type and click "create". In the window that opens, give your connection a name "ourData".

   ![Create Connection](/static/toolpad/create-connection.png)

1. Now that we can connect to our data source, we can make an API endpoint for it on the Toolpad application. Click the plus button next to "Apis" in the left menu and select the "ourData" connection that we will make an API for. In the editor that opens, give it a name "ourDataApi" and in the url fill in `https://gist.githubusercontent.com/Janpot/c9d1f00be8472f2a510680b7e716a43b/raw/f001e0c3c501f5a0da35474ba4854cfc69acfd78/sample-data.json`. This contains a sample dataset for us to use. If everything went well, you will see a preview in the bottom half of the page. Click "update" to accept the parameters for this API.

   ![Create Api](/static/toolpad/create-api.png)

1. Now we need to bring this data to our page. To do this, make a new page and click the "create query state" button in the page properties. In the popup that opens, give the state a name "ourDataState" and select the API we created before. We now have the data from this API available on the page in a variable `ourDataState` and we can bind it to components on the page.

   ![Create State](/static/toolpad/create-state.png)

1. Now add a DataGrid on the page and in its properties click the link button next to "DataQuery". This will open our trusty binding editor in which you can type `ourDataState` and click "update binding". Close the binding editor to see the result.

   ![Bind Query State](/static/toolpad/bind-query-state.png)

Read our deep dive into data fetching in the [data fetching documentation](/toolpad/data-fetching/).
