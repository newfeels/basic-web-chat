package main

import (
	"net/http"
	"sync"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/gorilla/websocket"
)

const SIZE = 1024

// Mutex for accesing shared resources (msgs)
var mutex = sync.Mutex{}

// Updates socket status
var upgrader = websocket.Upgrader{
	ReadBufferSize:  SIZE,
	WriteBufferSize: SIZE,
	CheckOrigin: func(r *http.Request) bool {
		return true // Allow all origins
	},
}

// Set of connected clients
var clients = make(map[*websocket.Conn]string)

// Websocket handler
func handleWS(c *gin.Context) {
	ws, err := upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		c.String(http.StatusInternalServerError, "Update error.")
		return
	}
	defer ws.Close()

	userID := uuid.New().String()

	mutex.Lock()
	clients[ws] = userID
	mutex.Unlock()

	for {
		var msg map[string]interface{}
		err := ws.ReadJSON(&msg)
		if err != nil {
			mutex.Lock()
			delete(clients, ws)
			mutex.Unlock()
			break
		}
		msg["userID"] = userID
		// Send msg to all clients
		mutex.Lock()
		for cli := range clients {
			cli.WriteJSON(msg)
		}
		mutex.Unlock()
	}
}

func main() {
	r := gin.Default()

	// HTML path server
	r.Static("/static", "./static")
	r.GET("/login", func(c *gin.Context) {
		c.File("./static/login.html")
	})
	r.GET("/chat", func(c *gin.Context) {
		if _, err := c.Cookie("username"); err != nil {
			c.Redirect(http.StatusTemporaryRedirect, "/login")
		} else {
			c.File("./static/index.html")
		}
	})

	// Websocket path
	r.GET("/ws", handleWS)

	// Default path to redirect to login page
	r.GET("/", func(c *gin.Context) {
		c.Redirect(http.StatusTemporaryRedirect, "/login")
	})

	r.Run(":8080")
}
