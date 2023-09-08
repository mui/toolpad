# Why Toolpad?

<p class="description">This doc explains our motivation for building Toolpad, where it differs from other tools and how it could be useful to you.</p>

## Introduction

Toolpad is primarily designed as an application framework for internal tool development. Such applications are often built by teams with access to fewer frontend development resources. These teams face challenges such as:

- Having to keep up with the fast evolving landscape of libraries, frameworks and best practices.
- Lots of glue code is required to get backend data to the browser and hooked up to data displaying components.
- As backends evolve, the internal applications need to evolve with them with minimal amount of maintenance required.
- Lesser focus on quality assurance, usually lead to higher chances of failure.

## TLDR

- **Integrates well with your existing code**. You can reuse your database models, client libraries, secrets, bespoke components
- Integrates well with your **development lifecycle.** Your project lives on your own file system. You can use your own IDE, version control system, deployment target, CLI tools
- Comes with a **Drag and drop builder** to simplify UI building
- Sets **Healthy UI constraints** that prevent common pitfalls and anti-patterns
- Lets you maintain a **single source of truth** for all business logic
- **Less boilerplate** so you can focus on the important parts of the app

## Market overview

After reviewing multiple approaches and tools, we noticed that there are a few recurring core problem areas that needed to be addressed:

### The challenge of codebase fragmentation and duplication

Frequently, developers invest valuable time in hunting down particular versions of business logic and then maintaining them at multiple places. When working with external tools, code duplication can often arise as consequences of design decisions. Not having a unified reference point within a codebase compromises its scalability, ease of maintenance and debugging.

### Loss of control with external tools

When working with external tools, developers often forfeit their autonomy and are constrained by the choices offered by the tool. Developers typically derive a sense of ownership and responsibility when they oversee the entire process, encompassing integrations, deployment, and version control. However, when a black-box element intervenes, control often shifts away.

### Trade-off between speed and customization

Typically, depending on factors such as project size, time constraints, available resources, and scope, developers are compelled to strike a balance between speed and customization. Every business wants features to be delivered at speed, but being able to customize later keeps the project open to come what may. While both aspects are significant, we believe that an architecturally well-designed tool empowers you to attain both objectives simultaneously.

### Trust and Safety

Internal tools have access to highly sensitive data, data that every organization solemnly pledges to safeguard. Despite the stringent security measures in place, data breaches remain a prevalent occurrence. Organizations rigorously engage in due diligence and compliance assessments before placing trust in a vendor. The security of the underlying data remains an exceptionally vital aspect that cannot be underestimated.

## Toolpad

We think addressing above mentioned problems can lead to a better developer experience. Let' see how Toolpad solves these:

### Front end UI

Toolpad works as a drag-and-drop UI builder and uses MUI's own Material UI components. Material UI has almost every component required for internal use cases; currently, Toolpad supports 16 of them and work on supporting more is continuously ongoing.

For more components, Toolpad supports adding any number of custom components. You can create your own by writing React code. Drag-and-drop builder helps you assemble a quick UI and gives you a head start for the next steps. It ensures **speed and customization**.

### Connecting to data

Toolpad supports connecting to data in two ways:

- REST APIs can be easily linked to Toolpad through _HTTP queries_. This is the most common way of getting data to Toolpad.
- _Custom functions_ where you can write code in your own IDE to connect to any data source. You can reuse your existing scripts, business logic, database models, client libraries, and secrets files. These allow you to have a single, shared codebase for internal or external applications meaning **no duplication or fragmentation**.

### Development Lifecycle

Toolpad ensures you have **full control** over your development lifecycle. Toolpad supports a local-first way of application development. Your project lives on your own file system. You can use your own IDE, version control system, deployment target, and CLI tools.

You can build your app and deploy it like any other Node.js app, to any hosting provider of your choice (AWS, Render, Railway, Heroku etc.). Toolpad does not lock you in to its own cloud hosting.

### Collaboration and Sharing

A Toolpad app is a set of files that can be simply added to a GitHub/GitLab repo and maintained collaboratively. We didn't want to reinvent the wheel when it comes to collaboration for engineers. Having a private code repository is one of the essential practices to ensure **safety** of user data.

<!---
### Consistent Design

Maintaining a consistent design language throughout a web application is crucial for a seamless user experience. Toolpad helps you achieve this by providing pre-built components that follow Material Design guidelines.

Toolpad also supports adding a theme to a page which can help with a UI that matches your brand guidelines. The components have individual overrides as well, in case you wish to customize them further.


### Open-Source

MUI Toolpad is an open-source project, which follows an open-core model. It means that the core is going to remain free to use forever. In the future, we may add add paid features to support advanced use cases. However, we will not attempt to monetise the project via artificial constraints on usage, such as limits on the number of connections, components or queries.

The open-source nature of Toolpad also means that it is constantly being updated and improved by the MUI team and the community.
-->

## Conclusion

Toolpad is a platform to build internal tools that are used for tasks like running marketing campaigns, data analysis, monitoring fraud, updating user data, and more. It aims to reduce the overhead associated with frontend development by providing visual editors and reducing the amount of boilerplate required to bring data on the page. With basic frontend knowledge you can build an app in just one sitting.
