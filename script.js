import { fetchProduct } from "./fetch.js";
 
const showProduct = () => {
    const productCard = document.querySelector('.item-card');
    fetchProduct()
        .then(data => {
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
                                <button class="add-to-cart-button" data-product-id="${product.id}">Add to cart</button>
                            </div>
                        </div>
                    </div>
                `;

                // Add event listener to the "Add to cart" button
                const addToCartButton = card.querySelector('.add-to-cart-button');
                addToCartButton.addEventListener('click', () => addToCart(product));

                const cart = JSON.parse(localStorage.getItem("cart"));

                if (cart && cart.items) {
                    const existingProduct = cart.items.find(item => item.id === product.id);
                    if (existingProduct) {
                        const addCartDiv = card.querySelector('.add-cart');
                        addCartDiv.innerHTML = ''; // Clear the existing content

                        // Create the increase and decrease buttons dynamically
                        const decreaseButton = document.createElement('button');
                        decreaseButton.classList.add('btn', 'btn-sm', 'btn-primary', 'decreaseQty', 'm-2');
                        decreaseButton.setAttribute('data-product-id', product.id);
                        decreaseButton.textContent = '-';
                        
                        const quantitySpan = document.createElement('span');
                        quantitySpan.textContent = existingProduct.qty;
                        
                        const increaseButton = document.createElement('button');
                        increaseButton.classList.add('btn', 'btn-sm', 'btn-primary', 'increaseQty', 'm-2');
                        increaseButton.setAttribute('data-product-id', product.id);
                        increaseButton.textContent = '+';

                        // Append the buttons to the addCartDiv
                        addCartDiv.appendChild(decreaseButton);
                        addCartDiv.appendChild(quantitySpan);
                        addCartDiv.appendChild(increaseButton);

                        // Attach event listeners to the new buttons
                        decreaseButton.addEventListener('click', () => updateQuantity(product.id, -1));
                        increaseButton.addEventListener('click', () => updateQuantity(product.id, 1));
                    }
                }

                productCard.appendChild(card);
            });
        })
        .catch(error => {
            console.error("Error fetching product data: ", error);
        });
}



const initializeCart = () => {
    const cart = JSON.parse(localStorage.getItem("cart"));
    if (!cart) {
        const cartObj = {
            totalQuantity: 0,
            items: []
        };
        localStorage.setItem("cart", JSON.stringify(cartObj));
    }
}

const addToCart = (product) => {
    const item_obj = {
        "id": product.id,
        "name": product.name,
        "price": product.price,
        "totalAmount": product.price * 1,
        "qty": 1
    }
    let cart = JSON.parse(localStorage.getItem("cart"));
    if (!cart) {
        initializeCart();
        cart = JSON.parse(localStorage.getItem("cart"));
    }
    const existingProduct = cart.items.find(item => item.id === product.id);
    if (!existingProduct) {
        cart.items.push(item_obj);
    } else {
        existingProduct.qty++;
        existingProduct.totalAmount = existingProduct.price * existingProduct.qty;
    }
    cart.totalQuantity++;
    saveCartToLocalStorage(cart);
    reloadPageInBackground()
    renderCart();
}


const renderCart = () => {
    let cart = JSON.parse(localStorage.getItem("cart"));
    const cartShow = document.querySelector('.cart-show');
    cartShow.innerHTML = '';
    if (cart && cart.items.length > 0) {
        cart.items.forEach(item => {
            const itemIndex = cart.items.indexOf(item);
            cartShow.innerHTML += `
            <li class="list-group-item d-flex justify-content-between align-items-start">
            <div class="ms-2 me-auto">
                <div class="fw-bold">${item.name}</div>
                <p>${item.description}</p>
                <p>Price: $${item.price}</p>
                <p>Quantity: ${item.qty}</p>
                <p>Total Amount: ${item.qty*item.price}</p>
            </div>
            <button class="btn btn-danger remove-from-cart" data-product-index="${itemIndex}" data-product-id="${item.id}">Remove</button>
            </li>
            `;
        });
    }
    const removeButtons = document.querySelectorAll('.remove-from-cart');
    removeButtons.forEach(button => {
        const itemIndex = parseInt(button.getAttribute('data-product-index'));
        button.addEventListener('click', () => removeFromCart(itemIndex));
    });
}

const removeFromCart = (itemIndex) => {
    const cart = JSON.parse(localStorage.getItem("cart"))
    cart.totalQuantity-=cart.items[itemIndex].qty;
    cart.items.splice(itemIndex, 1);
    saveCartToLocalStorage(cart);
    reloadPageInBackground();
    renderCart();
}

const updateQuantity = (productId, increment) => {
    let cart = JSON.parse(localStorage.getItem("cart")) || { items: [], totalQuantity: 0 };
    const productIndex = cart.items.findIndex(item => item.id === productId);

    if (productIndex !== -1) {
        // Increment or decrement quantity based on the "increment" parameter
        cart.items[productIndex].qty += increment;
        cart.items[productIndex].totalAmount += increment * cart.items[productIndex].price;

        if (cart.items[productIndex].qty <= 0) {
            // If quantity becomes zero or negative, remove the item from the cart
            cart.totalQuantity -= Math.abs(increment);
            cart.items.splice(productIndex, 1);
        } else {
            cart.totalQuantity += increment;
        }

        localStorage.setItem("cart", JSON.stringify(cart));
        reloadPageInBackground(); // Reload the page in the background
    }
}

const saveCartToLocalStorage = (cart) => {
    localStorage.setItem("cart", JSON.stringify(cart))
}

(function() {
    showProduct();
    renderCart();
})()

const reloadPageInBackground = () => {
    setTimeout(() => {
        location.reload(); // Reload the page in the background after a short delay
    }); // Adjust the delay time as needed
}



