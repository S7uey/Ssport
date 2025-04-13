import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const HeadToHead = () => {
  const [teams, setTeams] = useState([]);
  const [selectedTeam1, setSelectedTeam1] = useState("");
  const [selectedTeam2, setSelectedTeam2] = useState("");
  const [headToHeadData, setHeadToHeadData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [leagues, setLeagues] = useState([]);
  const [selectedLeague, setSelectedLeague] = useState("39"); // Premier League by default
  const [team1Players, setTeam1Players] = useState([]);
  const [team2Players, setTeam2Players] = useState([]);
  const [selectedPlayer1, setSelectedPlayer1] = useState("");
  const [selectedPlayer2, setSelectedPlayer2] = useState("");
  const [playerComparison, setPlayerComparison] = useState(null);
  const [playerLoading, setPlayerLoading] = useState(false);
  const [playerError, setPlayerError] = useState(null);
  const [activeTab, setActiveTab] = useState("teams"); // "teams" or "players"

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

  // Fetch head-to-head data when both teams are selected
  const fetchHeadToHead = async () => {
    if (!selectedTeam1 || !selectedTeam2) {
      setError("Please select both teams to compare");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(
        `https://v3.football.api-sports.io/fixtures/headtohead?h2h=${selectedTeam1}-${selectedTeam2}&last=5`,
        {
          method: "GET",
          headers: {
            "x-rapidapi-host": "v3.football.api-sports.io",
            "x-rapidapi-key": "3e35192ee89b4d9324a60a8a2907218b",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch head-to-head data");
      }

      const data = await response.json();
      setHeadToHeadData(data.response || []);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching head-to-head data:", err);
      setError("Failed to load head-to-head data. Please try again later.");
      setLoading(false);
    }
  };

  // Fetch players when a team is selected
  const fetchTeamPlayers = async (teamId, setPlayers) => {
    if (!teamId) return;

    try {
      setPlayerLoading(true);
      setPlayerError(null);
      
      const response = await fetch(
        `https://v3.football.api-sports.io/players/squads?team=${teamId}`,
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
      setPlayerLoading(false);
    } catch (err) {
      console.error("Error fetching team players:", err);
      setPlayerError("Failed to load team players. Please try again later.");
      setPlayerLoading(false);
    }
  };

  // Fetch player statistics for comparison
  const comparePlayers = async () => {
    if (!selectedPlayer1 || !selectedPlayer2) {
      setPlayerError("Please select both players to compare");
      return;
    }

    try {
      setPlayerLoading(true);
      setPlayerError(null);
      
      // Fetch player statistics for both players
      const [player1Response, player2Response] = await Promise.all([
        fetch(
          `https://v3.football.api-sports.io/players?id=${selectedPlayer1}&season=2024`,
          {
            method: "GET",
            headers: {
              "x-rapidapi-host": "v3.football.api-sports.io",
              "x-rapidapi-key": "3e35192ee89b4d9324a60a8a2907218b",
            },
          }
        ),
        fetch(
          `https://v3.football.api-sports.io/players?id=${selectedPlayer2}&season=2024`,
          {
            method: "GET",
            headers: {
              "x-rapidapi-host": "v3.football.api-sports.io",
              "x-rapidapi-key": "3e35192ee89b4d9324a60a8a2907218b",
            },
          }
        )
      ]);

      if (!player1Response.ok || !player2Response.ok) {
        throw new Error("Failed to fetch player statistics");
      }

      const player1Data = await player1Response.json();
      const player2Data = await player2Response.json();

      setPlayerComparison({
        player1: player1Data.response[0] || null,
        player2: player2Data.response[0] || null
      });
      setPlayerLoading(false);
    } catch (err) {
      console.error("Error fetching player statistics:", err);
      setPlayerError("Failed to load player statistics. Please try again later.");
      setPlayerLoading(false);
    }
  };

  // Get team names for display
  const getTeamName = (teamId) => {
    const team = teams.find(t => t.team.id === parseInt(teamId));
    return team ? team.team.name : "Unknown Team";
  };

  // Get team logo for display
  const getTeamLogo = (teamId) => {
    const team = teams.find(t => t.team.id === parseInt(teamId));
    return team ? team.team.logo : "";
  };

  // Get player name for display
  const getPlayerName = (playerId, playersList) => {
    const player = playersList.find(p => p.id === parseInt(playerId));
    return player ? player.name : "Unknown Player";
  };

  // Calculate head-to-head statistics
  const calculateStats = () => {
    if (!headToHeadData || headToHeadData.length === 0) return null;

    const team1Id = parseInt(selectedTeam1);
    const team2Id = parseInt(selectedTeam2);
    
    let team1Wins = 0;
    let team2Wins = 0;
    let draws = 0;
    let team1Goals = 0;
    let team2Goals = 0;
    
    headToHeadData.forEach(match => {
      const homeTeamId = match.teams.home.id;
      const awayTeamId = match.teams.away.id;
      
      if (match.goals.home > match.goals.away) {
        if (homeTeamId === team1Id) team1Wins++;
        else if (homeTeamId === team2Id) team2Wins++;
      } else if (match.goals.home < match.goals.away) {
        if (awayTeamId === team1Id) team1Wins++;
        else if (awayTeamId === team2Id) team2Wins++;
      } else {
        draws++;
      }
      
      if (homeTeamId === team1Id) team1Goals += match.goals.home;
      else if (awayTeamId === team1Id) team1Goals += match.goals.away;
      
      if (homeTeamId === team2Id) team2Goals += match.goals.home;
      else if (awayTeamId === team2Id) team2Goals += match.goals.away;
    });
    
    return {
      team1Wins,
      team2Wins,
      draws,
      team1Goals,
      team2Goals,
      totalMatches: headToHeadData.length
    };
  };

  // Handle team selection change
  const handleTeam1Change = (e) => {
    const teamId = e.target.value;
    setSelectedTeam1(teamId);
    if (teamId) {
      fetchTeamPlayers(teamId, setTeam1Players);
    } else {
      setTeam1Players([]);
    }
  };

  // Handle team selection change
  const handleTeam2Change = (e) => {
    const teamId = e.target.value;
    setSelectedTeam2(teamId);
    if (teamId) {
      fetchTeamPlayers(teamId, setTeam2Players);
    } else {
      setTeam2Players([]);
    }
  };

  const stats = calculateStats();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Head-to-Head Comparison</h1>
      
      {/* Tabs */}
      <div className="flex border-b mb-6">
        <button
          className={`py-2 px-4 font-medium ${
            activeTab === "teams"
              ? "border-b-2 border-blue-800 text-blue-800"
              : "text-gray-500 hover:text-gray-700"
          }`}
          onClick={() => setActiveTab("teams")}
        >
          Team Comparison
        </button>
        <button
          className={`py-2 px-4 font-medium ${
            activeTab === "players"
              ? "border-b-2 border-blue-800 text-blue-800"
              : "text-gray-500 hover:text-gray-700"
          }`}
          onClick={() => setActiveTab("players")}
        >
          Player Comparison
        </button>
      </div>
      
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
      
      {activeTab === "teams" ? (
        <>
          {/* Team Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label htmlFor="team1-select" className="block text-sm font-medium text-gray-700 mb-1">
                Select First Team
              </label>
              <select
                id="team1-select"
                value={selectedTeam1}
                onChange={(e) => setSelectedTeam1(e.target.value)}
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
            
            <div>
              <label htmlFor="team2-select" className="block text-sm font-medium text-gray-700 mb-1">
                Select Second Team
              </label>
              <select
                id="team2-select"
                value={selectedTeam2}
                onChange={(e) => setSelectedTeam2(e.target.value)}
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
          
          {/* Compare Button */}
          <div className="mb-6">
            <button
              onClick={fetchHeadToHead}
              disabled={!selectedTeam1 || !selectedTeam2 || loading}
              className="px-4 py-2 bg-blue-800 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {loading ? "Loading..." : "Compare Teams"}
            </button>
          </div>
          
          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}
          
          {/* Head-to-Head Results */}
          {headToHeadData && headToHeadData.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-2xl font-bold mb-4">Head-to-Head Results</h2>
              
              {/* Team Comparison */}
              <div className="flex flex-col md:flex-row justify-between items-center mb-6">
                <div className="text-center mb-4 md:mb-0">
                  <img
                    src={getTeamLogo(selectedTeam1)}
                    alt={getTeamName(selectedTeam1)}
                    className="w-24 h-24 mx-auto mb-2"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "https://via.placeholder.com/150?text=No+Logo";
                    }}
                  />
                  <h3 className="text-xl font-semibold">{getTeamName(selectedTeam1)}</h3>
                  {stats && (
                    <div className="mt-2">
                      <p className="text-lg font-bold text-blue-800">{stats.team1Wins} Wins</p>
                      <p className="text-gray-600">{stats.team1Goals} Goals</p>
                    </div>
                  )}
                </div>
                
                <div className="text-center mb-4 md:mb-0">
                  <div className="text-3xl font-bold">VS</div>
                  {stats && (
                    <div className="mt-2">
                      <p className="text-lg font-bold">{stats.totalMatches} Matches</p>
                      <p className="text-gray-600">{stats.draws} Draws</p>
                    </div>
                  )}
                </div>
                
                <div className="text-center">
                  <img
                    src={getTeamLogo(selectedTeam2)}
                    alt={getTeamName(selectedTeam2)}
                    className="w-24 h-24 mx-auto mb-2"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "https://via.placeholder.com/150?text=No+Logo";
                    }}
                  />
                  <h3 className="text-xl font-semibold">{getTeamName(selectedTeam2)}</h3>
                  {stats && (
                    <div className="mt-2">
                      <p className="text-lg font-bold text-blue-800">{stats.team2Wins} Wins</p>
                      <p className="text-gray-600">{stats.team2Goals} Goals</p>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Recent Matches */}
              <h3 className="text-xl font-semibold mb-4">Recent Matches</h3>
              <div className="space-y-4">
                {headToHeadData.map((match) => (
                  <div
                    key={match.fixture.id}
                    className="bg-gray-50 rounded-lg p-4 flex flex-col md:flex-row justify-between items-center"
                  >
                    <div className="flex items-center mb-2 md:mb-0">
                      <img
                        src={match.teams.home.logo}
                        alt={match.teams.home.name}
                        className="w-8 h-8 mr-2"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "https://via.placeholder.com/150?text=No+Logo";
                        }}
                      />
                      <span className="font-medium">{match.teams.home.name}</span>
                    </div>
                    
                    <div className="text-center mb-2 md:mb-0">
                      <span className="font-bold text-lg">
                        {match.goals.home} - {match.goals.away}
                      </span>
                      <div className="text-sm text-gray-600">
                        {new Date(match.fixture.date).toLocaleDateString()}
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <span className="font-medium">{match.teams.away.name}</span>
                      <img
                        src={match.teams.away.logo}
                        alt={match.teams.away.name}
                        className="w-8 h-8 ml-2"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "https://via.placeholder.com/150?text=No+Logo";
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* No Results Message */}
          {headToHeadData && headToHeadData.length === 0 && (
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <p className="text-gray-600">No head-to-head matches found between these teams.</p>
            </div>
          )}
        </>
      ) : (
        <>
          {/* Team Selection for Player Comparison */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label htmlFor="team1-select" className="block text-sm font-medium text-gray-700 mb-1">
                Select First Team
              </label>
              <select
                id="team1-select"
                value={selectedTeam1}
                onChange={handleTeam1Change}
                className="block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select a team</option>
                {teams.map((team) => (
                  <option key={team.team.id} value={team.team.id}>
                    {team.team.name}
                  </option>
                ))}
              </select>
              
              {team1Players.length > 0 && (
                <div className="mt-4">
                  <label htmlFor="player1-select" className="block text-sm font-medium text-gray-700 mb-1">
                    Select Player from {getTeamName(selectedTeam1)}
                  </label>
                  <select
                    id="player1-select"
                    value={selectedPlayer1}
                    onChange={(e) => setSelectedPlayer1(e.target.value)}
                    className="block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select a player</option>
                    {team1Players.map((player) => (
                      <option key={player.id} value={player.id}>
                        {player.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
            
            <div>
              <label htmlFor="team2-select" className="block text-sm font-medium text-gray-700 mb-1">
                Select Second Team
              </label>
              <select
                id="team2-select"
                value={selectedTeam2}
                onChange={handleTeam2Change}
                className="block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select a team</option>
                {teams.map((team) => (
                  <option key={team.team.id} value={team.team.id}>
                    {team.team.name}
                  </option>
                ))}
              </select>
              
              {team2Players.length > 0 && (
                <div className="mt-4">
                  <label htmlFor="player2-select" className="block text-sm font-medium text-gray-700 mb-1">
                    Select Player from {getTeamName(selectedTeam2)}
                  </label>
                  <select
                    id="player2-select"
                    value={selectedPlayer2}
                    onChange={(e) => setSelectedPlayer2(e.target.value)}
                    className="block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select a player</option>
                    {team2Players.map((player) => (
                      <option key={player.id} value={player.id}>
                        {player.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>
          
          {/* Compare Players Button */}
          <div className="mb-6">
            <button
              onClick={comparePlayers}
              disabled={!selectedPlayer1 || !selectedPlayer2 || playerLoading}
              className="px-4 py-2 bg-blue-800 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {playerLoading ? "Loading..." : "Compare Players"}
            </button>
          </div>
          
          {/* Player Error Message */}
          {playerError && (
            <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
              {playerError}
            </div>
          )}
          
          {/* Player Comparison Results */}
          {playerComparison && playerComparison.player1 && playerComparison.player2 && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-2xl font-bold mb-4">Player Comparison</h2>
              
              <div className="flex flex-col md:flex-row justify-between items-center mb-6">
                <div className="text-center mb-4 md:mb-0">
                  <img
                    src={playerComparison.player1.player.photo}
                    alt={playerComparison.player1.player.name}
                    className="w-32 h-32 mx-auto mb-2 rounded-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "https://via.placeholder.com/150?text=No+Photo";
                    }}
                  />
                  <h3 className="text-xl font-semibold">{playerComparison.player1.player.name}</h3>
                  <p className="text-gray-600">{getTeamName(selectedTeam1)}</p>
                </div>
                
                <div className="text-center mb-4 md:mb-0">
                  <div className="text-3xl font-bold">VS</div>
                </div>
                
                <div className="text-center">
                  <img
                    src={playerComparison.player2.player.photo}
                    alt={playerComparison.player2.player.name}
                    className="w-32 h-32 mx-auto mb-2 rounded-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "https://via.placeholder.com/150?text=No+Photo";
                    }}
                  />
                  <h3 className="text-xl font-semibold">{playerComparison.player2.player.name}</h3>
                  <p className="text-gray-600">{getTeamName(selectedTeam2)}</p>
                </div>
              </div>
              
              {/* Player Statistics */}
              <h3 className="text-xl font-semibold mb-4">Statistics</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Statistic
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {playerComparison.player1.player.name}
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {playerComparison.player2.player.name}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        Age
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-500">
                        {playerComparison.player1.player.age}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-500">
                        {playerComparison.player2.player.age}
                      </td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        Nationality
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-500">
                        {playerComparison.player1.player.nationality}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-500">
                        {playerComparison.player2.player.nationality}
                      </td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        Position
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-500">
                        {playerComparison.player1.statistics[0]?.games.position || "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-500">
                        {playerComparison.player2.statistics[0]?.games.position || "N/A"}
                      </td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        Appearances
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-500">
                        {playerComparison.player1.statistics[0]?.games.appearences || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-500">
                        {playerComparison.player2.statistics[0]?.games.appearences || 0}
                      </td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        Goals
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-500">
                        {playerComparison.player1.statistics[0]?.goals.total || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-500">
                        {playerComparison.player2.statistics[0]?.goals.total || 0}
                      </td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        Assists
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-500">
                        {playerComparison.player1.statistics[0]?.goals.assists || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-500">
                        {playerComparison.player2.statistics[0]?.goals.assists || 0}
                      </td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        Minutes Played
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-500">
                        {playerComparison.player1.statistics[0]?.games.minutes || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-500">
                        {playerComparison.player2.statistics[0]?.games.minutes || 0}
                      </td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        Yellow Cards
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-500">
                        {playerComparison.player1.statistics[0]?.cards.yellow || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-500">
                        {playerComparison.player2.statistics[0]?.cards.yellow || 0}
                      </td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        Red Cards
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-500">
                        {playerComparison.player1.statistics[0]?.cards.red || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-500">
                        {playerComparison.player2.statistics[0]?.cards.red || 0}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
          
          {/* No Player Comparison Results */}
          {playerComparison && (!playerComparison.player1 || !playerComparison.player2) && (
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <p className="text-gray-600">No player statistics available for comparison.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default HeadToHead; 