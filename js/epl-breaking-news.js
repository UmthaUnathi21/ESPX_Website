// Fetch breaking news from ESPN API
async function fetchBreakingNews() {
    try {
        const response = await fetch('https://site.api.espn.com/apis/site/v2/sports/soccer/eng.1/scoreboard');
        const data = await response.json();
        
        // Extract news items from the data
        const newsItems = data.events.map(event => {
            const homeTeam = event.competitions[0].competitors[0].team.name;
            const awayTeam = event.competitions[0].competitors[1].team.name;
            const score = event.status.displayClock || 'Scheduled';
            return `${homeTeam} vs ${awayTeam} - ${score}`;
        });
        
        // Display news in the HTML
        const newsContainer = document.getElementById('breaking-news');
        newsContainer.innerHTML = newsItems.join('<br>');
    } catch (error) {
        console.error('Error fetching breaking news:', error);
    }
}

// Call the function to fetch and display news
fetchBreakingNews();