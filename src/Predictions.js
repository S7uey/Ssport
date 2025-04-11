import {
	Document,
	Page,
	PDFDownloadLink,
	StyleSheet,
	Text,
	View,
} from "@react-pdf/renderer";
import React, { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

const styles = StyleSheet.create({
	page: { padding: 30 },
	title: { fontSize: 24, marginBottom: 20 },
	section: { marginBottom: 15 },
	heading: { fontSize: 18, marginBottom: 10 },
	row: {
		flexDirection: "row",
		justifyContent: "space-between",
		marginBottom: 5,
	},
	text: { fontSize: 12 },
});

const PredictionPDF = ({ predictions }) => (
	<Document>
		<Page size="A4" style={styles.page}>
			<Text style={styles.title}>
				{predictions.league.name} Match Prediction
			</Text>

			<View style={styles.section}>
				<Text style={styles.heading}>Teams</Text>
				<Text style={styles.text}>
					{predictions.teams.home.name} vs{" "}
					{predictions.teams.away.name}
				</Text>
			</View>

			<View style={styles.section}>
				<Text style={styles.heading}>Prediction Details</Text>
				<Text style={styles.text}>
					Winner: {predictions.predictions.winner.name}
				</Text>
				<Text style={styles.text}>
					Advice: {predictions.predictions.advice}
				</Text>
			</View>

			<View style={styles.section}>
				<Text style={styles.heading}>Win Probability</Text>
				<Text style={styles.text}>
					Home: {predictions.predictions.percent.home}
				</Text>
				<Text style={styles.text}>
					Draw: {predictions.predictions.percent.draw}
				</Text>
				<Text style={styles.text}>
					Away: {predictions.predictions.percent.away}
				</Text>
			</View>

			<View style={styles.section}>
				<Text style={styles.heading}>Team Comparison</Text>
				<View style={styles.row}>
					<Text style={styles.text}>
						Form: {predictions.comparison.form.home} vs{" "}
						{predictions.comparison.form.away}
					</Text>
				</View>
				<View style={styles.row}>
					<Text style={styles.text}>
						Attack: {predictions.comparison.att.home} vs{" "}
						{predictions.comparison.att.away}
					</Text>
				</View>
				<View style={styles.row}>
					<Text style={styles.text}>
						Defense: {predictions.comparison.def.home} vs{" "}
						{predictions.comparison.def.away}
					</Text>
				</View>
			</View>

			<View style={styles.section}>
				<Text style={styles.heading}>Recent Head to Head</Text>
				{predictions.h2h.slice(0, 5).map((match, index) => (
					<Text key={index} style={styles.text}>
						{new Date(match.fixture.date).toLocaleDateString()}:{" "}
						{match.teams.home.name} {match.goals.home} -{" "}
						{match.goals.away} {match.teams.away.name}
					</Text>
				))}
			</View>
		</Page>
	</Document>
);

const Predictions = () => {
	const [searchParams] = useSearchParams();
	const fixtureId = searchParams.get("fixture");
	const [predictions, setPredictions] = useState(null);
	const [upcomingFixtures, setUpcomingFixtures] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	const fetchUpcomingFixtures = async () => {
		try {
			const today = new Date();
			const nextWeek = new Date(today);
			nextWeek.setDate(today.getDate() + 7);

			const response = await fetch(
				`https://v3.football.api-sports.io/fixtures?date=${
					today.toISOString().split("T")[0]
				}`,
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
			setUpcomingFixtures(data.response.slice(0, 10)); // Get first 10 fixtures
		} catch (err) {
			setError(err.message);
		}
	};

	const fetchPredictions = async (id) => {
		try {
			setLoading(true);
			const response = await fetch(
				`https://v3.football.api-sports.io/predictions?fixture=${id}`,
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
			setPredictions(data.response[0]);
			setLoading(false);
		} catch (err) {
			setError(err.message);
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchUpcomingFixtures();
	}, []);

	useEffect(() => {
		if (fixtureId) {
			fetchPredictions(fixtureId);
		} else {
			setLoading(false);
		}
	}, [fixtureId]);

	if (loading) return <div className="text-center p-4">Loading...</div>;
	if (error)
		return (
			<div className="text-center p-4 text-red-500">Error: {error}</div>
		);

	if (!fixtureId) {
		return (
			<div className="container mx-auto p-4">
				<h2 className="text-2xl font-bold mb-4">Upcoming Fixtures</h2>
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
					{upcomingFixtures.map((fixture) => (
						<Link
							to={`/fixture/${fixture.fixture.id}`}
							key={fixture.fixture.id}
							className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow">
							<div className="flex items-center justify-between mb-2">
								<div className="flex items-center space-x-2">
									<img
										src={fixture.teams.home.logo}
										alt={fixture.teams.home.name}
										className="w-8 h-8"
									/>
									<span className="font-semibold">
										{fixture.teams.home.name}
									</span>
								</div>
								<span className="text-sm">vs</span>
								<div className="flex items-center space-x-2">
									<span className="font-semibold">
										{fixture.teams.away.name}
									</span>
									<img
										src={fixture.teams.away.logo}
										alt={fixture.teams.away.name}
										className="w-8 h-8"
									/>
								</div>
							</div>
							<div className="text-sm text-gray-600">
								{new Date(
									fixture.fixture.date
								).toLocaleString()}
							</div>
							<div className="text-sm text-gray-600">
								{fixture.league.name}
							</div>
						</Link>
					))}
				</div>
			</div>
		);
	}

	if (!predictions)
		return <div className="text-center p-4">No predictions available</div>;

	return (
		<div className="container mx-auto p-4">
			<div className="flex justify-between items-center mb-4">
				<Link
					to="/predictions"
					className="text-blue-600 hover:text-blue-800">
					← Back to Fixtures
				</Link>

				<PDFDownloadLink
					document={<PredictionPDF predictions={predictions} />}
					fileName={`match-prediction-${predictions.teams.home.name}-vs-${predictions.teams.away.name}.pdf`}
					className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded inline-flex items-center">
					{({ blob, url, loading, error }) =>
						loading ? "Preparing PDF..." : "Download PDF Report"
					}
				</PDFDownloadLink>
			</div>
			<div className="bg-white rounded-lg shadow-lg p-6">
				{/* Match Header */}
				<div className="flex items-center justify-between mb-6">
					<div className="flex items-center space-x-4">
						<img
							src={predictions.teams.home.logo}
							alt={predictions.teams.home.name}
							className="w-12 h-12"
						/>
						<span className="text-xl font-bold">vs</span>
						<img
							src={predictions.teams.away.logo}
							alt={predictions.teams.away.name}
							className="w-12 h-12"
						/>
					</div>
					<div className="text-right">
						<h2 className="text-lg font-semibold">
							{predictions.league.name}
						</h2>
						<p className="text-gray-600">
							{predictions.league.country}
						</p>
					</div>
				</div>

				{/* Prediction Stats */}
				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					{/* Winner Prediction */}
					<div className="bg-gray-50 p-4 rounded-lg">
						<h3 className="text-lg font-semibold mb-3">
							Match Prediction
						</h3>
						<p className="text-gray-700">
							Winner: {predictions.predictions.winner.name}
						</p>
						<p className="text-gray-700">
							Advice: {predictions.predictions.advice}
						</p>

						{/* Percentage Bars */}
						<div className="mt-4">
							<div className="mb-2">
								<div className="flex justify-between mb-1">
									<span>Home</span>
									<span>
										{predictions.predictions.percent.home}
									</span>
								</div>
								<div className="w-full bg-gray-200 rounded-full h-2.5">
									<div
										className="bg-blue-600 h-2.5 rounded-full"
										style={{
											width: predictions.predictions
												.percent.home,
										}}></div>
								</div>
							</div>
							<div className="mb-2">
								<div className="flex justify-between mb-1">
									<span>Draw</span>
									<span>
										{predictions.predictions.percent.draw}
									</span>
								</div>
								<div className="w-full bg-gray-200 rounded-full h-2.5">
									<div
										className="bg-gray-600 h-2.5 rounded-full"
										style={{
											width: predictions.predictions
												.percent.draw,
										}}></div>
								</div>
							</div>
							<div>
								<div className="flex justify-between mb-1">
									<span>Away</span>
									<span>
										{predictions.predictions.percent.away}
									</span>
								</div>
								<div className="w-full bg-gray-200 rounded-full h-2.5">
									<div
										className="bg-green-600 h-2.5 rounded-full"
										style={{
											width: predictions.predictions
												.percent.away,
										}}></div>
								</div>
							</div>
						</div>
					</div>

					{/* Team Comparison */}
					<div className="bg-gray-50 p-4 rounded-lg">
						<h3 className="text-lg font-semibold mb-3">
							Team Comparison
						</h3>
						<div className="space-y-3">
							<div className="flex justify-between items-center">
								<span>Form</span>
								<div className="flex space-x-2">
									<span>
										{predictions.comparison.form.home}
									</span>
									<span>vs</span>
									<span>
										{predictions.comparison.form.away}
									</span>
								</div>
							</div>
							<div className="flex justify-between items-center">
								<span>Attack</span>
								<div className="flex space-x-2">
									<span>
										{predictions.comparison.att.home}
									</span>
									<span>vs</span>
									<span>
										{predictions.comparison.att.away}
									</span>
								</div>
							</div>
							<div className="flex justify-between items-center">
								<span>Defense</span>
								<div className="flex space-x-2">
									<span>
										{predictions.comparison.def.home}
									</span>
									<span>vs</span>
									<span>
										{predictions.comparison.def.away}
									</span>
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* H2H Section */}
				<div className="mt-6">
					<h3 className="text-lg font-semibold mb-3">
						Head to Head History
					</h3>
					<div className="overflow-x-auto">
						<table className="min-w-full table-auto">
							<thead>
								<tr className="bg-gray-100">
									<th className="px-4 py-2">Date</th>
									<th className="px-4 py-2">Home</th>
									<th className="px-4 py-2">Score</th>
									<th className="px-4 py-2">Away</th>
								</tr>
							</thead>
							<tbody>
								{predictions.h2h.map((match, index) => (
									<tr key={index} className="border-b">
										<td className="px-4 py-2">
											{new Date(
												match.fixture.date
											).toLocaleDateString()}
										</td>
										<td className="px-4 py-2">
											{match.teams.home.name}
										</td>
										<td className="px-4 py-2">
											{match.goals.home} -{" "}
											{match.goals.away}
										</td>
										<td className="px-4 py-2">
											{match.teams.away.name}
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Predictions;
