import React, { useState, useEffect } from 'react';

function LiveMatchStats({ matchId, onClose, matchData }) {
  const [stats, setStats] = useState(null);
  const [events, setEvents] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLiveData = async () => {
      try {
        setLoading(true);
        // Fetch statistics
        const statsResponse = await fetch(
          `https://v3.football.api-sports.io/fixtures/statistics?fixture=${matchId}`,
          {
            method: "GET",
            headers: {
              "x-rapidapi-host": "v3.football.api-sports.io",
              "x-rapidapi-key": "3e35192ee89b4d9324a60a8a2907218b",
            },
          }
        );

        // Fetch events (goals, assists, etc.)
        const eventsResponse = await fetch(
          `https://v3.football.api-sports.io/fixtures/events?fixture=${matchId}`,
          {
            method: "GET",
            headers: {
              "x-rapidapi-host": "v3.football.api-sports.io",
              "x-rapidapi-key": "3e35192ee89b4d9324a60a8a2907218b",
            },
          }
        );

        if (!statsResponse.ok || !eventsResponse.ok) {
          throw new Error("Failed to fetch live data");
        }

        const statsData = await statsResponse.json();
        const eventsData = await eventsResponse.json();
        
        setStats(statsData.response);
        setEvents(eventsData.response);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchLiveData();
    const interval = setInterval(fetchLiveData, 30000);
    return () => clearInterval(interval);
  }, [matchId]);

  const handleClose = (e) => {
    e.stopPropagation();
    onClose();
  };

  // Helper function to get goals and assists
  const getGoalsAndAssists = () => {
    if (!events) return { home: [], away: [] };

    const homeGoals = [];
    const awayGoals = [];
    const homeAssists = [];
    const awayAssists = [];

    events.forEach(event => {
      if (event.type === 'Goal') {
        const goal = {
          player: event.player.name,
          minute: event.time.elapsed,
          assist: event.assist?.name || null
        };
        if (event.team.id === matchData.teams.home.id) {
          homeGoals.push(goal);
          if (goal.assist) homeAssists.push(goal.assist);
        } else {
          awayGoals.push(goal);
          if (goal.assist) awayAssists.push(goal.assist);
        }
      }
    });

    return {
      home: { goals: homeGoals, assists: homeAssists },
      away: { goals: awayGoals, assists: awayAssists }
    };
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={handleClose}>
        <div className="bg-white p-4 rounded-lg max-w-md w-full mx-4" onClick={e => e.stopPropagation()}>
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-800"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={handleClose}>
        <div className="bg-white p-4 rounded-lg max-w-md w-full mx-4" onClick={e => e.stopPropagation()}>
          <div className="text-red-600 text-center">{error}</div>
          <button
            onClick={handleClose}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  const goalsAndAssists = getGoalsAndAssists();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={handleClose}>
      <div className="bg-white p-3 rounded-lg max-w-sm w-full mx-4" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-lg font-bold">Live Match Statistics</h2>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700 text-lg"
          >
            ✕
          </button>
        </div>

        {/* Match Header */}
        <div className="flex justify-between items-center mb-2 p-2 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-1">
            <img
              src={matchData.teams.home.logo}
              alt={matchData.teams.home.name}
              className="w-6 h-6"
            />
            <span className="font-bold text-xs">{matchData.teams.home.name}</span>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-green-600">
              {matchData.goals.home} - {matchData.goals.away}
            </div>
            <div className="text-xs text-red-600 font-semibold">
              {matchData.fixture.status.elapsed}' {matchData.fixture.status.short === "HT" ? "HT" : ""}
            </div>
          </div>
          <div className="flex items-center space-x-1">
            <span className="font-bold text-xs">{matchData.teams.away.name}</span>
            <img
              src={matchData.teams.away.logo}
              alt={matchData.teams.away.name}
              className="w-6 h-6"
            />
          </div>
        </div>

        {/* Goals and Assists Section */}
        <div className="mb-2">
          <h3 className="text-sm font-semibold mb-1">Goals and Assists</h3>
          <div className="grid grid-cols-2 gap-2">
            {/* Home Team */}
            <div className="bg-gray-50 p-2 rounded-lg">
              <h4 className="font-semibold text-xs mb-1">{matchData.teams.home.name}</h4>
              {goalsAndAssists.home.goals.length > 0 ? (
                goalsAndAssists.home.goals.map((goal, index) => (
                  <div key={index} className="text-xs mb-1">
                    <span className="font-medium">{goal.player}</span>
                    <span className="text-gray-600"> ({goal.minute}')</span>
                    {goal.assist && (
                      <div className="text-xs text-gray-500 ml-2">
                        Assist: {goal.assist}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-xs text-gray-500">No goals yet</div>
              )}
            </div>

            {/* Away Team */}
            <div className="bg-gray-50 p-2 rounded-lg">
              <h4 className="font-semibold text-xs mb-1">{matchData.teams.away.name}</h4>
              {goalsAndAssists.away.goals.length > 0 ? (
                goalsAndAssists.away.goals.map((goal, index) => (
                  <div key={index} className="text-xs mb-1">
                    <span className="font-medium">{goal.player}</span>
                    <span className="text-gray-600"> ({goal.minute}')</span>
                    {goal.assist && (
                      <div className="text-xs text-gray-500 ml-2">
                        Assist: {goal.assist}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-xs text-gray-500">No goals yet</div>
              )}
            </div>
          </div>
        </div>
        
        {/* Statistics Grid */}
        <div className="grid grid-cols-1 gap-2 max-h-64 overflow-y-auto">
          {stats && stats.map((teamStats, index) => (
            <div key={index} className="bg-gray-50 p-2 rounded-lg">
              <h3 className="text-xs font-semibold mb-1">{teamStats.team.name}</h3>
              <div className="grid grid-cols-2 gap-1">
                {teamStats.statistics.map((stat, statIndex) => (
                  <div key={statIndex} className="flex justify-between items-center p-1 bg-white rounded shadow-sm text-xs">
                    <span className="text-gray-700">{stat.type}</span>
                    <span className="text-blue-600 font-bold">{stat.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default LiveMatchStats; 