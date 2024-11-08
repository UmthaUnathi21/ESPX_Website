// Define the API URL for fetching EPL (English Premier League) standings data
const apiURL = 'https://site.web.api.espn.com/apis/v2/sports/soccer/eng.1/standings?season=2022';

// Function to fetch EPL data from the API
async function fetchEPLData() {
    try {
        // Fetch data from the API
        const response = await fetch(apiURL);
        const data = await response.json();

        const teamsData = [];

        data.children[0].standings.entries.forEach(team => {
            const teamName = team.team.displayName;
            const goalsScoredStat = team.stats.find(stat => stat.name === "pointsFor");
            const winsStat = team.stats.find(stat => stat.name === "wins");

            if (!goalsScoredStat || !winsStat) {
                console.error(`Stats missing for ${teamName}`);
                return;
            }

            teamsData.push({
                team: teamName,
                goals: goalsScoredStat.value,
                wins: winsStat.value
            });
        });

        renderChart(teamsData);

        // Add a resize listener to make the chart responsive
        window.addEventListener("resize", () => renderChart(teamsData));
    } catch (error) {
        console.error('Error fetching EPL data:', error);
    }
}

// Function to render the chart using the provided team data
function renderChart(teamsData) {
    // Select the SVG element and clear any existing content
    const svg = d3.select("svg");
    svg.selectAll("*").remove();

    // Get current dimensions of the SVG container for responsive scaling
    const width = parseInt(svg.style("width"));
    const height = parseInt(svg.style("height"));

    // Define the margins
    const margin = {top: 20, right: 30, bottom: 40, left: 50};
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    const xScale = d3.scaleLinear()
        .domain([0, d3.max(teamsData, d => d.goals)]).nice()
        .range([0, chartWidth]);

    const yScale = d3.scaleLinear()
        .domain([0, d3.max(teamsData, d => d.wins)]).nice()
        .range([chartHeight, 0]);

    const xAxis = d3.axisBottom(xScale);
    g.append("g")
        .attr("transform", `translate(0,${chartHeight})`)
        .call(xAxis)
        .append("text")
        .attr("x", chartWidth)
        .attr("y", 35)
        .attr("fill", "black")
        .attr("text-anchor", "end")
        .text("Goals Scored");

    const yAxis = d3.axisLeft(yScale);
    g.append("g")
        .call(yAxis)
        .append("text")
        .attr("x", -10)
        .attr("y", -10)
        .attr("fill", "black")
        .attr("text-anchor", "end")
        .text("Wins");

    // Responsive sections for elite, middle, and poor teams
    g.append("rect")
        .attr("x", xScale(60))
        .attr("y", yScale(18))
        .attr("width", chartWidth - xScale(60))
        .attr("height", yScale(0) - yScale(18))
        .attr("class", "elite-section");

    g.append("rect")
        .attr("x", xScale(40))
        .attr("y", yScale(10))
        .attr("width", xScale(60) - xScale(40))
        .attr("height", yScale(18) - yScale(10))
        .attr("class", "middle-section");

    g.append("rect")
        .attr("x", 0)
        .attr("y", yScale(10))
        .attr("width", xScale(40))
        .attr("height", chartHeight - yScale(10))
        .attr("class", "poor-section");

    const tooltip = d3.select("body").append("div")
        .style("position", "absolute")
        .style("background-color", "white")
        .style("border", "solid 1px")
        .style("border-radius", "5px")
        .style("padding", "10px")
        .style("display", "none");

    g.selectAll("image")
        .data(teamsData)
        .enter()
        .append("image")
        .attr("xlink:href", d => `../logos/${d.team.toLowerCase().replace(/ /g, "-").replace("&", "and")}.png`)
        .attr("x", d => xScale(d.goals) - 15)
        .attr("y", d => yScale(d.wins) - 15)
        .attr("width", 30)
        .attr("height", 30)
        .on("mouseover", (event, d) => {
            tooltip.style("left", `${event.pageX + 10}px`)
                .style("top", `${event.pageY - 10}px`)
                .style("display", "inline-block")
                .html(`<strong>${d.team}</strong><br>Goals: ${d.goals}<br>Wins: ${d.wins}`);
        })
        .on("mouseout", () => tooltip.style("display", "none"));

    g.selectAll("image")
        .data(teamsData)
        .enter()
        .append("image")
        .attr("xlink:href", d => `../logos/${d.team.toLowerCase().replace(/ /g, "-").replace("&", "and")}.png`)
        .attr("x", d => xScale(d.goals) - 15)
        .attr("y", d => yScale(d.wins) - 15)
        .attr("width", 30)
        .attr("height", 30)
        .attr("opacity", 0)
        .transition()
        .duration(1000)
        .attr("opacity", 1);
}

// Fetch the data and render the chart
fetchEPLData();
