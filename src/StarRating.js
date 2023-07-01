import {useState} from "react";

const containerStyle = {display: "flex", alignItems: "center", gap: "16px"};
const starContainerStyle = {display: "flex"};
const textStyle = {lineHeight: "1", margin: "0"};

export default function StarRating({maxRating = 5}) {
	const [rating, setRating] = useState(0);
	const [tempRating, setTempRating] = useState(0);

	function handleRating(rating) {
		setRating(rating);
	}
	return (
		<div style={containerStyle}>
			<div style={starContainerStyle}>
				{Array.from({length: maxRating}, (_, i) => (
					<span style={textStyle}>
						<Star
							key={i}
							onRate={() => handleRating(i + 1)}
							onHoverIn={() => setTempRating(i + 1)}
							onHoverOut={() => setTempRating(0)}
							full={tempRating ? tempRating >= i + 1 : rating >= i + 1}
						/>
					</span>
				))}
			</div>
			<p style={textStyle}>{tempRating || rating || ""}</p>
		</div>
	);
}
