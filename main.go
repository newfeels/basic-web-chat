package main

import (
	"basic-web-chat/src"
	"net/http"

	"github.com/gin-gonic/gin"
)

func main() {
	r := gin.Default()

	src.Init()

	// HTML path server
	r.Static("/static", "./static")
	r.GET("/login", func(c *gin.Context) {
		c.File("./static/login.html")
	})
	r.POST("/login", src.Login)

	// Websocket path
	r.GET("/ws", src.HandleWS)

	// Default path to redirect to login page
	r.GET("/", func(c *gin.Context) {
		c.Redirect(http.StatusTemporaryRedirect, "/login")
	})

	r.GET("/contacts", func(c *gin.Context) {
		c.File("./static/contacts.html")
	})

	r.GET("/chat", func(c *gin.Context) {
		if _, err := c.Cookie("username"); err != nil {
			c.Redirect(http.StatusTemporaryRedirect, "/login")
		} else {
			c.File("./static/index.html")
		}
	})

	r.GET("/search", src.SearchUsers)

	r.POST("/start_chat/:user1_id/:user2_id", src.StartChat)

	r.Run(":8080")
}
