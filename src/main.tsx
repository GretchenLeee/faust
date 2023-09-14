import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { DataverseContextProvider } from "@dataverse/hooks";
import { BrowserRouter } from "react-router-dom";
import { AppContextProvider } from "./store";
import "./index.scss";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <AppContextProvider>
    <DataverseContextProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </DataverseContextProvider>
  </AppContextProvider>
);
