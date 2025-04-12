import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./App.css";
import { useAuth } from "./contexts/AuthContext";

function Leagues() {
	const [leagues, setLeagues] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [selectedLeague, setSelectedLeague] = useState("all");
	const [favoriteLeagues, setFavoriteLeagues] = useState([]);
	const [activeTab, setActiveTab] = useState("all"); // "all" or "favorites"
	const [searchTerm, setSearchTerm] = useState('');
	const [selectedCountry, setSelectedCountry] = useState('all');
	const [countries, setCountries] = useState([]);
	const { user } = useAuth();

	useEffect(() => {
		const initializeData = async () => {
			try {
				setLoading(true);
				setError(null);
				await fetchLeagues();
				// Load favorites from localStorage
				loadFavoriteLeagues();
			} catch (err) {
				console.error("Error initializing data:", err);
				setError(err.message);
			} finally {
				setLoading(false);
			}
		};

		initializeData();
	}, []);

	const fetchLeagues = async () => {
		try {
			setLoading(true);
			console.log("Fetching leagues for season 2024-2025");
			const response = await fetch(
				"https://v3.football.api-sports.io/leagues?season=2024",
				{
					method: "GET",
					headers: {
						"x-rapidapi-host": "v3.football.api-sports.io",
						"x-rapidapi-key": "3e35192ee89b4d9324a60a8a2907218b",
					},
				}
			);

			const data = await response.json();
			console.log("Leagues API Response:", data);
			
			// Check if we have valid data
			if (data.response && data.response.length > 0) {
				console.log("First league:", data.response[0].league.name);
				console.log("First league season:", data.response[0].seasons[0].year);
				console.log("First league country:", data.response[0].country.name);
			} else {
				console.log("No leagues found in the response");
			}
			
			setLeagues(data);
			
			// Extract unique countries for the filter
			if (data.response) {
				const uniqueCountries = [...new Set(data.response.map(league => league.country.name))];
				console.log("Unique countries:", uniqueCountries);
				setCountries(uniqueCountries);
			}
			
			setLoading(false);
		} catch (err) {
			console.error("Error fetching leagues:", err);
			setError(err.message);
			setLoading(false);
		}
	};

	// Load favorites from localStorage
	const loadFavoriteLeagues = () => {
		try {
			const storedFavorites = localStorage.getItem('favoriteLeagues');
			if (storedFavorites) {
				setFavoriteLeagues(JSON.parse(storedFavorites));
			}
		} catch (err) {
			console.error("Error loading favorites from localStorage:", err);
			setFavoriteLeagues([]);
		}
	};

	// Save favorites to localStorage
	const saveFavoriteLeagues = (favorites) => {
		try {
			localStorage.setItem('favoriteLeagues', JSON.stringify(favorites));
		} catch (err) {
			console.error("Error saving favorites to localStorage:", err);
		}
	};

	const toggleFavorite = (leagueId, leagueName, leagueLogo, countryName, countryFlag) => {
		try {
			// Convert leagueId to number if it's a string
			const numericLeagueId = parseInt(leagueId, 10);
			const isFavorite = favoriteLeagues.some(fav => fav.league_id === numericLeagueId);
			
			let updatedFavorites;
			
			if (isFavorite) {
				// Remove from favorites
				updatedFavorites = favoriteLeagues.filter(fav => fav.league_id !== numericLeagueId);
			} else {
				// Add to favorites
				updatedFavorites = [...favoriteLeagues, {
					league_id: numericLeagueId,
					league_name: leagueName,
					league_logo: leagueLogo,
					country_name: countryName,
					country_flag: countryFlag
				}];
			}
			
			setFavoriteLeagues(updatedFavorites);
			saveFavoriteLeagues(updatedFavorites);
		} catch (err) {
			console.error("Error toggling favorite:", err);
			alert("Failed to update favorites. Please try again.");
		}
	};

	const isLeagueFavorite = (leagueId) => {
		const numericLeagueId = parseInt(leagueId, 10);
		return favoriteLeagues.some(fav => fav.league_id === numericLeagueId);
	};

	const filteredLeagues = () => {
		if (!leagues?.response) return [];
		
		if (activeTab === "favorites") {
			return favoriteLeagues;
		}
		
		let filtered = leagues.response;
		
		// Apply search term filter
		if (searchTerm) {
			filtered = filtered.filter(item => 
				item.league.name.toLowerCase().includes(searchTerm.toLowerCase())
			);
		}
		
		// Apply country filter
		if (selectedCountry !== 'all') {
			filtered = filtered.filter(item => 
				item.country.name === selectedCountry
			);
		}
		
		// Apply league filter
		if (selectedLeague !== "all") {
			filtered = filtered.filter(
				item => item.league.id.toString() === selectedLeague
			);
		}
		
		return filtered;
	};

	// Get leagues filtered by country for the dropdown
	const getLeaguesByCountry = () => {
		if (!leagues?.response) return [];
		
		if (selectedCountry === 'all') {
			return leagues.response;
		}
		
		return leagues.response.filter(item => 
			item.country.name === selectedCountry
		);
	};

	if (loading) {
		return (
			<div className="container mx-auto px-4 py-8">
				<div className="flex justify-center items-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-800"></div>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="container mx-auto px-4 py-8">
				<div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
					Error: {error}
				</div>
			</div>
		);
	}

	return (
		<div className="container mx-auto px-4 py-8">
			<h1 className="text-3xl font-bold mb-6">Football Leagues</h1>
			
			{/* Tabs */}
			<div className="flex border-b mb-6">
				<button
					className={`py-2 px-4 font-medium ${
						activeTab === "all"
							? "border-b-2 border-blue-800 text-blue-800"
							: "text-gray-500 hover:text-gray-700"
					}`}
					onClick={() => setActiveTab("all")}
				>
					All Leagues
				</button>
				<button
					className={`py-2 px-4 font-medium ${
						activeTab === "favorites"
							? "border-b-2 border-blue-800 text-blue-800"
							: "text-gray-500 hover:text-gray-700"
					}`}
					onClick={() => setActiveTab("favorites")}
				>
					Favorites
				</button>
			</div>
			
			{/* Search and Filters - Only show when on All Leagues tab */}
			{activeTab === "all" && (
				<div className="mb-6 space-y-4">
					{/* Search Bar */}
					<div>
						<label htmlFor="league-search" className="block text-sm font-medium text-gray-700 mb-1">
							Search Leagues
						</label>
						<input
							id="league-search"
							type="text"
							placeholder="Type to search leagues..."
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							className="block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white"
						/>
					</div>
					
					<div className="flex flex-col md:flex-row gap-4">
						{/* Country Filter */}
						<div className="w-full md:w-64">
							<label htmlFor="country-filter" className="block text-sm font-medium text-gray-700 mb-1">
								Filter by Country
							</label>
							<select
								id="country-filter"
								value={selectedCountry}
								onChange={(e) => setSelectedCountry(e.target.value)}
								className="block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white"
							>
								<option value="all">All Countries</option>
								{countries.map((country) => (
									<option key={country} value={country}>
										{country}
									</option>
								))}
							</select>
						</div>
						
						{/* League Filter Dropdown */}
						<div className="w-full md:w-64">
							<label htmlFor="league-select" className="block text-sm font-medium text-gray-700 mb-1">
								Filter by League
							</label>
							<select
								id="league-select"
								value={selectedLeague}
								onChange={(e) => setSelectedLeague(e.target.value)}
								className="block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white"
							>
								<option value="all">All Leagues</option>
								{getLeaguesByCountry().map((item) => (
									<option key={item.league.id} value={item.league.id}>
										{item.league.name}
									</option>
								))}
							</select>
						</div>
					</div>
				</div>
			)}
			
			{/* Leagues List */}
			{activeTab === "all" ? (
				<div>
					{filteredLeagues().map((item) => {
						const currentSeason = item.seasons?.find(
							(season) => season.current
						);
						return (
							<div
								key={item.league.id}
								className="block bg-white rounded-lg shadow-md p-6 mb-4 hover:shadow-lg transition-shadow duration-200"
							>
								<div className="flex justify-between items-start">
									<Link
										to={`/league/${item.league.id}?season=${
											currentSeason?.year || 2024
										}`}
										className="flex-1"
									>
										<div className="flex items-center gap-4 mb-4">
											<img
												src={item.league.logo}
												alt={item.league.name}
												className="w-16 h-16 object-contain"
											/>
											<div>
												<h2 className="text-xl font-semibold">
													{item.league.name}
												</h2>
												<div className="flex items-center gap-2">
													<img
														src={item.country.flag}
														alt={item.country.name}
														className="w-6 h-4"
													/>
													<p className="text-gray-600">
														{item.country.name}
													</p>
												</div>
											</div>
										</div>

										<div className="space-y-2">
											<h3 className="font-semibold">Seasons:</h3>
											<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
												{item.seasons.map((season) => (
													<div
														key={season.year}
														className={`p-3 rounded-lg ${
															season.current
																? "bg-blue-100 border border-blue-300"
																: "bg-gray-50"
														}`}>
														<p className="font-medium">
															Year: {season.year}
														</p>
														<p className="text-sm text-gray-600">
															{season.start} to {season.end}
														</p>
														{season.current && (
															<span className="text-blue-600 text-sm">
																Current Season
															</span>
														)}
													</div>
												))}
											</div>
										</div>
									</Link>
									
									<button
										onClick={() => toggleFavorite(
											item.league.id,
											item.league.name,
											item.league.logo,
											item.country.name,
											item.country.flag
										)}
										className={`ml-4 p-2 rounded-full ${
											isLeagueFavorite(item.league.id)
												? "text-red-500"
												: "text-gray-400"
										} hover:bg-gray-100`}
										title={isLeagueFavorite(item.league.id) ? "Remove from favorites" : "Add to favorites"}
									>
										<svg
											xmlns="http://www.w3.org/2000/svg"
											className="h-6 w-6"
											fill={isLeagueFavorite(item.league.id) ? "currentColor" : "none"}
											viewBox="0 0 24 24"
											stroke="currentColor"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
											/>
										</svg>
									</button>
								</div>
							</div>
						);
					})}
				</div>
			) : (
				<div>
					{favoriteLeagues.length === 0 ? (
						<div className="text-center py-8">
							<p className="text-gray-500">You haven't favorited any leagues yet.</p>
							<button
								onClick={() => setActiveTab("all")}
								className="mt-4 px-4 py-2 bg-blue-800 text-white rounded hover:bg-blue-700"
							>
								Browse Leagues
							</button>
						</div>
					) : (
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
							{favoriteLeagues.map((fav) => (
								<div
									key={fav.league_id}
									className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200"
								>
									<div className="flex justify-between items-start">
										<Link
											to={`/league/${fav.league_id}`}
											className="flex-1"
										>
											<div className="flex items-center gap-4">
												<img
													src={fav.league_logo}
													alt={fav.league_name}
													className="w-16 h-16 object-contain"
												/>
												<div>
													<h2 className="text-xl font-semibold">
														{fav.league_name}
													</h2>
													<div className="flex items-center gap-2">
														<img
															src={fav.country_flag}
															alt={fav.country_name}
															className="w-6 h-4"
														/>
														<p className="text-gray-600">
															{fav.country_name}
														</p>
													</div>
												</div>
											</div>
										</Link>
										
										<button
											onClick={() => toggleFavorite(
												fav.league_id,
												fav.league_name,
												fav.league_logo,
												fav.country_name,
												fav.country_flag
											)}
											className="ml-4 p-2 rounded-full text-red-500 hover:bg-gray-100"
											title="Remove from favorites"
										>
											<svg
												xmlns="http://www.w3.org/2000/svg"
												className="h-6 w-6"
												fill="currentColor"
												viewBox="0 0 24 24"
												stroke="currentColor"
											>
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													strokeWidth={2}
													d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
												/>
											</svg>
										</button>
									</div>
								</div>
							))}
						</div>
					)}
				</div>
			)}
		</div>
	);
}

export default Leagues;
