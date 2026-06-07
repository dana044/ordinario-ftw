document.addEventListener("DOMContentLoaded", () => {
    const contenedor = document.getElementById("detallePelicula");

    const parametrosUrl = new URLSearchParams(window.location.search);
    const idPelicula = parametrosUrl.get("id");

    if (!idPelicula) {
        contenedor.innerHTML = "<p>No se seleccionó ninguna película válida.</p>";
        return;
    }

    fetch("cartelera.xml")
        .then(response => {
            if (!response.ok) throw new Error("Error al conectar con la base de datos de películas.");
            return response.text();
        })
        .then(dataString => {
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(dataString, "text/xml");
            const peliculasXml = xmlDoc.getElementsByTagName("pelicula");

            const nodoPelicula = Array.from(peliculasXml).find(p => p.getAttribute("id") === idPelicula);

            if (!nodoPelicula) {
                contenedor.innerHTML = "<p>La película solicitada no se encuentra disponible.</p>";
                return;
            }

            const titulo = nodoPelicula.getElementsByTagName("titulo")[0].textContent;
            const actores = nodoPelicula.getElementsByTagName("actores")[0].textContent;
            const sinopsis = nodoPelicula.getElementsByTagName("sinopsis")[0].textContent;
            const categoria = nodoPelicula.getElementsByTagName("categoria")[0].textContent;
            const duracion = nodoPelicula.getElementsByTagName("duracion")[0].textContent;

            const nombreImagen = titulo.toLowerCase().replace(/:/g, "").replace(/ /g, "-") + ".jpg";

            
            contenedor.innerHTML = `
                <h2>${titulo}</h2>
                <div class="detalle-bloque">
                    <img src="img/${nombreImagen}" alt="${titulo}">
                    <div class="info-texto">
                        <p><strong>Género / Categoría:</strong> ${categoria}</p>
                        <p><strong>Duración:</strong> ${duracion}</p>
                        <p><strong>Elenco:</strong> ${actores}</p>
                        <br>
                        <p><strong>Sinopsis:</strong></p>
                        <p style="font-style: italic; color: #cccccc;">${sinopsis}</p>
                    </div>
                </div>
            `;
        })
        .catch(error => {
            console.error(error);
            contenedor.innerHTML = "<p>Error al procesar la información de la película.</p>";
        });
});