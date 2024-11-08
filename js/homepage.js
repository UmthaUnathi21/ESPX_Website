// Array of match scores for the 2022-23 EPL season
const scores = [
    "Man City 2-0 Arsenal",
    "Liverpool 1-1 Chelsea",
    "Tottenham 3-2 Man United",
    "Leicester 1-0 Southampton",
    "Everton 2-3 West Ham",
    "Crystal Palace 1-1 Nottm Forest",
    "Leicester City 2-1 West Ham",
    "Leeds 1-4 Tottenham", 
    "Wolves 1-0 Aston Villa",
    "Bournemouth 2-0 Brighton",
];

document.addEventListener('DOMContentLoaded', () => {
    const themeToggle = document.getElementById('theme-toggle');
    const body = document.body;

    themeToggle.addEventListener('click', () => {
        // Toggle the theme
        if (body.getAttribute('data-theme') === 'dark') {
            body.removeAttribute('data-theme');
            themeToggle.textContent = '🌙'; // Light mode icon
        } else {
            body.setAttribute('data-theme', 'dark');
            themeToggle.textContent = '☀️'; // Dark mode icon
        }
    });
});

// Function to update the ticker text
function updateTicker() {
    const tickerText = document.getElementById('ticker-text');
    tickerText.textContent = scores.join('  |  ');
}

// Call the updateTicker function when the page loads
document.addEventListener('DOMContentLoaded', updateTicker);

// Carousel container
const carouselContainer = document.getElementById('carousel-container');

// Function to create and add carousel items
function createCarouselItem(imageUrl, altText, headline, link) {
    const carouselItem = document.createElement("a");
    carouselItem.href = link;
    carouselItem.classList.add("carousel-item");

    carouselItem.innerHTML = `
        <img src="${imageUrl}" alt="${altText}">
        <div class="score-overlay">${headline}</div>
    `;
    carouselContainer.appendChild(carouselItem);
}

// Function to fetch and display one random image per league (NBA, NCAA, EPL) in the carousel
function loadCarouselImages() {
    const apiUrls = [
        { url: 'https://site.api.espn.com/apis/site/v2/sports/basketball/nba/news', type: 'NBA' },
        { url: 'https://site.api.espn.com/apis/site/v2/sports/basketball/mens-college-basketball/news', type: 'NCAA' },
        { url: 'https://site.api.espn.com/apis/site/v2/sports/soccer/eng.1/news', type: 'EPL' }
    ];

    apiUrls.forEach(api => {
        fetch(api.url)
            .then(response => response.json())
            .then(data => {
                const articles = data.articles;
                
                // Select a random article from the list
                const randomArticle = articles[Math.floor(Math.random() * articles.length)];

                // Extract information for the carousel item
                const imageUrl = randomArticle.images && randomArticle.images[0] ? randomArticle.images[0].url : '';
                const altText = `${api.type} News`;
                const headline = randomArticle.headline;
                const link = randomArticle.links.web.href;

                // Add the selected item to the carousel
                createCarouselItem(imageUrl, altText, headline, link);
            })
            .catch(error => console.error(`Error fetching ${api.type} news:`, error));
    });
}

// Load carousel images on page load
document.addEventListener("DOMContentLoaded", loadCarouselImages);


