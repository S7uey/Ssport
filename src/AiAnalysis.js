import { useState, useEffect } from "react";

const AIAnalysis = ({ data, type }) => {
	const [analysis, setAnalysis] = useState(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);

	useEffect(() => {
		// Log environment variable status on component mount
		console.log('Environment variables:', {
			hasApiKey: !!process.env.REACT_APP_OPENAI_API_KEY,
			apiKeyLength: process.env.REACT_APP_OPENAI_API_KEY?.length,
			apiKeyPrefix: process.env.REACT_APP_OPENAI_API_KEY?.substring(0, 7)
		});
	}, []);

	const generateAnalysis = async () => {
		setLoading(true);
		setError(null);
		try {
			const apiKey = process.env.REACT_APP_OPENAI_API_KEY;
			console.log('API Key status:', {
				hasApiKey: !!apiKey,
				apiKeyLength: apiKey?.length,
				apiKeyPrefix: apiKey?.substring(0, 7)
			});

			if (!apiKey) {
				throw new Error(
					"OpenAI API key is not configured. Please check that your .env file is in the correct location and contains REACT_APP_OPENAI_API_KEY"
				);
			}

			let prompt = "";
			if (type === "player") {
				const limitedData = {
					name: data.player?.name,
					position: data.statistics?.[0]?.games?.position,
					stats: data.statistics?.[0] ? {
						appearances: data.statistics[0].games.appearences,
						goals: data.statistics[0].goals.total,
						assists: data.statistics[0].goals.assists,
						minutesPlayed: data.statistics[0].games.minutes
					} : null
				};
				
				prompt = `Analyze this player's stats: ${JSON.stringify(limitedData)}. Include:
                1. Performance overview
                2. Key strengths
                3. Areas for improvement
                4. Comparison to similar players
                5. Future predictions`;
			} else if (type === "fixture") {
				const limitedData = {
					homeTeam: data.homeTeam,
					awayTeam: data.awayTeam,
					date: data.date,
					venue: data.venue,
					league: data.league
				};
				
				prompt = `Analyze this match data: ${JSON.stringify(limitedData)}. Include:
                1. Match prediction
                2. Key factors affecting outcome
                3. Team form analysis
                4. Key player matchups
                5. Historical context`;
			}

			console.log('Sending request to OpenAI with prompt:', prompt);

			const completion = await fetch(
				"https://api.openai.com/v1/chat/completions",
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${apiKey}`,
					},
					body: JSON.stringify({
						model: "gpt-3.5-turbo",
						messages: [
							{
								role: "system",
								content:
									"You are a football analytics expert providing detailed analysis and insights.",
							},
							{ role: "user", content: prompt },
						],
						temperature: 0.7,
						max_tokens: 300,
					}),
				}
			);

			if (!completion.ok) {
				const errorData = await completion.json();
				console.error('OpenAI API Error:', errorData);
				throw new Error(
					errorData.error?.message || "API request failed"
				);
			}

			const result = await completion.json();
			setAnalysis(result.choices[0].message.content);
		} catch (err) {
			console.error('Error in generateAnalysis:', err);
			setError(err.message || "Failed to generate analysis");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="bg-white rounded-lg shadow-md p-6 mt-6">
			<div className="flex justify-between items-center mb-4">
				<h3 className="text-xl font-bold">AI Analysis</h3>
				{!analysis && (
					<button
						onClick={generateAnalysis}
						disabled={loading}
						className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors disabled:bg-blue-300">
						{loading ? "Analyzing..." : "Generate Analysis"}
					</button>
				)}
			</div>

			{error && <div className="text-red-600 mb-4">{error}</div>}

			{loading && (
				<div className="flex justify-center items-center py-8">
					<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
				</div>
			)}

			{analysis && (
				<div className="prose max-w-none">
					<div className="whitespace-pre-wrap">{analysis}</div>
				</div>
			)}
		</div>
	);
};

export default AIAnalysis;
