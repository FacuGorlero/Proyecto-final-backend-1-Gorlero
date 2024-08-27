const fs = require("fs");

class CartManager {
  constructor (path) {
    this.counterId = 0;
    this.cart = [];
    this.path = path || './src/mock/Cart.json';
    this.initiator();
  }
  async initiator() {
    this.getCarts(-1, true);
    await this.getId();
  }
// Método para crear un nuevo carrito
  async create() {
    const cart = {
      id: this.counterId,
      cart: []
    }
    this.cart.push(cart);
    
    this.counterId++;
    const jsonCart = JSON.stringify(this.cart);
    await fs.promises.writeFile(this.path, jsonCart);

    return (this.counterId - 1)
  }

   // Método para obtener carritos (asincrónico)
   async getCarts(id = -1, synchronize = false) {
    let getCarts;
  
    try {
      const exists = fs.existsSync(this.path);
  
      if (!exists) {
        getCarts = [];
      } else {
        const fileContent = await fs.promises.readFile(this.path, 'utf-8');
  
        // Check if the file content is empty
        if (fileContent.trim() === '') {
          getCarts = [];
        } else {
          getCarts = JSON.parse(fileContent);
        }
      }
  
      // Synchronize the variable cart with the obtained carts
      if (synchronize === true) this.cart = getCarts;
      if (id === -1) return getCarts;
  
      const cart = getCarts.find((crt) => crt.id === id);
      return cart ? cart : 'Carrito no encontrado';
    } catch (error) {
      console.error('Error parsing JSON:', error.message);
      return 'Error parsing JSON';
    }
  }

  // Método para agregar un producto a un carrito
  async addProduct(id, productId) {
    if (!this.cart[id]) return "Carrito no encontrado"
    const i = this.cart[id].cart.findIndex((elm)=>elm.productId === productId)
    if (i === -1) {
        // Si el producto no existe en el carrito, lo agrega con una cantidad de 1
        this.cart[id].cart.push({
          productId: productId,
          quantity: 1
        })
      } else {
        // Si el producto ya existe en el carrito, incrementa la cantidad
        this.cart[id].cart[i].quantity++
      }

    const jsonCart = JSON.stringify(this.cart);
    await fs.promises.writeFile(this.path, jsonCart);

    // Retorna el carrito actualizado
    return (this.cart[id])
}

 // Método para remover un producto de un carrito
async removeProduct(id, productId){
    if(!this.cart[id]) return 'carrito no encontrado'

    const i = this.cart[id].cart.findIndex((elm)=> elm.productId === productId)

    if(i === -1){
        return 'producto no encontrado'
    }else{
         // Si la cantidad es 1, elimina el producto del carrito; de lo contrario, disminuye la cantidad
        if(this.cart[id].cart[i].quantity === 1){
            this.cart[id].cart.splice(i,1)
        } else {
            this.cart[id].cart[i].quantity--
        }
    }
// Actualiza el archivo con la lista de carritos modificada
const jsonCart = JSON.stringify(this.cart);
await fs.promises.writeFile(this.path, jsonCart);
return (this.cart[id])
}
// Método auxiliar para obtener el ID máximo existente
getId() {
    const exists = fs.existsSync(this.path);
    if (!exists) {
      this.counterId = 0
    } else {
      // Obtiene el ID máximo de los carritos para iniciar su contador
      this.counterId = this.cart.reduce((maxId, crt) => { return Math.max(maxId, crt.id) } , 0)
      this.counterId ++;
    }
  };

}

exports.CartManager = CartManager;


