import reactLogo from "./assets/react.svg";
import { Link } from "react-router-dom";
import viteLogo from "/vite.svg";
import "./App.css";
import { Fragment, useEffect } from "react";
// Base styles for media player and provider (~400B).
import "@vidstack/react/player/styles/default/theme.css";
import "@vidstack/react/player/styles/default/layouts/video.css";
import { MediaPlayer, MediaProvider } from "@vidstack/react";
import {
  defaultLayoutIcons,
  DefaultVideoLayout,
} from "@vidstack/react/player/layouts/default";

const getGoogleAuthUrl = () => {
  const url = "https://accounts.google.com/o/oauth2/auth";
  const query = {
    client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
    redirect_uri: import.meta.env.VITE_GOOGLE_REDIRECT_URI,
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
      <h2>Video streaming</h2>
      <video controls width={500}>
        {/* <source
          src="http://localhost:5000/static/video-stream/0eba0868a22642d4643c4d300.mp4"
          type="video/mp4"
        /> */}
      </video>
      <h2>HLS Streaming</h2>
      <MediaPlayer
        title="Sprite Fight"
        src="https://twitter-clone-minh-ap-southeast-1.s3.ap-southeast-1.amazonaws.com/Videos/90qomS7wp6-LmwdFYm2Hm.mp4"
      >
        <MediaProvider />
        <DefaultVideoLayout
          thumbnails="https://files.vidstack.io/sprite-fight/thumbnails.vtt"
          icons={defaultLayoutIcons}
        />
      </MediaPlayer>
      {isAuthenticated ? (
        <Fragment>
          <span>Login oke</span>
          <button onClick={logout}>Logout</button>
        </Fragment>
      ) : (
        <Fragment>
          <Link to={`/forgot_password`}>Forgot Password - Click here</Link>
          <Link to={googleOAuthUrl}>Google Oauth 2.</Link>
        </Fragment>
      )}
    </>
  );
}

export default Home;
