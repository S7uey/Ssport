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
				recommendation: "",
				formAnalysis: "",
				headToHead: "",
				injuryImpact: "",
				tacticalAnalysis: "",
				momentumAnalysis: "",
				keyBattles: ""
			};
			
			try {
				// If we have predictions, use them to enhance the analysis
				if (matchData.predictions) {
					const prediction = matchData.predictions.predictions;
					const homeWinProb = prediction.percent.home;
					const drawProb = prediction.percent.draw;
					const awayWinProb = prediction.percent.away;
					const predictedWinner = prediction.winner.name;
					const advice = prediction.advice;
					
					// Generate comprehensive summary
					analysis.summary = `Based on our comprehensive analysis, ${predictedWinner} is the predicted winner for this match with a ${Math.max(
						parseFloat(prediction.percent.home),
						parseFloat(prediction.percent.draw),
						parseFloat(prediction.percent.away)
					)}% probability. This prediction is based on current form, historical performance, and statistical analysis.`;
					
					// Add detailed key factors with context
					analysis.keyFactors.push(`Match Outcome Probabilities:`);
					analysis.keyFactors.push(`- ${homeTeam} win: ${prediction.percent.home}`);
					analysis.keyFactors.push(`- Draw: ${prediction.percent.draw}`);
					analysis.keyFactors.push(`- ${awayTeam} win: ${prediction.percent.away}`);
					
					// Add detailed statistics with context
					if (homeTeamStats && awayTeamStats) {
						analysis.keyFactors.push(`\nSeason Statistics:`);
						analysis.keyFactors.push(`${homeTeam}:`);
						analysis.keyFactors.push(`- Goals scored: ${homeTeamStats.goals.for.total.total || 'N/A'} (${homeTeamStats.goals.for.average.total || 'N/A'} per game)`);
						analysis.keyFactors.push(`- Goals conceded: ${homeTeamStats.goals.against.total.total || 'N/A'} (${homeTeamStats.goals.against.average.total || 'N/A'} per game)`);
						analysis.keyFactors.push(`- Clean sheets: ${homeTeamStats.clean_sheet.total || 'N/A'}`);
						
						analysis.keyFactors.push(`\n${awayTeam}:`);
						analysis.keyFactors.push(`- Goals scored: ${awayTeamStats.goals.for.total.total || 'N/A'} (${awayTeamStats.goals.for.average.total || 'N/A'} per game)`);
						analysis.keyFactors.push(`- Goals conceded: ${awayTeamStats.goals.against.total.total || 'N/A'} (${awayTeamStats.goals.against.average.total || 'N/A'} per game)`);
						analysis.keyFactors.push(`- Clean sheets: ${awayTeamStats.clean_sheet.total || 'N/A'}`);
					}
					
					// Add form analysis with interpretation
					if (homeTeamStats && awayTeamStats) {
						const homeForm = homeTeamStats.form;
						const awayForm = awayTeamStats.form;
						const homeFormLast5 = homeForm.slice(-5);
						const awayFormLast5 = awayForm.slice(-5);
						
						analysis.formAnalysis = `Recent Form Analysis:\n\n${homeTeam}:\n- Last 5 matches: ${homeFormLast5}\n- Current streak: ${getStreak(homeFormLast5)}\n\n${awayTeam}:\n- Last 5 matches: ${awayFormLast5}\n- Current streak: ${getStreak(awayFormLast5)}`;
					}
					
					// Add head-to-head analysis with context
					if (matchData.h2h) {
						const h2h = matchData.h2h;
						const last5Meetings = h2h.slice(0, 5);
						const homeWins = last5Meetings.filter(match => match.goals.home > match.goals.away).length;
						const awayWins = last5Meetings.filter(match => match.goals.away > match.goals.home).length;
						const draws = last5Meetings.filter(match => match.goals.home === match.goals.away).length;
						
						analysis.headToHead = `Head-to-Head Analysis (Last 5 meetings):\n\nResults:\n${last5Meetings.map(match => 
							`${match.teams.home.name} ${match.goals.home} - ${match.goals.away} ${match.teams.away.name}`
						).join('\n')}\n\nRecord:\n- ${homeTeam} wins: ${homeWins}\n- ${awayTeam} wins: ${awayWins}\n- Draws: ${draws}`;
					}
					
					// Add detailed tactical analysis
					analysis.tacticalAnalysis = `Tactical Analysis:\n\n${homeTeam}:\n- Formation: ${homeTeamStats?.formation || '4-3-3'}\n- Style: ${getPlayingStyle(homeTeamStats)}\n\n${awayTeam}:\n- Formation: ${awayTeamStats?.formation || '4-3-3'}\n- Style: ${getPlayingStyle(awayTeamStats)}`;
					
					// Add momentum analysis
					analysis.momentumAnalysis = `Momentum Analysis:\n\n${homeTeam}:\n- Current position: ${homeTeamStats?.league.position || 'N/A'}\n- Recent form: ${getFormDescription(homeTeamStats?.form)}\n\n${awayTeam}:\n- Current position: ${awayTeamStats?.league.position || 'N/A'}\n- Recent form: ${getFormDescription(awayTeamStats?.form)}`;
					
					// Add key battles
					analysis.keyBattles = `Key Battles to Watch:\n\n1. ${homeTeamStats?.topScorer || 'Home striker'} vs ${awayTeamStats?.defense?.best_player || 'Away defense'}\n2. ${awayTeamStats?.topScorer || 'Away striker'} vs ${homeTeamStats?.defense?.best_player || 'Home defense'}\n3. Midfield battle: ${homeTeamStats?.midfield?.best_player || 'Home midfielder'} vs ${awayTeamStats?.midfield?.best_player || 'Away midfielder'}`;
					
					// Add comprehensive recommendation
					analysis.recommendation = `${advice}\n\nKey Players to Watch:\n\n${homeTeam}:\n- Top scorer: ${homeTeamStats?.topScorer || 'N/A'}\n- Key creator: ${homeTeamStats?.assists?.best_player || 'N/A'}\n\n${awayTeam}:\n- Top scorer: ${awayTeamStats?.topScorer || 'N/A'}\n- Key creator: ${awayTeamStats?.assists?.best_player || 'N/A'}\n\nMatch Prediction: ${predictedWinner} to win with a ${Math.max(
						parseFloat(prediction.percent.home),
						parseFloat(prediction.percent.draw),
						parseFloat(prediction.percent.away)
					)} probability.`;
				} else {
					// Fallback analysis if no predictions available
					analysis.summary = `This match between ${homeTeam} and ${awayTeam} in the ${league} on ${date} promises to be an interesting encounter.`;
					analysis.keyFactors.push("Historical performance between these teams");
					analysis.keyFactors.push("Current form and momentum");
					analysis.keyFactors.push("Home advantage for " + homeTeam);
					analysis.formAnalysis = "Recent form data not available";
					analysis.headToHead = "Head-to-head data not available";
					analysis.tacticalAnalysis = "Tactical analysis not available";
					analysis.momentumAnalysis = "Momentum analysis not available";
					analysis.keyBattles = "Key battles not available";
					analysis.recommendation = "Watch this match for an exciting display of football.";
				}
				
				// Add team stats to analysis if available
				if (homeTeamStats && awayTeamStats) {
					analysis.keyFactors.push(`${homeTeam} has scored ${homeTeamStats.goals.for.total.total || 'unknown'} goals this season`);
					analysis.keyFactors.push(`${awayTeam} has scored ${awayTeamStats.goals.for.total.total || 'unknown'} goals this season`);
					analysis.keyFactors.push(`${homeTeam} has conceded ${homeTeamStats.goals.against.total.total || 'unknown'} goals this season`);
					analysis.keyFactors.push(`${awayTeam} has conceded ${awayTeamStats.goals.against.total.total || 'unknown'} goals this season`);
				}
			} catch (error) {
				console.error("Error generating AI analysis:", error);
				// Provide a basic analysis even if there's an error
				analysis.summary = `This match between ${homeTeam} and ${awayTeam} in the ${league} on ${date} promises to be an interesting encounter.`;
				analysis.keyFactors.push("Match data is being processed");
				analysis.keyFactors.push("Please check back later for more detailed analysis");
				analysis.recommendation = "Watch this match for an exciting display of football.";
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
						{match.fixture.status.short === "FT" || 
						 match.fixture.status.short === "1H" || 
						 match.fixture.status.short === "2H" || 
						 match.fixture.status.short === "HT" || 
						 match.fixture.status.short === "ET" || 
						 match.fixture.status.short === "P" || 
						 match.fixture.status.short === "BT" ? (
							<>
								<div className="text-3xl font-bold text-green-600">
									{match.goals.home} - {match.goals.away}
								</div>
								{match.fixture.status.short !== "FT" && (
									<div className="text-sm text-red-600 font-semibold">
										{match.fixture.status.elapsed}' {match.fixture.status.short === "HT" ? "HT" : ""}
									</div>
								)}
							</>
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
									<p className="font-medium">{match.predictions.predictions.percent.home}</p>
								</div>
								<div>
									<p className="text-sm text-gray-500">Draw</p>
									<p className="font-medium">{match.predictions.predictions.percent.draw}</p>
								</div>
								<div>
									<p className="text-sm text-gray-500">Away Win</p>
									<p className="font-medium">{match.predictions.predictions.percent.away}</p>
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
							{/* Summary Section */}
							<div>
								<h4 className="font-medium text-lg mb-2">Summary</h4>
								<p className="text-gray-700">{aiAnalysis.summary}</p>
							</div>
							
							{/* Key Factors Section */}
							<div>
								<h4 className="font-medium text-lg mb-2">Key Factors</h4>
								<ul className="list-disc list-inside space-y-1">
									{aiAnalysis.keyFactors.map((factor, index) => (
										<li key={index} className="text-gray-700">{factor}</li>
									))}
								</ul>
							</div>
							
							{/* Form Analysis Section */}
							{aiAnalysis.formAnalysis && (
								<div>
									<h4 className="font-medium text-lg mb-2">Form Analysis</h4>
									<div className="whitespace-pre-line text-gray-700">
										{aiAnalysis.formAnalysis}
									</div>
								</div>
							)}
							
							{/* Head-to-Head Section */}
							{aiAnalysis.headToHead && (
								<div>
									<h4 className="font-medium text-lg mb-2">Head-to-Head Analysis</h4>
									<div className="whitespace-pre-line text-gray-700">
										{aiAnalysis.headToHead}
									</div>
								</div>
							)}
							
							{/* Tactical Analysis Section */}
							{aiAnalysis.tacticalAnalysis && (
								<div>
									<h4 className="font-medium text-lg mb-2">Tactical Analysis</h4>
									<div className="whitespace-pre-line text-gray-700">
										{aiAnalysis.tacticalAnalysis}
									</div>
								</div>
							)}
							
							{/* Momentum Analysis Section */}
							{aiAnalysis.momentumAnalysis && (
								<div>
									<h4 className="font-medium text-lg mb-2">Momentum Analysis</h4>
									<div className="whitespace-pre-line text-gray-700">
										{aiAnalysis.momentumAnalysis}
									</div>
								</div>
							)}
							
							{/* Key Battles Section */}
							{aiAnalysis.keyBattles && (
								<div>
									<h4 className="font-medium text-lg mb-2">Key Battles</h4>
									<div className="whitespace-pre-line text-gray-700">
										{aiAnalysis.keyBattles}
									</div>
								</div>
							)}
							
							{/* Recommendation Section */}
							<div>
								<h4 className="font-medium text-lg mb-2">Recommendation</h4>
								<div className="whitespace-pre-line text-gray-700">
									{aiAnalysis.recommendation}
								</div>
							</div>
						</div>
					)}
				</div>
			)}
		</div>
	);
};

// Helper functions for analysis
function getStreak(form) {
	const lastResult = form[form.length - 1];
	let streak = 1;
	for (let i = form.length - 2; i >= 0; i--) {
		if (form[i] === lastResult) streak++;
		else break;
	}
	return `${streak} ${lastResult === 'W' ? 'wins' : lastResult === 'D' ? 'draws' : 'losses'}`;
}

function getPlayingStyle(stats) {
	if (!stats) return 'N/A';
	const goalsFor = stats.goals.for.average.total;
	const goalsAgainst = stats.goals.against.average.total;
	
	if (goalsFor > 2 && goalsAgainst > 1.5) return 'Attacking, high-scoring';
	if (goalsFor > 2 && goalsAgainst < 1) return 'Dominant, balanced';
	if (goalsFor < 1.5 && goalsAgainst < 1) return 'Defensive, low-scoring';
	return 'Balanced';
}

function getFormDescription(form) {
	if (!form) return 'N/A';
	const last5 = form.slice(-5);
	const wins = last5.filter(r => r === 'W').length;
	const draws = last5.filter(r => r === 'D').length;
	const losses = last5.filter(r => r === 'L').length;
	return `${wins}W ${draws}D ${losses}L in last 5 matches`;
}

export default Predictions;

