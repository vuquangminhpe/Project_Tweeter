import axios from "axios";
import { useState } from "react";
import { Link } from "react-router-dom";
function ForgotPassword() {
  const [email, setEmail] = useState("");

  const handleSendEmail = () => {
    const controller = new AbortController();
    axios
      .post(
        "/users/forgot-password",
        { email: email },
        {
          baseURL: "http://localhost:5000",
          signal: controller.signal,
        }
      )
      .then((res) => {
        console.log(res);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  return (
    <div>
      <p>hãy nhập email để forgot password</p>
      <input
        type="email"
        name=""
        id=""
        onMouseEnter={(e) => setEmail(e.currentTarget.value)}
      />
      <Link to={`/verify_forgot_token`} onClick={handleSendEmail}>
        Send email
      </Link>
    </div>
  );
}

export default ForgotPassword;
