# Accurity UI Data Lineage
## Data Lineage visualization tool for Glossary's Mappings

- Build Status: [![Build Status](http://dev04.simplity.dev/buildStatus/icon?job=accurity-ui-data-lineage)](http://dev04.simplity.dev/buildStatus/icon?job=accurity-ui-data-lineage)
- [How to contribute](CONTRIBUTING.md)
- [What has changed?](CHANGELOG.md)

## Description

This project is a graphical representation of data lineage on Glossary's Mappings

# Getting Started

## Prerequisites

- [Git](https://git-for-windows.github.io/) or any other Git client to clone and commit, set up your git as explained in [this guide](https://project.simplity.eu/projects/product-architecture/wiki/The_setup)
- [Node.js v6.2.0](https://nodejs.org/en/) see `node.version` in `pom.xml`
- [Node Package Manager 3.8.9](https://nodejs.org/en/) is included in `nodejs` install package. See `npm.version` in `pom.xml`

## Clone this repository

```
> git clone https://git.simplity.eu/gdovinf/accurity-ui-data-lineage.git
```

## Maven Dependencies

The UI Data Lineage project defines runtime dependencies to ensure compatibility with other pool libraries.

| groupId | artifactId | version | scope | notes |
| ------- | ---------- | ------- | ----- | ----- |

So far, there are no maven dependencies on other projects

# Running with Maven

It's a good idea to start with building from Maven. This will trigger builds using NodeJS but before that Maven downloads
`node` and `npm` binaries and then all javascript dependencies will be downloaded.

## Install
```
> mvn clean install
```
The JAR file will be generated in the 'target' folder and also installed in your local .m2 repository.

## Run tests with coverage report
```
> mvn clean install -DwithCoverage
```

This will run test also with code coverage. Generally, this is a bit slower than without report generation.

# Running with NodeJS

If you have not installed `npm` into your operating system, you need to use `node/npm` command instead of `npm`.

## Install dependencies for UI Data Lineage

```
> npm install
```

All dependencies will be installed in `node_modules` directory. Sometimes it's
a good idea to remove this directory and do a fresh install.


## Start

```
> npm start
```

This command executes the webpack-dev-server which enabled hot reload and files are served from the 'src' folder.

The UI Data Lineage will start on port http://localhost:3001 but will detect a development
mode and try to connect to your app - see default ports above.