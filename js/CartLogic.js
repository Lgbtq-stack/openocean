export function renderCart() {
    const itemsContainer = document.getElementById('cart-items');
    const items = Cart.getItems();

    itemsContainer.innerHTML = "";

    if (items.length === 0) {
        itemsContainer.innerHTML = "<p>Корзина пуста.</p>";
        return;
    }

    items.forEach(item => {
        const div = document.createElement('div');
        div.classList.add('cart-item');
        div.innerHTML = `
            <strong>${item.name}</strong><br>
            Цена: ${item.price} ETH<br>
            Количество: ${item.count}<br>
            <button onclick="Cart.removeItem(${item.id}); renderCart();">Remove</button>
        `;
        itemsContainer.appendChild(div);
    });
}

// Вызывай renderCart при переключении на вкладку корзины


const Cart = {
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

function updateCartIndicator() {
    const indicator = document.querySelector('.cart-count');
    const count = Cart.getTotalCount();
    indicator.textContent = count;

    indicator.style.display = count > 0 ? 'flex' : 'none';
}

document.addEventListener('DOMContentLoaded', updateCartIndicator);
