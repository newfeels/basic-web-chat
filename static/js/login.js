function login() {
    var username = document.getElementById("username").value;
    document.cookie = "username=" + encodeURIComponent(username) + "; path=/";
    window.location.href = "/chat";
}

function shrinkContainer(container) {
    container.style.animation = 'shrink 0.2s ease-in-out';
        setTimeout(function() {
        container.style.animation = '';
        container.style.opacity = '1'; // Hacer visible el contenedor
        container.style.transform = 'translateY(0)'; // Devolver el contenedor a su posición original
    }, 1000); // Duración de la animación en milisegundos

    if (container === document.querySelector('.blur:first-child')) {
        var newContainer = document.getElementById('newContainer');
        newContainer.style.opacity = '1'; // Hacer visible el texto
        newContainer.style.transform = 'translateY(0)'; // Devolver el texto a su posición original
    }
}


// Función para ocultar el contenedor de texto
function hideText() {
    var newContainer = document.getElementById('newContainer');
    newContainer.style.opacity = '0'; // Ocultar el texto
    newContainer.style.transform = 'translateY(20px)'; // Desplazar el texto hacia abajo
}

function showText() { 
    var newContainer = document.getElementById('newContainer');
    newContainer.style.opacity = '1'; 
    newContainer.style.transform = 'translateY(0)'; 
}

document.addEventListener('DOMContentLoaded', showText);