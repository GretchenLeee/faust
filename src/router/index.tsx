import React from "react";

import { Navigate, useRoutes } from "react-router-dom";

import { Home, Profile, Verify, Settings } from "../pages";

const AppRouter = () => {
  return useRoutes([
    {
      path: "/",
      element: <Navigate to="/home" />,
    },
    {
      path: "/home",
      element: <Home />,
    },
    {
      path: "/profile",
      element: <Profile />,
    },
    {
      path: "/verify",
      element: <Verify />,
    },
    {
      path: "/settings",
      element: <Settings />,
    },
  ]);
};

export default AppRouter;
