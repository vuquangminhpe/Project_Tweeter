import { createBrowserRouter } from "react-router-dom";
import Home from "./Home";
import Login from "./Login";
import VerifyEmail from "./VerifyEmail";
export const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/login/oauth",
    element: <Login />,
  },
  {
    path: "/verify-email",
    element: <VerifyEmail />,
  },
]);
