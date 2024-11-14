import { createBrowserRouter } from "react-router-dom";
import Home from "./Home";
import Login from "./Login";
import VerifyEmail from "./VerifyEmail";
import ForgotPassword from "./ForgotPassword";
import VerifyForgotToken from "./VerifyForgotToken";
import ResetPassword from "./ResetPassword";
import Chat from "./Chat";
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
  {
    path: "/forgot_password",
    element: <ForgotPassword />,
  },
  {
    path: "/verify-forgot-password",
    element: <VerifyForgotToken />,
  },
  {
    path: "/reset-password",
    element: <ResetPassword />,
  },
  {
    path: "/chat",
    element: <Chat />,
  },
]);
