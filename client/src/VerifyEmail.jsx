import { useEffect, useState } from "react";
import useQueryParams from "./useQueryParams";
import axios from "axios";
function VerifyEmail() {
  const [message, setMessage] = useState("");
  const { token } = useQueryParams();
  useEffect(() => {
    const controller = new AbortController();

    if (token) {
      axios
        .post(
          "/users/verify-email",
          { email_verify_token: token },
          {
            baseURL: "http://localhost:5000",
            signal: controller.signal,
          }
        )
        .then((res) => {
          setMessage(res.data.message);
          if (res.data.result) {
            const { refresh_token, access_token } = res.data.result;
            localStorage.setItem("access_token", access_token);
            localStorage.setItem("refresh_token", refresh_token);
          }
        })
        .catch((error) => {
          setMessage(error);
        });
    }
  }, [token]);
  return <div>{message}</div>;
}

export default VerifyEmail;
