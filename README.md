# Accurity Visualisation tool
## BIM and data lineage visualization tool for Glossary

- [What has changed?](CHANGELOG.md)

## Description

This project is a graphical representation of BIM and data lineage in Glossary

# Getting Started

## Prerequisites

- [Git](https://git-for-windows.github.io/) or any other Git client to clone and commit, set up your git as explained in [this guide](https://project.simplity.eu/projects/product-architecture/wiki/The_setup)
- [Node.js v6.2.0](https://nodejs.org/en/) see `node.version` in `pom.xml`
- [Node Package Manager 3.8.9](https://nodejs.org/en/) is included in `nodejs` install package. See `npm.version` in `pom.xml`

## Clone this repository

```
> git clone https://git.simplity.eu/gdovinf/accurity-ui-data-lineage.git
```

# Running with Maven

It's a good idea to start with building from Maven. This will trigger builds using NodeJS but before that Maven downloads
`node` and `npm` binaries and then all javascript dependencies will be downloaded.

## Install
```
> mvn clean install
```
The JAR file will be generated in the 'target' folder and also installed in your local .m2 repository.

# Running with NodeJS

If you have not installed `npm` into your operating system, you need to use `node/npm` command instead of `npm`.

## Install dependencies for Visualisation tool

```
> npm install
```

All dependencies will be installed in `node_modules` directory. Sometimes it's
a good idea to remove this directory and do a fresh install.


## Start

```
> npm start
```

This command executes the webpack-dev-server with enabled hot reload. Files are served from the 'src' folder.
The Visualisation tool will start on port http://localhost:3001.


## Build

```
> npm run build
```

This command executes the webpack build process which bundles all required files into 'dist' folder.