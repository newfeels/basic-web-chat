var userID = null;
var ws = new WebSocket("ws://" + location.host + "/ws");

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

// Sending message to web socket with username, chatid and text
function sendMessage() {
    console.log("sending msg")
    var text = document.getElementById("msg").value;
    var chatID = getCookie("chatID");
    if (text.trim() === "") { // Message can not be empty
        return; 
    }
    var username = getCookie("username"); // Obtaining local username
    // Sending message to web socket
    ws.send(JSON.stringify({ text: text, username: username, chatID: chatID }));
    scrollToBottom(); 
    document.getElementById("msg").value = ""; 
}

window.addEventListener("load", scrollToBottom);

// Web Socker listener action when reciving message
ws.onmessage = function(event) {
    var msg = JSON.parse(event.data);

    var chatBox = document.getElementById("chat");
    if (msg.chat_id === parseInt(getCookie("chatID"), 10) ) {
        if (msg.username === getCookie("username")) { // Message is from user
            chatBox.innerHTML += `<div class="messageuser">
                                    <div class="user">${msg.username} </div> 
                                    <div class="msgtxt">${msg.text}</div>
                                </div>`;
        } else { // The message is from the other user
            chatBox.innerHTML += `<div class="messageother">
                                    <div class="user">${msg.username} </div> 
                                    <div class="msgtxt">${msg.text}</div>
                                </div>`;
        }
        scrollToBottom();
    }
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

