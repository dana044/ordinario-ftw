document.addEventListener("DOMContentLoaded", () => {
    // Referencias a los elementos del DOM
    const contenedor = document.getElementById("contenedorResenas");
    const filtroCalificacion = document.getElementById("filtroCalificacion");
    const filtroGenero = document.getElementById("filtroGenero");
    const ordenFecha = document.getElementById("ordenFecha");

    let listaPeliculas = [];

    fetch("reseñas.xml")
        .then(response => {
            if (!response.ok) {
                throw new Error("No se pudo recuperar el archivo XML de reseñas.");
            }
            return response.text();
        })
        .then(dataString => {
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(dataString, "text/xml");
            const peliculasXml = xmlDoc.getElementsByTagName("pelicula");

            listaPeliculas = Array.from(peliculasXml).map(pelicula => {
                return {
                    id: pelicula.getAttribute("id"),
                    titulo: pelicula.getElementsByTagName("titulo")[0].textContent,
                    genero: pelicula.getElementsByTagName("genero")[0].textContent,
                    calificacion: parseFloat(pelicula.getElementsByTagName("calificacion")[0].textContent),
                    autor: pelicula.getElementsByTagName("autor")[0].textContent,
                    fecha: pelicula.getElementsByTagName("fecha")[0].textContent,
                    comentario: pelicula.getElementsByTagName("comentario")[0].textContent
                };
            });

            procesarYMostrarResenas();
        })
        .catch(error => {
            console.error("Error al procesar las reseñas:", error);
            contenedor.innerHTML = `<p class="error">Error al cargar las reseñas. Inténtalo más tarde.</p>`;
        });

    filtroCalificacion.addEventListener("change", procesarYMostrarResenas);
    filtroGenero.addEventListener("change", procesarYMostrarResenas);
    ordenFecha.addEventListener("change", procesarYMostrarResenas);

    function procesarYMostrarResenas() {
        let peliculasFiltradas = [...listaPeliculas];

        const valCalificacion = filtroCalificacion.value;
        const valGenero = filtroGenero.value;
        const valOrden = ordenFecha.value;

        if (valGenero !== "Todos") {
            peliculasFiltradas = peliculasFiltradas.filter(p => 
                p.genero.toLowerCase().replace("ó", "o") === valGenero.toLowerCase()
            );
        }

        if (valCalificacion !== "Todos") {
            const rangoEsperado = parseInt(valCalificacion, 10);
            peliculasFiltradas = peliculasFiltradas.filter(p => 
                Math.floor(p.calificacion) === rangoEsperado
            );
        }

        peliculasFiltradas.sort((a, b) => {
            const fechaA = new Date(a.fecha);
            const fechaB = new Date(b.fecha);
            
            if (valOrden === "recientes") {
                return fechaB - fechaA; 
            } else {
                return fechaA - fechaB;
            }
        });

        inyectarHtml(peliculasFiltradas);
    }

    function inyectarHtml(peliculas) {
        contenedor.innerHTML = "";

        if (peliculas.length === 0) {
            contenedor.innerHTML = `<p class="sin-resultados">No hay reseñas</p>`;
            return;
        }

        peliculas.forEach(p => {
            const tarjeta = document.createElement("article");
            tarjeta.classList.add("tarjeta-resena");

            const estrellas = "★".repeat(Math.floor(p.calificacion)) + "☆".repeat(5 - Math.floor(p.calificacion));

            tarjeta.innerHTML = `
                <div class="header-resena">
                    <h3>${p.titulo}</h3>
                    <span class="genero-tag">${p.genero}</span>
                </div>
                <div class="meta-resena">
                    <span class="estrellas" title="Calificación: ${p.calificacion}">${estrellas} (${p.calificacion})</span>
                    <span class="autor">Por: <strong>${p.autor}</strong></span>
                    <span class="fecha">${formatearFechaEspanol(p.fecha)}</span>
                </div>
                <p class="comentario-texto">"${p.comentario}"</p>
            `;

            contenedor.appendChild(tarjeta);
        });
    }

    function formatearFechaEspanol(stringFecha) {
        const opciones = { year: 'numeric', month: 'long', day: 'numeric' };
        const fechaObj = new Date(stringFecha + "T00:00:00"); 
        return fechaObj.toLocaleDateString('es-ES', opciones);
    }
});