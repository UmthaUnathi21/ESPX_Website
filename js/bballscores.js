document.addEventListener("DOMContentLoaded", function() {
    const nbaLogo = document.getElementById('nba-logo');
    const wnbaLogo = document.getElementById('wnba-logo');
    const ncaamwLogo = document.getElementById('ncaamw-logo');
    const ncaawLogo = document.getElementById('ncaaw-logo');

    const nbaScoresContainer = document.getElementById('nba-scores-container');
    const wnbaScoresContainer = document.getElementById('wnba-scores-container');
    const ncaamwScoresContainer = document.getElementById('ncaamw-scores-container');
    const ncaawScoresContainer = document.getElementById('ncaaw-scores-container');

    const apiUrlBase = 'https://site.api.espn.com/apis/site/v2/sports/basketball/';

    // Function to fetch and display scores
    function fetchScores(league, containerId) {
        fetch(`${apiUrlBase}${league}/scoreboard`)
            .then(response => response.json())
            .then(data => {
                displayScores(data, containerId);
            })
            .catch(error => console.error('Error fetching scores:', error));
    }

    // Function to display scores
    function displayScores(data, containerId) {
        const scoresContainer = document.getElementById(containerId);
        scoresContainer.innerHTML = ''; // Clear previous content

        data.events.forEach(event => {
            const gameContainer = document.createElement('div');
            gameContainer.classList.add('game-container');

            // Display team logos, names, and scores
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

            scoresContainer.appendChild(gameContainer);
        });
    }

    // Function to hide all scores containers
    function hideAllScoresContainers() {
        nbaScoresContainer.style.display = 'none';
        wnbaScoresContainer.style.display = 'none';
        ncaamwScoresContainer.style.display = 'none';
        ncaawScoresContainer.style.display = 'none';
    }

    // Function to remove 'active-logo' class from all logos
    function removeActiveClassFromAll() {
        nbaLogo.classList.remove('active-logo');
        wnbaLogo.classList.remove('active-logo');
        ncaamwLogo.classList.remove('active-logo');
        ncaawLogo.classList.remove('active-logo');
    }

    // Set up the default display for NBA scores
    function displayDefaultNBA() {
        hideAllScoresContainers();
        nbaScoresContainer.style.display = 'block'; // Show NBA container
        fetchScores('nba', 'nba-scores'); // Fetch and display NBA scores
        removeActiveClassFromAll();
        nbaLogo.classList.add('active-logo'); // Set red underline for NBA logo
    }

    // Event listeners for logo clicks
    nbaLogo.addEventListener('click', function() {
        hideAllScoresContainers();
        nbaScoresContainer.style.display = 'block';
        fetchScores('nba', 'nba-scores');
        removeActiveClassFromAll();
        nbaLogo.classList.add('active-logo');
    });

    wnbaLogo.addEventListener('click', function() {
        hideAllScoresContainers();
        wnbaScoresContainer.style.display = 'block';
        fetchScores('wnba', 'wnba-scores');
        removeActiveClassFromAll();
        wnbaLogo.classList.add('active-logo');
    });

    ncaamwLogo.addEventListener('click', function() {
        hideAllScoresContainers();
        ncaamwScoresContainer.style.display = 'block';
        fetchScores('mens-college-basketball', 'ncaamw-scores');
        removeActiveClassFromAll();
        ncaamwLogo.classList.add('active-logo');
    });

    ncaawLogo.addEventListener('click', function() {
        hideAllScoresContainers();
        ncaawScoresContainer.style.display = 'block';
        fetchScores('womens-college-basketball', 'ncaaw-scores');
        removeActiveClassFromAll();
        ncaawLogo.classList.add('active-logo');
    });

    // Display NBA scores by default when page loads
    displayDefaultNBA();
});
