import { useEffect, useState } from "react";
import useQueryParams from "./useQueryParams";
import axios from "axios";
import { Link } from "react-router-dom";
function VerifyForgotToken() {
  const [message, setMessage] = useState("");
  const { token } = useQueryParams();
  console.log(token);

  useEffect(() => {
    const controller = new AbortController();

    if (token) {
      axios
        .post(
          "/users/verify-forgot-password",
          { forgot_password_token: token },
          {
            baseURL: "http://localhost:5000",
            signal: controller.signal,
          }
        )
        .then((res) => {
          setMessage(res.data.message);

          localStorage.setItem("forgot_password_token", token);
        })
        .catch((error) => {
          setMessage(error);
        });
    }
  }, [token]);
  return (
    <div>
      {!token ? (
        <div>Hãy Kiểm tra email</div>
      ) : (
        <div>
          <div>{message}</div>
          <Link to={"/reset-password"}>Click vào đây để đổi mật khẩu</Link>
        </div>
      )}
    </div>
  );
}

export default VerifyForgotToken;
