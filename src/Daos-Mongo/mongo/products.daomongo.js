const { productModel } = require("./Models/products.model");

class ProductDaoMongo {
  constructor() {
    this.model = productModel;
  }

  getProducts = async (filters = {}) => {
    const query = filters && filters.query ? filters.query : {};
    const options = {
      limit: filters.limit * 1 || 10,
      page: filters.page * 1 || 10,
    };

    if (filters.category) {
      const categories = await this.getCategorys();
      if (typeof categories === "string") {
        return "Hubo un error en la peticion";
      }
      if (categories.includes(filters.category)) {
        query["category"] = filters.category;
      }
    }

    if (filters.availability) {
      query["stock"] = { $gt: 0 };
    }

    if (filters.sort * 1 === 1 || filters.sort * 1 === -1) {
      options["sort"] = { price: filters.sort * 1 };
    }
    if (filters.sort === "asc" || filters.sort === "desc") {
      options["sort"] = { price: filters.sort };
    }

    try {
      const result = await this.model.paginate(query, options);
      return result;
    } catch (error) {
      return "Hubo un error en la peticion";
    }
  };

  getProductsById = async (pid) => {
    try {
      // Usa findById para buscar un documento por ID único
      const result = await this.model.findById(pid).lean();
      if (!result) {
        return "Producto no encontrado";
      }
      return result;
    } catch (error) {
      console.error('Error al buscar el producto:', error); // Log adicional para inspección
      return "Ha ocurrido un error al buscar el producto";
    }
  };
  


  addProduct = async ({
    title,
    description,
    code,
    price,
    stock,
    status = true,
    category,
    thumbnail,
  }) => {
    try {
      const newProduct = {
        title: title,
        description: description,
        code: code,
        price: price,
        status: status,
        stock: stock,
        category: category,
        thumbnail: thumbnail,
      };
      return await this.model.create(newProduct);
    } catch (error) {
        // Manejo de errores, incluyendo códigos duplicados
        if (error.code === 11000) {
          return 'ERROR: codigo repetido';
        }
        return 'Verificar ERROR de mongoose codigo: ' + error.code;
      }
  };

  updateProduct = async (pid,changedProduct) => {
    const updateProd = await this.getProductsById(pid);

    if (updateProd.length === 0) {
      return 'Producto no encontrado';
    }

    try {
      // Actualizar el producto y devolver el resultado actualizado
      await this.model.updateOne({ _id: pid }, changedProduct);
      return await this.getProductsById(pid);
    } catch (error) {
      // Manejo de errores, incluyendo códigos duplicados
      if (error.code === 11000) {
        return 'ERROR: esta queriendo ingresar un codigo repetido';
      }
      return 'ERROR: se ha producido une error al modificar el producto';
    }
  };

  deleteProductById = async (pid) => {
    const deleteProd = await this.getProductsById(pid);

    if (deleteProd.length === 0) {
      return 'Producto no encontrado';
    }
    try {
      // Eliminar el producto y devolver el resultado eliminado
      await this.model.deleteOne({ _id: pid });
      return deleteProd;
    } catch (error) {
      return 'Hubo un error en la peticion';
    }
  };

  // Método para eliminar un producto por su código
  deleteProductByCode = async (pcode) => {
    const productoEliminado = await this.model.find({ code: pcode });

    if (productoEliminado.length === 0) {
      return 'Producto no encontrado';
    }
    try {
      // Eliminar el producto por código y devolver el resultado eliminado
      await this.model.deleteOne({ code: pcode });
      return productoEliminado;
    } catch (error) {
      return 'Hubo un error en el la peticion';
    }
  };

  getCategorys = async () => {
    try {
      // Obtener todas las categorías de la base de datos
      const list = await this.model.aggregate([
        { $group: { _id: "$category" } },
      ]);
      // Crear un array de categorías
      const arrayCategory = list.map((x) => {
        return x._id;
      });
      return arrayCategory;
    } catch (error) {
      return "Ocurrio un Error";
    }
  };
}

exports.ProductMongo = ProductDaoMongo;