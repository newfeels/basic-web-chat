package src

import (
	"database/sql"
	"fmt"
	"log"
	"net/http"
	"strconv"
	"sync"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
	_ "github.com/lib/pq"
)

const SIZE = 1024

const (
	host     = "localhost"
	port     = 5432
	user     = "postgres"
	password = "postgres"
	dbname   = "postgres"
)

// Mutex for accesing shared resources (msgs)
var mutex = sync.Mutex{}

// DDBB
var db *sql.DB

// Updates socket status
var upgrader = websocket.Upgrader{
	ReadBufferSize:  SIZE,
	WriteBufferSize: SIZE,
	CheckOrigin: func(r *http.Request) bool {
		return true // Allow all origins
	},
}

// Set of connected clients
var clients = make(map[*websocket.Conn]int)

// DDBB conection
func Init() {
	log.Println("Conecting to database...")
	var err error
	psqlInfo := fmt.Sprintf("host=%s port=%d user=%s password=%s dbname=%s sslmode=disable",
		host, port, user, password, dbname)
	db, err = sql.Open("postgres", psqlInfo)
	if err != nil {
		log.Fatal(err)
	}

	err = db.Ping()
	if err != nil {
		log.Fatal(err)
	}
	log.Println("Succesfully connected to data base.")
}

// Websocket handler
func HandleWS(c *gin.Context) {
	ws, err := upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		c.String(http.StatusInternalServerError, "Update error.")
		return
	}
	defer ws.Close()

	// Get the chatID from the cookies (this could be a parameter), the bd is
	// made so there is only one chat id per peer of chatters
	chatID, err := c.Cookie("chatID")
	if err != nil {
		log.Println("CHAT DID NOT INITIATED CORRECTLY!")
		return
	}

	// See if the chat exists
	var user1_id, user2_id int
	rows, err := db.Query("SELECT user1_id, user2_id FROM chats WHERE id = $1", chatID)

	if err != nil {
		log.Println("CHAT DOES NOT EXISTS! error: ", err)
	}
	defer rows.Close()
	// Get the users ids, this is necessary for sending to the receiver user the
	// websocket upgrade
	for rows.Next() {
		if err = rows.Scan(&user1_id, &user2_id); err != nil {
			log.Fatal(err)
		}
		log.Println(user1_id, user2_id)
	}

	mutex.Lock()
	clients[ws] = user2_id
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

		// Identify chat and dest
		chatID, _ := strconv.Atoi((msg["chatID"].(string)))
		text := msg["text"].(string)
		username, _ := msg["username"].(string)

		var senderID int
		err = db.QueryRow("SELECT id FROM users WHERE username = $1", username).Scan(&senderID)
		if err != nil {
			log.Println("error: ", err)
			return
		}

		var username2 string
		err = db.QueryRow("SELECT username FROM users WHERE id = $1", user2_id).Scan(&username2)
		if err != nil {
			log.Println("error: ", err)
			return
		}

		// The endpoint is made that one user is always the second parameter, so
		// is necessary to change it in the case that the user that occupy the
		// second parameter is the sender
		if username == username2 {
			user2_id = user1_id
		}

		// Save msg into db (this should be encrypted in js side)
		query :=
			`INSERT INTO messages (chat_id, sender_id, text) VALUES ($1, $2, $3)`
		_, err = db.Exec(query, chatID, senderID, text)
		if err != nil {
			log.Println("Error inserting message: ", err)
		}

		log.Println("Message ", text, "from ", username)
		// Send msg to clients that are in the same chat
		mutex.Lock()
		for client, id := range clients {
			if id != user2_id && id != senderID {
				continue
			}
			log.Println("Sending mensage ", text, "from ", username, "to ", username2)
			client.WriteJSON(map[string]interface{}{
				"chat_id":  chatID,
				"username": username,
				"text":     text,
			})
		}
		mutex.Unlock()
	}
}

// Login that writes the cookies with the username and user id and redirects to
// contacts page with 302 http status, if the username is not in the database,
// it creates it
func Login(c *gin.Context) {
	// Decode request and obtain username
	var data map[string]string
	if err := c.BindJSON(&data); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Bad request"})
		return
	}
	username := data["username"]
	log.Println("Logged username: ", username)

	// If user dont exists in db, create it
	var id int
	err := db.QueryRow("SELECT id FROM users WHERE username = $1", username).Scan(&id)
	if err == sql.ErrNoRows {
		_, err := db.Exec("INSERT INTO users (username) VALUES ($1)", username)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create user"})
			return
		}
	} else if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to query database"})
		return
	}

	c.SetCookie("username", username, 300000, "/", "", false, false)
	c.SetCookie("userID", strconv.Itoa(id), 300000, "/", "", false, false)

	c.Redirect(http.StatusFound, "/contacts")
}

// Initiates a chat, if it does not exists it creates it, writes the chat id in
// the cookies and returns it in JSON response with 200 http status
func StartChat(c *gin.Context) {
	user1 := c.Param("user1_id")
	user2 := c.Param("user2_id")
	chatID := 0

	// Verify that the chat already exists (if the two people already have a
	// chat) if not, create it
	err := db.QueryRow("SELECT id FROM chats WHERE (user1_id = $1 OR user1_id = $2) AND (user2_id = $1 OR user2_id = $2)", user1, user2).Scan(&chatID)
	if err != nil {
		log.Println("ERROR AT SEARCHING CHAT! error: ", err)
	}

	if chatID == 0 {
		query := `INSERT INTO chats (user1_id, user2_id) VALUES ($1, $2) RETURNING id`

		err = db.QueryRow(query, user1, user2).Scan(&chatID)
		if err != nil {
			log.Println("Error executing SQL query:", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to search users"})
			return
		}
	}
	log.Println("New chat! id: ", chatID)
	c.SetCookie("chatID", strconv.Itoa(chatID), 300000, "/", "", false, false)
	c.JSON(http.StatusOK, gin.H{"chat_id": chatID})
}

// Search a user in the database and if it finds it, returns its id and username
// in JSON form with a 200 http status
func SearchUsers(c *gin.Context) {
	searchTerm := c.Query("q")
	log.Println("Search term:", searchTerm)
	query := `SELECT id, username FROM users WHERE username ILIKE $1`
	rows, err := db.Query(query, "%"+searchTerm+"%")
	if err != nil {
		log.Println("Error executing SQL query:", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to search users"})
		return
	}
	defer rows.Close()

	var users []map[string]interface{}
	for rows.Next() {
		var id int
		var username string
		if err := rows.Scan(&id, &username); err == nil {
			users = append(users, map[string]interface{}{
				"id":       id,
				"username": username,
			})

		}
	}

	c.JSON(http.StatusOK, gin.H{"users": users})
}
