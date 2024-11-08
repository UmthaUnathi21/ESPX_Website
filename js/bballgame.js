const width = 800, height = 400;
const gameArea = d3.select('#game-area').append('svg')
    .attr('width', width)
    .attr('height', height);

let score = 0;
let timeLeft = 30;
let isDragging = false;
const hoopX = width - 100, hoopY = height / 2;

// Draw the hoop
gameArea.append('rect')
    .attr('x', hoopX)
    .attr('y', hoopY - 30)
    .attr('width', 60)
    .attr('height', 10)
    .attr('fill', 'orange');

// Draw the ball
let ball = gameArea.append('circle')
    .attr('cx', 100)
    .attr('cy', height - 50)
    .attr('r', 15)
    .attr('fill', 'orange');

// Draw an arrow to indicate shot direction
let arrow = gameArea.append('line')
    .attr('x1', 100)
    .attr('y1', height - 50)
    .attr('x2', 100)
    .attr('y2', height - 50)
    .attr('stroke', 'red')
    .attr('stroke-width', 2)
    .attr('marker-end', 'url(#arrowhead)');

gameArea.append('defs').append('marker')
    .attr('id', 'arrowhead')
    .attr('viewBox', '0 -5 10 10')
    .attr('refX', 5)
    .attr('refY', 0)
    .attr('markerWidth', 6)
    .attr('markerHeight', 6)
    .attr('orient', 'auto')
    .append('path')
    .attr('d', 'M0,-5L10,0L0,5')
    .attr('fill', 'red');

let startX, startY;

// Start drag on mousedown
ball.on('mousedown', (event) => {
    const [mouseX, mouseY] = d3.pointer(event);
    startX = parseFloat(ball.attr('cx'));
    startY = parseFloat(ball.attr('cy'));
    arrow.attr('x1', startX).attr('y1', startY);
    isDragging = true;
    d3.select(window).on('mousemove', updateArrow);
});

// Launch the ball on mouseup
d3.select(window).on('mouseup', () => {
    if (!isDragging) return;
    isDragging = false;

    // Calculate shot direction and power, with opposite direction
    const endX = parseFloat(arrow.attr('x2'));
    const endY = parseFloat(arrow.attr('y2'));
    const distance = Math.sqrt(Math.pow(startX - endX, 2) + Math.pow(startY - endY, 2));
    const power = Math.min(distance * 3, 600); // Cap max power
    const angleRad = Math.atan2(endY - startY, endX - startX);

    // Opposite velocity based on angle and power
    const velocityX = Math.cos(angleRad) * power;
    const velocityY = Math.sin(angleRad) * power;

    // Animate shot in the opposite direction
    d3.select(ball.node())
        .transition()
        .duration(1000)
        .attr('cx', parseFloat(ball.attr('cx')) - velocityX)
        .attr('cy', parseFloat(ball.attr('cy')) - velocityY)
        .on('end', () => checkScore());

    resetArrow();
});

// Update the direction of the arrow based on mouse position
function updateArrow(event) {
    if (isDragging) {
        const [mouseX, mouseY] = d3.pointer(event);
        arrow
            .attr('x2', mouseX)
            .attr('y2', mouseY);
    }
}

// Check if shot is successful
function checkScore() {
    const ballX = parseFloat(ball.attr('cx'));
    const hoopXDistance = Math.abs(ballX - hoopX);
    
    if (hoopXDistance < 30) {
        score += 3;
        d3.select('#score').text(score);
    }
    resetBall();
}

// Reset ball and arrow position
function resetBall() {
    ball.transition().duration(0)
        .attr('cx', 100)
        .attr('cy', height - 50);
}

function resetArrow() {
    arrow
        .attr('x1', 100)
        .attr('y1', height - 50)
        .attr('x2', 100)
        .attr('y2', height - 50);
}

// Countdown timer
const timer = setInterval(() => {
    timeLeft--;
    d3.select('#time').text(timeLeft);
    if (timeLeft <= 0) {
        clearInterval(timer);
        alert(`Game Over! Your score is ${score}`);
    }
}, 1000);
