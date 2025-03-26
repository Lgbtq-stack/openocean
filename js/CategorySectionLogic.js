function renderCategoryCards(items) {
    const container = document.querySelector("#categories .cards");
    container.innerHTML = "";

    items.forEach(item => {
        const card = document.createElement("div");
        card.className = "nft-card";

        card.innerHTML = `
            <img src="${item.image}" alt="${item.name}">
            <h4>${item.name}</h4>
            <p>$${item.price.toLocaleString()}</p>
        `;

        container.appendChild(card);
    });
}

function showCategories() {
    document.getElementById("categories").style.display = "block";
    renderCategoryCards(nftItems);
}

document.querySelector("#categories input").addEventListener("input", (e) => {
    const searchValue = e.target.value.toLowerCase();
    const filtered = nftItems.filter(item =>
        item.name.toLowerCase().includes(searchValue)
    );
    renderCategoryCards(filtered);
});