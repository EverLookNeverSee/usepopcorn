import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import AppV1 from "./App-v1";
import AppV2 from "./App-v2";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
	<React.StrictMode>
		<AppV2 />
	</React.StrictMode>,
);
