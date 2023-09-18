# Why Toolpad?

<p class="description">Explains our motivation for building Toolpad, where it differs from other tools and how it could be useful to you.</p>

## TL;DR

- **Higher-level API** . Toolpad operates at a higher abstraction level than Material UI. It sets healthy UI constraints that prevent common pitfalls and anti-patterns
- **Drag-and-drop builder**. Toolpad comes with a drag-and-drop builder to simplify UI building. The Drag-and-drop state is persisted in a yaml file so you can fully control the visual output with code
- **Less boilerplate** so you can focus on the important parts of the app
- **Run alongside existing code**. It integrates well with your existing code. You can use your database models, client libraries, secrets, and bespoke components directly
- **Single source of truth**. Because Toolpad runs alongside your existing code, it lets you maintain a single source of truth for all business logic
- **Integrates well with your development lifecycle**. Your project lives on your own file system. You can use your own IDE, version control system, deployment target, CLI tools

## The problems

After reviewing multiple approaches and tools, we noticed that there are a few recurring core problem areas that needed to be addressed:

### Codebase fragmentation and duplication

Frequently, developers invest valuable time in hunting down particular versions of business logic and then maintaining them at multiple places. When working with external tools, code duplication can often arise as consequences of design decisions. Not having a unified reference point within a codebase compromises its scalability, ease of maintenance and debugging.

### Loss of control with external tools

When working with external tools, developers often forfeit their autonomy and are constrained by the choices offered by the tool. Developers typically derive a sense of ownership and responsibility when they oversee the entire process, encompassing integrations, deployment, and version control. However, when a black-box element intervenes, control often shifts away.

### Trade-off between speed and customization

Typically, depending on factors such as project size, time constraints, available resources, and scope, developers are compelled to strike a balance between speed and customization. Every business wants features to be delivered at speed, but being able to customize later keeps the project open to come what may. While both aspects are significant, we believe that an architecturally well-designed tool empowers you to attain both objectives simultaneously.

### Trust and safety

Internal tools have access to highly sensitive data—data that every organization solemnly pledges to safeguard. Despite stringent security measures, data breaches remain a prevalent occurrence. Organizations rigorously engage in due diligence and compliance assessments before placing trust in a vendor. The security of the underlying data is critical, and the seriousness of this matter can't be overstated.

## How Toolpad fits in

Addressing all the aforementioned problems leads to a better developer experience. Toolpad solves them in the following ways:

### Front-end UI

Toolpad works as a drag-and-drop UI builder and uses MUI's own Material UI components. Material UI includes all of the foundational components required for internal use cases. Toolpad currently supports 16 of them, and we're adding more every day.

For other use cases, Toolpad supports adding any number of custom React components. The drag-and-drop builder enables you to quickly assemble a minimum viable UI that's endlessly customizable, ensuring the best of both worlds: speed _and_ flexibility.

### Connecting to data

Toolpad supports connecting to data in two ways:

1. Link REST APIs to Toolpad through HTTP queries—this is the most common way of getting data to Toolpad.
2. Write custom functions in your own IDE to connect to any data source. You can reuse your existing scripts, business logic, database models, client libraries, and secrets. These allow you to have a single, shared codebase for internal or external applications—meaning **no duplication or fragmentation**.

### Development lifecycle

Toolpad gives you **full control** over your app's development lifecycle. Toolpad is "local-first": your project lives on your own file system, so you can use your own IDE, version control system, deployment target, and CLI tools.

Like any Node.js app, you can self-host a Toolpad app on your own server or any hosting provider of your choice (such as AWS, Render, Railway, or Heroku). Toolpad does not lock you in to its own cloud hosting.

### Collaboration and sharing

The Toolpad application configuration is stored in yaml files that can be checked into git or any version control tool of your choice and maintained collaboratively. We didn't want to reinvent the wheel when it comes to collaboration for engineers. Having a private code repository is one of the essential practices to ensure that user data remains secure.
