# Go Chat Application

This project is a simple chat application built with Go for the server-side logic and WebSockets for real-time communication. The frontend is constructed with HTML, CSS, and JavaScript. The application allows users to send and receive messages in real-time, with distinct visual cues for messages sent by the user and other participants.

My goal in doing this project is to learn golang and complex frontend.

## Features

- Real-time chat with WebSockets
- User-based identification using cookies
- Flexbox-based layout for responsive design
- Distinct visual styles for messages sent by the user and others
- Input validation to prevent sending empty messages
- Support for sending messages by pressing "Enter" or clicking a "Send" button
- Basic login system with username input

## Structure

- `main.go`: Go server code to handle WebSocket connections and broadcast messages to all connected clients.
- `static/`: Static files for the frontend (HTML, CSS, JavaScript, images).

## Deploy
In the root folder of this project:
```
go run .\main.go
```