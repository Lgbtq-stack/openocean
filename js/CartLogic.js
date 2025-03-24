import {showErrorPopup} from "./PopupLogic.js";
import {user_Id} from "./index.js";

export async function showCartUserHeader() {
    const response = await fetch(`https://miniappservcc.com/api/user?uid=${user_Id}`);
    if (!response.ok) {
        showErrorPopup("error", "Balance error.");
        return;
    }

    const userData = await response.json();

    const header = document.getElementById('cartUserHeader');
    document.getElementById('user-nickname').textContent = `👤${userData.nickname}`;
    document.getElementById('user-balance').textContent = `
                <img src="content/money-icon.png" class="price-icon" alt="NFT" />${userData.balance}`;
    document.getElementById('user-bonus').textContent = `
                <img src="content/nft_extra.png" class="price-icon" alt="Extra" />${userData.balance_bonus}`;
    document.getElementById('user-level').textContent = `📊 ${userData.level}`;
    header.classList.add('show');
}

export function hideCartUserHeader() {
    document.getElementById('cartUserHeader').classList.remove('show');
}

export function renderCart() {
    const itemsContainer = document.getElementById('cart-items');
    const items = Cart.getItems();

    itemsContainer.innerHTML = "";

    if (items.length === 0) {
        itemsContainer.innerHTML = "<p>Корзина пуста.</p>";
        return;
    }

    let totalNFT = 0;
    let totalBonusNFT = 0;

    items.forEach(item => {
        const div = document.createElement('div');
        div.classList.add('cart-item');

        const itemTotalNFT = item.price * item.count;
        const itemTotalBonusNFT = 1 * item.count;

        totalNFT += itemTotalNFT;
        totalBonusNFT += itemTotalBonusNFT;

        div.innerHTML = `
            <div class="cart-card">
                <div class="cart-card-header">
                    <img src="${item.image}" class="cart-item-image" alt="${item.name}" />
                    <div class="cart-item-info">
                        <strong class="cart-item-title">${item.name}</strong>
                        <p class="cart-item-collection">${item.collection || "Collection"}</p>
                    </div>
                </div>

                <div class="cart-item-controls">
                    <button class="cart-btn" onclick="updateItemCount(${item.id}, -1)">-</button>
                    <span class="cart-item-count">${item.count}</span>
                    <button class="cart-btn" onclick="updateItemCount(${item.id}, 1)">+</button>
                </div>

                <div class="cart-prices">
                    <div class="price-block">
                        <span class="price">${itemTotalNFT.toFixed(2)}</span>
                        <img src="content/money-icon.png" class="price-icon" alt="USD" />
                    </div>
                    <span class="price-separator">or</span>
                    <div class="price-block">
                        <span class="price">${itemTotalBonusNFT}</span>
                        <img src="content/nft_extra.png" class="price-icon" alt="NFT" />
                    </div>
                </div>
            </div>
        `;
        itemsContainer.appendChild(div);
    });

    const summary = document.createElement('div');
    summary.classList.add('cart-summary');
    summary.innerHTML = `
        <div class="promo-container">
            <input type="text" class="promo-input" placeholder="Enter promo code" />
        </div>
        <div class="cart-total">
            <strong>Total:</strong>
            <div class="price-block">
                <span class="price">${totalNFT.toFixed(2)}</span>
                <img src="content/money-icon.png" class="price-icon" alt="NFT" />
            </div>
            <span class="price-separator">or</span>
            <div class="price-block">
                <span class="price">${totalBonusNFT}</span>
                <img src="content/nft_extra.png" class="price-icon" alt="Extra" />
            </div>
        </div>
        <button class="pay-now-btn">Pay Now</button>
    `;
    itemsContainer.appendChild(summary);
}

export const Cart = {
    getItems: function() {
        return JSON.parse(sessionStorage.getItem('cart')) || [];
    },

    saveItems: function(items) {
        sessionStorage.setItem('cart', JSON.stringify(items));
        updateCartIndicator();
    },

    addItem: function(item) {
        const items = this.getItems();
        const existing = items.find(i => i.id === item.id);

        if (existing) {
            existing.count += item.count;
        } else {
            items.push(item);
        }

        this.saveItems(items);
    },

    removeItem: function(itemId) {
        let items = this.getItems().filter(i => i.id !== itemId);
        this.saveItems(items);
    },

    clearCart: function() {
        sessionStorage.removeItem('cart');
        updateCartIndicator();
    },

    getTotalCount: function() {
        return this.getItems().reduce((total, item) => total + item.count, 0);
    }
};

function updateItemCount(id, change) {
    const items = Cart.getItems();
    const item = items.find(i => i.id === id);
    if (!item) return;

    item.count += change;
    if (item.count <= 0) {
        Cart.removeItem(id);
    } else {
        Cart.saveItems(items);
    }

    renderCart();
}

function updateCartIndicator() {
    const indicator = document.querySelector('.cart-count');
    const count = Cart.getTotalCount();
    indicator.textContent = count;

    indicator.style.display = count > 0 ? 'flex' : 'none';
}


document.addEventListener('DOMContentLoaded', updateCartIndicator);
