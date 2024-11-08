const statsToShow = ["Goals", "Assists", "Shots", "ShotsOnGoal", "YellowCards", "RedCards", "Crosses", "TacklesWon", "Score", "OpponentScore"];
let teamData = [];

// Fetch team data from the API
async function fetchTeamData() {
    try {
        const response = await fetch('http://localhost:3000/epl/teamstats');
        const data = await response.json();
        teamData = data[0].TeamSeasons;
        populateDropdowns();
    } catch (error) {
        console.error("Error fetching team data:", error);
    }
}

// Populate dropdowns with team names
function populateDropdowns() {
    const team1Select = document.getElementById('team1');
    const team2Select = document.getElementById('team2');

    teamData.forEach(team => {
        const option1 = document.createElement('option');
        option1.value = team.TeamId;
        option1.textContent = team.Name || team.Team;
        team1Select.appendChild(option1);

        const option2 = document.createElement('option');
        option2.value = team.TeamId;
        option2.textContent = team.Name || team.Team;
        team2Select.appendChild(option2);
    });

    team1Select.addEventListener('change', updateChart);
    team2Select.addEventListener('change', updateChart);
}

// Draw chart based on selected teams
function updateChart() {
    const team1Id = document.getElementById('team1').value;
    const team2Id = document.getElementById('team2').value;

    const team1 = teamData.find(team => team.TeamId == team1Id);
    const team2 = teamData.find(team => team.TeamId == team2Id);

    if (team1 && team2) {
        drawChart(team1, team2);
    }
}

// Draw the comparison chart
function drawChart(team1, team2) {
    d3.select('#chart-area').selectAll("*").remove();

    const container = document.querySelector('#chart-area');
    const margin = { top: 20, right: 30, bottom: 40, left: 50 };
    const width = container.offsetWidth - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    const svg = d3.select('#chart-area').append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

    const maxStat = d3.max(statsToShow.map(stat => Math.max(team1[stat], team2[stat])));
    const xScale = d3.scaleLinear().domain([0, maxStat]).range([0, width / 2 - 60]);
    const yScale = d3.scaleBand().domain(statsToShow).range([0, height]).padding(0.1);

    svg.selectAll('.bar-team1')
        .data(statsToShow)
        .enter().append('rect')
        .attr('class', 'bar-team1')
        .attr('x', d => width / 2 - xScale(team1[d]) - 60)
        .attr('y', d => yScale(d))
        .attr('width', d => xScale(team1[d]))
        .attr('height', yScale.bandwidth());

    svg.selectAll('.value-team1')
        .data(statsToShow)
        .enter().append('text')
        .attr('class', 'value-team1')
        .attr('x', d => width / 2 - xScale(team1[d]) - 65)
        .attr('y', d => yScale(d) + yScale.bandwidth() / 2)
        .attr('dy', '.35em')
        .attr('text-anchor', 'end')
        .text(d => team1[d]);

    svg.selectAll('.bar-team2')
        .data(statsToShow)
        .enter().append('rect')
        .attr('class', 'bar-team2')
        .attr('x', width / 2 + 60)
        .attr('y', d => yScale(d))
        .attr('width', d => xScale(team2[d]))
        .attr('height', yScale.bandwidth());

    svg.selectAll('.value-team2')
        .data(statsToShow)
        .enter().append('text')
        .attr('class', 'value-team2')
        .attr('x', d => width / 2 + xScale(team2[d]) + 65)
        .attr('y', d => yScale(d) + yScale.bandwidth() / 2)
        .attr('dy', '.35em')
        .attr('text-anchor', 'start')
        .text(d => team2[d]);

    svg.selectAll('.stat-label')
        .data(statsToShow)
        .enter().append('text')
        .attr('class', 'stat-label')
        .attr('x', width / 2)
        .attr('y', d => yScale(d) + yScale.bandwidth() / 2)
        .attr('dy', '.35em')
        .style('text-anchor', 'middle')
        .text(d => d);

    svg.append('text')
        .attr('class', 'team-label team1-label')
        .attr('x', width / 4)
        .attr('y', +5)
        .attr('text-anchor', 'middle')
        .text(team1.Name || team1.Team);

    svg.append('text')
        .attr('class', 'team-label team2-label')
        .attr('x', 3 * width / 4)
        .attr('y', +5)
        .attr('text-anchor', 'middle')
        .text(team2.Name || team2.Team);
}

// Load data and initialize page
fetchTeamData();

// Redraw the chart on window resize
window.addEventListener('resize', updateChart);
