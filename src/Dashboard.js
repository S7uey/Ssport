import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

function Dashboard() {
  const [recentMatches, setRecentMatches] = useState([]);
  const [upcomingMatches, setUpcomingMatches] = useState([]);
  const [topScorers, setTopScorers] = useState([]);
  const [topAssisters, setTopAssisters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedLeague, setSelectedLeague] = useState('39'); // Premier League by default

  // League options for the dropdown
  const leagues = [
    { id: '39', name: 'Premier League' },
    { id: '140', name: 'La Liga' },
    { id: '135', name: 'Serie A' },
    { id: '78', name: 'Bundesliga' },
    { id: '61', name: 'Ligue 1' },
  ];

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch fixtures for the selected league
        const fixturesResponse = await fetch(
          `https://v3.football.api-sports.io/fixtures?league=${selectedLeague}&season=2024`,
          {
            method: "GET",
            headers: {
              "x-rapidapi-host": "v3.football.api-sports.io",
              "x-rapidapi-key": "3e35192ee89b4d9324a60a8a2907218b",
            },
          }
        );

        if (!fixturesResponse.ok) {
          throw new Error("Failed to fetch fixtures data");
        }

        const fixturesData = await fixturesResponse.json();
        console.log("Fixtures API Response:", fixturesData);

        // Filter for upcoming matches
        const today = new Date().toISOString().split("T")[0];
        const upcomingMatches = fixturesData.response.filter(
          (match) => match.fixture.date.split("T")[0] > today
        ).sort((a, b) => new Date(a.fixture.date) - new Date(b.fixture.date));

        // Filter for recent completed matches
        const recentMatches = fixturesData.response.filter(
          (match) => match.fixture.date.split("T")[0] <= today && match.fixture.status.short === "FT"
        ).sort((a, b) => new Date(b.fixture.date) - new Date(a.fixture.date));

        console.log("Upcoming matches:", upcomingMatches);
        console.log("Recent matches:", recentMatches);
        
        setRecentMatches(recentMatches.slice(0, 5)); // Show last 5 completed matches
        setUpcomingMatches(upcomingMatches.slice(0, 5)); // Show next 5 upcoming matches

        // Fetch top scorers (using selected league)
        const scorersResponse = await fetch(
          `https://v3.football.api-sports.io/players/topscorers?league=${selectedLeague}&season=2024`,
          {
            method: "GET",
            headers: {
              "x-rapidapi-host": "v3.football.api-sports.io",
              "x-rapidapi-key": "3e35192ee89b4d9324a60a8a2907218b",
            },
          }
        );

        const scorersData = await scorersResponse.json();
        setTopScorers(scorersData.response?.slice(0, 5) || []);

        // Fetch top assisters
        const assistersResponse = await fetch(
          `https://v3.football.api-sports.io/players/topassists?league=${selectedLeague}&season=2024`,
          {
            method: "GET",
            headers: {
              "x-rapidapi-host": "v3.football.api-sports.io",
              "x-rapidapi-key": "3e35192ee89b4d9324a60a8a2907218b",
            },
          }
        );

        const assistersData = await assistersResponse.json();
        setTopAssisters(assistersData.response?.slice(0, 5) || []);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [selectedLeague]);

  const handleLeagueChange = (e) => {
    const newLeague = e.target.value;
    setSelectedLeague(newLeague);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-800"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600 p-4">
        Error loading dashboard data: {error}
      </div>
    );
  }

  return (
    <main className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <section className="mb-12 text-center">
        <h2 className="text-4xl font-bold text-gray-800 mb-4">
          Live Football Analytics
        </h2>
        <p className="text-xl text-gray-600 mb-8">
          Real-time insights, predictions, and analysis for football
          matches worldwide
        </p>
      </section>

      {/* Today's Matches Section */}
      <section className="mb-12">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold">Today's Matches</h3>
          <select
            value={selectedLeague}
            onChange={handleLeagueChange}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          >
            {leagues.map((league) => (
              <option key={league.id} value={league.id}>
                {league.name}
              </option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Recent Matches */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-2xl font-bold mb-4">Recent Matches</h2>
            <div className="space-y-4">
              {recentMatches.map((match) => (
                <div
                  key={match.fixture.id}
                  className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <img
                      src={match.teams.home.logo}
                      alt={match.teams.home.name}
                      className="w-8 h-8"
                    />
                    <span className="font-medium">{match.teams.home.name}</span>
                  </div>
                  <div className="text-center">
                    <div className="font-bold">
                      {match.goals.home} - {match.goals.away}
                    </div>
                    <div className="text-sm text-gray-600">
                      {new Date(match.fixture.date).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="font-medium">{match.teams.away.name}</span>
                    <img
                      src={match.teams.away.logo}
                      alt={match.teams.away.name}
                      className="w-8 h-8"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming Matches */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold mb-4">Upcoming Matches</h2>
            <div className="space-y-4">
              {upcomingMatches.map((match) => (
                <div
                  key={match.fixture.id}
                  className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <img
                      src={match.teams.home.logo}
                      alt={match.teams.home.name}
                      className="w-8 h-8"
                    />
                    <span className="font-medium">{match.teams.home.name}</span>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-gray-600">
                      {new Date(match.fixture.date).toLocaleDateString()}
                    </div>
                    <div className="text-sm text-gray-600">
                      {new Date(match.fixture.date).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="font-medium">{match.teams.away.name}</span>
                    <img
                      src={match.teams.away.logo}
                      alt={match.teams.away.name}
                      className="w-8 h-8"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Top Scorers Section */}
      <section className="mb-12">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold">Top Scorers</h3>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {topScorers.map((scorer) => (
              <Link
                to={`/player/${scorer.player.id}`}
                key={scorer.player.id}
                className="flex items-center space-x-4 p-4 hover:bg-gray-50 rounded-lg transition-colors">
                <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                  {scorer.player.photo ? (
                    <img
                      src={scorer.player.photo}
                      alt={scorer.player.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "https://via.placeholder.com/150?text=No+Photo";
                      }}
                    />
                  ) : (
                    <img
                      src="https://via.placeholder.com/150?text=No+Photo"
                      alt={scorer.player.name}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                <div>
                  <h4 className="font-semibold">
                    {scorer.player.name}
                  </h4>
                  <p className="text-gray-600">
                    {scorer.statistics[0].team.name}
                  </p>
                  <p className="text-blue-600 font-bold">
                    {scorer.statistics[0].goals.total} goals
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Top Assisters Section */}
      <section className="mb-12">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold">Top Assisters</h3>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {topAssisters.map((assister) => (
              <Link
                to={`/player/${assister.player.id}`}
                key={assister.player.id}
                className="flex items-center space-x-4 p-4 hover:bg-gray-50 rounded-lg transition-colors">
                <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                  {assister.player.photo ? (
                    <img
                      src={assister.player.photo}
                      alt={assister.player.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "https://via.placeholder.com/150?text=No+Photo";
                      }}
                    />
                  ) : (
                    <img
                      src="https://via.placeholder.com/150?text=No+Photo"
                      alt={assister.player.name}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                <div>
                  <h4 className="font-semibold">
                    {assister.player.name}
                  </h4>
                  <p className="text-gray-600">
                    {assister.statistics[0].team.name}
                  </p>
                  <p className="text-blue-600 font-bold">
                    {assister.statistics[0].goals.assists || 0} assists
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Links */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          to="/leagues"
          className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
          <h4 className="text-lg font-semibold mb-2">
            Browse Leagues
          </h4>
          <p className="text-gray-600">
            Explore matches from different leagues worldwide
          </p>
        </Link>
        <Link
          to="/predictions"
          className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
          <h4 className="text-lg font-semibold mb-2">
            Match Predictions
          </h4>
          <p className="text-gray-600">
            Get AI-powered predictions for upcoming matches
          </p>
        </Link>
        <Link
          to="/analytics"
          className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
          <h4 className="text-lg font-semibold mb-2">Analytics</h4>
          <p className="text-gray-600">
            Deep dive into football statistics and trends
          </p>
        </Link>
      </section>
    </main>
  );
}

export default Dashboard; 