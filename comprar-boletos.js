document.addEventListener("DOMContentLoaded", () => {
    // Referencias al DOM
    const tituloPelicula = document.getElementById("tituloPelicula");
    const comboHorario = document.getElementById("comboHorario");
    
    // Nuevos inputs manuales
    const inputCantidad = document.getElementById("cantidadBoletos");
    const inputAsientos = document.getElementById("asientosEscritos");
    
    const numBoletosSpan = document.getElementById("numBoletos");
    const listaAsientosSpan = document.getElementById("listaAsientos");
    const totalVentaSpan = document.getElementById("totalVenta");
    const btnAlCarrito = document.getElementById("btnAlCarrito");

    // Obtener el ID de la película desde la URL
    const parametrosUrl = new URLSearchParams(window.location.search);
    const idPelicula = parametrosUrl.get("id");
    
    const PRECIO_BOLETO = 75.00; 
    let datosPelicula = null;

    if (!idPelicula) {
        tituloPelicula.textContent = "Error: Película no seleccionada.";
        return;
    }

    // 1. Cargar datos desde cartelera.xml
    fetch("cartelera.xml")
        .then(response => response.text())
        .then(xmlString => {
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(xmlString, "text/xml");
            const peliculas = Array.from(xmlDoc.getElementsByTagName("pelicula"));
            
            const nodoPelicula = peliculas.find(p => p.getAttribute("id") === idPelicula);
            
            if (nodoPelicula) {
                datosPelicula = {
                    id: idPelicula,
                    titulo: nodoPelicula.getElementsByTagName("titulo")[0].textContent,
                    horarios: nodoPelicula.getElementsByTagName("horarios")[0].textContent.split(",")
                };
                
                tituloPelicula.textContent = datosPelicula.titulo;
                
                datosPelicula.horarios.forEach(horario => {
                    const opcion = document.createElement("option");
                    opcion.value = horario.trim();
                    opcion.textContent = horario.trim();
                    comboHorario.appendChild(opcion);
                });
            } else {
                tituloPelicula.textContent = "Película no encontrada.";
            }
        })
        .catch(error => console.error("Error cargando XML:", error));

    // 2. Escuchar cambios en los inputs para actualizar el resumen
    inputCantidad.addEventListener("input", actualizarResumen);
    inputAsientos.addEventListener("input", actualizarResumen);

    function actualizarResumen() {
        const cantidad = parseInt(inputCantidad.value) || 0;
        const asientosTexto = inputAsientos.value.trim();

        numBoletosSpan.textContent = cantidad;
        listaAsientosSpan.textContent = asientosTexto !== "" ? asientosTexto : "Ninguno";
        
        const total = cantidad * PRECIO_BOLETO;
        totalVentaSpan.textContent = `$${total.toFixed(2)}`;
    }

    // 3. Validar y Guardar en el Carrito
    btnAlCarrito.addEventListener("click", () => {
        const cantidad = parseInt(inputCantidad.value) || 0;
        const asientosTexto = inputAsientos.value.trim();

        if (cantidad <= 0) {
            alert("Por favor, ingresa una cantidad válida de boletos (mínimo 1).");
            return;
        }

        if (asientosTexto === "") {
            alert("Por favor, escribe los números de los asientos que deseas.");
            return;
        }

        let carrito = JSON.parse(localStorage.getItem("carrito")) || [];
        
        const horarioElegido = comboHorario.value;
        
        // Creamos el objeto del ticket
        const nuevoTicket = {
            id: `TICKET-${idPelicula}-${Date.now()}`,
            nombre: `Boletos: ${datosPelicula.titulo} (${horarioElegido}) [Asientos: ${asientosTexto}]`,
            precio: PRECIO_BOLETO, // En el carrito se multiplicará precio * cantidad
            cantidad: cantidad
        };

        carrito.push(nuevoTicket);
        localStorage.setItem("carrito", JSON.stringify(carrito));
        
        alert("¡Boletos añadidos a tu carrito con éxito!");
        window.location.href = "carrito.html";
    });
});