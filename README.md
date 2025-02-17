# chor-js-looseness

A modified version of the [`chor-js-demo`](https://github.com/bptlab/chor-js-demo) application, enhanced to implement various situations of looseness in BPMN 2.0 choreography diagrams.

This demo application uses the npm package of chor-js to view and edit BPMN 2.0 choreography diagrams in the browser. It also includes additional features such as diagram upload, download, and validation. The primary focus of this modified version is to demonstrate the implementation of different looseness scenarios within choreography diagrams.

## Features

- **View and Edit BPMN 2.0 Choreography Diagrams**: Use chor-js to interact with BPMN 2.0 choreography diagrams.
- **Diagram Upload and Download**: Easily upload and download diagrams for editing and sharing.
- **Validator**: Check diagrams for potential issues.
- **Looseness Implementation**: Demonstrates various scenarios of looseness in BPMN 2.0 choreography diagrams.

## Local Usage

### Node

You can install and run the demo locally using Node.js.


#### Run Only
delete the package-lock.json
node version suggested 20^
```shell
nvm install 20 
npm install
npm run dev
```

The demo will be served at http://localhost:9013. We use Parcel as a build tool. Thus, unless you set up the project as a development environment (see below), chor-js will not be transpiled and polyfilled, which should be no problem for modern browsers.

## License

MIT
