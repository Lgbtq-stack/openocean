import {showNFTDetails} from "./ProductDetailsLogic.js";

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

let currentPage = 1;
let currentCategory = 1;

function generatePagination(paging, onPageChange) {
    const { page, totalPages } = paging;
    const paginationContainer = document.getElementById("pagination-container");

    if (!paginationContainer) {
        return;
    }

    paginationContainer.innerHTML = "";

    if (page > 1) {
        const prevButton = document.createElement("button");
        prevButton.textContent = "<";
        prevButton.className = "pagination-btn";
        prevButton.addEventListener("click", () => onPageChange(page - 1));
        paginationContainer.appendChild(prevButton);
    }

    const firstPage = createPageButton(1, page, onPageChange);
    paginationContainer.appendChild(firstPage);

    if (page > 3) {
        const dots = document.createElement("span");
        dots.textContent = "...";
        dots.className = "dots";
        paginationContainer.appendChild(dots);
    }

    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) {
        const pageButton = createPageButton(i, page, onPageChange);
        paginationContainer.appendChild(pageButton);
    }

    if (page < totalPages - 2) {
        const dots = document.createElement("span");
        dots.textContent = "...";
        dots.className = "dots";
        paginationContainer.appendChild(dots);
    }

    if (totalPages > 1) {
        const lastPage = createPageButton(totalPages, page, onPageChange);
        paginationContainer.appendChild(lastPage);
    }

    if (page < totalPages) {
        const nextButton = document.createElement("button");
        nextButton.textContent = ">";
        nextButton.className = "pagination-btn";
        nextButton.addEventListener("click", () => onPageChange(page + 1));
        paginationContainer.appendChild(nextButton);
    }
}

function createPageButton(pageNumber, currentPage, onPageChange) {
    const button = document.createElement("button");
    button.textContent = pageNumber;
    button.className = "pagination-btn";

    if (pageNumber === currentPage) {
        button.classList.add("active");
    }

    button.addEventListener("click", () => {
        onPageChange(pageNumber);
        scrollToTop();
    });

    return button;
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

async function onPageChange(newPage) {
    currentPage = newPage;
    await loadCategories(currentPage, currentCategory);
}

export async function loadCategories(page = 1, category) {
    if (!category || !category.id) {
        console.error("Invalid category:", category);
        return;
    }

    try {
        console.log(`Loading category: ${category.name}`);

        const response = await fetch(`https://miniappservcc.com/api/collections?collection_id=${category.id}&page=${page}`);
        if (!response.ok) throw new Error(`Fetch failed: ${response.status}`);

        const data = await response.json();
        const items = Array.isArray(data.data) ? data.data : [];
        const paging = data.paging || { page: 1, totalPages: 1 };

        const cardsContainer = document.getElementById("category-list");
        if (!cardsContainer) {
            console.error("Container #category-list not found");
            return;
        }

        cardsContainer.innerHTML = "";

        items.forEach(item => {
            const card = document.createElement("div");
            card.className = "card nft-card";

            card.innerHTML = `
                <div class="nft-image-container">
                    <img src="${item.image}" alt="${item.name}" class="nft-image" loading="lazy">
                </div>
                <div class="nft-details">
                    <h3 class="nft-title">${item.name}</h3>

                    <div class="nft-info-row">
                        <span>🏷️ ${item.collection || "Unknown"}</span>
                    </div>
                </div>

                <button class="details-button" data-id="${item.id}">
                    <img src="content/info.png" class="info-icon" alt="Details"> Details
                </button>
            `;

            // Навешиваем обработчик кнопки Details
            const detailsBtn = card.querySelector(".details-button");
            detailsBtn.addEventListener("click", () => {
                showNFTDetails(item.id, items);
            });

            cardsContainer.appendChild(card);
        });

        // Подгрузка изображений и пагинация
        lazyLoadImages();
        generatePagination(paging, (newPage) => loadCategories(newPage, category));

    } catch (err) {
        console.error("Error loading categories:", err);
    }
}
