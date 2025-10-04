"use client";

import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { useAuth } from "./hooks/use-auth";

import Home from "./pages/Home";
import LogIn from "./pages/LogIn";
import SignUp from "./pages/SignUp";
import ErrorPage from "./pages/ErrorPage";
import Recovery from "./pages/RecoverPassword";
import ResetPassword from "./pages/ResetPassword";

import loadingGif from "./assets/bidoofious-bidoofiousfor1.gif";
import placeholder from "./assets/placeholder.svg";

export default function AppWrapper() {
  const { loadingInitialAuth } = useAuth();

  if (loadingInitialAuth) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#292928]">
        <img
          src={loadingGif || placeholder}
          alt="Loading..."
          className="w-32 h-32 object-contain"
        />
        <p className="text-white mt-4 text-lg">Loading application...</p>
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
        { path: "forgot-password", element: <Recovery /> },
        { path: "reset-password", element: <ResetPassword /> },
      ],
    },
  ]);

  return <RouterProvider router={router} />;
}
