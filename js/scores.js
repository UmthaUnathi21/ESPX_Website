document.addEventListener("DOMContentLoaded", function() {
    const eplScoresContainer = document.getElementById("epl-scores-container");
    const apiUrl = "https://site.api.espn.com/apis/site/v2/sports/soccer/eng.1/scoreboard"; // EPL API endpoint

    // Fetch and display recent EPL scores
    function fetchEPLScores() {
        fetch(apiUrl)
            .then(response => response.json())
            .then(data => {
                displayEPLScores(data);
            })
            .catch(error => console.error("Error fetching EPL scores:", error));
    }

    // Display the fetched scores in the EPL scores container
    function displayEPLScores(data) {
        eplScoresContainer.innerHTML = ""; // Clear previous scores

        data.events.forEach(event => {
            const gameContainer = document.createElement("div");
            gameContainer.classList.add("game-container");

            // Populate the game data
            gameContainer.innerHTML = `
                <div class="team-score">
                    <img src="${event.competitions[0].competitors[0].team.logo}" alt="${event.competitions[0].competitors[0].team.displayName} Logo" class="team-logo">
                    <p>${event.competitions[0].competitors[0].team.displayName}</p>
                    <p>${event.competitions[0].competitors[0].score}</p>
                </div>
                <div class="team-score">
                    <img src="${event.competitions[0].competitors[1].team.logo}" alt="${event.competitions[0].competitors[1].team.displayName} Logo" class="team-logo">
                    <p>${event.competitions[0].competitors[1].team.displayName}</p>
                    <p>${event.competitions[0].competitors[1].score}</p>
                </div>
            `;
            
            eplScoresContainer.appendChild(gameContainer);
        });
    }

    // Fetch EPL scores on page load
    fetchEPLScores();
});
