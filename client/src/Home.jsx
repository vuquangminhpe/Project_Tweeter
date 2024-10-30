import reactLogo from "./assets/react.svg";
import { Link } from "react-router-dom";
import viteLogo from "/vite.svg";
import "./App.css";
import { Fragment, useEffect } from "react";

const getGoogleAuthUrl = () => {
  const url = "https://accounts.google.com/o/oauth2/auth";
  const query = {
    client_id:
      "1065435437989-s24vtub6m0damkbqslkfoplhdg1s5ssg.apps.googleusercontent.com",
    redirect_uri: "http://localhost:5000/users/oauth/google",
    response_type: "code",
    scope: [
      "https://www.googleapis.com/auth/userinfo.profile",
      "https://www.googleapis.com/auth/userinfo.email",
    ].join(" "),
    prompt: "consent",
    access_type: "offline",
  };
  const queryString = new URLSearchParams(query).toString();
  return `${url}?${queryString}`;
};
const googleOAuthUrl = getGoogleAuthUrl();
function Home() {
  const isAuthenticated = Boolean(localStorage.getItem("access_token"));
  const logout = () => {
    localStorage.setItem("access_token", "");
    localStorage.setItem("refresh_token", "");
  };
  useEffect(() => {
    localStorage.getItem("access_token");
  }, [isAuthenticated]);
  return (
    <>
      <div>
        <span>
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </span>
        <span>
          <img src={reactLogo} className="logo react" alt="React logo" />
        </span>
      </div>

      {isAuthenticated ? (
        <Fragment>
          <span>Login oke</span>
          <button onClick={logout}>Logout</button>
        </Fragment>
      ) : (
        <Link to={googleOAuthUrl}>Google Oauth 2.</Link>
      )}
    </>
  );
}

export default Home;
