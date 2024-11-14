import "./App.css";
import { RouterProvider } from "react-router-dom";
import { router } from "./router";
import { useEffect } from "react";
import axios from "axios";
function App() {
  useEffect(() => {
    const controller = new AbortController();
    axios
      .get("/users/me", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
        baseURL: "http://localhost:5000",
        signal: controller.signal,
      })
      .then((res) => {
        localStorage.setItem("profile", JSON.stringify(res.data.result));
      })
      .catch((err) => console.log(err));
    return () => {
      controller.abort();
    };
  }, []);
  return <RouterProvider router={router} />;
}

export default App;
