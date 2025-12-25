import ReactDOM from "react-dom/client";
import Demo from "./demo";

const rootElement = document.getElementById("root");
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(<Demo />);
}

const body = document.getElementsByTagName("body")[0];
body.style.margin = "0";
body.style.padding = "0";
