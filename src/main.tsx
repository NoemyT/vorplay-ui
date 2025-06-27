"use client";

import React from "react";
import ReactDOM from "react-dom/client";
import AppWrapper from "./Wrapper";
import { AuthProvider } from "./context/authContext";

import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AuthProvider>
      <AppWrapper />
    </AuthProvider>
  </React.StrictMode>,
);
