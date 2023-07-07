import React, {useState} from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import AppV1 from "./App-v1";
import StarRating from "./StarRating";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
	<React.StrictMode>
		<AppV1 />
		{/*<StarRating*/}
		{/*	maxRating={5}*/}
		{/*	messages={["Terrible", "Bad", "Okay", "Good", "Amazing"]}*/}
		{/*	defaultRating={3}*/}
		{/*/>*/}
	</React.StrictMode>,
);
