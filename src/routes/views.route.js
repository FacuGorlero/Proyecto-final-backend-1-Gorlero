const { Router } = require('express');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const { ProductMongo } = require('../Daos-Mongo/mongo/products.daomongo.js');

const router = Router();
const productos = new ProductMongo();

router.get('/', async (req, res) => {
    res.redirect('/products');
});

router.get('/products', async (req, res) => {
    let page = req.query.page || 1;
    let { sort, category, availability } = req.query;
    let options = { page };

    if (sort) options.sort = sort;
    if (category) options.category = category;
    if (availability) options.availability = availability;

    let resp = await productos.getProducts(options);

    // Verificar que la página solicitada esté dentro de los límites
    if (page > resp.totalPages) {
        page = resp.totalPages;
        resp = await productos.getProducts({ ...options, page });
    } else if (page < 1) {
        page = 1;
        resp = await productos.getProducts({ ...options, page });
    }

    let productError = false;
    if (resp.docs.length === 0) {
        productError = true;
    }

    // Update product
    let product = resp.docs || [];
    if (!productError) {
        product.forEach((prd) => {
            prd.price = new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'ARS' }).format(prd.price);
        });
    }

    // Update URL and security
    let workingUrl = req.url.split('?')[1];
    let arrayString;

    if (workingUrl) {
        arrayString = workingUrl.split('&');

        let secPage = arrayString.findIndex((elm) => elm.split('=')[0] === 'page');
        if (secPage !== -1) {
            secPage = arrayString[secPage].split('=')[1];
            if (secPage > resp.totalPages || secPage < 1) {
                pageError = true;
            }
        }
    }

    function filterUrl(array, filter) {
        if (!workingUrl) return '/products?';
        array = array.filter((elm) => elm.split('=')[0] !== filter);
        array = array.filter((elm) => elm.split('=')[0] !== 'page');
        if (array.length === 0) {
            return '/products?';
        } else {
            return '/products?' + array.join('&') + '&';
        }
    }

    const url = filterUrl(arrayString, 'category');

    res.render('products', {
        title: 'Inicio',
        productError,
        product,
        page: resp.page,
        totalPages: resp.totalPages,
        hasPrevPage: resp.hasPrevPage,
        hasNextPage: resp.hasNextPage,
        prevPage: resp.prevPage, 
        nextPage: resp.nextPage, 
        category: await productos.getCategorys(),
        ascend: `${filterUrl(arrayString, 'sort')}sort=asc`,
        descend: `${filterUrl(arrayString, 'sort')}sort=desc`,
        disorderly: `${filterUrl(arrayString, 'sort')}sort=disorderly`,
        availability: `${filterUrl(arrayString, 'availability')}availability=false`,
        unavailability: `${filterUrl(arrayString, 'availability')}availability=true`,
        url,
    });
});

router.get('/products/:pid', async (req, res) => {
    const objectRender = { title: 'Producto' };
    const pid = req.params.pid;
  
    try {
        let resp = await fetch(`http://localhost:8080/api/products/${pid}`);
        if (!resp.ok) {
          throw new Error(`Error HTTP: ${resp.status}`);
        }
      
        resp = await resp.json();
        const product = resp.data;
      
        if (resp.status === "ok") {
          objectRender['productError'] = false;
          objectRender['product'] = product;
          objectRender['cart'] = `66cdeabf0a5175cd15709803`;
        } else {
          objectRender['productError'] = true;
        }
      } catch (error) {
        console.error("Error al obtener el producto:", error);
        objectRender['productError'] = true;
        objectRender['errorMessage'] = error.message || 'Se ha producido un error al obtener el producto.';
      }
      
  
    res.render('product', objectRender);
  });
  

  router.get('/cart', async (req, res) => {
    const objectRender = { title: 'Carrito' }
    let resp = await fetch(`http://localhost:8080/api/carts/66cdeabf0a5175cd15709803`);
    resp = await resp.json();
    const cart = resp.payload;
    const products = cart.products;

    let totalAmount = 0;
    products.forEach(prd => {
        prd['total'] = prd.product.price * prd.quantity;
        totalAmount += prd['total'];
    });

    if (resp.status == "ok") {
        objectRender['cartError'] = false;
        objectRender['cartId'] = cart._id;
    
        if (products.length != 0) {
            objectRender['cartNoEmpty'] = true;
            objectRender['products'] = products;
            objectRender['totalAmount'] = totalAmount; // Pass totalAmount to the view
        } 
    } else {
        objectRender['cartError'] = true
    }

    res.render('cart', objectRender);
});

  

router.get('/realtimeproducts', async (req, res) => {
    const product = await productos.getProducts();
    res.render('realtimeproducts', {
        title: 'SportClub',
        product: product.docs || [], // Usando 'docs' para obtener los productos en la respuesta paginada
    });
});

exports.viewsrouter = router;
