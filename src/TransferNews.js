import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const TransferNews = () => {
  const [transfers, setTransfers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedLeague, setSelectedLeague] = useState("");
  const [leagues, setLeagues] = useState([]);
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

  // Fetch transfers when league is selected
  useEffect(() => {
    const fetchTransfers = async () => {
      if (!selectedLeague) return;
      
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(
          `https://v3.football.api-sports.io/players/transfers?league=${selectedLeague}&season=2024`,
          {
            method: "GET",
            headers: {
              "x-rapidapi-host": "v3.football.api-sports.io",
              "x-rapidapi-key": "3e35192ee89b4d9324a60a8a2907218b",
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch transfers");
        }

        const data = await response.json();
        console.log("Transfers API Response:", data);
        
        if (data.response && Array.isArray(data.response) && data.response.length > 0) {
          setTransfers(data.response);
        } else {
          // Try fetching data from the previous season as fallback
          const fallbackResponse = await fetch(
            `https://v3.football.api-sports.io/players/transfers?league=${selectedLeague}&season=2023`,
            {
              method: "GET",
              headers: {
                "x-rapidapi-host": "v3.football.api-sports.io",
                "x-rapidapi-key": "3e35192ee89b4d9324a60a8a2907218b",
              },
            }
          );
          
          if (fallbackResponse.ok) {
            const fallbackData = await fallbackResponse.json();
            console.log("Fallback Transfers API Response:", fallbackData);
            
            if (fallbackData.response && Array.isArray(fallbackData.response) && fallbackData.response.length > 0) {
              setTransfers(fallbackData.response);
              setError("Showing transfer data from the 2023 season as current season data is not yet available.");
            } else {
              setTransfers([]);
              setError("No transfer data available for this league. This could be because the transfer window is closed or data is not yet available.");
            }
          } else {
            setTransfers([]);
            setError("No transfer data available for this league. This could be because the transfer window is closed or data is not yet available.");
          }
        }
        
        setLoading(false);
      } catch (err) {
        console.error("Error fetching transfers:", err);
        setError("Failed to load transfers. Please try again later.");
        setLoading(false);
      }
    };

    fetchTransfers();
  }, [selectedLeague]);

  // Get leagues for the selected country
  const getLeaguesForCountry = (country) => {
    return countryLeagueMap[country] || [];
  };

  // Filter leagues by country
  const filteredLeagues = selectedCountry
    ? getLeaguesForCountry(selectedCountry)
    : [];

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Transfer News</h1>
      
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
      
      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded">
          <p className="font-medium">Information:</p>
          <p>{error}</p>
        </div>
      )}
      
      {/* Loading State */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-800"></div>
        </div>
      ) : (
        <>
          {/* Transfers List */}
          {transfers.length > 0 ? (
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Player
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        From
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        To
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {transfers.map((transfer, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-8 w-8">
                              <img 
                                className="h-8 w-8 rounded-full" 
                                src={transfer.player.photo || "https://via.placeholder.com/40"} 
                                alt={transfer.player.name} 
                              />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {transfer.player.name}
                              </div>
                              <div className="text-sm text-gray-500">
                                {transfer.player.age} years
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-8 w-8">
                              <img 
                                className="h-8 w-8" 
                                src={transfer.teams.out.logo || "https://via.placeholder.com/40"} 
                                alt={transfer.teams.out.name} 
                              />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {transfer.teams.out.name}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-8 w-8">
                              <img 
                                className="h-8 w-8" 
                                src={transfer.teams.in.logo || "https://via.placeholder.com/40"} 
                                alt={transfer.teams.in.name} 
                              />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {transfer.teams.in.name}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(transfer.transfer.date)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            transfer.transfer.type === "Free" 
                              ? "bg-green-100 text-green-800" 
                              : transfer.transfer.type === "Loan" 
                                ? "bg-yellow-100 text-yellow-800" 
                                : "bg-blue-100 text-blue-800"
                          }`}>
                            {transfer.transfer.type}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <p className="text-gray-600">No transfer data available for the selected league.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default TransferNews; 