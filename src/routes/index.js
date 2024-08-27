const { Router } = require('express');
const {viewsrouter} = require("./views.route.js");
const {productosrouter} = require('./products.route.js');
const {cartsRouter} = require('./cart.route.js');

const router = Router();

router.use('/', viewsrouter);
router.use('/api/products/', productosrouter);
router.use('/api/carts/', cartsRouter);

router.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Error de server');
});

module.exports = router;
