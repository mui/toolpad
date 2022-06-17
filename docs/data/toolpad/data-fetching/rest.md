---
title: Toolpad docs - Data Fetching
---

# REST API

<p class="description">Connect to any REST API from a Toolpad app</p>

Toolpad comes with a default REST API That you can use to make all purpose API calls. You can set up a connection to a REST API where you can configure a base URL, headers, authentication. In order to use API headers, one must define a base url.

- **No authentication**: The default
- **Basic authentication**: Allows you to set a username and a password which will eb automatically encoded for you in a `Authorization` header.
- **Bearer authentication**: Allows to configure a token that will be used in the `Authorization` header. e.g. to configure an access token for Oauth.
