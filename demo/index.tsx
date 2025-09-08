import React from "react";
import ReactDOM from "react-dom/client";
import Demo from "./demo.tsx";

ReactDOM.createRoot(document.getElementById("root")!).render(<Demo />);

const body = document.getElementsByTagName("body")[0];
body.style.margin = "0";
body.style.padding = "0";
