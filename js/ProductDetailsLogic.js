import {Cart, renderCart} from "./CartLogic.js";
import {showSuccessPopup} from "./Utilities.js";

export function showNFTDetails(id, dataSource) {
    const nft = dataSource.find(item => item.id === id || item.id === Number(id));
    if (!nft) return;

    document.getElementById('nft-title').textContent = nft.name;
    document.getElementById('nft-image').src = nft.image;
    document.getElementById('nft-description').textContent = nft.description || 'No description available';
    document.getElementById('nft-collection').textContent = nft.collection?.name || nft.collection || 'Unknown';

    // 💰 Цены с иконками
    const priceHTML = `
        <p class="nft-price">
            ${nft.price}
            <img src="content/money-icon.png" alt="Money Icon" class="price-icon" /> or 
        </p>
        <p class="nft-price">
            1
            <img src="content/nft_extra.png" alt="NFT Extra Icon" class="price-icon" />
        </p>
    `;
    document.getElementById('nft-price').innerHTML = priceHTML;

    const closeBtn = document.querySelector('.close-panel');
    if (closeBtn) {
        closeBtn.addEventListener('click', closeNFTDetails, { once: true });
    }

    const detailsPanel = document.getElementById('nftDetailsPanel');
    detailsPanel.classList.add('show');

    document.body.style.overflow = 'hidden';

    setTimeout(() => {
        const addToCartBtn = document.querySelector('.add-to-cart-button');
        if (addToCartBtn) {
            addToCartBtn.onclick = () => {
                Cart.addItem({
                    id: nft.id,
                    name: nft.name,
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
