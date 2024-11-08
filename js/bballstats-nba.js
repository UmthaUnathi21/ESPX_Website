document.addEventListener('DOMContentLoaded', function () {
    const apiKey = 'ae0d70c2783545b59863bb3d5ca75444';
    const apiUrl = 'http://localhost:3000/playerstats'; // API for player stats
    const playerInfoApi = 'http://localhost:3000/playerinfo'; // Use the server route for player info
    let allPlayers = [];

    // Fetch all player names on page load
    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            allPlayers = data.map(player => player.Name); // Store all player names
        })
        .catch(error => console.error('Error fetching data:', error));

    // Event listener for typing in the search bar
    document.getElementById('search-bar').addEventListener('input', function () {
        const query = this.value.toLowerCase();
        const suggestions = allPlayers.filter(name => name.toLowerCase().includes(query));
        updateSuggestions(suggestions);
    });

    // Event listener for search button click
    document.getElementById('search-button').addEventListener('click', fetchPlayerData);

    // Update datalist with suggestions
    function updateSuggestions(suggestions) {
        const datalist = document.getElementById('player-suggestions');
        datalist.innerHTML = ''; // Clear previous suggestions
        suggestions.forEach(suggestion => {
            const option = document.createElement('option');
            option.value = suggestion;
            datalist.appendChild(option);
        });
    }

    // Show loading spinner and hide containers
    function showLoadingSpinner() {
        document.getElementById('loading-spinner').style.display = 'block';  // Show the spinner
        document.getElementById('nba-player-info').style.display = 'none';  // Hide player info
        document.getElementById('nba-player-stats').style.display = 'none'; // Hide player stats
        document.getElementById('visualization').style.display = 'none';    // Hide visualization
    }
    
    function hideLoadingSpinner() {
        document.getElementById('loading-spinner').style.display = 'none';  // Hide the spinner
    }
    

    // Fetch player data when the search button is clicked
    function fetchPlayerData() {
        const playerName = document.getElementById('search-bar').value.toLowerCase();

        // Show the loading spinner
        showLoadingSpinner();

        fetch(playerInfoApi)
            .then(response => response.json())
            .then(playerInfoData => {
                const playerInfo = playerInfoData.find(p => `${p.FirstName.toLowerCase()} ${p.LastName.toLowerCase()}` === playerName);

                if (playerInfo) {
                    // Fetch player stats only if the player is found in playerInfo
                    fetch(apiUrl)
                        .then(response => response.json())
                        .then(playerStatsData => {
                            const playerStats = playerStatsData.find(p => p.Name.toLowerCase() === playerName);

                            // Hide the loading spinner after both fetches
                            hideLoadingSpinner();

                            if (playerStats) {
                                // Display both player info and stats
                                document.getElementById('player-info').style.display = 'block';
                                document.getElementById('player-stats').style.display = 'block';
                                document.getElementById('visualization').style.display = 'block';
                                
                                displayPlayerInfo(playerInfo);   // Update player info
                                displayPlayerStats(playerStats); // Update player stats and D3 chart
                            } else {
                                alert('Player stats not found!');
                            }
                        })
                        .catch(error => {
                            hideLoadingSpinner();
                            console.error('Error fetching player stats:', error);
                        });
                } else {
                    hideLoadingSpinner();
                    alert('Player not found! Please check the name and try again.');
                }
            })
            .catch(error => {
                hideLoadingSpinner();
                console.error('Error fetching player info:', error);
            });
    }

    // Display the player's basic information
    function displayPlayerInfo(player) {
    const playerInfoDiv = document.getElementById('nba-player-info');
    playerInfoDiv.innerHTML = `
        <h2>${player.FirstName} ${player.LastName}</h2>
        <img src="${player.PhotoUrl}" alt="Player Image">
        <p>Position: ${player.Position}</p>
        <p>Team: ${player.Team}</p>
        <p>Height: ${player.Height} inches</p>
        <p>Weight: ${player.Weight} lbs</p>
        <p>Birthdate: ${new Date(player.BirthDate).toLocaleDateString()}</p>
        <p>Salary: $${player.Salary}</p>
        <p>Injury Status: ${player.InjuryStatus || 'Healthy'}</p>
        <p>Injury Notes: ${player.InjuryNotes || 'No injuries'}</p>
    `;
}


function displayPlayerStats(player) {
    console.log('Player Stats:', player); // Check what the player stats look like
    const playerStatsDiv = document.getElementById('nba-player-stats');
    playerStatsDiv.innerHTML = `
        <h2>Stats for ${player.Name}</h2>
        <p>Games Played: ${player.Games}</p>
        <p>Points: ${player.Points}</p>
        <p>Assists: ${player.Assists}</p>
        <p>Rebounds: ${player.Rebounds}</p>
        <p>Field Goals Made: ${player.FieldGoalsMade}</p>
        <p>Three-Pointers Made: ${player.ThreePointersMade}</p>
        <p>Turnovers: ${player.Turnovers}</p>
        <p>Player Efficiency Rating: ${player.PlayerEfficiencyRating}</p>
    `;

    // Clear any previous visualization and create a new one
    d3.select("#visualization").html(""); // Clear the visualization area
    createBarChart(player); // Pass the player stats to the D3 chart
}


    // Define the createBarChart function here
    function createBarChart(player) {
        const data = [
            { stat: "Points", value: player.Points },
            { stat: "Assists", value: player.Assists },
            { stat: "Rebounds", value: player.Rebounds },
            { stat: "Turnovers", value: player.Turnovers }
        ];
    
        const width = 500;
        const height = 300;
        const margin = { top: 20, right: 30, bottom: 40, left: 40 };
    
        const svg = d3.select("#visualization")
            .append("svg")
            .attr("width", width)
            .attr("height", height);
    
        const x = d3.scaleBand()
            .domain(data.map(d => d.stat))
            .range([margin.left, width - margin.right])
            .padding(0.1);
    
        const y = d3.scaleLinear()
            .domain([0, d3.max(data, d => d.value)]).nice()
            .range([height - margin.bottom, margin.top]);
    
        // Bars
        svg.append("g")
            .attr("fill", "#007BFF")
            .selectAll("rect")
            .data(data)
            .join("rect")
            .attr("x", d => x(d.stat))
            .attr("y", d => y(d.value))
            .attr("height", d => y(0) - y(d.value))
            .attr("width", x.bandwidth());
    
        // Left Y-axis
        svg.append("g")
            .call(d3.axisLeft(y))
            .attr("transform", `translate(${margin.left},0)`);
    
        // Bottom X-axis
        svg.append("g")
            .call(d3.axisBottom(x))
            .attr("transform", `translate(0,${height - margin.bottom})`);
    }    

    // Section highlighting
    const sections = document.querySelectorAll('section');
    window.addEventListener('scroll', function() {
        const scrollPos = window.scrollY + window.innerHeight / 2;
        sections.forEach(section => {
            if (section.offsetTop <= scrollPos && section.offsetTop + section.offsetHeight > scrollPos) {
                section.classList.add('active');
            } else {
                section.classList.remove('active');
            }
        });
    });

    // Back-to-top button
    const backToTopButton = document.getElementById('back-to-top');
    window.addEventListener('scroll', function() {
        if (window.scrollY > 300) {
            backToTopButton.style.display = 'block';
        } else {
            backToTopButton.style.display = 'none';
        }
    });

    backToTopButton.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
});
