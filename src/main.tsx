"use client";

import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/authContext"; // Import useAuth

import "./index.css";

import Home from "./pages/Home";
import LogIn from "./pages/LogIn";
import SignUp from "./pages/SignUp";
import ErrorPage from "./pages/ErrorPage";

// A wrapper component to ensure AuthProvider loads before RouterProvider renders Home
function AppWrapper() {
  const { loadingInitialAuth } = useAuth();

  if (loadingInitialAuth) {
    // You can render a loading spinner or splash screen here
    return (
      <div className="flex items-center justify-center min-h-screen text-white">
        Loading application...
      </div>
    );
  }

  const router = createBrowserRouter([
    {
      path: "/",
      errorElement: <ErrorPage />,
      children: [
        { index: true, element: <Home /> },
        { path: "login", element: <LogIn /> },
        { path: "signup", element: <SignUp /> },
      ],
    },
  ]);

  return <RouterProvider router={router} />;
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AuthProvider>
      <AppWrapper /> {/* Render the wrapper component */}
    </AuthProvider>
  </React.StrictMode>
);
