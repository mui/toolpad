# Why Toolpad?

<p class="description">Explains our motivation for building Toolpad, where it differs from other tools and how it could be useful to you.</p>

## Introduction

Toolpad is primarily designed as an application framework for internal tool development. Such application are often built by teams with access to fewer frontend development resources. These teams face challenges such as:

- Having to keep up with the fast evolving landscape of libraries, frameworks and best practices.
- Lots of glue code is required to get backend data to the browser and hooked up to data displaying components.
- As backends evolve, the internal applications need to evolve with them with minimal amount of maintenance required.
- These applications typically don't undergo the same quality assurance processes as the external application.

Like any application, there are multiple points of failure that can lead to a sub-optimal user experience for end users (generally operations, finance, marketing teams). Since these don't go through rigorous quality assurance, failure chances are usually higher.

MUI Toolpad aims to reduce the overhead associated with frontend development by providing visual editors and reducing the amount of boilerplate required to bring data on the page. With basic frontend knowledge you can build an app in just one sitting. On this page, we'll try to address your concerns by covering all aspects of building an admin panel. This shall help you evaluate if Toolpad is the right product for you.

## TLDR

- **Integrates well with your existing code**. You can reuse your database models, client libraries, secrets, bespoke components
- Integrates well with your **development lifecycle.** Your project lives on your own file system. You can use your own IDE, version control system, deployment target, CLI tools
- Comes with a **Drag and drop builder** to simplify UI building
- Sets **Healthy UI constraints** that prevent common pitfalls and anti-patterns
- Lets you maintain a **single source of truth** for all business logic
- **Less boilerplate** so you can focus on the important parts of the app

## Admin builders market overview

The main problem with the tools currently in the Node.js and TypeScript ecosystem is that they require a major tradeoff between flexibility and speed. For a back office application developer, the backend and the database schema is an area of comfort. What's relatively challenging is building the UI and having a reasonable UX that can show the required data in a readable and editable format. And that's where all the admin builders come into the picture. If we closely look at the market, we can divide them into the following categories:

### Fast development, less flexibility

Most modern internal tool builders in the market fall into this category. Products like Retool, Appsmith act like a SaaS and provide a UI for rapid application development. The apps can be either hosted by you or them. They are excellent products for someone who's looking to build fast. The caveats are that you can't use your IDE, your existing codebase, or logic, and it can cost a lot as you scale.

### Moderate development speed, moderate flexibility

Products like airplane.dev, interval.com fall under this category. They have APIs for all admin use cases; while this can be great for those who enjoy writing code, it is a bit too much as adding a component also requires writing code. Their main advantage over previous category is that they store their configuration in local code files. This puts more control over the development lifecycle back in the developer's hands. Users can version control, deploy, and use any IDE they want.

### Slow development speed, more flexibility

Products like react admin, refine.dev fall in this category, they are all code and have APIs for everything to build an admin panel from scratch. They don't support cloud hosting and are a relatively cheaper alternative.

We'll do a detailed comparison with these tools in the future.

## Toolpad

How is Toolpad different from the above tools, and why should you use it? Toolpad is a **flexible and fast** way to build a internal tool. Let's see how:

### Front end UI

Toolpad works as a drag-and-drop UI builder and uses MUI's own Material UI components. Material UI has almost every component required for internal use cases; currently, Toolpad supports 16 of them and work on supporting more is continuously ongoing.

For more components, Toolpad supports adding any number of custom components. You can create your own by writing React code.

Drag-and-drop builder helps you assemble a quick UI and gives you a head start for the next steps.

### Consistent Design

Maintaining a consistent design language throughout a web application is crucial for a seamless user experience. Toolpad helps you achieve this by providing pre-built components that follow Material Design guidelines.

Toolpad also supports adding a theme to a page which can help with a UI that matches your brand guidelines. The components have individual overrides as well, in case you wish to customize them further.

### Connecting to data

Once you've built the front end, the next step is connecting to your data. In Toolpad, you can bring data from your existing backend in two ways:

- REST APIs can be easily linked to Toolpad through **HTTP queries**. This is the most common way of getting data to Toolpad.
- **Custom functions** where you can write code in your own IDE to connect to any data source. You can reuse your existing scripts, business logic, database models, client libraries, and secrets files. However, remember that currently, Toolpad only supports Node.js functions

Later we'll also support REST API like UI for graphQL, Open API, etc.

### Development Lifecycle

Toolpad ensures you have full control over your development lifecycle. Toolpad supports a local-first way of application development. Your project lives on your own file system. You can use your own IDE, version control system, deployment target, and CLI tools.

### Deployment

You can build your app and deploy it like any other Node.js app, to any hosting provider of your choice (AWS, Render, Railway, Heroku etc.). Toolpad does not lock you in to its own cloud hosting.

### Collaboration and Sharing

A Toolpad app is a set of files that can be simply added to a GitHub/GitLab repo and maintained collaboratively. We didn't want to reinvent the wheel when it comes to collaboration for engineers.

### Open-Source

MUI Toolpad is an open-source project, which follows an open-core model. It means that the core is going to remain free to use forever. In the future, we may add add paid features to support advanced use cases. However, we will not attempt to monetise the project via artificial constraints on usage, such as limits on the number of connections, components or queries.

The open-source nature of Toolpad also means that it is constantly being updated and improved by the MUI team and the community.

## Conclusion

Toolpad is a platform to build internal tools that are used for tasks like running marketing campaigns, data analysis, monitoring fraud, updating user data, and more. These tools often prioritise function over form.
