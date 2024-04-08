# Notes

## As a developer, what do I dislike about low-code tools?

What I usually don't like about low-code tools **as a developer**:

- I like to be able to use my own code editor and extensions.
- I like to be able to use source control to track history, versions and use branching.
- I like to be able to generate code to save time on more complex projects.
- I like an easy way of sharing code. (is there anything easier than copy+pasting text?)
- I like to be able to run locally and offline. (for example I'd like to work on the train)

## Authentication

User management is hard and labor intensive to get right, especially in the beginning. Can we get away with just promoting an authentication proxy? And/or provide a list of user/pwds for basic auth?

- https://github.com/pomerium/pomerium
- https://github.com/buzzfeed/sso
- https://github.com/openshift/oauth-proxy
- https://github.com/oauth2-proxy/oauth2-proxy

What if a proxy can just pass a role/group through HTTP headers?

## Persistence

Do we need a DB to keep state? What are the pro's and cons of using a DB vs, let's say config files? Depends a lot on what type of application we try to be, who we cater for.

## Security

- Even though it's meant for internal applications, a user that has no editing rights shouldn't be able to run arbitrary queries, even by spoofing HTTP requests. Meaning: in "viewer mode", the frontend should not be able to execute arbitrary SQL queries by responding to raw requests that don't contain an access token that specifically allows this.
- For database queries, interpollation **MUST** always use native escaping features (for example send queries like `SELECT * FROM table WHERE col = ?;`)

## Simplicity enables flexibility

On how notion created a flexible platform by betting on a compact datamodel: https://www.notion.so/blog/data-model-behind-notion

Keep the data model as simple as possible. Constrain the sandbox, but allow users to come up with unexpected solutions to their own problems. Study what they come up with, generalize, improve and add to the platform.

## Engineering philosophy

Other biases about this dude aside, these 5 minutes are eye-opening: https://www.youtube.com/watch?v=t705r8ICkRw&t=806s

Take aways:

- All designs are wrong, it's just a matter of how wrong.
- If parts are not being added back into the design at least 10% of the time, not enough parts are being deleted.
- The most common error of a smart engineer is to optimize something that should not exist.

## On low-code tools for developers

### What can we leverage that React developers are capable of?

- thinking in components, properties, and controlled properties?
- state? lifting state?

### Which pain do we want to take away that React developers have to deal with building UIs?

- having to always keep performance in the back of the head?

## Random

- What if a low-code tool compiles down to a Next.js app?
- empowering low-tech users or automating high-tech user's work?

## TODO

- default connections
