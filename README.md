# Network Creation UI Tool
## Meraki and ServiceNow

# Overview
This project is an Angular application to interact with the Meraki API. 

# Features
* Create a Meraki network with web form
* Bind network to a list of config templates
* Claim order,serial and license numbers
* Add devices to the newly created network
* Log messages to a central component
* Send new network and device adjusments to backend service

This app is built for ServiceNow, but could easily be ported to a customm Meraki API proxy.

## Design Concept
<img src="screenshots/network-concept.png" width="500">
<img src="screenshots/claim-concept.png" width="500">

## This Angular app
<img src="screenshots/network-mvp.png" width="500">
<img src="screenshots/claim-mvp.png" width="500">


# ToDo
Instructions for creating ServiceNow REST interfaces using the provided snow-scripts
include NodeJS express proxy

## Disclaimer
This is a proof of concept and has not been thoroughly tested. Use as an educational tool or as a starting point for your next project.

## Written by Cory Guynn @eedionysus
http://meraki.io


-- --



# Development
This project was based off of the amazing work
https://github.com/nathangrove/ng-snow

The instructions from the original project are copied below to get the project configured and running.

# NG-SNow Starter Project
This starter project is intended to help you build and deploy angular2 applications on the ServiceNow platform. Before you ask me "Why angular2?" I will go ahead and answer that question, because its awesome. Thats why. Here are a few reasons why I like it:

1. Modularity
2. TypeScript
3. Optional 2-way data binding
4. Automatic scoped CSS (this really is more amazing that it sounds)
5. Built in use of RxJs

## Prerequisites
  - Have nodejs installed
  - Have npm installed
  - Have angular-cli installed: `npm install -g angular-cli`

## Installation
1. Clone repo (obviously)
2. Run: `npm install`
4. Run: `npm run setup`

## Usage

  - ### Development
    After the project and dev tools have been installed, it is time to start developing!

    To get things started, run: `npm run start`
    This will spin up a localhost server on port 4200 to serve the application locally. This command will also configure a proxy so any `/api` request will be routed to your instance with a BasicAuth header added on the request for authentication.

    Once you save a file, the project is recompiled and the dev page is refreshed in the browser.

    When building out your application, authentication is not required. ServiceNow will handle authenticated access to the application itself. 

    Use the pre-built http-client (src/app/services/http-client.service.ts) when making any API calls. The service will return a standard http-client but the custom service will add the X-UserToken to the request headers for authenticated API calls once deployed.

    Don't forget that you can use angular-cli to build services, classes, components, etc automatically with the ng generators https://github.com/angular/angular-cli#generating-components-directives-pipes-and-services
  
  - ### Deployment
    Make sure your snow.conf.json file has the sys_ids of all the required files loaded.
    Then run `npm run deploy` this will build and deploy your files to the instance.

## Contributing
Contributions are very welcomed.

1. Fork it!
2. Create your feature branch: `git checkout -b my-new-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin my-new-feature`
5. Submit a pull request

## Future wishlist
* More intelligent application setup within ServiceNow
  - Application name collision detection
  - Scope name suggestions

## History
TODO: Write history


## License
Apache 2.0 (see [LICENSE](./LICENSE) and [NOTICE](./NOTICE)).
