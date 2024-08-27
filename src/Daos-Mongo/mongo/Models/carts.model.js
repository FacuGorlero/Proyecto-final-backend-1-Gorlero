const {Schema, model} = require ('mongoose')

const cartSchema = new Schema({
    products : {
        type: [{
            product: {type: Schema.Types.ObjectId, ref: 'products'},
            quantity: {type: Number, default: 1 }
        }]
    },
    atCreated: { type: Date, default: Date() },
})

exports.cartModel = model('carts', cartSchema);