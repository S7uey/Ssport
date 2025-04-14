import React, { useEffect, useState } from "react";
import { Link, useParams, useLocation } from "react-router-dom";
import AIAnalysis from "./AiAnalysis";

const PlayerDetails = () => {
	const { id } = useParams();
	const location = useLocation();
	const [playerStats, setPlayerStats] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		const fetchPlayerStats = async () => {
			try {
				// Get player ID from URL params and validate it
				if (!id) {
					setError("Player ID is required");
					setLoading(false);
					return;
				}

				const playerIdNum = parseInt(id, 10);
				if (isNaN(playerIdNum)) {
					setError("Invalid player ID format");
					setLoading(false);
					return;
				}

				// Get league ID from URL search params or use default (Premier League)
				const searchParams = new URLSearchParams(location.search);
				const leagueId = searchParams.get('league') || '39';
				const teamId = searchParams.get('team');
				console.log('Fetching player stats for player ID:', playerIdNum, 'league ID:', leagueId, 'and team ID:', teamId);

				const response = await fetch(
					`https://v3.football.api-sports.io/players?id=${playerIdNum}&season=2024&league=${leagueId}`,
					{
						method: "GET",
						headers: {
							"x-rapidapi-host": "v3.football.api-sports.io",
							"x-rapidapi-key": "3e35192ee89b4d9324a60a8a2907218b",
						},
					}
				);
				const data = await response.json();
				console.log('API Response:', data);

				if (data.response && data.response.length > 0) {
					const playerData = data.response[0];
					console.log('Player Data:', playerData);

					// Check if we have statistics
					if (playerData.statistics && playerData.statistics.length > 0) {
						// Find statistics for the requested league
						const leagueStats = playerData.statistics.find(
							stat => stat.league && stat.league.id.toString() === leagueId
						);

						if (leagueStats) {
							setPlayerStats({
								player: playerData.player,
								statistics: [leagueStats]
							});
						} else {
							// If no stats for the specific league, use all available stats
							setPlayerStats({
								player: playerData.player,
								statistics: playerData.statistics
							});
							setError("No statistics available for this league. Showing available statistics.");
						}
					} else {
						// If no statistics at all, just set the player info
						setPlayerStats({
							player: playerData.player,
							statistics: []
						});
						setError("No statistics available for this player.");
					}
				} else {
					console.log('No player data found in response');
					setError("Player not found");
				}
				setLoading(false);
			} catch (err) {
				console.error('Error fetching player stats:', err);
				setError(err.message);
				setLoading(false);
			}
		};

		fetchPlayerStats();
	}, [id, location.search]);

	if (loading) return <div className="text-center p-4">Loading...</div>;
	if (error)
		return (
			<div className="text-center p-4 text-red-500">Error: {error}</div>
		);
	if (!playerStats)
		return <div className="text-center p-4">No player data available</div>;

	const analysisData = {
		player: playerStats.player,
		statistics: playerStats.statistics,
		recentForm: playerStats.recentMatches,
	};

	return (
		<div className="container mx-auto p-4">
			<Link
				to={-1}
				className="text-blue-600 hover:text-blue-800 mb-4 inline-block">
				← Back
			</Link>

			<div className="bg-white rounded-lg shadow-lg p-6">
				<div className="flex items-center mb-6">
					<img
						src={playerStats.player.photo}
						alt={playerStats.player.name}
						className="w-32 h-32 rounded-full object-cover"
					/>
					<div className="ml-6">
						<h1 className="text-3xl font-bold">
							{playerStats.player.name}
						</h1>
						<div className="text-gray-600">
							{playerStats.statistics[0].team.name}
						</div>
						<div className="mt-2">
							<span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
								{playerStats.statistics[0].games.position}
							</span>
						</div>
					</div>
				</div>

				<div className="grid md:grid-cols-2 gap-6">
					{/* Personal Info */}
					<div className="bg-gray-50 p-4 rounded-lg">
						<h2 className="text-xl font-semibold mb-4">
							Personal Information
						</h2>
						<div className="space-y-2">
							<div className="flex justify-between">
								<span className="text-gray-600">Age</span>
								<span>{playerStats.player.age}</span>
							</div>
							<div className="flex justify-between">
								<span className="text-gray-600">
									Nationality
								</span>
								<span>{playerStats.player.nationality}</span>
							</div>
							<div className="flex justify-between">
								<span className="text-gray-600">Height</span>
								<span>{playerStats.player.height}</span>
							</div>
							<div className="flex justify-between">
								<span className="text-gray-600">Weight</span>
								<span>{playerStats.player.weight}</span>
							</div>
						</div>
					</div>

					{/* Season Stats */}
					<div className="bg-gray-50 p-4 rounded-lg">
						<h2 className="text-xl font-semibold mb-4">
							Season Statistics
						</h2>
						<div className="space-y-2">
							<div className="flex justify-between">
								<span className="text-gray-600">
									Appearances
								</span>
								<span>
									{
										playerStats.statistics[0].games
											.appearences
									}
								</span>
							</div>
							<div className="flex justify-between">
								<span className="text-gray-600">Goals</span>
								<span>
									{playerStats.statistics[0].goals.total}
								</span>
							</div>
							<div className="flex justify-between">
								<span className="text-gray-600">Assists</span>
								<span>
									{playerStats.statistics[0].goals.assists}
								</span>
							</div>
							<div className="flex justify-between">
								<span className="text-gray-600">
									Minutes Played
								</span>
								<span>
									{playerStats.statistics[0].games.minutes}
								</span>
							</div>
						</div>
					</div>
				</div>
			</div>

			<AIAnalysis data={analysisData} type="player" />
		</div>
	);
};

export default PlayerDetails;
