const socket = io();  

const divswiper = document.querySelector('#swiper');
const form = document.querySelector('#form');

form.addEventListener('submit', (event)=>{
  event.preventDefault();

const prod = {
  title: document.querySelector('#formtitulo').value,
  code: document.querySelector('#formcode').value,
  price: document.querySelector('#formprecio').value,
  stock: document.querySelector('#formStock').value,
  status: true,
  category: document.querySelector('#formcategoria').value
};

socket.emit('nuevoproducto', prod);

escuchar();
});

function deleteProduct(code) {
socket.emit('eliminarProducto', code);
escuchar();

}

function escuchar () {

  socket.on('productos', (listproduct) => {

    let armandoHtml = '';
    listproduct.forEach((prod) => {
      armandoHtml += `<div class="home-slide">
      <p class="rl-title">${prod.title}</p>
      <p class="rl-price">Precio: $ ${prod.price}</p>
      <p class="rl-code">Código: ${prod.code}</p>
      <button onclick="deleteProduct('${prod.code}')">Eliminar</button>
    </div>`;
    });
    divswiper.innerHTML = armandoHtml;
    
  }  
)}
