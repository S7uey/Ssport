import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./App.css";

function Leagues() {
	const [leagues, setLeagues] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		fetchLeagues();
	}, []);

	const fetchLeagues = async () => {
		try {
			const response = await fetch(
				"https://v3.football.api-sports.io/leagues",
				{
					method: "GET",
					headers: {
						"x-rapidapi-host": "v3.football.api-sports.io",
						"x-rapidapi-key": "3e35192ee89b4d9324a60a8a2907218b",
					},
				}
			);

			if (!response.ok) {
				throw new Error("Network response was not ok");
			}

			const data = await response.json();
			setLeagues(data);
			setLoading(false);
		} catch (err) {
			setError(err.message);
			setLoading(false);
		}
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

			{leagues?.response?.map((item) => {
				const currentSeason = item.seasons.find(
					(season) => season.current
				);
				return (
					<Link
						to={`/league/${item.league.id}?season=${
							currentSeason?.year || 2023
						}`}
						key={item.league.id}
						className="block bg-white rounded-lg shadow-md p-6 mb-4 hover:shadow-lg transition-shadow duration-200">
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
				);
			})}
		</div>
	);
}

export default Leagues;
