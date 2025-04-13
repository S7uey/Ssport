import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import AIAnalysis from "./AiAnalysis";

const FixtureDetails = () => {
	const { fixtureId } = useParams();
	const [fixture, setFixture] = useState(null);
	const [predictions, setPredictions] = useState(null);
	const [homeTeamSquad, setHomeTeamSquad] = useState(null);
	const [awayTeamSquad, setAwayTeamSquad] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		const fetchAllData = async () => {
			try {
				// Fetch fixture details
				const fixtureResponse = await fetch(
					`https://v3.football.api-sports.io/fixtures?id=${fixtureId}`,
					{
						method: "GET",
						headers: {
							"x-rapidapi-host": "v3.football.api-sports.io",
							"x-rapidapi-key":
								"3e35192ee89b4d9324a60a8a2907218b",
						},
					}
				);
				const fixtureData = await fixtureResponse.json();
				const fixtureDetails = fixtureData.response[0];
				setFixture(fixtureDetails);

				// Fetch match statistics if match is finished
				if (fixtureDetails.fixture.status.short === "FT") {
					const statisticsResponse = await fetch(
						`https://v3.football.api-sports.io/fixtures/statistics?fixture=${fixtureId}&half=true`,
						{
							method: "GET",
							headers: {
								"x-rapidapi-host": "v3.football.api-sports.io",
								"x-rapidapi-key":
									"3e35192ee89b4d9324a60a8a2907218b",
							},
						}
					);
					const statisticsData = await statisticsResponse.json();
					console.log("Statistics API Response:", statisticsData);
					
					if (statisticsData.response && statisticsData.response.length > 0) {
						// Update fixture with statistics data
						fixtureDetails.statistics = statisticsData.response;
						console.log("Statistics data added to fixture:", fixtureDetails.statistics);
						setFixture({...fixtureDetails});
					} else {
						console.log("No statistics data available in the response");
					}
				}

				// Fetch predictions if match hasn't started
				if (fixtureDetails.fixture.status.short !== "FT") {
					const predictionsResponse = await fetch(
						`https://v3.football.api-sports.io/predictions?fixture=${fixtureId}`,
						{
							method: "GET",
							headers: {
								"x-rapidapi-host": "v3.football.api-sports.io",
								"x-rapidapi-key":
									"3e35192ee89b4d9324a60a8a2907218b",
							},
						}
					);
					const predictionsData = await predictionsResponse.json();
					setPredictions(predictionsData.response[0]);
				}

				// Fetch squads for both teams
				const [homeSquad, awaySquad] = await Promise.all([
					fetch(
						`https://v3.football.api-sports.io/players/squads?team=${fixtureDetails.teams.home.id}`,
						{
							method: "GET",
							headers: {
								"x-rapidapi-host": "v3.football.api-sports.io",
								"x-rapidapi-key":
									"3e35192ee89b4d9324a60a8a2907218b",
							},
						}
					),
					fetch(
						`https://v3.football.api-sports.io/players/squads?team=${fixtureDetails.teams.away.id}`,
						{
							method: "GET",
							headers: {
								"x-rapidapi-host": "v3.football.api-sports.io",
								"x-rapidapi-key":
									"3e35192ee89b4d9324a60a8a2907218b",
							},
						}
					),
				]);

				const homeSquadData = await homeSquad.json();
				const awaySquadData = await awaySquad.json();

				setHomeTeamSquad(homeSquadData.response[0]);
				setAwayTeamSquad(awaySquadData.response[0]);
				setLoading(false);
			} catch (err) {
				setError(err.message);
				setLoading(false);
			}
		};

		fetchAllData();
	}, [fixtureId]);

	if (loading) return <div className="text-center p-4">Loading...</div>;
	if (error)
		return (
			<div className="text-center p-4 text-red-500">Error: {error}</div>
		);
	if (!fixture)
		return <div className="text-center p-4">No fixture data available</div>;

	const isMatchFinished = fixture.fixture.status.short === "FT";

	const analysisData = {
		fixture: fixture,
		predictions: predictions,
		homeTeam: {
			name: fixture?.teams.home.name,
			stats: fixture?.statistics?.find(
				(s) => s.team.id === fixture.teams.home.id
			),
			squad: homeTeamSquad,
		},
		awayTeam: {
			name: fixture?.teams.away.name,
			stats: fixture?.statistics?.find(
				(s) => s.team.id === fixture.teams.away.id
			),
			squad: awayTeamSquad,
		},
	};

	return (
		<div className="container mx-auto p-4">
			<Link
				to="/predictions"
				className="text-blue-600 hover:text-blue-800 mb-4 inline-block">
				← Back to Fixtures
			</Link>

			{/* Match Header */}
			<div className="bg-white rounded-lg shadow-lg p-6 mb-6">
				<div className="flex justify-between items-center">
					<div className="text-center">
						<img
							src={fixture.teams.home.logo}
							alt={fixture.teams.home.name}
							className="w-16 h-16 mx-auto"
						/>
						<h2 className="mt-2 font-bold">
							{fixture.teams.home.name}
						</h2>
					</div>
					<div className="text-center flex flex-col justify-center items-center h-full">
						<div className="text-3xl font-bold">
							{isMatchFinished
								? `${fixture.goals.home} - ${fixture.goals.away}`
								: "vs"}
						</div>
						<div className="text-sm text-gray-600">
							{new Date(
								fixture.fixture.date
							).toLocaleDateString()}
						</div>
						<div className="text-sm font-semibold text-gray-800">
							{fixture.fixture.venue.name}
						</div>
					</div>
					<div className="text-center">
						<img
							src={fixture.teams.away.logo}
							alt={fixture.teams.away.name}
							className="w-16 h-16 mx-auto"
						/>
						<h2 className="mt-2 font-bold">
							{fixture.teams.away.name}
						</h2>
					</div>
				</div>
			</div>

			{/* Match Stats or Predictions */}
			{isMatchFinished ? (
				<div className="bg-white rounded-lg shadow-lg p-6 mb-6">
					<h3 className="text-xl font-bold mb-4">Match Statistics</h3>
					{fixture.statistics && fixture.statistics.length > 0 ? (
						<div className="grid grid-cols-3 gap-4">
							{console.log("Rendering statistics:", fixture.statistics)}
							
							{/* Helper function to get statistic value */}
							{(() => {
								const getStatValue = (teamIndex, statType) => {
									if (!fixture.statistics[teamIndex] || !fixture.statistics[teamIndex].statistics) return "0";
									const stat = fixture.statistics[teamIndex].statistics.find(s => s.type === statType);
									return stat ? stat.value : "0";
								};
								
								// Define all statistics to display
								const statsToShow = [
									{ type: "Ball Possession", label: "Possession" },
									{ type: "Total Shots", label: "Total Shots" },
									{ type: "Shots on Goal", label: "Shots on Goal" },
									{ type: "Shots off Goal", label: "Shots off Goal" },
									{ type: "Shots insidebox", label: "Shots Inside Box" },
									{ type: "Shots outsidebox", label: "Shots Outside Box" },
									{ type: "Blocked Shots", label: "Blocked Shots" },
									{ type: "Total passes", label: "Total Passes" },
									{ type: "Passes accurate", label: "Accurate Passes" },
									{ type: "Passes %", label: "Pass Accuracy" },
									{ type: "Fouls", label: "Fouls" },
									{ type: "Yellow Cards", label: "Yellow Cards" },
									{ type: "Red Cards", label: "Red Cards" },
									{ type: "Goalkeeper Saves", label: "Goalkeeper Saves" },
									{ type: "Corner Kicks", label: "Corner Kicks" },
									{ type: "Offsides", label: "Offsides" }
								];
								
								return (
									<>
										{statsToShow.map((stat, index) => (
											<React.Fragment key={index}>
												<div className="text-right">
													{getStatValue(0, stat.type)}
												</div>
												<div className="text-center font-semibold">
													{stat.label}
												</div>
												<div className="text-left">
													{getStatValue(1, stat.type)}
												</div>
											</React.Fragment>
										))}
									</>
								);
							})()}
						</div>
					) : (
						<div className="text-center text-gray-500 py-4">
							Statistics not available for this match
						</div>
					)}
				</div>
			) : (
				predictions && (
					<div className="bg-white rounded-lg shadow-lg p-6 mb-6">
						<h3 className="text-xl font-bold mb-4">
							Match Predictions
						</h3>
						<div className="space-y-4">
							<div>
								<p className="font-semibold">
									Winner Prediction:
								</p>
								<p className="text-gray-700">
									{predictions.predictions.winner.name} (
									{predictions.predictions.winner.comment})
								</p>
							</div>
							<div>
								<p className="font-semibold">
									Prediction Advice:
								</p>
								<p className="text-gray-700">
									{predictions.predictions.advice}
								</p>
							</div>
							<div>
								<p className="font-semibold">
									Win Probability:
								</p>
								<div className="space-y-2">
									<div>
										<div className="flex justify-between mb-1">
											<span>Home</span>
											<span>
												{
													predictions.predictions
														.percent.home
												}
											</span>
										</div>
										<div className="w-full bg-gray-200 rounded-full h-2">
											<div
												className="bg-blue-600 h-2 rounded-full"
												style={{
													width: predictions
														.predictions.percent
														.home,
												}}></div>
										</div>
									</div>
									<div>
										<div className="flex justify-between mb-1">
											<span>Draw</span>
											<span>
												{
													predictions.predictions
														.percent.draw
												}
											</span>
										</div>
										<div className="w-full bg-gray-200 rounded-full h-2">
											<div
												className="bg-gray-600 h-2 rounded-full"
												style={{
													width: predictions
														.predictions.percent
														.draw,
												}}></div>
										</div>
									</div>
									<div>
										<div className="flex justify-between mb-1">
											<span>Away</span>
											<span>
												{
													predictions.predictions
														.percent.away
												}
											</span>
										</div>
										<div className="w-full bg-gray-200 rounded-full h-2">
											<div
												className="bg-green-600 h-2 rounded-full"
												style={{
													width: predictions
														.predictions.percent
														.away,
												}}></div>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				)
			)}

			{/* Team Squads */}
			<div className="grid md:grid-cols-2 gap-6">
				{/* Home Team Squad */}
				<div className="bg-white rounded-lg shadow-lg p-6">
					<h3 className="text-xl font-bold mb-4">
						{fixture.teams.home.name} Squad
					</h3>
					<div className="grid grid-cols-1 gap-4">
						{homeTeamSquad?.players.map((player) => (
							<Link
								to={`/player/${player.id}`}
								key={player.id}
								className="flex items-center p-3 hover:bg-gray-50 rounded-lg transition-colors">
								<img
									src={player.photo}
									alt={player.name}
									className="w-12 h-12 rounded-full object-cover"
								/>
								<div className="ml-4">
									<div className="font-semibold">
										{player.name}
									</div>
									<div className="text-sm text-gray-600">
										{player.position} - #{player.number}
									</div>
								</div>
							</Link>
						))}
					</div>
				</div>

				{/* Away Team Squad */}
				<div className="bg-white rounded-lg shadow-lg p-6">
					<h3 className="text-xl font-bold mb-4">
						{fixture.teams.away.name} Squad
					</h3>
					<div className="grid grid-cols-1 gap-4">
						{awayTeamSquad?.players.map((player) => (
							<Link
								to={`/player/${player.id}`}
								key={player.id}
								className="flex items-center p-3 hover:bg-gray-50 rounded-lg transition-colors">
								<img
									src={player.photo}
									alt={player.name}
									className="w-12 h-12 rounded-full object-cover"
								/>
								<div className="ml-4">
									<div className="font-semibold">
										{player.name}
									</div>
									<div className="text-sm text-gray-600">
										{player.position} - #{player.number}
									</div>
								</div>
							</Link>
						))}
					</div>
				</div>
			</div>

			<AIAnalysis data={analysisData} type="fixture" />
		</div>
	);
};

export default FixtureDetails;
