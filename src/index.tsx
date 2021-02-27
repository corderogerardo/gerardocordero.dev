// eslint-disable-next-line @typescript-eslint/no-redeclare
import React from "react";
import ReactDOM from "react-dom";
import * as Sentry from "@sentry/react";
import "./index.css";
import "./i18n";
import App from "./App";
import { ThemeProvider } from 'styled-components'
import * as serviceWorker from "./serviceWorker";

import { myTheme } from './styles/my-theme'

Sentry.init({
  dsn:
    "https://e7b6a6f1fce54603aabbfad00366e8bf@o434437.ingest.sentry.io/5391502",
});

ReactDOM.render(
  <React.StrictMode>
    <ThemeProvider theme={myTheme}>
      <App />
    </ThemeProvider>

  </React.StrictMode>,
  document.getElementById("root")
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.register();
