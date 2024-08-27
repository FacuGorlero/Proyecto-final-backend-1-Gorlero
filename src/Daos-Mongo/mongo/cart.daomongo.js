const { cartModel } = require('./Models/carts.model.js');  // Importa el modelo de carrito
const { ProductMongo } = require('./products.daomongo.js');  // Importa la clase ProductMongo
const products = new ProductMongo();  // Crea una instancia de ProductMongo

class CartDaoMongo {
  constructor() {
    this.model = cartModel;  // Inicializa el modelo de carrito
  }

  // Método para crear un nuevo carrito
  async create() {
    try {
      return await this.model.create({});  // Crea un nuevo carrito vacío en la base de datos
    } catch (error) {
      return 'Se ha producido un error al momento de crear el carrito';
    }
  }

  // Método para obtener uno o varios carritos
  async getCarts(cid, populate = true) {
    let query = {};
    let one = false;
    let cart;
    if (cid) {
      one = true;
      query = { _id: cid };
    }

    try {
      // Obtiene uno o varios carritos según los parámetros
      if (one) {
        if (populate === true) {
          cart = await this.model.findOne(query).populate('products.product');  // Carga los productos asociados si se especifica
        } else {
          cart = await this.model.findById(query);
        }
      } else {
        if (populate === true) {
          cart = await this.model.find(query).populate('products.product');  // Carga los productos asociados si se especifica
        } else {
          cart = await this.model.find(query);
        }
      }
      if (cart == null) {
        return 'Carrito no encontrado';
      }
      return cart;
    } catch (error) {
      return 'Ocurrio un error al buscar el carrito';
    }
  }

  // Método para agregar un producto al carrito
  async addProduct(cid, productId) {
    try {
      // Obtiene el carrito y el producto
      let cart = await this.getCarts(cid);
      if (typeof cart == 'string') {
        return 'Carrito no encontrado';
      }
      let product = await products.getProductsById(productId);
      if (typeof product == 'string') {
        return 'Producto no encontrado';
      }

      // Verifica si el producto ya existe en el carrito y actualiza la cantidad
      const existingProduct = cart.products.findIndex((item) =>
        item.product.equals(productId),
      );

      if (existingProduct !== -1) {
        cart.products[existingProduct].quantity += 1;
      } else {
        cart.products.push({
          product: productId,
          quantity: 1,
        });
      }

      await cart.save();  // Guarda los cambios en el carrito
      return await this.model.findOne({ _id: cid });  // Devuelve el carrito actualizado
    } catch (error) {
      return 'Ocurrio un error al agregar el producto';
    }
  }

  // Método para eliminar un producto del carrito
  async removeProduct(cid, productId) {
    try {
      // Obtiene el carrito y el producto
      let cart = await this.getCarts(cid);
      if (typeof cart == 'string') {
        return 'Carrito no encontrado';
      }
      let product = await products.getProductsById(productId);
      if (typeof product == 'string') {
        return 'Producto no encontrado';
      }

      // Elimina el producto del carrito
      const result = await this.model.updateOne(
        { _id: cid },
        {
          $pull: {
            products: { product: productId },
          },
        },
      );

      return await this.getCarts(cid);  // Devuelve el carrito actualizado
    } catch (error) {
      return 'Ocurrio un error al tratar de eliminar el producto';
    }
  }

  // Método para actualizar la lista de productos en el carrito
  async updateCartProducts(cid, newProducts) {
    try {
      // Obtiene el carrito
      let cart = await this.getCarts(cid);
      if (typeof cart == 'string') {
        return 'Carrito no encontrado';
      }

      cart.products = newProducts;  // Actualiza la lista de productos en el carrito

      await cart.save();  // Guarda los cambios en el carrito
      return await this.model.findOne({ _id: cid });  // Devuelve el carrito actualizado
    } catch (error) {
      return 'Ha ocurrido un error';
    }
  }

  // Método para actualizar la cantidad de un producto en el carrito
  async updateCartQuantity(cid, productId, quantity) {
    try {
      // Obtiene el carrito
      let cart = await this.getCarts(cid);
      if (typeof cart == 'string') {
        return 'Carrito no encontrado';
      }

      // Busca el índice del producto en el carrito
      const productIndex = cart.products.findIndex((item) =>
        item.product.equals(productId),
      );

      if (typeof productIndex == -1) {
        return 'Producto no encontrado';
      }

      // Actualiza la cantidad del producto en el carrito
      cart.products[productIndex].quantity = quantity;

      await cart.save();  // Guarda los cambios en el carrito
      return await this.model.findOne({ _id: cid });  // Devuelve el carrito actualizado
    } catch (error) {
      return 'Ha ocurrido un error';
    }
  }

  // Método para eliminar todos los productos del carrito
  async removeCartProducts(cid) {
    try {
      // Obtiene el carrito
      let cart = await this.getCarts(cid);
      if (typeof cart == 'string') {
        return 'Carrito no encontrado';
      }

      cart.products = [];  // Elimina todos los productos del carrito

      await cart.save();  // Guarda los cambios en el carrito
      return await this.model.findOne({ _id: cid });  // Devuelve el carrito actualizado
    } catch (error) {
      return 'Ha ocurrido un error';
    }
  }
}

exports.CartMongo = CartDaoMongo;
