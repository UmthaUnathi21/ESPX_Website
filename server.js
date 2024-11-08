const express = require('express'); 
const fetch = require('node-fetch'); // Using dynamic import if necessary
const cors = require('cors'); // Importing the cors package

const app = express();
const port = 3000;

// Use CORS middleware
app.use(cors()); // Enable CORS for all routes

// Route for fetching EPL team season stats
app.get('/epl/teamstats', async (req, res) => {
    const apiKey = '3dab92c399914b7d8f833695dacb94c3'; // EPL API key
    const apiUrl = 'http://archive.sportsdata.io/v4/soccer/scores/json/teamseasonstats/epl/2023/2023-09-26-23-51.json';

    try {
        const response = await fetch(`${apiUrl}?key=${apiKey}`);
        const data = await response.json();
        res.json(data); // Send the data back to the client
    } catch (error) {
        console.error('Error fetching EPL team stats from SportsDataIO API:', error);
        res.status(500).send('Error fetching data');
    }
});

// Route for fetching NCAA player stats (existing)
app.get('/ncaa/playerstats', async (req, res) => {
    const apiKey = 'ef038563bdc04c66852fb0f60f90e542';
    const apiUrl = 'http://archive.sportsdata.io/v3/cbb/stats/json/playerseasonstats/2024reg/2024-03-18-15-53.json';

    try {
        const response = await fetch(`${apiUrl}?key=${apiKey}`);
        const data = await response.json();
        res.json(data); // Send the data back to the client
    } catch (error) {
        console.error('Error fetching data from SportsDataIO API:', error);
        res.status(500).send('Error fetching data');
    }
});

// Route for fetching NCAA player info (existing)
app.get('/ncaa/playerinfo', async (req, res) => {
    const apiKey = 'ef038563bdc04c66852fb0f60f90e542';
    const playerInfoApi = 'http://archive.sportsdata.io/v3/cbb/stats/json/players/2023-12-02-23-58.json';

    try {
        const response = await fetch(`${playerInfoApi}?key=${apiKey}`);
        const data = await response.json();
        res.json(data); // Send the data back to the client
    } catch (error) {
        console.error('Error fetching player info from SportsDataIO API:', error);
        res.status(500).send('Error fetching data');
    }
});

// Route for fetching NBA player stats (new)
app.get('/nba/playerstats', async (req, res) => {
    const apiKey = '00d6f472c65e423bafd5ba18b4127181'; // Updated API key
    const apiUrl = 'http://archive.sportsdata.io/v3/nba/stats/json/playerseasonstats/2024reg/2023-12-08-23-32.json';

    try {
        const response = await fetch(`${apiUrl}?key=${apiKey}`);
        const data = await response.json();
        res.json(data); // Send the data back to the client
    } catch (error) {
        console.error('Error fetching NBA player stats from SportsDataIO API:', error);
        res.status(500).send('Error fetching data');
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
