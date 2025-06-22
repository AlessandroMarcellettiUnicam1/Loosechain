# Loosechain


## Features

- **View and Edit BPMN 2.0 Choreography Diagrams**: Use chor-js to interact with BPMN 2.0 choreography diagrams.
- **Diagram Upload and Download**: Easily upload and download diagrams for editing and sharing.
- **Validator**: Check diagrams for potential issues.
- **Looseness Implementation**: Supports various scenarios of looseness in BPMN 2.0 choreography diagrams.

## Local Usage

### Node

You can install and run the demo locally using Node.js.


#### Run Only
delete the package-lock.json
node version suggested 20^
```shell
nvm install 20
nvm use 20
npm install
npm run dev
```

The demo will be served at http://localhost:9013. We use Parcel as a build tool. Thus, unless you set up the project as a development environment (see below), chor-js will not be transpiled and polyfilled, which should be no problem for modern browsers.

## License

MIT
