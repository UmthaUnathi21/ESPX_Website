document.addEventListener('DOMContentLoaded', function () {
    const url = 'http://localhost:3000/nba/playerstats'; // Local server URL

    // Event listener for the search button
    document.getElementById('search-button').addEventListener('click', fetchPlayerData);

    function fetchPlayerData() {
        const playerName = document.getElementById('search-bar').value.trim().toLowerCase();

        // Show the loading spinner
        document.getElementById('loading-spinner').style.display = 'flex';

        fetch(url) // Make a request to the local server
            .then(response => response.json())
            .then(data => {
                console.log(data); // Debug: Inspect the fetched data

                // Hide the loading spinner
                document.getElementById('loading-spinner').style.display = 'none';

                // Check if data is an array
                if (Array.isArray(data)) {
                    // Find the player by name
                    const player = data.find(p => p.Name.toLowerCase() === playerName);

                    if (player) {
                        // Use only the relevant stats
                        const playerStats = {
                            '2P%': player.TwoPointersPercentage || 0,
                            '3P%': player.ThreePointersPercentage || 0,
                            'FT%': player.FreeThrowsPercentage || 0,
                            'Rebounds': player.Rebounds || 0,
                            'Assists': player.Assists || 0,
                            'Steals': player.Steals || 0,
                            'Blocks': player.BlockedShots || 0,
                            'Turnovers': player.Turnovers || 0,
                            'Points': player.Points || 0
                        };

                        // Create the spider chart
                        createSpiderChart(playerStats, player.Name);
                    } else {
                        alert('Player not found!');
                    }
                } else {
                    console.error('Unexpected data format:', data);
                }
            })
            .catch(error => {
                console.error('Error fetching data:', error);
                // Hide the loading spinner in case of an error
                document.getElementById('loading-spinner').style.display = 'none';
            });
    }

    // Function to create the spider chart using D3.js
    function createSpiderChart(stats, playerName) {
        d3.select("#spider-chart").html(''); // Clear previous chart

        const width = 500, height = 500; // Dimensions for the chart
        const radius = Math.min(width, height) / 2 - 80; // Subtract 80 to account for the label space
        const levels = 5; // Number of levels for the chart

        const svg = d3.select("#spider-chart")
            .append("svg")
            .attr("width", width)
            .attr("height", height)
            .append("g")
            .attr("transform", `translate(${width / 2},${height / 2})`);

        const statsKeys = Object.keys(stats);
        const totalAxes = statsKeys.length;
        const angleSlice = (2 * Math.PI) / totalAxes;

        const maxValue = Math.max(...Object.values(stats)); // Use max value to scale
        const rScale = d3.scaleLinear()
            .domain([0, maxValue])
            .range([0, radius]);

        // Draw web/grid
        for (let level = 0; level <= levels; level++) {
            const levelFactor = (radius / levels) * level;

            svg.selectAll(".levels")
                .data(statsKeys)
                .enter()
                .append("line")
                .attr("x1", (d, i) => levelFactor * Math.cos(angleSlice * i - Math.PI / 2))
                .attr("y1", (d, i) => levelFactor * Math.sin(angleSlice * i - Math.PI / 2))
                .attr("x2", (d, i) => levelFactor * Math.cos(angleSlice * (i + 1) - Math.PI / 2))
                .attr("y2", (d, i) => levelFactor * Math.sin(angleSlice * (i + 1) - Math.PI / 2))
                .attr("stroke", "#CDCDCD");
        }

        // Draw axes
        svg.selectAll(".axes")
            .data(statsKeys)
            .enter()
            .append("line")
            .attr("x1", 0)
            .attr("y1", 0)
            .attr("x2", (d, i) => radius * Math.cos(angleSlice * i - Math.PI / 2))
            .attr("y2", (d, i) => radius * Math.sin(angleSlice * i - Math.PI / 2))
            .attr("stroke", "white");

        // Add labels to axes
        svg.selectAll(".label")
            .data(statsKeys)
            .enter()
            .append("text")
            .attr("x", (d, i) => (radius + 30) * Math.cos(angleSlice * i - Math.PI / 2))
            .attr("y", (d, i) => (radius + 30) * Math.sin(angleSlice * i - Math.PI / 2))
            .attr("fill", "white")
            .style("text-anchor", "middle")
            .text(d => d);

        // Draw data points and area
        const dataPoints = statsKeys.map((key, i) => [
            rScale(stats[key]) * Math.cos(angleSlice * i - Math.PI / 2),
            rScale(stats[key]) * Math.sin(angleSlice * i - Math.PI / 2)
        ]);

        // Draw the polygon representing the player's stats
        svg.append("polygon")
            .attr("points", dataPoints.map(d => d.join(",")).join(" "))
            .attr("fill", "darkgreen")
            .attr("stroke", "green")
            .attr("fill-opacity", 0.5);

        // Draw circles on data points and add tooltip functionality
        const circles = svg.selectAll(".data-point")
            .data(dataPoints)
            .enter()
            .append("circle")
            .attr("class", "data-point")
            .attr("cx", d => d[0])
            .attr("cy", d => d[1])
            .attr("r", 5)
            .attr("fill", "green")
            .on("mouseover", function (event, d) {
                const index = circles.nodes().indexOf(this); // Get the index of the hovered circle
                const statKey = statsKeys[index]; // Get the corresponding stat key
                const statValue = stats[statKey]; // Get the stat value

                d3.select(this).attr("fill", "red"); // Change color to red on hover

                d3.select("#tooltip")
                    .style("opacity", 1)
                    .html(`${statKey}: ${statValue}`)
                    .style("left", (event.pageX + 5) + "px")
                    .style("top", (event.pageY - 28) + "px");
            })
            .on("mouseout", function () {
                d3.select(this).attr("fill", "green"); // Revert back to green when not hovered
                d3.select("#tooltip").style("opacity", 0); // Hide the tooltip
            });

        // Display player's name
        svg.append("text")
            .attr("x", 0)
            .attr("y", -radius - 60)
            .attr("text-anchor", "middle")
            .attr("fill", "white")
            .text(playerName)
            .style("font-size", "20px");
    }
});
