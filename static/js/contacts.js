
document.addEventListener('DOMContentLoaded', function() {
    var username = "username"; 

    // Event listener for submit button
    var searchForm = document.getElementById('searchForm');
    searchForm.addEventListener('submit', function(event) {
        event.preventDefault();
        var searchTerm = document.getElementById('searchInput').value;
        searchUsers(searchTerm);
    });

    showText();
});

function getCookie(cookieName) {
    var cookies = document.cookie.split(';');

    for (var i = 0; i < cookies.length; i++) {
        var cookie = cookies[i].trim();

        if (cookie.startsWith(cookieName + '=')) {
            return cookie.substring(cookieName.length + 1); 
        }
    }

    return null;
}

function startChat(userId) {
    var localUserId = getCookie('userID');
    console.log(localUserId);
    if (userId && localUserId) {
        fetch('/start_chat/' + localUserId + '/' + userId, {
            method: 'POST'
        })
        .then(response => {
            if (response.ok) {
                window.location.href = "/chat"
            } else {
                console.error('Error: ', response.statusText);
            }
        }) .catch(error => {
            console.error('Error sending request: ', error);
        })
    }
}

function fetchUsers() {
    fetch('/contacts', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.json())
    .then(data => {
        var userList = document.getElementById('userList');
        userList.innerHTML = ''; // Limpiar la lista antes de añadir nuevos usuarios
        data.users.forEach(user => {
            var li = document.createElement('li');
            li.textContent = user.username;
            userList.appendChild(li);
        });
    })
    .catch(error => console.error('Error fetching users:', error));
}

        // Función para buscar usuarios
function searchUsers(searchTerm) {
    fetch('/search?q=' + searchTerm, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.json())
    .then(data => {
        var userList = document.getElementById('userList');
        userList.innerHTML = ''; // Limpiar la lista antes de añadir nuevos usuarios
        data.users.forEach(user => {
            var div = document.createElement('div');
            div.classList.add('blur2');
            div.dataset.userId = user.id;
            div.addEventListener('click', function() {
                console.log("joputas");
                startChat(user.id);
            });

            var txt = document.createElement('h2');
            txt.textContent = user.id + '+ ' + user.username;
            div.appendChild(txt);
            userList.appendChild(div);
        });
    })
    .catch(error => console.error('Error searching users:', error));
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
