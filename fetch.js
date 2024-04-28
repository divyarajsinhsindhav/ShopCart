// cart.js
export function fetchProduct() {
    return fetch('http://localhost:3000/products')
        .then(res => res.json())
        .then(data => {
            return data;
        });
}
