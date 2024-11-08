document.addEventListener('DOMContentLoaded', function () {
    const apiKey = '3c4921f4cd3c4ebcb9ecd7c3337d3d07';
    const apiUrl = 'http://localhost:3000/ncaa/playerstats'; // Updated API for player stats
    const playerInfoApi = 'http://localhost:3000/ncaa/playerinfo'; // Use the server route for player info
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
        document.getElementById('loading-spinner').style.display = 'block';  // Show spinner
        document.getElementById('player-info').style.display = 'none';       // Hide player info
        document.getElementById('player-stats').style.display = 'none';      // Hide player stats
        document.getElementById('visualization').style.display = 'none';     // Hide visualization
        document.getElementById('scatter-visualization').style.display = 'none';     // Hide scatterplot visualization
    }

    // Hide loading spinner and show containers
    function hideLoadingSpinner() {
        document.getElementById('loading-spinner').style.display = 'none';  // Hide spinner
        document.getElementById('player-info').style.display = 'block';        // Show player info
        document.getElementById('player-stats').style.display = 'block';       // Show player stats
        document.getElementById('visualization').style.display = 'block';      // Show visualization
        document.getElementById('scatter-visualization').style.display = 'block';      // Show scatterplot visualization
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
                    // Fetch player stats only if player is found in playerInfo
                    fetch(apiUrl)
                        .then(response => response.json())
                        .then(playerStatsData => {
                            const playerStats = playerStatsData.find(p => p.Name.toLowerCase() === playerName);

                            // Hide the loading spinner after both fetches
                            hideLoadingSpinner();

                            if (playerStats) {
                                // Display both player info and stats
                                displayPlayerInfo(playerInfo);   // Update player info
                                displayPlayerStats(playerStats); // Update player stats and D3 charts
                                createScatterPlot(playerStatsData, playerStats); // Create scatter plot
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
        const playerInfoDiv = document.getElementById('player-info');
        playerInfoDiv.innerHTML = `
            <h3>${player.FirstName} ${player.LastName}</h3>
            <p>Team: ${player.Team}</p>
            <p>Jersey: ${player.Jersey}</p>
            <p>Position: ${player.Position}</p>
            <p>Class: ${player.Class}</p>
            <p>Height: ${player.Height}</p>
            <p>Weight: ${player.Weight}</p>
            <p>Birth City: ${player.BirthCity}</p>
            <p>Birth State: ${player.BirthState}</p>
            <p>High School: ${player.HighSchool}</p>
        `;
    }

    // Display the player's season stats
    function displayPlayerStats(player) {
        const playerStatsDiv = document.getElementById('player-stats');
        playerStatsDiv.innerHTML = `
            <p>Points: ${player.Points}</p>
            <p>Assists: ${player.Assists}</p>
            <p>Rebounds: ${player.Rebounds}</p>
            <p>Steals: ${player.Steals}</p>
            <p>Blocked Shots: ${player.BlockedShots}</p>
            <p>Fantasy Points: ${player.FantasyPoints}</p>
        `;

        const updatedPerformance = [
            { stat: 'Points', value: player.Points },
            { stat: 'Assists', value: player.Assists },
            { stat: 'Rebounds', value: player.Rebounds },
            { stat: 'Steals', value: player.Steals },
            { stat: 'Blocked Shots', value: player.BlockedShots },
            { stat: 'Fantasy Points', value: player.FantasyPoints }
        ];

        // Clear any previous visualization and create a new one
        d3.select("#visualization").html(""); // Clear the visualization area
        createBarChart(updatedPerformance); // Render D3 chart
    }

    // Create a Bar Chart
    function createBarChart(data) {
        const width = 500;
        const height = 300;
        const margin = { top: 20, right: 30, bottom: 40, left: 40 };

        // Create a tooltip div for hover effects
        const tooltip = d3.select("body").append("div")
            .attr("class", "tooltip")
            .style("position", "absolute")
            .style("background-color", "white")
            .style("border", "1px solid #ddd")
            .style("padding", "5px")
            .style("border-radius", "3px")
            .style("opacity", 0);  // Initially hidden

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
            .attr("width", x.bandwidth())
            .on("mouseover", function(event, d) {
                tooltip.transition().duration(200).style("opacity", 1);
                tooltip.html(`${d.stat}: ${d.value}`)
                    .style("left", (event.pageX + 10) + "px")
                    .style("top", (event.pageY - 20) + "px");
            })
            .on("mousemove", function(event) {
                tooltip.style("left", (event.pageX + 10) + "px")
                    .style("top", (event.pageY - 20) + "px");
            })
            .on("mouseout", function() {
                tooltip.transition().duration(200).style("opacity", 0);
            });

        svg.append("g")
            .call(d3.axisLeft(y))
            .attr("transform", `translate(${margin.left},0)`);

        svg.append("g")
            .call(d3.axisBottom(x))
            .attr("transform", `translate(0,${height - margin.bottom})`);
    }

    // Create a Scatter Plot
    function createScatterPlot(allPlayersData, searchedPlayer) {
        const width = 600;
        const height = 400;
        const margin = { top: 20, right: 30, bottom: 40, left: 60 };

        const tooltip = d3.select("body").append("div")
            .attr("class", "tooltip")
            .style("position", "absolute")
            .style("background-color", "white")
            .style("border", "1px solid #ddd")
            .style("padding", "5px")
            .style("border-radius", "3px")
            .style("opacity", 0);

        const svg = d3.select("#scatter-visualization")
            .append("svg")
            .attr("width", width)
            .attr("height", height);

        const x = d3.scaleLinear()
            .domain([0, d3.max(allPlayersData, d => d.Points)]).nice()
            .range([margin.left, width - margin.right]);

        const y = d3.scaleLinear()
            .domain([0, d3.max(allPlayersData, d => d.Rebounds)]).nice()
            .range([height - margin.bottom, margin.top]);

        svg.append("g")
            .attr("transform", `translate(0,${height - margin.bottom})`)
            .call(d3.axisBottom(x).ticks(6));

        svg.append("g")
            .attr("transform", `translate(${margin.left},0)`)
            .call(d3.axisLeft(y).ticks(6));

        svg.selectAll("circle")
            .data(allPlayersData)
            .join("circle")
            .attr("cx", d => x(d.Points))
            .attr("cy", d => y(d.Rebounds))
            .attr("r", d => d.Name === searchedPlayer.Name ? 8 : 5)
            .attr("fill", d => d.Name === searchedPlayer.Name ? "#ff0000" : "#007bff")
            .on("mouseover", function(event, d) {
                tooltip.transition().duration(200).style("opacity", 1);
                tooltip.html(`${d.Name}: Points ${d.Points}, Rebounds ${d.Rebounds}`)
                    .style("left", (event.pageX + 10) + "px")
                    .style("top", (event.pageY - 20) + "px");
            })
            .on("mousemove", function(event) {
                tooltip.style("left", (event.pageX + 10) + "px")
                    .style("top", (event.pageY - 20) + "px");
            })
            .on("mouseout", function() {
                tooltip.transition().duration(200).style("opacity", 0);
            });
    }


    // Get the button
const backToTopButton = document.getElementById('back-to-top');

// Show the button when the user scrolls down 100px from the top of the document
window.onscroll = function() {
    if (document.body.scrollTop > 100 || document.documentElement.scrollTop > 100) {
        backToTopButton.style.display = 'block';
    } else {
        backToTopButton.style.display = 'none';
    }
};

// Scroll to the top when the button is clicked
backToTopButton.addEventListener('click', function() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

});
