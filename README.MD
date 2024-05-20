# Go Chat Application

This project is a simple chat application built with Go for the server-side logic and WebSockets for real-time communication. The frontend is constructed with HTML, CSS, and JavaScript. The application allows users to send and receive messages in real-time, with distinct visual cues for messages sent by the user and other participants.

My goal in doing this project is to learn golang and complex frontend.

## Features

- Real-time chat with WebSockets
- User-based identification using cookies
- Flexbox-based layout for responsive design
- Distinct visual styles for messages sent by the user and others
- Input validation to prevent sending empty usernames
- Support for sending messages by pressing "Enter" or clicking a "Send" button
- Basic login system with username input
- Private chat with other users
- Persistence in SQL database
- Contact selection page

## TODO
- Show previous messages when opening a chat
- Message encryption 
- Password login
- Sing in page
- Integration with IAM (Keycloak)
- Request-Accept system for contacts

## Structure

- `main.go`: Go server code to handle WebSocket connections and broadcast messages to all connected clients.
- `static/`: Static files for the frontend (HTML, CSS, JavaScript, images).
- `db/`: SQL petitions for database
- `src/`: Source go code for the backend

## Deploy
Download postgres SQL and create database with username and password that you
prefer, change that parameters in *src/back.go* 
```
const (
	host     = "localhost"
	port     = 5432
	user     = "<your_username>"
	password = "<your_password>"
	dbname   = "<your_db_name>"
)
```
In the root folder of this project:
```
go run .\main.go
```
