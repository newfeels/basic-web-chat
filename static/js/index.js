var userID = null;

function getCookie(name) {
    var cookies = document.cookie.split(";");
    for (var i = 0; i < cookies.length; i++) {
        var cookie = cookies[i].trim();
        if (cookie.startsWith(name + "=")) {
            return decodeURIComponent(cookie.split("=")[1]);
        }
    }
    return null;
}


function scrollToBottom() {
    var chatBox = document.getElementById("chat");
    chatBox.scrollTop = chatBox.scrollHeight; 
}

function sendMessage() {
    var text = document.getElementById("msg").value;
    if (text.trim() === "") { // Si el texto está vacío
        return; // No hacer nada y salir de la función
    }
    var username = getCookie("username"); // Obtener el nombre del usuario de las cookies
    // Añadir el mensaje al contenedor del chat
    ws.send(JSON.stringify({ text: text, username: username }));
    scrollToBottom(); // Desplazar hacia abajo después de añadir el mensaje
    document.getElementById("msg").value = ""; // Limpiar el campo de entrada
}

window.addEventListener("load", scrollToBottom);

// function addOtherUserMessage(text) {
//     var chatBox = document.getElementById("chat");
//     chatBox.innerHTML += `<div class="message other">${text}</div>`;
//     scrollToBottom(); // Desplazar hacia abajo
// }

var ws = new WebSocket("ws://" + location.host + "/ws");

// ws.onopen = function() {
//     ws.send(JSON.stringify({request: "getID"}));
// }

ws.onmessage = function(event) {
    var msg = JSON.parse(event.data);

    var chatBox = document.getElementById("chat");

    if (msg.username === getCookie("username")) { // Si el mensaje es del usuario actual
        chatBox.innerHTML += `<div class="messageuser">
                                <div class="user">${msg.username} </div> 
                                <div class="msgtxt">${msg.text}</div>
                              </div>`;
    } else { // Si el mensaje es de otro usuario
        chatBox.innerHTML += `<div class="messageother">
                                <div class="user">${msg.username} </div> 
                                <div class="msgtxt">${msg.text}</div>
                              </div>`;
    }
    scrollToBottom();
};

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

