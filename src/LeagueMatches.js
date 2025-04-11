import { useEffect, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";

function LeagueMatches() {
	const { id } = useParams();
	const [searchParams] = useSearchParams();
	const season = searchParams.get("season") || "2023";
	const [matches, setMatches] = useState(null);
	const [rounds, setRounds] = useState([]);
	const [selectedRound, setSelectedRound] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		fetchRounds();
	}, [id]);

	useEffect(() => {
		if (selectedRound) {
			fetchMatches();
		}
	}, [selectedRound]);

	const fetchRounds = async () => {
		try {
			const response = await fetch(
				`https://v3.football.api-sports.io/fixtures?league=${id}&season=${season}`,
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
			// Extract unique rounds from the response
			const uniqueRounds = [
				...new Set(data.response.map((match) => match.league.round)),
			];
			setRounds(uniqueRounds);
			setSelectedRound(uniqueRounds[0]); // Select first round by default
			setLoading(false);
		} catch (err) {
			setError(err.message);
			setLoading(false);
		}
	};

	const fetchMatches = async () => {
		try {
			setLoading(true);
			const response = await fetch(
				`https://v3.football.api-sports.io/fixtures?league=${id}&season=${season}&round=${selectedRound}`,
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
			setMatches(data.response); // Store only the response array
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
			<Link
				to="/"
				className="inline-block mb-6 text-blue-600 hover:text-blue-800">
				← Back to Leagues
			</Link>

			<h1 className="text-3xl font-bold mb-6">League Matches</h1>

			<div className="mb-6">
				<select
					value={selectedRound || ""}
					onChange={(e) => setSelectedRound(e.target.value)}
					className="w-full md:w-auto px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
					{rounds.map((round) => (
						<option key={round} value={round}>
							{round}
						</option>
					))}
				</select>
			</div>

			<div className="grid gap-4">
				{matches?.map((match) => (
					<div
						key={match.fixture.id}
						className="bg-white rounded-lg shadow-md p-4">
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-2">
								<img
									src={match.teams.home.logo}
									alt={match.teams.home.name}
									className="w-8 h-8 object-contain"
								/>
								<span className="font-medium">
									{match.teams.home.name}
								</span>
							</div>

							<div className="flex items-center gap-2">
								<span className="font-bold">
									{match.goals.home ?? "-"} -{" "}
									{match.goals.away ?? "-"}
								</span>
							</div>

							<div className="flex items-center gap-2">
								<span className="font-medium">
									{match.teams.away.name}
								</span>
								<img
									src={match.teams.away.logo}
									alt={match.teams.away.name}
									className="w-8 h-8 object-contain"
								/>
							</div>
						</div>

						<div className="mt-2 flex justify-between items-center">
							<div className="text-sm text-gray-600">
								{new Date(
									match.fixture.date
								).toLocaleDateString()}{" "}
								- {match.fixture.status.long}
							</div>
							<Link
								to={`/predictions?fixture=${match.fixture.id}`}
								className="text-blue-600 hover:text-blue-800 text-sm">
								View Predictions
							</Link>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}

export default LeagueMatches;
