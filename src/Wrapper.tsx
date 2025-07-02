"use client";

import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { useAuth } from "./hooks/use-auth";

import Home from "./pages/Home";
import LogIn from "./pages/LogIn";
import SignUp from "./pages/SignUp";
import ErrorPage from "./pages/ErrorPage";

export default function AppWrapper() {
  const { loadingInitialAuth } = useAuth();

  if (loadingInitialAuth) {
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
