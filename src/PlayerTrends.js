import React, { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const PlayerTrends = () => {
  const [leagues, setLeagues] = useState([]);
  const [selectedLeague, setSelectedLeague] = useState("39"); // Premier League by default
  const [teams, setTeams] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState("");
  const [players, setPlayers] = useState([]);
  const [selectedPlayer, setSelectedPlayer] = useState("");
  const [playerStats, setPlayerStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [statType, setStatType] = useState("goals"); // goals, assists, minutes, cards
  const [seasons, setSeasons] = useState([]);
  const [selectedSeasons, setSelectedSeasons] = useState(["2024", "2023"]);

  // Fetch leagues for the dropdown
  useEffect(() => {
    const fetchLeagues = async () => {
      try {
        const response = await fetch(
          "https://v3.football.api-sports.io/leagues?season=2024",
          {
            method: "GET",
            headers: {
              "x-rapidapi-host": "v3.football.api-sports.io",
              "x-rapidapi-key": "3e35192ee89b4d9324a60a8a2907218b",
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch leagues");
        }

        const data = await response.json();
        setLeagues(data.response || []);
      } catch (err) {
        console.error("Error fetching leagues:", err);
        setError("Failed to load leagues. Please try again later.");
      }
    };

    fetchLeagues();
  }, []);

  // Fetch teams when league changes
  useEffect(() => {
    const fetchTeams = async () => {
      if (!selectedLeague) return;

      try {
        setLoading(true);
        setError(null);
        
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

        if (!response.ok) {
          throw new Error("Failed to fetch teams");
        }

        const data = await response.json();
        setTeams(data.response || []);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching teams:", err);
        setError("Failed to load teams. Please try again later.");
        setLoading(false);
      }
    };

    fetchTeams();
  }, [selectedLeague]);

  // Fetch players when team changes
  useEffect(() => {
    const fetchPlayers = async () => {
      if (!selectedTeam) return;

      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(
          `https://v3.football.api-sports.io/players/squads?team=${selectedTeam}`,
          {
            method: "GET",
            headers: {
              "x-rapidapi-host": "v3.football.api-sports.io",
              "x-rapidapi-key": "3e35192ee89b4d9324a60a8a2907218b",
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch team players");
        }

        const data = await response.json();
        if (data.response && data.response.length > 0) {
          setPlayers(data.response[0].players || []);
        } else {
          setPlayers([]);
        }
        setLoading(false);
      } catch (err) {
        console.error("Error fetching team players:", err);
        setError("Failed to load team players. Please try again later.");
        setLoading(false);
      }
    };

    fetchPlayers();
  }, [selectedTeam]);

  // Fetch player statistics across seasons
  const fetchPlayerStats = async () => {
    if (!selectedPlayer) {
      setError("Please select a player");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Fetch stats for each selected season
      const statsPromises = selectedSeasons.map(season => 
        fetch(
          `https://v3.football.api-sports.io/players?id=${selectedPlayer}&season=${season}`,
          {
            method: "GET",
            headers: {
              "x-rapidapi-host": "v3.football.api-sports.io",
              "x-rapidapi-key": "3e35192ee89b4d9324a60a8a2907218b",
            },
          }
        ).then(res => res.json())
      );
      
      const results = await Promise.all(statsPromises);
      
      // Process the results
      const processedStats = results.map((result, index) => {
        if (result.response && result.response.length > 0) {
          const playerData = result.response[0];
          return {
            season: selectedSeasons[index],
            stats: playerData.statistics && playerData.statistics.length > 0 
              ? playerData.statistics[0] 
              : null
          };
        }
        return { season: selectedSeasons[index], stats: null };
      });
      
      setPlayerStats(processedStats);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching player statistics:", err);
      setError("Failed to load player statistics. Please try again later.");
      setLoading(false);
    }
  };

  // Get team name for display
  const getTeamName = (teamId) => {
    const team = teams.find(t => t.team.id === parseInt(teamId));
    return team ? team.team.name : "Unknown Team";
  };

  // Get player name for display
  const getPlayerName = (playerId) => {
    const player = players.find(p => p.id === parseInt(playerId));
    return player ? player.name : "Unknown Player";
  };

  // Prepare chart data based on selected stat type
  const prepareChartData = () => {
    if (!playerStats) return null;
    
    const labels = playerStats.map(item => item.season);
    const data = playerStats.map(item => {
      if (!item.stats) return 0;
      
      switch (statType) {
        case "goals":
          return item.stats.goals?.total || 0;
        case "assists":
          return item.stats.goals?.assists || 0;
        case "minutes":
          return item.stats.games?.minutes || 0;
        case "cards":
          return (item.stats.cards?.yellow || 0) + (item.stats.cards?.red || 0);
        default:
          return 0;
      }
    });
    
    return {
      labels,
      datasets: [
        {
          label: getStatLabel(),
          data,
          borderColor: "rgb(75, 192, 192)",
          backgroundColor: "rgba(75, 192, 192, 0.5)",
          tension: 0.1,
        },
      ],
    };
  };

  // Get label for the selected stat type
  const getStatLabel = () => {
    switch (statType) {
      case "goals":
        return "Goals";
      case "assists":
        return "Assists";
      case "minutes":
        return "Minutes Played";
      case "cards":
        return "Cards (Yellow + Red)";
      default:
        return "";
    }
  };

  // Chart options
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: `${getPlayerName(selectedPlayer)} - ${getStatLabel()} Over Time`,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Player Performance Trends</h1>
      
      {/* League Selection */}
      <div className="mb-6">
        <label htmlFor="league-select" className="block text-sm font-medium text-gray-700 mb-1">
          Select League
        </label>
        <select
          id="league-select"
          value={selectedLeague}
          onChange={(e) => setSelectedLeague(e.target.value)}
          className="block w-full md:w-64 px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
        >
          {leagues.map((league) => (
            <option key={league.league.id} value={league.league.id}>
              {league.league.name}
            </option>
          ))}
        </select>
      </div>
      
      {/* Team Selection */}
      <div className="mb-6">
        <label htmlFor="team-select" className="block text-sm font-medium text-gray-700 mb-1">
          Select Team
        </label>
        <select
          id="team-select"
          value={selectedTeam}
          onChange={(e) => setSelectedTeam(e.target.value)}
          className="block w-full md:w-64 px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">Select a team</option>
          {teams.map((team) => (
            <option key={team.team.id} value={team.team.id}>
              {team.team.name}
            </option>
          ))}
        </select>
      </div>
      
      {/* Player Selection */}
      {players.length > 0 && (
        <div className="mb-6">
          <label htmlFor="player-select" className="block text-sm font-medium text-gray-700 mb-1">
            Select Player
          </label>
          <select
            id="player-select"
            value={selectedPlayer}
            onChange={(e) => setSelectedPlayer(e.target.value)}
            className="block w-full md:w-64 px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select a player</option>
            {players.map((player) => (
              <option key={player.id} value={player.id}>
                {player.name}
              </option>
            ))}
          </select>
        </div>
      )}
      
      {/* Season Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Select Seasons to Compare
        </label>
        <div className="flex flex-wrap gap-2">
          {["2024", "2023", "2022", "2021", "2020"].map((season) => (
            <label key={season} className="inline-flex items-center">
              <input
                type="checkbox"
                checked={selectedSeasons.includes(season)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedSeasons([...selectedSeasons, season]);
                  } else {
                    setSelectedSeasons(selectedSeasons.filter(s => s !== season));
                  }
                }}
                className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              />
              <span className="ml-2">{season}</span>
            </label>
          ))}
        </div>
      </div>
      
      {/* Stat Type Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Select Statistic to Compare
        </label>
        <div className="flex flex-wrap gap-2">
          {[
            { value: "goals", label: "Goals" },
            { value: "assists", label: "Assists" },
            { value: "minutes", label: "Minutes Played" },
            { value: "cards", label: "Cards" }
          ].map((stat) => (
            <label key={stat.value} className="inline-flex items-center">
              <input
                type="radio"
                checked={statType === stat.value}
                onChange={() => setStatType(stat.value)}
                className="rounded-full border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              />
              <span className="ml-2">{stat.label}</span>
            </label>
          ))}
        </div>
      </div>
      
      {/* Compare Button */}
      <div className="mb-6">
        <button
          onClick={fetchPlayerStats}
          disabled={!selectedPlayer || loading}
          className="px-4 py-2 bg-blue-800 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {loading ? "Loading..." : "Compare Seasons"}
        </button>
      </div>
      
      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}
      
      {/* Chart Display */}
      {playerStats && playerStats.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-2xl font-bold mb-4">Performance Trend</h2>
          
          <div className="h-96">
            <Line options={chartOptions} data={prepareChartData()} />
          </div>
          
          {/* Data Table */}
          <div className="mt-8 overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Season
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {getStatLabel()}
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Appearances
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Minutes Played
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {playerStats.map((item) => (
                  <tr key={item.season}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {item.season}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-500">
                      {item.stats ? (
                        statType === "goals" ? item.stats.goals?.total || 0 :
                        statType === "assists" ? item.stats.goals?.assists || 0 :
                        statType === "minutes" ? item.stats.games?.minutes || 0 :
                        (item.stats.cards?.yellow || 0) + (item.stats.cards?.red || 0)
                      ) : "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-500">
                      {item.stats?.games?.appearences || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-500">
                      {item.stats?.games?.minutes || 0}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlayerTrends; 