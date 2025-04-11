import { useEffect, useState } from "react";
import { Link, Route, BrowserRouter as Router, Routes } from "react-router-dom";
import "./App.css";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import FixtureDetails from "./FixtureDetails";
import LeagueMatches from "./LeagueMatches";
import Leagues from "./Leagues";
import Login from "./Login";
import PlayerDetails from "./PlayerDetails";
import Predictions from "./Predictions";
import Register from "./Register";
import Analytics from "./Analytics";

function App() {
	return (
		<AuthProvider>
			<Router>
				<AppContent />
			</Router>
		</AuthProvider>
	);
}

function AppContent() {
	const { user, signOut } = useAuth();
	const [recentMatches, setRecentMatches] = useState([]);
	const [upcomingMatches, setUpcomingMatches] = useState([]);
	const [topScorers, setTopScorers] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
	const [selectedLeague, setSelectedLeague] = useState('39'); // Premier League by default

	useEffect(() => {
		const fetchDashboardData = async () => {
			try {
				setLoading(true);
				// Get today's date and format it
				const today = new Date().toISOString().split("T")[0];

				// Fetch fixtures from today
				const fixturesResponse = await fetch(
					`https://v3.football.api-sports.io/fixtures?date=${today}`,
					{
						method: "GET",
						headers: {
							"x-rapidapi-host": "v3.football.api-sports.io",
							"x-rapidapi-key":
								"3e35192ee89b4d9324a60a8a2907218b",
						},
					}
				);

				// Fetch top scorers (using selected league)
				const scorersResponse = await fetch(
					`https://v3.football.api-sports.io/players/topscorers?league=${selectedLeague}&season=2023`,
					{
						method: "GET",
						headers: {
							"x-rapidapi-host": "v3.football.api-sports.io",
							"x-rapidapi-key":
								"3e35192ee89b4d9324a60a8a2907218b",
						},
					}
				);

				const fixturesData = await fixturesResponse.json();
				const scorersData = await scorersResponse.json();

				// Split fixtures into recent and upcoming
				const allFixtures = fixturesData.response || [];
				setRecentMatches(
					allFixtures
						.filter((match) => match.fixture.status.short === "FT")
						.slice(0, 5)
				);
				setUpcomingMatches(
					allFixtures
						.filter((match) => match.fixture.status.short === "NS")
						.slice(0, 5)
				);
				setTopScorers(scorersData.response?.slice(0, 5) || []);
				setLoading(false);
			} catch (err) {
				setError(err.message);
				setLoading(false);
			}
		};

		fetchDashboardData();
	}, [selectedLeague]);

	// League options for the dropdown
	const leagues = [
		{ id: '39', name: 'Premier League' },
		{ id: '140', name: 'La Liga' },
		{ id: '135', name: 'Serie A' },
		{ id: '78', name: 'Bundesliga' },
		{ id: '61', name: 'Ligue 1' },
	];

	if (loading) {
		return (
			<div className="flex justify-center items-center h-64">
				<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-800"></div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="text-center text-red-600 p-4">
				Error loading dashboard data: {error}
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gray-100">
			<nav className="bg-blue-800 text-white shadow-lg">
				<div className="container mx-auto px-4 py-3">
					<div className="flex items-center justify-between">
						<h1 className="text-2xl font-bold">SSport Analytics</h1>
						
						{/* Mobile menu button */}
						<div className="md:hidden">
							<button 
								onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
								className="text-white focus:outline-none"
								aria-label="Toggle menu"
							>
								<svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									{mobileMenuOpen ? (
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
									) : (
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
									)}
								</svg>
							</button>
						</div>
						
						{/* Desktop menu */}
						<div className="hidden md:flex items-center space-x-4">
							<Link to="/" className="hover:text-blue-200">
								Dashboard
							</Link>
							<Link to="/analytics" className="hover:text-blue-200">
								Analytics
							</Link>
							<Link to="/predictions" className="hover:text-blue-200">
								Predictions
							</Link>
							<Link to="/Leagues" className="hover:text-blue-200">
								Leagues
							</Link>
							{!user ? (
								<>
									<Link
										to="/login"
										className="hover:text-blue-200">
										Login
									</Link>
									<Link
										to="/register"
										className="hover:text-blue-200">
										Register
									</Link>
								</>
							) : (
								<div className="flex items-center space-x-4">
									<span className="text-sm text-blue-200">
										{user.email}
									</span>
									<button
										onClick={() => signOut()}
										className="hover:text-blue-200">
										Sign Out
									</button>
								</div>
							)}
						</div>
					</div>
					
					{/* Mobile menu */}
					{mobileMenuOpen && (
						<div className="md:hidden mt-4 pb-3 space-y-3">
							<Link to="/" className="block hover:text-blue-200 py-2">
								Dashboard
							</Link>
							<Link to="/analytics" className="block hover:text-blue-200 py-2">
								Analytics
							</Link>
							<Link to="/predictions" className="block hover:text-blue-200 py-2">
								Predictions
							</Link>
							<Link to="/Leagues" className="block hover:text-blue-200 py-2">
								Leagues
							</Link>
							{!user ? (
								<>
									<Link
										to="/login"
										className="block hover:text-blue-200 py-2">
										Login
									</Link>
									<Link
										to="/register"
										className="block hover:text-blue-200 py-2">
										Register
									</Link>
								</>
							) : (
								<div className="space-y-2">
									<span className="block text-sm text-blue-200">
										{user.email}
									</span>
									<button
										onClick={() => signOut()}
										className="block hover:text-blue-200 py-2">
										Sign Out
									</button>
								</div>
							)}
						</div>
					)}
				</div>
			</nav>

			<Routes>
				<Route path="/" element={<MainContent />} />
				<Route path="/login" element={<Login />} />
				<Route path="/register" element={<Register />} />
				<Route path="/Leagues" element={<Leagues />} />
				<Route path="/league/:id" element={<LeagueMatches />} />
				<Route path="/analytics" element={<Analytics />} />
				<Route path="/predictions" element={<Predictions />} />
				<Route
					path="/fixture/:fixtureId"
					element={<FixtureDetails />}
				/>
				<Route path="/player/:playerId" element={<PlayerDetails />} />
			</Routes>
		</div>
	);
}

// Separate the main content into its own component
function MainContent() {
	const [recentMatches, setRecentMatches] = useState([]);
	const [upcomingMatches, setUpcomingMatches] = useState([]);
	const [topScorers, setTopScorers] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [selectedLeague, setSelectedLeague] = useState('39'); // Premier League by default

	// League options for the dropdown
	const leagues = [
		{ id: '39', name: 'Premier League' },
		{ id: '140', name: 'La Liga' },
		{ id: '135', name: 'Serie A' },
		{ id: '78', name: 'Bundesliga' },
		{ id: '61', name: 'Ligue 1' },
	];

	useEffect(() => {
		const fetchDashboardData = async () => {
			try {
				setLoading(true);
				// Get today's date and format it
				const today = new Date().toISOString().split("T")[0];

				// Fetch fixtures from today
				const fixturesResponse = await fetch(
					`https://v3.football.api-sports.io/fixtures?date=${today}`,
					{
						method: "GET",
						headers: {
							"x-rapidapi-host": "v3.football.api-sports.io",
							"x-rapidapi-key":
								"3e35192ee89b4d9324a60a8a2907218b",
						},
					}
				);

				// Fetch top scorers (using selected league)
				const scorersResponse = await fetch(
					`https://v3.football.api-sports.io/players/topscorers?league=${selectedLeague}&season=2023`,
					{
						method: "GET",
						headers: {
							"x-rapidapi-host": "v3.football.api-sports.io",
							"x-rapidapi-key":
								"3e35192ee89b4d9324a60a8a2907218b",
						},
					}
				);

				const fixturesData = await fixturesResponse.json();
				const scorersData = await scorersResponse.json();

				// Split fixtures into recent and upcoming
				const allFixtures = fixturesData.response || [];
				setRecentMatches(
					allFixtures
						.filter((match) => match.fixture.status.short === "FT")
						.slice(0, 5)
				);
				setUpcomingMatches(
					allFixtures
						.filter((match) => match.fixture.status.short === "NS")
						.slice(0, 5)
				);
				setTopScorers(scorersData.response?.slice(0, 5) || []);
				setLoading(false);
			} catch (err) {
				setError(err.message);
				setLoading(false);
			}
		};

		fetchDashboardData();
	}, [selectedLeague]);

	if (loading) {
		return (
			<div className="flex justify-center items-center h-64">
				<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-800"></div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="text-center text-red-600 p-4">
				Error loading dashboard data: {error}
			</div>
		);
	}

	return (
		<main className="container mx-auto px-4 py-8">
			{/* Hero Section */}
			<section className="mb-12 text-center">
				<h2 className="text-4xl font-bold text-gray-800 mb-4">
					Live Football Analytics
				</h2>
				<p className="text-xl text-gray-600 mb-8">
					Real-time insights, predictions, and analysis for football
					matches worldwide
				</p>
			</section>

			{/* Today's Matches Section */}
			<section className="mb-12">
				<h3 className="text-2xl font-bold mb-6">Today's Matches</h3>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					{/* Recent Matches */}
					<div className="bg-white rounded-lg shadow-md p-6">
						<h4 className="text-lg font-semibold mb-4">
							Recent Results
						</h4>
						<div className="space-y-4">
							{recentMatches.map((match) => (
								<Link
									to={`/fixture/${match.fixture.id}`}
									key={match.fixture.id}
									className="block hover:bg-gray-50 rounded-lg p-3 transition-colors">
									<div className="flex justify-between items-center">
										<div className="flex items-center space-x-2">
											<img
												src={match.teams.home.logo}
												alt={match.teams.home.name}
												className="w-6 h-6"
											/>
											<span
												className={
													match.teams.home.winner
														? "font-bold"
														: ""
												}>
												{match.teams.home.name}
											</span>
										</div>
										<span className="font-bold">
											{match.goals.home} -{" "}
											{match.goals.away}
										</span>
										<div className="flex items-center space-x-2">
											<span
												className={
													match.teams.away.winner
														? "font-bold"
														: ""
												}>
												{match.teams.away.name}
											</span>
											<img
												src={match.teams.away.logo}
												alt={match.teams.away.name}
												className="w-6 h-6"
											/>
										</div>
									</div>
								</Link>
							))}
							{recentMatches.length === 0 && (
								<p className="text-gray-500 text-center">
									No completed matches today
								</p>
							)}
						</div>
					</div>

					{/* Upcoming Matches */}
					<div className="bg-white rounded-lg shadow-md p-6">
						<h4 className="text-lg font-semibold mb-4">
							Upcoming Matches
						</h4>
						<div className="space-y-4">
							{upcomingMatches.map((match) => (
								<Link
									to={`/fixture/${match.fixture.id}`}
									key={match.fixture.id}
									className="block hover:bg-gray-50 rounded-lg p-3 transition-colors">
									<div className="flex justify-between items-center">
										<div className="flex items-center space-x-2">
											<img
												src={match.teams.home.logo}
												alt={match.teams.home.name}
												className="w-6 h-6"
											/>
											<span>{match.teams.home.name}</span>
										</div>
										<span className="text-sm text-gray-600">
											{new Date(
												match.fixture.date
											).toLocaleTimeString([], {
												hour: "2-digit",
												minute: "2-digit",
											})}
										</span>
										<div className="flex items-center space-x-2">
											<span>{match.teams.away.name}</span>
											<img
												src={match.teams.away.logo}
												alt={match.teams.away.name}
												className="w-6 h-6"
											/>
										</div>
									</div>
								</Link>
							))}
							{upcomingMatches.length === 0 && (
								<p className="text-gray-500 text-center">
									No upcoming matches today
								</p>
							)}
						</div>
					</div>
				</div>
			</section>

			{/* Top Scorers Section */}
			<section className="mb-12">
				<div className="flex justify-between items-center mb-6">
					<h3 className="text-2xl font-bold">Top Scorers</h3>
					<select
						value={selectedLeague}
						onChange={(e) => setSelectedLeague(e.target.value)}
						className="px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
					>
						{leagues.map((league) => (
							<option key={league.id} value={league.id}>
								{league.name}
							</option>
						))}
					</select>
				</div>
				<div className="bg-white rounded-lg shadow-md p-6">
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
						{topScorers.map((scorer) => (
							<Link
								to={`/player/${scorer.player.id}`}
								key={scorer.player.id}
								className="flex items-center space-x-4 p-4 hover:bg-gray-50 rounded-lg transition-colors">
								<img
									src={scorer.player.photo}
									alt={scorer.player.name}
									className="w-16 h-16 rounded-full object-cover"
								/>
								<div>
									<h4 className="font-semibold">
										{scorer.player.name}
									</h4>
									<p className="text-gray-600">
										{scorer.statistics[0].team.name}
									</p>
									<p className="text-blue-600 font-bold">
										{scorer.statistics[0].goals.total} goals
									</p>
								</div>
							</Link>
						))}
					</div>
				</div>
			</section>

			{/* Quick Links */}
			<section className="grid grid-cols-1 md:grid-cols-3 gap-6">
				<Link
					to="/leagues"
					className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
					<h4 className="text-lg font-semibold mb-2">
						Browse Leagues
					</h4>
					<p className="text-gray-600">
						Explore matches from different leagues worldwide
					</p>
				</Link>
				<Link
					to="/predictions"
					className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
					<h4 className="text-lg font-semibold mb-2">
						Match Predictions
					</h4>
					<p className="text-gray-600">
						Get AI-powered predictions for upcoming matches
					</p>
				</Link>
				<Link
					to="/analytics"
					className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
					<h4 className="text-lg font-semibold mb-2">Analytics</h4>
					<p className="text-gray-600">
						Deep dive into football statistics and trends
					</p>
				</Link>
			</section>
		</main>
	);
}

export default App;
