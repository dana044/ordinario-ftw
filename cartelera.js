document.addEventListener("DOMContentLoaded", () => {
    const contenedor = document.getElementById("contenedorCartelera");
    const filtroGenero = document.getElementById("filtroGenero");
    const filtroFecha = document.getElementById("filtroFecha");

    let listaPeliculas = [];

    function normalizarTexto(texto) {
        return texto.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
    }

    fetch("cartelera.xml")
        .then(response => {
            if (!response.ok) throw new Error("No se pudo cargar el archivo XML.");
            return response.text();
        })
        .then(dataString => {
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(dataString, "text/xml");
            const peliculasXml = xmlDoc.getElementsByTagName("pelicula");

            listaPeliculas = Array.from(peliculasXml).map(p => {
                return {
                    id: p.getAttribute("id"),
                    titulo: p.getElementsByTagName("titulo")[0].textContent,
                    categoria: p.getElementsByTagName("categoria")[0].textContent,
                    horarios: p.getElementsByTagName("horarios")[0].textContent,
                    fechas: p.getElementsByTagName("fechas_transmision")[0].textContent
                };
            });

            mostrarCartelera();
        })
        .catch(error => {
            console.error(error);
            contenedor.innerHTML = "<p>Error al cargar la cartelera de películas.</p>";
        });

    filtroGenero.addEventListener("change", mostrarCartelera);
    filtroFecha.addEventListener("change", mostrarCartelera);

    function mostrarCartelera() {
        let peliculasFiltradas = [...listaPeliculas];
        const generoSeleccionado = filtroGenero.value;
        const fechaSeleccionada = filtroFecha.value;

        // Filtrar por Género
        if (generoSeleccionado !== "Todos") {
            peliculasFiltradas = peliculasFiltradas.filter(p => 
                normalizarTexto(p.categoria) === normalizarTexto(generoSeleccionado)
            );
        }

        // Filtrar por Fecha
        if (fechaSeleccionada) {
            peliculasFiltradas = peliculasFiltradas.filter(p => 
                p.fechas.includes(fechaSeleccionada)
            );
        }

        contenedor.innerHTML = "";

        if (peliculasFiltradas.length === 0) {
            contenedor.innerHTML = "<p>No hay funciones disponibles.</p>";
            return;
        }

        //  Tarjetas
        peliculasFiltradas.forEach(p => {
            const tarjeta = document.createElement("div");
            tarjeta.classList.add("tarjeta-pelicula");

            const nombreImagen = p.titulo.toLowerCase()
                                         .replace(/:/g, "")
                                         .replace(/ /g, "-") + ".jpg";

            tarjeta.innerHTML = `
                <img src="img/${nombreImagen}" alt="${p.titulo}">
                <h3>${p.titulo}</h3>
                <div class="horarios-contenedor">
                    <strong>Horarios:</strong>
                    <p>${p.horarios}</p>
                </div>
                <a href="pelicula.html?id=${p.id}" class="btn">Información</a>
            `;
            contenedor.appendChild(tarjeta);
        });
    }
});