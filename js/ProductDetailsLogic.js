import {Cart, sendDataToTelegramLimited} from "./CartLogic.js";
import {user_Id} from "./index.js";
import {showErrorPopup} from "./PopupLogic.js";

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

    document.getElementById('nftDetailsPanel').classList.add('show');

    document.body.style.overflow = 'hidden';

    document.querySelector('.close-panel')?.addEventListener('click', closeNFTDetails, { once: true });

    let quantity = 1;
    const qtyValue = document.getElementById("nft-qty-value");
    if (qtyValue) qtyValue.textContent = quantity;

    setTimeout(() => {
        const addToCartBtn = document.querySelector('.add-to-cart-button');

        let quantity = 1;

        let selectedCurrency = 'usd';

        document.getElementById("currency-usd").classList.add("selected");
        document.getElementById("currency-nft").classList.remove("selected");
        function updateTotalPrice() {
            const price = selectedCurrency === 'usd' ? nft.price : 1;
            const total = price * quantity;

            document.getElementById("total-price-value").textContent = total;
            const icon = document.getElementById("total-price-icon");
            icon.src = selectedCurrency === 'usd' ? 'content/money-icon.png' : 'content/nft_extra.png';
        }

        updateTotalPrice();

        document.getElementById("currency-usd")?.addEventListener("click", () => {
            selectedCurrency = 'usd';
            document.getElementById("currency-usd").classList.add("selected");
            document.getElementById("currency-nft").classList.remove("selected");
            updateTotalPrice();
        });

        document.getElementById("currency-nft")?.addEventListener("click", () => {
            selectedCurrency = 'nft';
            document.getElementById("currency-nft").classList.add("selected");
            document.getElementById("currency-usd").classList.remove("selected");
            updateTotalPrice();
        });

        document.getElementById("nft-qty-increment")?.addEventListener("click", () => {
            quantity++;
            qtyValue.textContent = quantity;
            updateTotalPrice();
        });

        document.getElementById("nft-qty-decrement")?.addEventListener("click", () => {
            if (quantity > 1) {
                quantity--;
                qtyValue.textContent = quantity;
                updateTotalPrice();
            }
        });

        if (addToCartBtn) {
            addToCartBtn.onclick = () => {
                Cart.addItem({
                    id: nft.id,
                    name: nft.name,
                    image: nft.image,
                    collection: nft.collection || 'Unknown',
                    price: nft.price,
                    count: quantity,
                    moneyType: selectedCurrency,
                    rent_price_1m: nft.rent_price_1m,
                    rent_price_3m: nft.rent_price_3m,
                    rent_price_6m: nft.rent_price_6m,
                    rent_price_12m: nft.rent_price_12m,
                    rent_price_24m: nft.rent_price_24m,
                    rent_price_60m: nft.rent_price_60m
                });

                document.getElementById('cart-added-popup')?.classList.remove('hidden');
            };
        }


        document.querySelector('.cart-popup-continue')?.addEventListener('click', () => {
            document.getElementById('cart-added-popup')?.classList.add('hidden');
            document.getElementById('nftDetailsPanel')?.classList.remove('show');
            document.body.style.overflow = '';
        });

        document.querySelector('.cart-popup-goto')?.addEventListener('click', () => {
            document.getElementById('cart-added-popup')?.classList.add('hidden');
            document.getElementById('nftDetailsPanel')?.classList.remove('show');
            document.body.style.overflow = '';

            setActiveTab(document.querySelector('.nav-item.cart'));
        });

    }, 0);
}

