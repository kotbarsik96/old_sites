fetch('../js/JSON/products.json')
    .then(resolve => resolve.json())
    .then(products => {
        @@include('main.js')
        @@include('products.js')
    });