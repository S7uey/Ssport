import { useState } from "react";

const AIAnalysis = ({ data, type }) => {
	const [analysis, setAnalysis] = useState(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);

	const generateAnalysis = async () => {
		setLoading(true);
		setError(null);
		try {
			console.log(
				"API Key status:",
				!!process.env.REACT_APP_OPENAI_API_KEY
			);
			if (!process.env.REACT_APP_OPENAI_API_KEY) {
				throw new Error(
					"OpenAI API key is not configured. Please check that your .env file is in the correct location and contains REACT_APP_OPENAI_API_KEY"
				);
			}

			let prompt = "";
			if (type === "player") {
				prompt = `Analyze this football player's statistics and provide insights: ${JSON.stringify(
					data
				)}. Include:
                1. Performance overview
                2. Key strengths
                3. Areas for improvement
                4. Comparison to similar players
                5. Future predictions`;
			} else if (type === "fixture") {
				prompt = `Analyze this football match data and provide insights: ${JSON.stringify(
					data
				)}. Include:
                1. Match prediction
                2. Key factors affecting the outcome
                3. Team form analysis
                4. Key player matchups
                5. Historical context`;
			}

			const completion = await fetch(
				"https://api.openai.com/v1/chat/completions",
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}`,
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
						max_tokens: 1000,
					}),
				}
			);

			if (!completion.ok) {
				const errorData = await completion.json();
				throw new Error(
					errorData.error?.message || "API request failed"
				);
			}

			const result = await completion.json();
			setAnalysis(result.choices[0].message.content);
		} catch (err) {
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
