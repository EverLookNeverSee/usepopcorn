import {useEffect, useState} from "react";
import StarRating from "./StarRating";

const average = arr => arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);
const KEY = "a8d8f475";

export default function AppV2() {
	const [query, setQuery] = useState("");
	const [movies, setMovies] = useState([]);
	const [watched, setWatched] = useState(() => JSON.parse(localStorage.getItem("watched")));
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState("");
	const [selectedId, setSelectedId] = useState(null);

	function handleSelectMovie(id) {
		setSelectedId(setSelectedId => (id === setSelectedId ? null : id));
	}

	function handleCloseMovie() {
		setSelectedId(null);
	}

	function handleAddWatched(movie) {
		setWatched(watched => [...watched, movie]);
		// localStorage.setItem("watched", JSON.stringify([...watched, movie]));
	}

	function handleDeleteWatched(id) {
		setWatched(watched => watched.filter(movie => movie.imdbID !== id));
	}

	useEffect(() => {
		localStorage.setItem("watched", JSON.stringify(watched));
	}, [watched]);

	useEffect(() => {
		const controller = new AbortController();

		async function fetchMovies() {
			try {
				setIsLoading(true);
				setError("");
				const res = await fetch(`http://www.omdbapi.com/?apikey=${KEY}&s=${query}`, {
					signal: controller.signal,
				});
				if (!res.ok) throw new Error("Something went wrong with fetching movies!");
				const data = await res.json();
				if (data.Response === "False") throw new Error("Movies not found!");
				setMovies(data.Search);
				setError("");
			} catch (e) {
				if (e.name !== "AbortError") {
					console.log(e.message);
					setError(e.message);
				}
			} finally {
				setIsLoading(false);
			}
		}

		if (query.length < 3) {
			setMovies([]);
			setError("");
			return;
		}
		handleCloseMovie();
		fetchMovies();
		return () => controller.abort();
	}, [query]);

	return (
		<>
			<NavBar>
				<Search query={query} setQuery={setQuery} />
				<NumResults movies={movies} />
			</NavBar>
			<Main>
				<Box>
					{isLoading ? (
						<Loader />
					) : error ? (
						<ErrorMessage message={error} />
					) : (
						<MoviesList movies={movies} onSelectMovie={handleSelectMovie} />
					)}
				</Box>
				<Box>
					{selectedId ? (
						<MovieDetails
							selectedId={selectedId}
							onCloseMovie={handleCloseMovie}
							onAddWatched={handleAddWatched}
							watched={watched}
						/>
					) : (
						<>
							<WatchedSummary watched={watched} />
							<WatchedMoviesList watched={watched} onDeleteWatched={handleDeleteWatched} />
						</>
					)}
				</Box>
			</Main>
		</>
	);
}

function Loader() {
	return <p className="loader">Loading...</p>;
}

function ErrorMessage({message}) {
	return (
		<p className="error">
			<span>⛔</span> {message}
		</p>
	);
}

function NavBar({children}) {
	return (
		<nav className="nav-bar">
			<Logo />
			{children}
		</nav>
	);
}

function Logo() {
	return (
		<div className="logo">
			<span role="img">🍿</span>
			<h1>usePopcorn</h1>
		</div>
	);
}

function Search({query, setQuery}) {
	return (
		<input
			className="search"
			type="text"
			placeholder="Search movies..."
			value={query}
			onChange={e => setQuery(e.target.value)}
		/>
	);
}

function NumResults({movies}) {
	return (
		<p className="num-results">
			Found <strong>{movies.length}</strong> results
		</p>
	);
}

function Main({children}) {
	return <main className="main">{children}</main>;
}

function Box({children}) {
	const [isOpen, setIsOpen] = useState(true);

	return (
		<div className="box">
			<button className="btn-toggle" onClick={() => setIsOpen(open => !open)}>
				{isOpen ? "–" : "+"}
			</button>
			{isOpen && children}
		</div>
	);
}

function MoviesList({movies, onSelectMovie}) {
	return (
		<ul className="list list-movies">
			{movies?.map(movie => (
				<Movie key={movie.imdbID} movie={movie} onSelectMovie={onSelectMovie} />
			))}
		</ul>
	);
}

function Movie({movie, onSelectMovie}) {
	return (
		<li onClick={() => onSelectMovie(movie.imdbID)}>
			<img src={movie.Poster} alt={`${movie.Title} poster`} />
			<h3>{movie.Title}</h3>
			<div>
				<p>
					<span>🗓</span>
					<span>{movie.Year}</span>
				</p>
			</div>
		</li>
	);
}

