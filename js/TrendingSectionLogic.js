export async function loadTrendingNFTs() {
    const container = document.getElementById('trending-cards-container');
    container.innerHTML = "";

    try {
        const response = await fetch("https://miniappservcc.com/api/trends");
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const data = await response.json();
        const trends = data.trending;

        trends.forEach(nft => {
            const card = document.createElement('div');
            card.className = 'card';

            card.innerHTML = `
                <img src="${nft.image}" alt="${nft.name}">
                <h3>${nft.name}</h3>
                <p class="collection">Collection: ${nft.collection || 'Unknown'}</p>
                <p class="price">$${parseFloat(nft.price).toFixed(2)}</p>
                <button class="card-btn">Details</button>
            `;

            card.querySelector('.card-btn').onclick = (event) => {
                event.stopPropagation();
                showNFTDetails(nft.id, trends);
            };

            container.appendChild(card);
        });

    } catch (error) {
        console.error("Error loading trendings", error);
        container.innerHTML = "<p>Error loading data.</p>";
    }
}
