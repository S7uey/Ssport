import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    padding: 30,
    backgroundColor: '#ffffff'
  },
  header: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
    color: '#1a365d'
  },
  matchContainer: {
    marginBottom: 20,
    padding: 15,
    border: '1px solid #e2e8f0',
    borderRadius: 5
  },
  teamsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10
  },
  team: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '40%'
  },
  teamLogo: {
    width: 30,
    height: 30,
    marginRight: 10
  },
  teamName: {
    fontSize: 14,
    fontWeight: 'bold'
  },
  vs: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4a5568'
  },
  matchInfo: {
    fontSize: 12,
    color: '#4a5568',
    marginTop: 5
  },
  score: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2d3748',
    textAlign: 'center',
    marginVertical: 10
  },
  statsContainer: {
    marginTop: 20,
    padding: 10,
    border: '1px solid #e2e8f0',
    borderRadius: 5
  },
  statsHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#1a365d'
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5
  },
  statName: {
    fontSize: 12,
    color: '#4a5568',
    width: '40%'
  },
  statValue: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#2d3748',
    width: '20%',
    textAlign: 'center'
  }
});

const MatchPDF = ({ match, stats }) => {
  const isFinished = match.fixture.status.short === "FT";
  
  const renderStats = () => {
    if (!stats || !Array.isArray(stats) || stats.length < 2) return null;

    const homeStats = stats[0]?.statistics || [];
    const awayStats = stats[1]?.statistics || [];

    const commonStats = [
      { name: 'Shots on Goal', homeKey: 'Shots on Goal', awayKey: 'Shots on Goal' },
      { name: 'Shots off Goal', homeKey: 'Shots off Goal', awayKey: 'Shots off Goal' },
      { name: 'Total Shots', homeKey: 'Total Shots', awayKey: 'Total Shots' },
      { name: 'Blocked Shots', homeKey: 'Blocked Shots', awayKey: 'Blocked Shots' },
      { name: 'Shots insidebox', homeKey: 'Shots insidebox', awayKey: 'Shots insidebox' },
      { name: 'Shots outsidebox', homeKey: 'Shots outsidebox', awayKey: 'Shots outsidebox' },
      { name: 'Fouls', homeKey: 'Fouls', awayKey: 'Fouls' },
      { name: 'Corner Kicks', homeKey: 'Corner Kicks', awayKey: 'Corner Kicks' },
      { name: 'Offsides', homeKey: 'Offsides', awayKey: 'Offsides' },
      { name: 'Ball Possession', homeKey: 'Ball Possession', awayKey: 'Ball Possession' },
      { name: 'Yellow Cards', homeKey: 'Yellow Cards', awayKey: 'Yellow Cards' },
      { name: 'Red Cards', homeKey: 'Red Cards', awayKey: 'Red Cards' },
      { name: 'Goalkeeper Saves', homeKey: 'Goalkeeper Saves', awayKey: 'Goalkeeper Saves' },
      { name: 'Total passes', homeKey: 'Total passes', awayKey: 'Total passes' },
      { name: 'Passes accurate', homeKey: 'Passes accurate', awayKey: 'Passes accurate' },
      { name: 'Passes %', homeKey: 'Passes %', awayKey: 'Passes %' }
    ];

    return (
      <View style={styles.statsContainer}>
        <Text style={styles.statsHeader}>Match Statistics</Text>
        <View style={styles.statsRow}>
          <Text style={[styles.statName, { width: '40%' }]}>Statistic</Text>
          <Text style={[styles.statValue, { width: '30%' }]}>{match.teams.home.name}</Text>
          <Text style={[styles.statValue, { width: '30%' }]}>{match.teams.away.name}</Text>
        </View>
        {commonStats.map((stat, index) => {
          const homeStat = homeStats.find(s => s.type === stat.homeKey);
          const awayStat = awayStats.find(s => s.type === stat.awayKey);
          
          if (!homeStat || !awayStat) return null;

          return (
            <View key={index} style={styles.statsRow}>
              <Text style={[styles.statName, { width: '40%' }]}>{stat.name}</Text>
              <Text style={[styles.statValue, { width: '30%' }]}>{homeStat.value}</Text>
              <Text style={[styles.statValue, { width: '30%' }]}>{awayStat.value}</Text>
            </View>
          );
        })}
      </View>
    );
  };
  
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.header}>
          {isFinished ? 'Match Result' : 'Match Preview'}
        </Text>
        
        <View style={styles.matchContainer}>
          <View style={styles.teamsContainer}>
            <View style={styles.team}>
              <Image src={match.teams.home.logo} style={styles.teamLogo} />
              <Text style={styles.teamName}>{match.teams.home.name}</Text>
            </View>
            
            <Text style={styles.vs}>VS</Text>
            
            <View style={styles.team}>
              <Text style={styles.teamName}>{match.teams.away.name}</Text>
              <Image src={match.teams.away.logo} style={styles.teamLogo} />
            </View>
          </View>

          {isFinished ? (
            <Text style={styles.score}>
              {match.goals.home} - {match.goals.away}
            </Text>
          ) : null}

          <Text style={styles.matchInfo}>
            Date: {new Date(match.fixture.date).toLocaleDateString()}
          </Text>
          <Text style={styles.matchInfo}>
            Status: {match.fixture.status.long}
          </Text>
          <Text style={styles.matchInfo}>
            Venue: {match.fixture.venue.name}
          </Text>
          <Text style={styles.matchInfo}>
            League: {match.league.name}
          </Text>

          {isFinished && renderStats()}
        </View>
      </Page>
    </Document>
  );
};

export default MatchPDF; 