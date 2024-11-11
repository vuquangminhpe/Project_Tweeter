/* eslint-disable no-unused-vars */
import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function Login() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  useEffect(() => {
    const access_token = params.get("access_token");
    const refresh_token = params.get("refresh_token");
    const newUser = params.get("new_user");
    const verify = params.get("verify");
    localStorage.setItem("access_token", access_token);
    localStorage.setItem("refresh_token", refresh_token);
    console.log(access_token, refresh_token, newUser);
    navigate("/");
  }, [params, navigate]);
  return <div>Login</div>;
}
