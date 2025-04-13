import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const AdvancedLeagueTable = () => {
  const [leagues, setLeagues] = useState([]);
  const [selectedLeague, setSelectedLeague] = useState("");
  const [standings, setStandings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: "rank", direction: "asc" });
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [countries, setCountries] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState("");

  // Define a mapping of countries to league IDs
  const countryLeagueMap = {
    "England": [
      { id: 39, name: "Premier League" },
      { id: 40, name: "Championship" },
      { id: 41, name: "League One" },
      { id: 42, name: "League Two" }
    ],
    "Spain": [
      { id: 140, name: "La Liga" },
      { id: 141, name: "La Liga 2" }
    ],
    "Germany": [
      { id: 78, name: "Bundesliga" },
      { id: 79, name: "2. Bundesliga" }
    ],
    "Italy": [
      { id: 135, name: "Serie A" },
      { id: 136, name: "Serie B" }
    ],
    "France": [
      { id: 61, name: "Ligue 1" },
      { id: 62, name: "Ligue 2" }
    ]
  };

  // Fetch leagues
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
        console.log("Leagues API response:", data);
        
        if (data.response && Array.isArray(data.response)) {
          setLeagues(data.response);
          
          // Set default countries
          setCountries(Object.keys(countryLeagueMap));
          
          // Set default league if available
          if (data.response.length > 0) {
            setSelectedLeague(data.response[0].league.id);
          }
        } else {
          console.error("Invalid leagues data format:", data);
          setError("Invalid data format received from the API");
          // Add default countries as fallback
          setCountries(Object.keys(countryLeagueMap));
        }
      } catch (err) {
        console.error("Error fetching leagues:", err);
        setError("Failed to load leagues. Please try again later.");
        // Add default countries as fallback
        setCountries(Object.keys(countryLeagueMap));
      }
    };

    fetchLeagues();
  }, []);

  // Fetch standings when league is selected
  useEffect(() => {
    const fetchStandings = async () => {
      if (!selectedLeague) return;
      
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(
          `https://v3.football.api-sports.io/standings?league=${selectedLeague}&season=2024`,
          {
            method: "GET",
            headers: {
              "x-rapidapi-host": "v3.football.api-sports.io",
              "x-rapidapi-key": "3e35192ee89b4d9324a60a8a2907218b",
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch standings");
        }

        const data = await response.json();
        
        if (data.response && data.response.length > 0 && data.response[0].league.standings) {
          // Get the first standings array (usually overall standings)
          const leagueStandings = data.response[0].league.standings[0];
          
          // Process and enhance the standings data
          const enhancedStandings = leagueStandings.map(team => {
            // Calculate additional statistics
            const matchesPlayed = team.all.played;
            const goalsFor = team.all.goals.for;
            const goalsAgainst = team.all.goals.against;
            const goalDifference = goalsFor - goalsAgainst;
            const points = team.points;
            
            // Calculate advanced metrics
            const goalsPerGame = matchesPlayed > 0 ? (goalsFor / matchesPlayed).toFixed(2) : "0.00";
            const goalsAgainstPerGame = matchesPlayed > 0 ? (goalsAgainst / matchesPlayed).toFixed(2) : "0.00";
            const pointsPerGame = matchesPlayed > 0 ? (points / matchesPlayed).toFixed(2) : "0.00";
            const winPercentage = matchesPlayed > 0 ? ((team.all.win / matchesPlayed) * 100).toFixed(1) : "0.0";
            const cleanSheets = team.clean_sheet || 0;
            const failedToScore = team.failed_to_score || 0;
            
            return {
              ...team,
              rank: team.rank,
              team: team.team,
              logo: team.team.logo,
              matchesPlayed,
              goalsFor,
              goalsAgainst,
              goalDifference,
              points,
              goalsPerGame,
              goalsAgainstPerGame,
              pointsPerGame,
              winPercentage,
              cleanSheets,
              failedToScore
            };
          });
          
          setStandings(enhancedStandings);
        } else {
          setStandings([]);
        }
        
        setLoading(false);
      } catch (err) {
        console.error("Error fetching standings:", err);
        setError("Failed to load standings. Please try again later.");
        setLoading(false);
      }
    };

    fetchStandings();
  }, [selectedLeague]);

  // Handle sorting
  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  // Sort standings
  const getSortedStandings = () => {
    if (!sortConfig.key) return standings;
    
    return [...standings].sort((a, b) => {
      // Handle numeric values
      if (typeof a[sortConfig.key] === "number") {
        return sortConfig.direction === "asc" 
          ? a[sortConfig.key] - b[sortConfig.key]
          : b[sortConfig.key] - a[sortConfig.key];
      }
      
      // Handle string values
      if (typeof a[sortConfig.key] === "string") {
        return sortConfig.direction === "asc"
          ? a[sortConfig.key].localeCompare(b[sortConfig.key])
          : b[sortConfig.key].localeCompare(a[sortConfig.key]);
      }
      
      return 0;
    });
  };

  // Get sort icon
  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return "↕️";
    return sortConfig.direction === "asc" ? "↑" : "↓";
  };

  // Get leagues for the selected country
  const getLeaguesForCountry = (country) => {
    return countryLeagueMap[country] || [];
  };

  // Filter leagues by country
  const filteredLeagues = selectedCountry
    ? getLeaguesForCountry(selectedCountry)
    : [];

  console.log("Selected country:", selectedCountry);
  console.log("Filtered leagues:", filteredLeagues);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Advanced League Tables</h1>
      
      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Country Selector */}
        <div>
          <label htmlFor="country-select" className="block text-sm font-medium text-gray-700 mb-1">
            Select Country
          </label>
          <select
            id="country-select"
            value={selectedCountry}
            onChange={(e) => {
              setSelectedCountry(e.target.value);
              setSelectedLeague(""); // Reset league selection when country changes
            }}
            className="block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select a country</option>
            {countries.map((country) => (
              <option key={country} value={country}>
                {country}
              </option>
            ))}
          </select>
        </div>
        
        {/* League Selector */}
        <div>
          <label htmlFor="league-select" className="block text-sm font-medium text-gray-700 mb-1">
            Select League
          </label>
          <select
            id="league-select"
            value={selectedLeague}
            onChange={(e) => setSelectedLeague(e.target.value)}
            className="block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select a league</option>
            {filteredLeagues.map((league) => (
              <option key={league.id} value={league.id}>
                {league.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      {/* Toggle Advanced Stats */}
      <div className="mb-4">
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          {showAdvanced ? "Hide Advanced Stats" : "Show Advanced Stats"}
        </button>
      </div>
      
      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}
      
      {/* Loading State */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-800"></div>
        </div>
      ) : (
        <>
          {/* Standings Table */}
          {standings.length > 0 ? (
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                        onClick={() => handleSort("rank")}
                      >
                        Pos {getSortIcon("rank")}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Team
                      </th>
                      <th 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                        onClick={() => handleSort("matchesPlayed")}
                      >
                        MP {getSortIcon("matchesPlayed")}
                      </th>
                      <th 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                        onClick={() => handleSort("points")}
                      >
                        Pts {getSortIcon("points")}
                      </th>
                      <th 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                        onClick={() => handleSort("goalsFor")}
                      >
                        GF {getSortIcon("goalsFor")}
                      </th>
                      <th 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                        onClick={() => handleSort("goalsAgainst")}
                      >
                        GA {getSortIcon("goalsAgainst")}
                      </th>
                      <th 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                        onClick={() => handleSort("goalDifference")}
                      >
                        GD {getSortIcon("goalDifference")}
                      </th>
                      {showAdvanced && (
                        <>
                          <th 
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                            onClick={() => handleSort("goalsPerGame")}
                          >
                            GPG {getSortIcon("goalsPerGame")}
                          </th>
                          <th 
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                            onClick={() => handleSort("goalsAgainstPerGame")}
                          >
                            GAPG {getSortIcon("goalsAgainstPerGame")}
                          </th>
                          <th 
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                            onClick={() => handleSort("pointsPerGame")}
                          >
                            PPG {getSortIcon("pointsPerGame")}
                          </th>
                          <th 
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                            onClick={() => handleSort("winPercentage")}
                          >
                            Win % {getSortIcon("winPercentage")}
                          </th>
                          <th 
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                            onClick={() => handleSort("cleanSheets")}
                          >
                            CS {getSortIcon("cleanSheets")}
                          </th>
                          <th 
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                            onClick={() => handleSort("failedToScore")}
                          >
                            FTS {getSortIcon("failedToScore")}
                          </th>
                        </>
                      )}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {getSortedStandings().map((team) => (
                      <tr key={team.team.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {team.rank}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-8 w-8">
                              <img className="h-8 w-8" src={team.logo} alt={team.team.name} />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {team.team.name}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {team.matchesPlayed}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {team.points}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {team.goalsFor}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {team.goalsAgainst}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {team.goalDifference > 0 ? `+${team.goalDifference}` : team.goalDifference}
                        </td>
                        {showAdvanced && (
                          <>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {team.goalsPerGame}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {team.goalsAgainstPerGame}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {team.pointsPerGame}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {team.winPercentage}%
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {team.cleanSheets}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {team.failedToScore}
                            </td>
                          </>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <p className="text-gray-600">No standings data available for the selected league.</p>
            </div>
          )}
          
          {/* Legend */}
          <div className="mt-4 text-sm text-gray-600">
            <p><strong>MP:</strong> Matches Played | <strong>Pts:</strong> Points | <strong>GF:</strong> Goals For | <strong>GA:</strong> Goals Against | <strong>GD:</strong> Goal Difference</p>
            {showAdvanced && (
              <p><strong>GPG:</strong> Goals Per Game | <strong>GAPG:</strong> Goals Against Per Game | <strong>PPG:</strong> Points Per Game | <strong>CS:</strong> Clean Sheets | <strong>FTS:</strong> Failed to Score</p>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default AdvancedLeagueTable; 