const { connect } = require('mongoose')

exports.connectDb = async () => {
    await connect('mongodb+srv://facundogorlero:Lucas-10@zogk.a4uasms.mongodb.net/SportClub?retryWrites=true&w=majority')
    console.log('Base de datos conectada')
}