import {user_Id} from "./index.js";

export async function showPurchaseHistoryPage() {

    const section = document.getElementById("history-page");
    const container = document.getElementById("history-list");

    section.style.display = "block";
    container.innerHTML = "<p>Loading...</p>";

    try {
        const res = await fetch(`https://miniappservcc.com/api/user/purchase_history?uid=${user_Id}`);
        const data = await res.json();

        if (!data.length) {
            container.innerHTML = "<p>No purchases found.</p>";
            return;
        }

        container.innerHTML = data.map(item => {
            const iconSrc = item.purchase_type === "balance"
                ? "content/money-icon.png"
                : "content/nft_extra.png";

            const iconAlt = item.purchase_type === "balance"
                ? "Money Icon"
                : "NFT Extra Icon";

            return `
                <div class="history-item">
                    <img src="https://miniappservcc.com/get-image?path=${item.image}" alt="${item.name}" class="history-image">
                    <div class="history-info">
                        <h4>${item.name}</h4>
                        <p><strong>Collection:</strong> ${item.collection}</p>
                        <p>
                            <strong>Price:</strong>
                            $${item.price.toLocaleString()} × ${item.count}
                        </p>
                        <p><strong>Type:</strong> 
                            <img src="${iconSrc}" alt="${iconAlt}" class="price-icon" /></p>
                        <p class="date">${new Date(item.purchased_at).toLocaleString()}</p>
                    </div>
                </div>
            `;
        }).join('');

    } catch (err) {
        console.error(err);
        container.innerHTML = "<p>Error loading history.</p>";
    }
}

function goBack() {
    document.getElementById("history-page").style.display = "none";
}

window.goBack = goBack;