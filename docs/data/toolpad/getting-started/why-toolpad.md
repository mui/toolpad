# Why Toolpad?

<p class="description">Explains our motivation for building Toolpad, where it differs from other tools and how it could be useful to you.</p>

## Introduction

Toolpad is a developer tool primarily for the admin applications use case. Building an admin panel (aka internal tools) can be intimidating because:

- it is not focused on frontend
- it is difficult to keep up with the fast evolving landscape of frameworks, libraries and best practices
- lots of glue code is required to display the data
- it requires connecting to multiple data sources
- security of the underlying sensitive data needs to ensured at all times
- it serves multiple stakeholders with varying needs

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

How is Toolpad different from the above tools, and why should you use it? Toolpad is a **flexible and fast** way to build a back office application. Let's see how:

### Front end UI

Toolpad works as a drag-and-drop UI builder and uses MUI's own Material UI components. Material UI has almost every component required for back-office use cases; currently, 16 of them are there in Toolpad but we are always adding more.

For more components, Toolpad supports adding any number of custom components. You can create your own by writing React code.

Drag-and-drop builder helps you assemble a quick UI and gives you a head start for the next steps.

### Consistent Design

Maintaining a consistent design language throughout a web application is crucial for a seamless user experience. Toolpad helps you achieve this by providing pre-built components that follow Material Design guidelines. This ensures your application looks consistent across all pages and screens.

Toolpad also supports adding a theme to a page, it can help with a UI that matches your brand guidelines. The components have overrides in case wish to customize them further.

### Connecting to data

Imagine you've built the front end, the next step is connecting your data. In Toolpad, you can bring your entire data from your existing backend in two ways:

- REST APIs can be easily linked to Toolpad through **HTTP queries**. This is the most common way of getting data to Toolpad
- **Custom functions** where you can write code in your own IDE to connect to any database. If there is business logic in your customer-facing application that could be useful in Toolpad; you can simply import it into Toolpad. You can reuse your database models, client libraries, and secrets. However, remember that currently only Node.js backend is supported in Toolpad.

Later we'll also support REST API like UI for graphQL, Open API, etc.

### Development Lifecycle

Toolpad ensures you have full control over your development lifecycle. Toolpad supports a local-first way of application development. Your project lives on your own file system. You can use your own IDE, version control system, deployment target, and CLI tools.

### Deployment

After building an app, you might wonder where to put it. Toolpad allows you to host your app on any platform of your choice. Currently, we don't offer cloud hosting. Instead, we suggest self-hosting like how you'd have done for your customer-facing application.

A Toolpad app is hosted like any other Node.js project. You can choose from providers like AWS, Render, Heroku, etc., without hassle.

### Collaboration and Sharing

MUI Toolpad is an ideal tool for teams as it allows collaboration with others through a shared codebase, through established practices like Git. We didn't want to reinvent the wheel and wanted to support already accepted ways of code collaboration. A Toolpad app is a set of files that can be simply put on a GitHub/GitLab repo and maintained collaboratively.

### Open-Source

MUI Toolpad is an open-source project, which follows an open-core model. It means that the core is going to remain free to use forever. We'll add paid features to support advanced use cases in the future. We won't put any artificial limits like the number of apps, data connections, components, etc.

The open-source nature of Toolpad also means that it is constantly being updated and improved by the MUI team and the community. This ensures that it remains up-to-date with the latest trends and technologies.

## Conclusion

Toolpad is a platform to build behind-the-scenes admin tools that are used for tasks like running marketing campaigns, checking daily data and stats, reporting fraud, updating user records, and more. These back office tools are more about function and less about design.

When building such an app, developers have certain expectations from the tools they use. Some prefer the old way of starting from scratch to maintain control over every detail - like if a new button needs to be added in a particular spot with a specific look. If they rely on tools like Toolpad, there might be differences in execution but rest assured, it can handle most custom scenarios efficiently.