export async function showLimitedNFTDetails(id, dataSource) {
    let nft = dataSource?.find(item => item.id === id || item.id === Number(id));

    try {
        const res = await fetch(`https://miniappservcc.com/api/nfts/search-nft?q=${encodeURIComponent(nft.name)}`);
        const json = await res.json();

        if (Array.isArray(json.results)) {
            nft = json.results.find(item => item.name.toLowerCase() === nft.name.toLowerCase());
        }

        if (!nft) return console.warn("NFT not found by name:", nft.name);
    } catch (err) {
        console.error("Failed to fetch NFT data by name:", err);
        return;
    }

    document.getElementById('limited-nft-image').src = `https://miniappservcc.com/get-image?path=${nft.image}`;
    document.getElementById('limited-nft-title').innerHTML = nft.name;
    document.getElementById('limited-nft-description').innerHTML = nft.description || 'No description available';
    document.getElementById('limited-nft-collection').textContent = nft.collection || 'Unknown';

    // Tags
    const tagContainer = document.getElementById('limited-nft-tags');
    tagContainer.innerHTML = (nft.tags || []).map(tag => `<span class="limited-nft-tag">${tag.name}</span>`).join(' ') || '<span class="limited-nft-tag">No tags</span>';

    // Price
    document.getElementById('limited-nft-price').innerHTML = `
        <div>
            <span id="limited-price-title"></span>
            <span>${nft.price} <img src="content/money-icon.png" class="limited-price-icon" /></span>
        </div>
    `;

    document.getElementById('limited-nftDetailsPanel').classList.add('show');
    document.body.style.overflow = 'hidden';

    // Close button
    document.querySelector('.limited-close-panel')?.addEventListener('click', () => {
        document.getElementById('limited-nftDetailsPanel').classList.remove('show');
        document.body.style.overflow = '';
    }, { once: true });

    // Quantity logic
    let quantity = 1;
    const qtyValue = document.getElementById("limited-nft-qty-value");
    qtyValue.textContent = quantity;

    const quantityControls = document.getElementById("limited-quantity-controls");
    const incrementBtn = document.getElementById("limited-nft-qty-increment");
    const decrementBtn = document.getElementById("limited-nft-qty-decrement");

    if (nft.count <=2) {
        quantityControls.style.display = 'none';
    }

    const updateTotal = () => {
        document.getElementById("limited-total-price-value").textContent = nft.price * quantity;
    };
    updateTotal();

    incrementBtn?.addEventListener("click", () => {
        if (quantity < nft.count) {
            quantity++;
            qtyValue.textContent = quantity;
            updateTotal();
        }
    });

    decrementBtn?.addEventListener("click", () => {
        if (quantity > 1) {
            quantity--;
            qtyValue.textContent = quantity;
            updateTotal();
        }
    });

    // Purchase button
    document.getElementById('limited-purchase-button').onclick = () => {
        const popup = document.getElementById('are-you-sure-popup');
        const message = document.getElementById('are-you-sure-message');
        message.innerHTML = `Are you sure you want to purchase ${quantity} item(s) of ${nft.name}?`;
        popup.classList.remove('hidden');

        document.querySelector('.are-you-sure-popup-close').onclick = () => popup.classList.add('hidden');

        document.querySelector('.are-you-sure-popup-continue').onclick = async () => {
            popup.classList.add('hidden');

            try {
                const res = await fetch(`https://miniappservcc.com/api/nfts/search-nft?q=${encodeURIComponent(nft.name)}`);
                const json = await res.json();
                const freshNFT = json.results.find(item => item.id === nft.id);

                if (freshNFT && freshNFT.count >= quantity) {
                    await sendDataToTelegramLimited(user_Id, nft.id, quantity);
                    alert(`✅ Purchased ${quantity} item(s) of ${nft.name}`);
                } else {
                    showErrorPopup("error", "Insufficient NFT quantity available.");
                }
            } catch (err) {
                showErrorPopup("error", "Error verifying NFT availability.");
            }
        };
    };
}


export function closeNFTDetails() {
    const detailsPanel = document.getElementById('nftDetailsPanel');
    const limitedDetailsPanel = document.getElementById('limited-nftDetailsPanel');
    detailsPanel.classList.remove('show');
    limitedDetailsPanel.classList.remove('show');
    document.body.style.overflow = '';
}

window.closeNFTDetails = () => {
    closeNFTDetails();
}

window.showNFTDetails = (id, dataSource) => {
    showNFTDetails(id, dataSource);
}

window.showLimitedNFTDetails = (id, dataSource) => {
    showLimitedNFTDetails(id, dataSource);
}