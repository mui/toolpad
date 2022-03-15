# Getting started

This page will guide you into creating your very first MUI Studio application. We will create an application that will ask for a name and print a greeting.

## Prerequisitos

Make sure have a running MUI Studio instance. If you don't know how to do that, please follow the [setup instructions](./setup.md)

## building your first application

1. Open MUI Studio by navigating to [http://localhost:3000/](http://localhost:3000/) if you went through the docker setup, or otherwise the url MUI Studio is hosted under. You'll be presented with an overview screen with all the applications available. If you've started from a fresh instance, there should be none present.

   <!-- TODO: screenshot "apps overview" -->

1. Click "create new" and choose a name for your application in the popup, then click "create". This will create a new MUI Studio application and the page will navigate to the application editor.

   <!-- TODO: screenshot "editor overview" -->

1. In the left navigation bar you will see all the objects that are present in this application. You'll see "connections", which represent credentials needed to connect to a datasource. "apis" allow you to query your data and make it available to pages. Next to the "pages" entry click + the icon to add a new page, give it a name and click "create". The page designer will open.

   <!-- TODO: screenshot "page designer" -->

1. You are now in the page designer. You can access the components catalog by hovering the bar on the left side containing the word "components". When the catalog folds out, grab a "TextField" and drag into the canvas over the green box that says "insert here". When the box highlights, drop the TextField. An MUI TextField will now appear on the page canvas and the component properties editor opens. This input will be used to enter the name of the person we want to greet. In the component editor, change the name to "nameInput". We will use this name later on to refer to this TextField, so that we can bind properties to its value.

   <!-- TODO: screenshot "page + textfield + component editor with name update" -->

1. open the component catalog again and drag a "Typography" component on the page. This will contain our greeting.

## Deploying your first application
