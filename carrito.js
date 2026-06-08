document.addEventListener("DOMContentLoaded", () => {
    const cuerpoCarrito = document.getElementById("cuerpoCarrito");
    const totalCarrito = document.getElementById("totalCarrito");
    const btnPagar = document.getElementById("btnPagar");

    let carrito = JSON.parse(localStorage.getItem("carrito")) || [];

    function mostrarElementosCarrito() {
        cuerpoCarrito.innerHTML = "";
        let total = 0;

        if (carrito.length === 0) {
            cuerpoCarrito.innerHTML = `<tr><td colspan="3">Carrito está vacío.</td></tr>`;
            totalCarrito.textContent = "0.00";
            return;
        }

        carrito.forEach(item => {
            const subtotal = item.precio * item.cantidad;
            total += subtotal;

            const fila = document.createElement("tr");
            fila.innerHTML = `
                <td style="text-align: left;">${item.nombre}</td>
                <td>${item.cantidad}</td>
                <td>$${subtotal.toFixed(2)}</td>
            `;
            cuerpoCarrito.appendChild(fila);
        });

        totalCarrito.textContent = total.toFixed(2);
    }

    btnPagar.addEventListener("click", () => {
        const nombre = document.getElementById("nombreTarjeta").value.trim();
        const num = document.getElementById("numTarjeta").value.trim();
        const exp = document.getElementById("expTarjeta").value.trim();
        const cvv = document.getElementById("cvvTarjeta").value.trim();

        if (carrito.length === 0) {
            alert("No tienes ningún producto para pagar.");
            return;
        }

        if (nombre === "" || num === "" || exp === "" || cvv === "") {
            alert("Por favor, rellena todos los campos de la tarjeta.");
            return;
        }

        if (num.length < 16) {
            alert("El número de tarjeta debe contener 16 dígitos.");
            return;
        }

        localStorage.removeItem("carrito");
        carrito = [];
        mostrarElementosCarrito();

        document.getElementById("nombreTarjeta").value = "";
        document.getElementById("numTarjeta").value = "";
        document.getElementById("expTarjeta").value = "";
        document.getElementById("cvvTarjeta").value = "";
    });

    mostrarElementosCarrito();
});