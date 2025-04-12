import { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

function Analytics() {
  const [leagueStats, setLeagueStats] = useState(null);
  const [teams, setTeams] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [teamStats, setTeamStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedLeague, setSelectedLeague] = useState('39'); // Premier League by default

  // Fetch teams when league changes
  useEffect(() => {
    const fetchTeams = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `https://v3.football.api-sports.io/teams?league=${selectedLeague}&season=2024`,
          {
            method: "GET",
            headers: {
              "x-rapidapi-host": "v3.football.api-sports.io",
              "x-rapidapi-key": "3e35192ee89b4d9324a60a8a2907218b",
            },
          }
        );

        const data = await response.json();
        setTeams(data.response || []);
        setSelectedTeam(null); // Reset selected team when league changes
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchTeams();
  }, [selectedLeague]);

  // Fetch team statistics when team changes
  useEffect(() => {
    const fetchTeamStats = async () => {
      if (!selectedTeam) return;

      try {
        setLoading(true);
        const response = await fetch(
          `https://v3.football.api-sports.io/teams/statistics?league=${selectedLeague}&season=2024&team=${selectedTeam}`,
          {
            method: "GET",
            headers: {
              "x-rapidapi-host": "v3.football.api-sports.io",
              "x-rapidapi-key": "3e35192ee89b4d9324a60a8a2907218b",
            },
          }
        );

        const data = await response.json();
        setTeamStats(data.response);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchTeamStats();
  }, [selectedTeam, selectedLeague]);

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
        Error loading analytics data: {error}
      </div>
    );
  }

  const leagues = [
    { id: '39', name: 'Premier League' },
    { id: '140', name: 'La Liga' },
    { id: '135', name: 'Serie A' },
    { id: '78', name: 'Bundesliga' },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* League and Team Selectors */}
      <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h2 className="text-2xl font-bold mb-4">League Analytics</h2>
          <select
            value={selectedLeague}
            onChange={(e) => setSelectedLeague(e.target.value)}
            className="block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          >
            {leagues.map((league) => (
              <option key={league.id} value={league.id}>
                {league.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-4">Team Selection</h2>
          <select
            value={selectedTeam || ''}
            onChange={(e) => setSelectedTeam(e.target.value)}
            className="block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select a team</option>
            {teams.map((team) => (
              <option key={team.team.id} value={team.team.id}>
                {team.team.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {teamStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Team Statistics */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Team Statistics</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Matches Played</span>
                <span className="font-bold">{teamStats.fixtures?.played?.total || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Wins</span>
                <span className="font-bold text-green-600">{teamStats.fixtures?.wins?.total || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Draws</span>
                <span className="font-bold text-blue-600">{teamStats.fixtures?.draws?.total || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Losses</span>
                <span className="font-bold text-red-600">{teamStats.fixtures?.loses?.total || 0}</span>
              </div>
            </div>
          </div>

          {/* Goals Analysis */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Goals Analysis</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Goals Scored</span>
                <span className="font-bold text-green-600">{teamStats.goals?.for?.total?.total || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Goals Conceded</span>
                <span className="font-bold text-red-600">{teamStats.goals?.against?.total?.total || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Clean Sheets</span>
                <span className="font-bold text-blue-600">{teamStats.clean_sheet?.total || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Failed to Score</span>
                <span className="font-bold text-gray-600">{teamStats.failed_to_score?.total || 0}</span>
              </div>
            </div>
          </div>

          {/* Form Analysis */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Performance Metrics</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Win Rate</span>
                <span className="font-bold text-green-600">
                  {(((teamStats.fixtures?.wins?.total || 0) / (teamStats.fixtures?.played?.total || 1)) * 100).toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Goals per Match</span>
                <span className="font-bold text-blue-600">
                  {((teamStats.goals?.for?.total?.total || 0) / (teamStats.fixtures?.played?.total || 1)).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Clean Sheet Rate</span>
                <span className="font-bold text-green-600">
                  {(((teamStats.clean_sheet?.total || 0) / (teamStats.fixtures?.played?.total || 1)) * 100).toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Goals Distribution Chart */}
      {teamStats?.goals?.for?.minute && (
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h3 className="text-lg font-semibold mb-4">Goals by Time Interval</h3>
          <Bar
            data={{
              labels: Object.keys(teamStats.goals.for.minute),
              datasets: [
                {
                  label: 'Goals Scored',
                  data: Object.values(teamStats.goals.for.minute).map(
                    (interval) => interval.total
                  ),
                  backgroundColor: 'rgba(59, 130, 246, 0.5)',
                  borderColor: 'rgb(59, 130, 246)',
                  borderWidth: 1,
                },
                {
                  label: 'Goals Conceded',
                  data: Object.values(teamStats.goals.against.minute).map(
                    (interval) => interval.total
                  ),
                  backgroundColor: 'rgba(239, 68, 68, 0.5)',
                  borderColor: 'rgb(239, 68, 68)',
                  borderWidth: 1,
                },
              ],
            }}
            options={{
              responsive: true,
              plugins: {
                legend: {
                  position: 'top',
                },
                title: {
                  display: true,
                  text: 'Goal Distribution by Match Time',
                },
              },
              scales: {
                y: {
                  beginAtZero: true,
                },
              },
            }}
          />
        </div>
      )}
    </div>
  );
}

export default Analytics; 