function MovieDetails({selectedId, onCloseMovie, onAddWatched, watched}) {
	const [movie, setMovie] = useState({});
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState("");
	const [userRating, setUserRating] = useState("");

	const isWatched = watched.map(movie => movie.imdbID).includes(selectedId);
	const userWatchedRating = watched.find(movie => movie.imdbID === selectedId)?.userRating;
	const {
		Title: title,
		Year: year,
		Poster: poster,
		Runtime: runtime,
		imdbRating,
		Plot: plot,
		Released: released,
		Actors: actors,
		Director: director,
		Genre: genre,
	} = movie;

	// const [isTop, setIsTop] = useState(imdbRating > 8);
	// console.log(isTop);
	// useEffect(() => {
	// 	setIsTop(true);
	// }, [imdbRating]);

	const isTop = imdbRating > 8;
	console.log(isTop);

	useEffect(() => {
		async function getMovieDetails() {
			try {
				setIsLoading(true);
				setError("");
				const res = await fetch(`http://www.omdbapi.com/?apikey=${KEY}&i=${selectedId}`);
				if (!res.ok) throw new Error("Something went wrong with fetching movie details!");
				const data = await res.json();
				setMovie(data);
			} catch (e) {
				console.error(e.message);
				setError(e.message);
			} finally {
				setIsLoading(false);
			}
		}

		getMovieDetails();
	}, [selectedId]);

	useEffect(() => {
		if (!title) return;
		document.title = `Movie | ${title}`;
		return () => {
			// Closure is here—clean up function will remember the title
			document.title = "usePopcorn";
		};
	}, [title]);

	useEffect(() => {
		function callBack(e) {
			if (e.code === "Escape") onCloseMovie();
		}

		document.addEventListener("keydown", callBack);
		return () => document.removeEventListener("keydown", callBack);
	}, [onCloseMovie]);

	function handleAdd() {
		const newWatchedMovie = {
			imdbID: selectedId,
			title,
			year,
			poster,
			imdbRating: Number(imdbRating),
			runtime: Number(runtime.split(" ").at(0)),
			userRating,
		};
		onAddWatched(newWatchedMovie);
		onCloseMovie();
	}

	return (
		<div className="details">
			{isLoading ? (
				<Loader />
			) : error ? (
				<ErrorMessage message={error} />
			) : (
				<>
					<header>
						<button className="btn-back" onClick={onCloseMovie}>
							&larr;
						</button>
						<img src={poster} alt={`Poster of ${movie}`} />
						<div className="details-overview">
							<h2>{title}</h2>
							<p>
								{released} &bull; {runtime}
							</p>
							<p>{genre}</p>
							<p>
								<span>⭐</span> {imdbRating} IMDb rating
							</p>
						</div>
					</header>
					<section>
						<div className="rating">
							{!isWatched ? (
								<>
									<StarRating maxRating={10} size={24} onSetRating={setUserRating} />
									{userRating > 0 && (
										<button className="btn-add" onClick={handleAdd}>
											Add to list
										</button>
									)}
								</>
							) : (
								<p>
									You have rated this movie {userWatchedRating} <span>⭐</span>
								</p>
							)}
						</div>
						<p>{plot}</p>
						<p>Starring {actors}</p>
						<p>Directed by {director}</p>
					</section>
				</>
			)}
		</div>
	);
}

function WatchedSummary({watched}) {
	const avgImdbRating = average(watched.map(movie => movie.imdbRating));
	const avgUserRating = average(watched.map(movie => movie.userRating));
	const avgRuntime = average(watched.map(movie => movie.runtime));
	return (
		<div className="summary">
			<h2>Movies you watched</h2>
			<div>
				<p>
					<span>#️⃣</span>
					<span>{watched.length} movies</span>
				</p>
				<p>
					<span>⭐️</span>
					<span>{avgImdbRating.toFixed(1)}</span>
				</p>
				<p>
					<span>🌟</span>
					<span>{avgUserRating.toFixed(1)}</span>
				</p>
				<p>
					<span>⏳</span>
					<span>{avgRuntime.toFixed(0)} min</span>
				</p>
			</div>
		</div>
	);
}

function WatchedMoviesList({watched, onDeleteWatched}) {
	return (
		<ul className="list">
			{watched.map(movie => (
				<WatchedMovie key={movie.imdbID} movie={movie} onDeleteWatched={onDeleteWatched} />
			))}
		</ul>
	);
}

function WatchedMovie({movie, onDeleteWatched}) {
	return (
		<li>
			<img src={movie.poster} alt={`${movie.title} poster`} />
			<h3>{movie.title}</h3>
			<div>
				<p>
					<span>⭐️</span>
					<span>{movie.imdbRating}</span>
				</p>
				<p>
					<span>🌟</span>
					<span>{movie.userRating}</span>
				</p>
				<p>
					<span>⏳</span>
					<span>{movie.runtime} min</span>
				</p>
				<button className="btn-delete" onClick={() => onDeleteWatched(movie.imdbID)}>
					X
				</button>
			</div>
		</li>
	);
}
