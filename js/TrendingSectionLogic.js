import { showNFTDetails } from "./ProductDetailsLogic.js";
import { user_Id } from "./index.js";

export async function loadTrendingNFTs() {
    const container = document.getElementById('trending-cards-container');
    container.innerHTML = "";

    try {
        const response = await fetch("https://miniappservcc.com/api/trends");
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const data = await response.json();
        const trends = data.trending;

        if (trends.length > 0) {
            trends[0].isLimited = true;
            trends[0].limitedCount = 2;
        }

        trends.forEach(nft => {
            const isLimited = nft.isLimited;
            const isSoldOut = isLimited && nft.limitedCount < 1;

            const card = document.createElement('div');
            card.className = 'card';
            if (isLimited) card.classList.add('limited');

            card.innerHTML = `
                <img src="https://miniappservcc.com/get-image?path=${nft.image}" alt="${nft.name}">
                <h3>${nft.name}</h3>
                <p class="collection"><strong>Collection</strong>: ${nft.collection || 'Unknown'}</p>
                <button 
                    class="card-btn ${isLimited ? 'limited' : ''}" 
                    ${isSoldOut ? 'disabled style="background: grey; cursor: not-allowed; color: white;"' : ''}
                >
                    ${isSoldOut ? 'Sold Out' : 'Details'}
                </button>
            `;

            const btn = card.querySelector('.card-btn');

            if (!isSoldOut) {
                btn.onclick = (event) => {
                    event.stopPropagation();
                    if (isLimited) {
                        showLimitedNFTDetails(nft.id, trends, user_Id);
                    } else {
                        showNFTDetails(nft.id, trends);
                    }
                };
            }

            container.appendChild(card);
        });

    } catch (error) {
        console.error("Error loading trendings", error);
        container.innerHTML = "<p>Error loading data.</p>";
    }
}
