import {Cart} from "./CartLogic.js";
import {showSuccessPopup} from "./Utilities.js";

export async function showNFTDetails(id, dataSource) {

    let nft = dataSource?.find(item => item.id === id || item.id === Number(id));

    try {
        const res = await fetch(`https://miniappservcc.com/api/nfts/search-nft?q=${encodeURIComponent(nft.name)}`);
        const json = await res.json();
        console.log(json);

        if (Array.isArray(json.results)) {
            nft = json.results.find(item => item.name.toLowerCase() === nft.name.toLowerCase());
        }

        if (!nft) {
            console.warn("NFT not found by name:", nft.name);
            return;
        }
    } catch (err) {
        console.error("Failed to fetch NFT data by name:", err);
        return;
    }

    document.getElementById('nft-image').src = `https://miniappservcc.com/get-image?path=${nft.image}`;
    document.getElementById('nft-title').textContent = nft.name;
    document.getElementById('nft-description').textContent = nft.description || 'No description available';
    document.getElementById('nft-collection').textContent = nft.collection || 'Unknown';

    const tagContainer = document.getElementById('nft-tags');
    if (tagContainer) {
        const tags = nft.tags || [];
        tagContainer.innerHTML = tags.length
            ? tags.map(tag => `<span class="nft-tag">${tag.name}</span>`).join(' ')
            : '<span class="nft-tag">No tags</span>';
    }

    document.getElementById('nft-price').innerHTML = `
        <p class="nft-price">
            ${nft.price}
            <img src="content/money-icon.png" alt="Money Icon" class="price-icon" /> or 
        </p>
        <p class="nft-price">
            1
            <img src="content/nft_extra.png" alt="NFT Extra Icon" class="price-icon" />
        </p>
    `;

    // Панелька
    document.getElementById('nftDetailsPanel').classList.add('show');
    document.body.style.overflow = 'hidden';

    document.querySelector('.close-panel')?.addEventListener('click', closeNFTDetails, { once: true });

    setTimeout(() => {
        const addToCartBtn = document.querySelector('.add-to-cart-button');
        if (addToCartBtn) {
            addToCartBtn.onclick = () => {
                Cart.addItem({
                    id: nft.id,
                    name: nft.name,
                    image: nft.image,
                    collection: nft.collection || 'Unknown',
                    price: nft.price,
                    count: 1
                });
                showSuccessPopup("✔ Added to cart");
                closeNFTDetails();
            };
        }
    }, 0);
}

export function closeNFTDetails() {
    const detailsPanel = document.getElementById('nftDetailsPanel');
    detailsPanel.classList.remove('show');
    document.body.style.overflow = '';
}
