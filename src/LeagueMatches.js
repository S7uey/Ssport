import { useEffect, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { PDFDownloadLink } from '@react-pdf/renderer';
import MatchPDF from './MatchPDF';

function LeagueMatches() {
	const { id } = useParams();
	const [searchParams] = useSearchParams();
	const season = searchParams.get("season") || "2024";
	const [matches, setMatches] = useState([]);
	const [rounds, setRounds] = useState([]);
	const [selectedRound, setSelectedRound] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [leagueInfo, setLeagueInfo] = useState(null);
	const [matchStats, setMatchStats] = useState({});

	useEffect(() => {
		fetchLeagueInfo();
		fetchRounds();
	}, [id]);

	useEffect(() => {
		if (selectedRound) {
			fetchMatches();
		}
	}, [selectedRound]);

	useEffect(() => {
		if (matches.length > 0) {
			matches.forEach(match => {
				fetchMatchStats(match.fixture.id);
			});
		}
	}, [matches]);

	const fetchLeagueInfo = async () => {
		try {
			const response = await fetch(
				`https://v3.football.api-sports.io/leagues?id=${id}`,
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
			if (data.response && data.response.length > 0) {
				setLeagueInfo(data.response[0]);
			}
		} catch (err) {
			console.error("Error fetching league info:", err);
		}
	};

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
			].sort((a, b) => {
				// Extract numbers from round strings (e.g., "Regular Season - 1" -> 1)
				const numA = parseInt(a.match(/\d+/)?.[0] || "0");
				const numB = parseInt(b.match(/\d+/)?.[0] || "0");
				return numA - numB;
			});
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
			setMatches(data.response);
			setLoading(false);
		} catch (err) {
			setError(err.message);
			setLoading(false);
		}
	};

	const fetchMatchStats = async (fixtureId) => {
		try {
			const response = await fetch(
				`https://v3.football.api-sports.io/fixtures/statistics?fixture=${fixtureId}`,
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
			if (data.response && Array.isArray(data.response)) {
				setMatchStats(prev => ({
					...prev,
					[fixtureId]: data.response
				}));
			}
		} catch (err) {
			console.error("Error fetching match stats:", err);
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
				to="/leagues"
				className="inline-block mb-6 text-blue-600 hover:text-blue-800">
				← Back to Leagues
			</Link>

			{leagueInfo && (
				<div className="flex items-center gap-4 mb-6">
					<img
						src={leagueInfo.league.logo}
						alt={leagueInfo.league.name}
						className="w-16 h-16 object-contain"
					/>
					<div>
						<h1 className="text-3xl font-bold">{leagueInfo.league.name}</h1>
						<div className="flex items-center gap-2">
							<img
								src={leagueInfo.country.flag}
								alt={leagueInfo.country.name}
								className="w-6 h-4"
							/>
							<p className="text-gray-600">{leagueInfo.country.name}</p>
						</div>
					</div>
				</div>
			)}

			<div className="mb-6">
				<select
					value={selectedRound}
					onChange={(e) => setSelectedRound(e.target.value)}
					className="block w-full md:w-64 px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
				>
					{rounds.map((round) => (
						<option key={round} value={round}>
							{round}
						</option>
					))}
				</select>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
				{matches.map((match) => (
					<div
						key={match.fixture.id}
						className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200"
					>
						<div className="flex justify-between items-center mb-4">
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
							<div className="text-lg font-bold">VS</div>
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

						<div className="text-sm text-gray-600">
							{new Date(match.fixture.date).toLocaleDateString()}{" "}
							- {match.fixture.status.long}
						</div>
						<div className="flex justify-between items-center mt-2">
							<Link
								to={`/predictions?fixture=${match.fixture.id}`}
								className="text-blue-600 hover:text-blue-800 text-sm">
								{match.fixture.status.short === "FT" ? "View Results" : "View Predictions"}
							</Link>
							<PDFDownloadLink
								document={<MatchPDF match={match} stats={matchStats[match.fixture.id]} />}
								fileName={`${match.teams.home.name}-vs-${match.teams.away.name}.pdf`}
								className="text-green-600 hover:text-green-800 text-sm">
								{({ blob, url, loading, error }) =>
									loading ? "Generating PDF..." : "Download PDF"
								}
							</PDFDownloadLink>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}

export default LeagueMatches;
