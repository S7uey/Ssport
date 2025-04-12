import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

const Predictions = () => {
	const [match, setMatch] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [aiAnalysis, setAiAnalysis] = useState(null);
	const [aiLoading, setAiLoading] = useState(false);
	const location = useLocation();
	
	// Get the fixture ID from the URL query parameters
	const searchParams = new URLSearchParams(location.search);
	const fixtureId = searchParams.get('fixture');

	// Fetch match and prediction
	const fetchMatch = async () => {
		if (!fixtureId) {
			setError("No fixture ID provided");
			setLoading(false);
			return;
		}

		try {
			setLoading(true);
			// Fetch match details
			const matchResponse = await fetch(
				`https://v3.football.api-sports.io/fixtures?id=${fixtureId}`,
				{
					method: "GET",
					headers: {
						"x-rapidapi-host": "v3.football.api-sports.io",
						"x-rapidapi-key": "3e35192ee89b4d9324a60a8a2907218b",
					},
				}
			);

			if (!matchResponse.ok) {
				throw new Error("Network response was not ok");
			}

			const matchData = await matchResponse.json();
			
			if (!matchData.response || matchData.response.length === 0) {
				throw new Error("Match not found");
			}
			
			const matchDetails = matchData.response[0];
			
			// Fetch prediction for the match
			try {
				const predictionsResponse = await fetch(
					`https://v3.football.api-sports.io/predictions?fixture=${fixtureId}`,
					{
						method: "GET",
						headers: {
							"x-rapidapi-host": "v3.football.api-sports.io",
							"x-rapidapi-key": "3e35192ee89b4d9324a60a8a2907218b",
						},
					}
				);
				const predictionsData = await predictionsResponse.json();
				
				if (predictionsData.response && predictionsData.response.length > 0) {
					matchDetails.predictions = predictionsData.response[0];
				}
			} catch (predErr) {
				console.error("Error fetching predictions:", predErr);
				// Continue without predictions
			}
			
			setMatch(matchDetails);
			setLoading(false);
			
			// Generate AI analysis after match data is loaded
			generateAiAnalysis(matchDetails);
		} catch (err) {
			console.error("Error fetching match:", err);
			setError(err.message);
			setLoading(false);
		}
	};
	
	// Generate AI analysis for the match
	const generateAiAnalysis = async (matchData) => {
		if (!matchData) return;
		
		try {
			setAiLoading(true);
			
			// Prepare data for AI analysis
			const homeTeam = matchData.teams.home.name;
			const awayTeam = matchData.teams.away.name;
			const league = matchData.league.name;
			const date = new Date(matchData.fixture.date).toLocaleDateString();
			
			// Get team stats if available
			let homeTeamStats = null;
			let awayTeamStats = null;
			
			try {
				// Fetch team statistics
				const homeStatsResponse = await fetch(
					`https://v3.football.api-sports.io/teams/statistics?league=${matchData.league.id}&season=2024&team=${matchData.teams.home.id}`,
					{
						method: "GET",
						headers: {
							"x-rapidapi-host": "v3.football.api-sports.io",
							"x-rapidapi-key": "3e35192ee89b4d9324a60a8a2907218b",
						},
					}
				);
				
				const awayStatsResponse = await fetch(
					`https://v3.football.api-sports.io/teams/statistics?league=${matchData.league.id}&season=2024&team=${matchData.teams.away.id}`,
					{
						method: "GET",
						headers: {
							"x-rapidapi-host": "v3.football.api-sports.io",
							"x-rapidapi-key": "3e35192ee89b4d9324a60a8a2907218b",
						},
					}
				);
				
				const homeStatsData = await homeStatsResponse.json();
				const awayStatsData = await awayStatsResponse.json();
				
				if (homeStatsData.response) {
					homeTeamStats = homeStatsData.response;
				}
				
				if (awayStatsData.response) {
					awayTeamStats = awayStatsData.response;
				}
			} catch (statsErr) {
				console.error("Error fetching team stats:", statsErr);
				// Continue without team stats
			}
			
			// Generate AI analysis based on available data
			let analysis = {
				summary: "",
				keyFactors: [],
				recommendation: ""
			};
			
			// If we have predictions, use them to enhance the analysis
			if (matchData.predictions) {
				const prediction = matchData.predictions.predictions;
				const homeWinProb = prediction.percent.home;
				const drawProb = prediction.percent.draw;
				const awayWinProb = prediction.percent.away;
				const predictedWinner = prediction.winner.name;
				const advice = prediction.advice;
				
				// Generate summary based on prediction data
				analysis.summary = `Based on our analysis, ${predictedWinner} is the predicted winner for this match with a ${Math.max(homeWinProb, drawProb, awayWinProb)}% probability. ${advice}`;
				
				// Add key factors based on prediction data
				analysis.keyFactors.push(`Home team win probability: ${homeWinProb}`);
				analysis.keyFactors.push(`Draw probability: ${drawProb}`);
				analysis.keyFactors.push(`Away team win probability: ${awayWinProb}`);
				
				// Add recommendation
				analysis.recommendation = advice;
			} else {
				// Fallback analysis if no predictions available
				analysis.summary = `This match between ${homeTeam} and ${awayTeam} in the ${league} on ${date} promises to be an interesting encounter.`;
				analysis.keyFactors.push("Historical performance between these teams");
				analysis.keyFactors.push("Current form and momentum");
				analysis.keyFactors.push("Home advantage for " + homeTeam);
				analysis.recommendation = "Watch this match for an exciting display of football.";
			}
			
			// Add team stats to analysis if available
			if (homeTeamStats && awayTeamStats) {
				analysis.keyFactors.push(`${homeTeam} has scored ${homeTeamStats.goals.for.total.total || 'unknown'} goals this season`);
				analysis.keyFactors.push(`${awayTeam} has scored ${awayTeamStats.goals.for.total.total || 'unknown'} goals this season`);
				analysis.keyFactors.push(`${homeTeam} has conceded ${homeTeamStats.goals.against.total.total || 'unknown'} goals this season`);
				analysis.keyFactors.push(`${awayTeam} has conceded ${awayTeamStats.goals.against.total.total || 'unknown'} goals this season`);
			}
			
			setAiAnalysis(analysis);
		} catch (err) {
			console.error("Error generating AI analysis:", err);
			// Set a fallback analysis
			setAiAnalysis({
				summary: "We're unable to generate a detailed analysis at this time.",
				keyFactors: ["Match data is being processed", "Please check back later"],
				recommendation: "Watch the match for an exciting display of football."
			});
		} finally {
			setAiLoading(false);
		}
	};

	useEffect(() => {
		fetchMatch();
	}, [fixtureId]);

	if (loading) return <div className="text-center p-4">Loading...</div>;
	if (error) return <div className="text-center p-4 text-red-500">Error: {error}</div>;
	if (!match) return <div className="text-center p-4">No match found</div>;

	return (
		<div className="container mx-auto p-4">
			<h2 className="text-2xl font-bold mb-4">
				{match.fixture.status.short === "FT" ? "Match Result" : "Match Prediction"}
			</h2>
			
			{/* Match Details */}
			<div className="bg-white rounded-lg shadow-md p-6 mb-6">
				<div className="flex justify-between items-center mb-4">
					<div className="flex items-center space-x-4">
						<img
							src={match.teams.home.logo}
							alt={match.teams.home.name}
							className="w-16 h-16"
						/>
						<span className="font-semibold text-lg">
							{match.teams.home.name}
						</span>
					</div>
					<div className="text-center">
						{match.fixture.status.short === "FT" ? (
							<div className="text-3xl font-bold">
								{match.goals.home} - {match.goals.away}
							</div>
						) : (
							<>
								<div className="text-lg font-medium">
									{new Date(match.fixture.date).toLocaleDateString()}
								</div>
								<div className="text-lg font-medium">
									{new Date(match.fixture.date).toLocaleTimeString([], {
										hour: "2-digit",
										minute: "2-digit",
									})}
								</div>
							</>
						)}
						<div className="text-sm text-gray-600 mt-1">
							{match.league.name}
						</div>
						<div className="text-sm text-gray-600">
							{match.fixture.status.long}
						</div>
					</div>
					<div className="flex items-center space-x-4">
						<span className="font-semibold text-lg">
							{match.teams.away.name}
						</span>
						<img
							src={match.teams.away.logo}
							alt={match.teams.away.name}
							className="w-16 h-16"
						/>
					</div>
				</div>
			</div>

			{/* Match Prediction - Only show for upcoming matches */}
			{match.fixture.status.short !== "FT" && match.predictions && (
				<div className="bg-white rounded-lg shadow-md p-6 mb-6">
					<h3 className="text-xl font-semibold mb-4">Prediction</h3>
					<div className="space-y-4">
						<div>
							<p className="text-gray-600">Predicted Winner:</p>
							<p className="font-medium">{match.predictions.predictions.winner.name}</p>
						</div>
						<div>
							<p className="text-gray-600">Betting Advice:</p>
							<p className="font-medium">{match.predictions.predictions.advice}</p>
						</div>
						<div>
							<p className="text-gray-600">Win Probabilities:</p>
							<div className="grid grid-cols-3 gap-4 mt-2">
								<div>
									<p className="text-sm text-gray-500">Home Win</p>
									<p className="font-medium">{match.predictions.predictions.percent.home}%</p>
								</div>
								<div>
									<p className="text-sm text-gray-500">Draw</p>
									<p className="font-medium">{match.predictions.predictions.percent.draw}%</p>
								</div>
								<div>
									<p className="text-sm text-gray-500">Away Win</p>
									<p className="font-medium">{match.predictions.predictions.percent.away}%</p>
								</div>
							</div>
						</div>
					</div>
				</div>
			)}

			{/* AI Analysis - Only show for upcoming matches */}
			{match.fixture.status.short !== "FT" && aiAnalysis && !aiLoading && (
				<div className="bg-white rounded-lg shadow-md p-6">
					<h3 className="text-xl font-semibold mb-4">AI Analysis</h3>
					{aiLoading ? (
						<div className="flex justify-center items-center py-4">
							<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-800"></div>
						</div>
					) : (
						<div className="space-y-6">
							<div>
								<h4 className="font-medium text-lg mb-2">Summary</h4>
								<p className="text-gray-700">{aiAnalysis.summary}</p>
							</div>
							
							<div>
								<h4 className="font-medium text-lg mb-2">Key Factors</h4>
								<ul className="list-disc list-inside space-y-1">
									{aiAnalysis.keyFactors.map((factor, index) => (
										<li key={index} className="text-gray-700">{factor}</li>
									))}
								</ul>
							</div>
							
							<div>
								<h4 className="font-medium text-lg mb-2">Recommendation</h4>
								<p className="text-gray-700">{aiAnalysis.recommendation}</p>
							</div>
						</div>
					)}
				</div>
			)}
		</div>
	);
};

export default Predictions;

