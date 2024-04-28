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
                    <button class="card-link" data-product-id="${product.id}">Add to cart</a>
                </div>
            </div>
        `;
        // Add event listener to the "Add to cart" link
        const addToCartButton = card.querySelector('.card-link');
        addToCartButton.addEventListener('click', () => addToCartClicked(product.id));
        
        itemCard.appendChild(card);
    });
}).catch(error => {
    console.error('Error fetching product data:', error);
})


// Function to handle "Add to cart" button click
const addToCartClicked = () => {
    event.preventDefault();
    const productId = event.target.getAttribute('data-product-id');
    fetchProduct().then(data => {
        let cart_obj = JSON.parse(localStorage.getItem("cart")); 
        // Update the cart data
        if (!cart_obj) {
            cart_obj = {
                "data": {
                    "quantity": 0,
                    "itemList": []
                }
            }
        }
        cart_obj.data.quantity++;
        const existingProduct = cart_obj.data.itemList.find(item => item.id === productId);
        if(existingProduct) {
            existingProduct.qty++;
        } else {
            const object = {
                "id": data[productId-1].id,
                "name": data[productId-1].name,
                "description": data[productId-1].description,
                "price": data[productId-1].price,
                "qty": 1,
            }
            cart_obj.data.itemList.push(object);
        }
        // Store the updated cart data in localStorage
        localStorage.setItem("cart", JSON.stringify(cart_obj));

        // Render the cart
        renderCart();  
    });
}

// Function to handle "Remove from Cart" button click
const removeFromCart = (itemIndex) => {
    const cartData = JSON.parse(localStorage.cart);
    cartData.data.itemList.splice(itemIndex, 1);
    cartData.data.quantity--;
    localStorage.setItem("cart", JSON.stringify(cartData));
    renderCart();
}

// Function to render the cart
function renderCart() {
    // Retrieve cart data from localStorage
    const cartData = JSON.parse(localStorage.getItem("cart"));
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
    // Add event listeners to remove buttons
    const removeButtons = document.querySelectorAll('.remove-from-cart');
    removeButtons.forEach(button => {
        // Retrieve the itemIndex from the data-product-index attribute
        const itemIndex = parseInt(button.getAttribute('data-product-index'));
        button.addEventListener('click', () => removeFromCart(itemIndex));
        // console.log(itemIndex)
    });
}


// Immediately invoked function to render the cart when the page loads
(function() {
    renderCart();
})();
