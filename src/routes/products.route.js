const { Router } = require("express");
// const ProductManager = require('../Daos-Mongo/Manager/ProductManager.js');
const { ProductMongo } = require("../Daos-Mongo/mongo/products.daomongo");
const router = Router();

// const productos = new ProductManager("./src/mock/Productos.json");

const productos = new ProductMongo();

router.get("/", async (req, res) => {
  let {
    limit = 10,
    page,
    category,
    availability = true,
    sort,
    campo1,
    campo2,
    filtro1,
    filtro2,
    campo3,
    filtro3,
  } = req.query;
  availability = availability == true || availability == "true";

  const filters = { 
    limit,
    page: page || 1,
    query: {},
  }
  if (category) {
    filters.category = category;
  }
  if (availability) {
    filters.availability = availability;
  }
  if (sort) {
    filters.sort = sort;
  }
  if (campo1 && filtro1) {
    filters.query[campo1] = filtro1;
  }
  if (campo2 && filtro2) {
    filters.query[campo2] = filtro2;
  }
  if (campo3 && filtro3) {
    filters.query[campo3] = filtro3;
  }

  const resp = await productos.getProducts(filters);

  let prevLink = resp.prevPage ? `page=${resp.prevPage}` : '';
  let nextLink = resp.nextPage ? `page=${resp.nextPage}` : '';

  if (typeof resp === 'string') {
    res.status(400).json({
      status: 'error',
      payload: resp,
    });
  } else {
    res.status(200).json({
      status: 'success',
      payload: resp.docs,
      totalPages: resp.totalPages,
      prevPage: resp.prevPage,
      nextPage: resp.nextPage,
      page: resp.page,
      hasPrevPage: resp.hasPrevPage,
      hasNextPage: resp.hasNextPage,
      prevLink: prevLink,
      nextLink: nextLink,
    });
  }
});


router.get("/:pid", async (req, res) => {
  const pid = req.params.pid;
  const getProducts = await productos.getProductsById(pid);

  if (typeof getProducts === "string") {
    res.status(404).json({
      status: "fail",
      data: getProducts,
    });
  } else {
    res.status(200).json({
      status: "ok",
      data: getProducts,
    });
  }
});


router.post("/", async (req, res) => {
  const newProduct = req.body;
  const resp = await productos.addProduct(newProduct);

  if (typeof resp === "string") {
    res.status(400).json({
      status: "fail",
      data: resp,
    });
  } else {
    res.status(200).json({
      status: "ok",
      data: resp,
    });
  }
});

router.put("/:pid", async (req, res) => {
  const pid = req.params.id ;
  const changedProduct = req.body;

  const resp = await productos.updateProduct(pid, changedProduct);

  if (typeof resp === "string") {
    res.status(400).json({
      status: "fail",
      data: resp,
    });
  } else {
    res.status(200).json({
      status: "ok",
      data: resp,
    });
  }
});

router.delete("/:pid", async (req, res) => {
  try {
    const pid = req.params.pid ;
    const resp = await productos.deleteProductById(pid);

    if (typeof resp === "string") {
      res.status(400).json({
        status: "fail",
        data: resp,
      });
    } else {
      res.status(200).json({
        status: "ok",
        data: resp,
      });
    }
  } catch (error) {
    console.error("Error en el endpoint /delete:", error);
    res.status(500).send("Error al procesar la solicitud");
  }
});

router.delete('/', async (req,res)=> {
  const pcode = req.query.code;
  const resp = await productos.deleteProductByCode(pcode)

  if (typeof resp === "string") {
    res.status(400).json({
      status: 'fail',
      payload: resp,
    })
  }else{
    res.status(200).json({
      status: 'success',
      payload: resp,
    })
  }
});

router.get('/group/categorys', async (req, res) => {
  const resp = await productos.getCategorys();

  if (typeof resp === 'string') {
    res.status(400).json({
      status: 'fail',
      payload: resp,
    });
  } else {
    res.status(200).json({
      status: 'ok',
      payload: resp,
    });
  }
});

exports.productosrouter = router;
