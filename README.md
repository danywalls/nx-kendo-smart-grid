# Nx Kendo Smart Grid

This Nx workspace contains Angular and React versions of the smart grid
example. Both apps use Kendo UI components and share the costume catalog,
semantic matching, and demo assistant in `libs/costume-domain`.

The shared matching logic uses a small, local concept list. It demonstrates
the application flow, but it is not a language model or production embedding
service. The assistant also returns fixed, local responses.

## Requirements

- Node.js 22.12 or newer
- A valid Telerik license or trial for Kendo UI

## Install and run

Clone this repository and install the dependencies from its root:

```bash
git clone https://github.com/danywalls/nx-kendo-smart-grid.git
cd nx-kendo-smart-grid
npm ci
```

Start either app from the workspace root. Use separate terminals to run both
at the same time:

```bash
npm run start:angular
```

Open the URL printed by Nx, usually `http://localhost:4200`. To start React,
open another terminal and run:

```bash
npm run start:react
```

Open the URL printed by Vite, usually `http://localhost:4300`.

## Try the grid

In either app:

1. Search for `scary slasher with a hockey mask`. Jason Voorhees should appear.
2. Search for `friendly rock alien`. Korg should appear.
3. Search for `gothic girl with black braids`. Wednesday Addams should appear.
4. Clear the search. All three costumes should return.
5. Click **Ask AI** on a row. Try asking how to make the costume with foam.
   The prompt should show a local answer, and the row should display it.

## Build both apps

Run this from the workspace root:

```bash
npm run build
```

To build only one app, use `npm run build:angular` or `npm run build:react`.

## Workspace layout

- `apps/angular-smart-grid` contains the Kendo UI for Angular app.
- `apps/react-smart-grid` contains the KendoReact app.
- `libs/costume-domain` contains the shared catalog and demo logic.

The workspace uses Nx 23.3, Angular 22.1, Kendo UI for Angular 25.3,
React 19.2, and KendoReact 16.2.
