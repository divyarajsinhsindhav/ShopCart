import { fetchProduct } from './fetch.js';

// Fetch the product data
fetchProduct().then(data => {
    const itemCard = document.querySelector('.item-card');
    data.forEach(product => {
        const card = document.createElement('div');
        card.classList.add('item', 'col');
        card.innerHTML = `
            <div class="card" style="width: 18rem;">
                <div class="card-body">
                    <h5 class="card-title">${product.name}</h5>
                    <h6 class="card-subtitle mb-2 text-muted">Price: $${product.price}</h6>
                    <p class="card-text">${product.description}</p>
                    <div class="add-cart">
                        <button class="card-link" data-product-id="${product.id}">Add to cart</button>
                    </div>
                </div>
            </div>
        `;
        // Add event listener to the "Add to cart" link
        const addToCartButton = card.querySelector('.card-link');
        addToCartButton.addEventListener('click', (event) => addToCartClicked(event, product.id));

        const addCart = card.querySelector('.add-cart');
        increaseDecrease(addCart, product.id)
        itemCard.appendChild(card);
    });
}).catch(error => {
    console.error('Error fetching product data:', error);
});

// Function to handle "Add to cart" button click
const addToCartClicked = (event) => {
    event.preventDefault();
    const productId = event.target.getAttribute('data-product-id');
    fetchProduct().then(data => {
        let cartData = JSON.parse(localStorage.getItem("cart")); 
        // Update the cart data
        if (!cartData) {
            cartData = {
                "data": {
                    "quantity": 0,
                    "itemList": []
                }
            };
        }
        cartData.data.quantity++;
        const existingProduct = cartData.data.itemList.find(item => item.id === productId);
        if (existingProduct) {
            existingProduct.qty++;
        } else {
            const product = data.find(item => item.id === productId);
            if (product) {
                const newItem = {
                    "id": product.id,
                    "name": product.name,
                    "description": product.description,
                    "price": product.price,
                    "qty": 1
                };
                cartData.data.itemList.push(newItem);
            }
        }
        // Store the updated cart data in localStorage
        localStorage.setItem("cart", JSON.stringify(cartData));
        // Render the cart
        renderCart();
    }).catch(error => {
        console.error('Error fetching product data:', error);
    });
}

//Function to handle Increase & Decrease button in Item Card
const increaseDecrease = (addCart, productId) => {
    const cartData = JSON.parse(localStorage.getItem("cart"));
    if (!cartData) {
        console.error('Cart data not found in localStorage');
        return;
    }
    const item = cartData.data.itemList.find(item => item.id === productId);
    if (item) {
        if (item.qty >= 1) {
            addCart.innerHTML = `
                <button class="btn btn-sm btn-primary decreaseQty mr-2" data-product-id="${productId}">-</button>
                <span>${item.qty}</span>
                <button class="btn btn-sm btn-primary increaseQty ml-2" data-product-id="${productId}">+</button>
            `;
            const increaseQty = addCart.querySelector('.increaseQty');
            increaseQty.addEventListener('click', () => increase(productId));
            const decreaseQty = addCart.querySelector('.decreaseQty');
            decreaseQty.addEventListener('click', () => decrease(productId));
        }
    } else {
        removeFromCart(productId);
        const addToCartButton = addCart.querySelector('.card-link');
        if (addToCartButton) {
            addToCartButton.removeEventListener('click', (event) => addToCartClicked(event, productId));
        }
        addCart.innerHTML = `<button class="card-link" data-product-id="${productId}">Add to cart</button>`;
        const newAddToCartButton = addCart.querySelector('.card-link');
        newAddToCartButton.addEventListener('click', (event) => addToCartClicked(event, productId));
    }
}

// Function to handle Increase button click
const increase = (productId) => {
    const cartData = JSON.parse(localStorage.getItem("cart"));
    const item = cartData.data.itemList.find(item => item.id === productId);
    if (item) {
        item.qty++;
        localStorage.setItem("cart", JSON.stringify(cartData));
        renderCart();
    }
}

// Function to handle Decrease button click
const decrease = (productId) => {
    const cartData = JSON.parse(localStorage.getItem("cart"));
    const item = cartData.data.itemList.find(item => item.id === productId);
    if (item && item.qty > 1) {
        item.qty--;
        localStorage.setItem("cart", JSON.stringify(cartData));
        renderCart();
    } else if (item && item.qty === 1) {
        removeFromCart(cartData.data.itemList.indexOf(item));
    }
}

// Function to handle "Remove from Cart" button click
const removeFromCart = (itemIndex) => {
    const cartData = JSON.parse(localStorage.getItem("cart"));
    cartData.data.itemList.splice(itemIndex, 1);
    cartData.data.quantity--;
    localStorage.setItem("cart", JSON.stringify(cartData));
    renderCart();
}

// Function to render the cart
const renderCart = () => {
    let cartData = JSON.parse(localStorage.getItem("cart"));
    const cartShow = document.querySelector('.cart-show');
    cartShow.innerHTML = '';
    if (cartData && cartData.data.itemList.length > 0) {
        cartData.data.itemList.forEach(item => {
            const itemIndex = cartData.data.itemList.indexOf(item);
            // Render each item in the cart
            cartShow.innerHTML += `<li class="list-group-item d-flex justify-content-between align-items-start">
                <div class="ms-2 me-auto">
                    <div class="fw-bold">${item.name}</div>
                    <p>${item.description}</p>
                    <p>Price: $${item.price}</p>
                    <p>Quantity: ${item.qty}</p>
                    <p>Total Amount: ${item.qty*item.price}</p>
                </div>
                <button class="btn btn-danger remove-from-cart" data-product-index="${itemIndex}" data-product-id="${item.id}">Remove</button>
                </li>`;
        });
    }
    const removeButtons = document.querySelectorAll('.remove-from-cart');
    removeButtons.forEach(button => {
        const itemIndex = parseInt(button.getAttribute('data-product-index'));
        button.addEventListener('click', () => removeFromCart(itemIndex));
    });
}

// Immediately invoked function to render the cart when the page loads
(function() {
    renderCart();
})();
