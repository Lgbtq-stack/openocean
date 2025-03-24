export async function showNFTDetails(id, dataSource) {
    try {
        const nft = dataSource.find(item => item.id === Number(id));
        if (!nft) return;

        document.getElementById('nft-title').textContent = nft.name;
        document.getElementById('nft-image').src = nft.image;
        document.getElementById('nft-description').textContent = nft.description || "No description available.";
        document.getElementById('nft-collection').textContent = nft.collection.name || nft.collection || "Unknown Artist";
        document.getElementById('nft-price').textContent = `${nft.price} ETH или $${nft.price_usd || "N/A"}`;

        document.querySelector('.add-to-cart-button').onclick = () => {
            Cart.addItem({ id: nft.id, name: nft.name, price: nft.price, count: 1 });
            alert(`${nft.name} добавлен в корзину!`);
        };

        document.querySelector('.close-panel').onclick = closeNFTDetails;

        const detailsPanel = document.getElementById('nftDetailsPanel');
        detailsPanel.style.display = 'block';
        document.body.style.overflow = 'hidden';

    } catch (error) {
        console.error('Ошибка:', error);
    }
}

function closeNFTDetails() {
    document.getElementById('nftDetailsPanel').style.display = 'none';
    document.body.style.overflow = '';
}
