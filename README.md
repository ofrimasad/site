

## Prerequisites

Both the CLI and generated project have dependencies that require Node 6.9.0 or higher, together
with NPM 3 or higher.

download https://nodejs.org/en/ (Recommended version)

## Installation

in windows Powershell run commands

```bash

npm install -g @angular/cli

git clone CURRENT PROJECT
cd INTO PROJECT FOLDER
npm install
ng serve
```
Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

You can configure the default HTTP port and the one used by the LiveReload server with two command-line options :

```bash
ng serve --host 0.0.0.0 --port 4201 --live-reload-port 49153
```
To build code

```bash
ng build --prod
```
For sandbox code
```bash
ng build --prod --env=sandbox
```
