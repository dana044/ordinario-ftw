document.addEventListener("DOMContentLoaded", () => {
    const contenedor = document.getElementById("contenedorDulceria");
    const filtroCategoria = document.getElementById("filtroDulceria");

    let listaProductos = [];

    fetch("dulceria.xml")
        .then(response => {
            if (!response.ok) throw new Error("No se pudo cargar el archivo XML de la dulcería.");
            return response.text();
        })
        .then(dataString => {
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(dataString, "text/xml");
            const productosXml = xmlDoc.getElementsByTagName("producto");

            listaProductos = Array.from(productosXml).map(p => {
                return {
                    id: p.getAttribute("id"),
                    nombre: p.getElementsByTagName("nombre")[0].textContent,
                    categoria: p.getElementsByTagName("categoria")[0].textContent,
                    detalles: p.getElementsByTagName("detalles")[0].textContent,
                    precio: p.getElementsByTagName("precio")[0].textContent
                };
            });

            mostrarDulceria();
        })
        .catch(error => {
            console.error(error);
            contenedor.innerHTML = "<p>Error al cargar el menú de dulcería.</p>";
        });

    filtroCategoria.addEventListener("change", mostrarDulceria);

    function mostrarDulceria() {
        let productosFiltrados = [...listaProductos];
        const categoriaSeleccionada = filtroCategoria.value;

        if (categoriaSeleccionada !== "Todos") {
            productosFiltrados = productosFiltrados.filter(p => p.categoria === categoriaSeleccionada);
        }

        contenedor.innerHTML = "";

        if (productosFiltrados.length === 0) {
            contenedor.innerHTML = "<p>No hay productos en esta categoría.</p>";
            return;
        }

        productosFiltrados.forEach(p => {
            const tarjeta = document.createElement("div");
            tarjeta.classList.add("tarjeta-producto");

            const nombreImagen = p.nombre.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/ /g, "-") + ".jpg";

            tarjeta.innerHTML = `
                <img src="img/dulceria/${nombreImagen}" alt="${p.nombre}">
                <h3>${p.nombre}</h3>
                <p class="descripcion-producto">${p.detalles}</p>
                <p class="precio-producto">$${p.precio} MXN</p>
                <a href="#" class="btn btn-agregar">Agregar</a>
            `;

            const botonAgregar = tarjeta.querySelector(".btn-agregar");
            botonAgregar.addEventListener("click", () => {
                agregarAlCarrito(p);
            });

            contenedor.appendChild(tarjeta);
        });
    }
    
    function agregarAlCarrito(producto) {
        let carrito = JSON.parse(localStorage.getItem("carrito")) || [];

        const itemExistente = carrito.find(item => item.id === producto.id);

        if (itemExistente) {
            itemExistente.cantidad++;
        } else {
            carrito.push({
                id: producto.id,
                nombre: producto.nombre,
                precio: producto.precio,
                cantidad: 1
            });
        }

        localStorage.setItem("carrito", JSON.stringify(carrito));
    }
});