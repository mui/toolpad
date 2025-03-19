# Why Toolpad Studio?

:::warning
Toolpad Studio has been deprecated. Please use [Toolpad Core](/toolpad/) instead.
:::

<p class="description">Learn how Toolpad Studio approaches building internal tools, and how it can be useful to you.</p>

## TL;DR

- **Higher-level API**. Toolpad Studio operates at a higher abstraction level than Material UI. It sets healthy UI constraints that prevent common pitfalls and anti-patterns.
- **Drag-and-drop builder**. Toolpad Studio comes with a drag-and-drop builder to simplify UI building. The builder saves the UI as a YAML file, so you can even modify and version the visual output on your file system.
- **Less boilerplate** so you can focus on the essential parts of the app.
- **Run alongside existing code**. Toolpad Studio integrates well with your existing code. You can use your database models, client libraries, secrets, and bespoke components directly.
- **Single source of truth**. Because Toolpad Studio runs alongside your existing code, it lets you maintain a single source of truth for all business logic.
- **Integrates well with your development lifecycle**. Your project lives on your file system. You can use your own IDE, version control system, deployment target, CLI tools.

## Limitations with pro-code tools

The key problems most pro-code tools have relative to Toolpad Studio:

### Slower delivery speed

Every organization wants to achieve fast delivery but in order to accommodate various use cases, you are pushed to choose flexible pro-code solutions.

This flexibility comes at the cost of more **boilerplate** code.
To connect backend data to the browser and set up data-display components, a substantial amount of boilerplate HTML, CSS, and JavaScript glue code is often required.
As the use cases repeat themselves, you create abstractions but their maintenance burden quickly grows.

Wouldn't it be great if you could use a tool that abstracts the repetitive parts of creating internal tools?

### No direct manipulation of objects

By the definition of a pro-code tool, you write code in an IDE and the UI renders in the browser, a different window.

You can't **directly manipulate** the parameters, queries, etc. in the browser. It makes it harder to make changes on the application.

Wouldn't it be great if it was possible to directly manipulate the app created in the browser, manipulating the data the closest possible to the source of truth?

### Require specialized knowledge

Creating internal tools with pro-code requires knowledge of front-end technologies.

While front-end developers feel comfortable with it, most developers of internal tools are full-stack engineers, people who consider writing low-level CSS and React code a **distraction**.

Wouldn't it be great if you could use a tool that is approachable, not requiring to be a React expert?

## Limitations with low-code tools

The key problems most low-code tools have relative to Toolpad Studio:

### Extensibility

Low-code tools can be hard to extend. When the tool can't handle a particular task by default, integrating your own code seamlessly is often a challenge.

This lack of flexibility often results in being stuck or having to write custom code inside these apps and storing the business logic within their configuration files.

Wouldn't it be great if the tool used code in your filesystem as its source of truth?

### Duplication of logic

When working with low-code or no-code tools, the duplication of code and logic can frequently occur because of a lack of extensibility.
Developers invest valuable time in hunting down specific versions of business logic and maintaining them in **multiple** places.

This lack of a unified reference point within the codebase can compromise its scalability, making maintenance and debugging more challenging.

### Cheaper developer tooling

When developers use low-code or no-code tools, they frequently sacrifice their autonomy and become restricted by the options provided by the tool.
The introduction of a black-box element prevents access to the high-quality tools developers are used to when working with pro-code, for example Git for version control.

This can lead to a significant problem when it comes to the long-term maintainability of internal tools, as it becomes challenging to adapt, extend, or customize them to meet evolving needs.

## How Toolpad Studio fits in

Addressing the problems mentioned above leads to a better developer experience. Toolpad Studio solves them in the following ways:

{{"component": "modules/components/DocsImage.tsx", "src": "/static/toolpad/docs/studio/getting-started/why-toolpad/why-toolpad.png", "alt": "How Toolpad Studio fits in your codebase", "caption": "How Toolpad Studio fits in your workflow", "zoom": true }}

### Drag-and-drop builder

Toolpad Studio works as a drag-and-drop UI builder and uses MUI's own Material UI components. Material UI includes all of the foundational components required for internal use cases. Toolpad Studio currently supports [many of them](https://mui.com/toolpad/studio/reference/components/), and more are continuously being added.

Toolpad Studio supports adding any number of custom React components for other use cases. The drag-and-drop builder enables you to quickly assemble a minimum viable UI that's endlessly customizable, ensuring the best of both worlds: speed _and_ flexibility.

### Single source of truth

Toolpad Studio offers two ways to connect to your data, ensuring that you can keep your data in one centralized location and avoid duplicating it for each internal tool you create:

1. Link REST APIs to Toolpad Studio through HTTP queries: This common method allows you to access your data directly by building REST queries in a visual interface.
2. Write custom functions in your own IDE to connect to any data source: You can use your existing scripts, business logic, database models, client libraries, and secrets. This approach helps you maintain a single, shared data source for all your internal tools, preventing data duplication and ensuring consistency across applications.

### Integrates with your development lifecycle

Toolpad Studio empowers you with total control over the entire development lifecycle of your application. It operates on a "local-first" principle, where your project resides on your local file system. This enables you to utilize your preferred Integrated Development Environment (IDE), version control system, deployment target, and Command Line Interface (CLI) tools.

Similar to any Node.js application, you have the flexibility to self-host a Toolpad Studio app on your own server or select a hosting provider that suits your needs, whether it's AWS, Render, Railway, or Heroku. Toolpad Studio does not confine you to its cloud hosting, ensuring you have the freedom to choose the hosting solution that best aligns with your preferences and requirements.

### Collaborate as programmers

Toolpad apps use YAML files as their source of truth.
This means you can store your entire Toolpad app the same way you store your other code, so you can continue to use the source control systems and developer workflows that you prefer.

## How is Toolpad Studio different from other tools?

🚧 Work in progress, [issue #2853](https://github.com/mui/toolpad/issues/2853).
