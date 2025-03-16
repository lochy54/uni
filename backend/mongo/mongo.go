package mongo

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"fmt"
	"log"
	"time"

	"github.com/go-playground/validator/v10"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"golang.org/x/crypto/bcrypt"
)

type Login struct {
	Username string `json:"username" validate:"required,min=3,max=20"`
	Password string `json:"password" validate:"required,min=6"`
} 

type User struct {
	Name     string `json:"name" bson:"name" validate:"required"`
	Surname  string `json:"surname" bson:"surname" validate:"required"`
	Age      int    `json:"age" bson:"age" validate:"required ,gte=0"`
	Cf       string `json:"cf" bson:"cf" validate:"required len=16"`
	Username string `json:"username" bson:"username" validate:"required,min=3,max=20"`
	Password string `json:"password" bson:"password" validate:"required,min=6"`
}

type timers struct {
	time     time.Time
	username string
}

type Connection struct {
	database string
	url      string
	client   *mongo.Client
	list     map[string]timers
}

func CreateCLient(url string, database string) *Connection {
	return &Connection{
		database: database,
		url:      url,
		list:     make(map[string]timers),
	}
}

func (c *Connection) Connect() error {

	clientOptions := options.Client().ApplyURI(c.url)
	client, err := mongo.Connect(context.TODO(), clientOptions)
	if err != nil {
		return err
	}
	err = client.Ping(context.TODO(), nil)
	if err != nil {
		return err
	}
	c.client = client

	c.check()

	return nil
}

func (c *Connection) Register(user User) (error, string) {
	validate := validator.New()
	err := validate.Struct(user)
	if err != nil {
		return err, ""
	}
	user.Password, err = hashPassword(user.Password)
	if err != nil {
		return err, ""
	}
	session, err := c.client.StartSession()
	if err != nil {
		return err, ""
	}
	defer session.EndSession(context.TODO())

	err = session.StartTransaction()
	if err != nil {
		return err, ""
	}

	defer func() {
		if err != nil {
			session.AbortTransaction(context.TODO())
		} else {
			err = session.CommitTransaction(context.TODO())
		}
	}()

	collection := c.client.Database(c.database).Collection("users")
	_, err = collection.InsertOne(context.TODO(), user)
	if err != nil {
		return err, ""
	}

	err, token := c.generateToken(user.Username)
	if err != nil {
		return err, ""
	}
	return nil, token
}


func (c *Connection) Login(l Login)  (error,string) {
	validate := validator.New()
	err := validate.Struct(l)
	if err != nil {
		return err, ""
	}
	var user User
	collection := c.client.Database(c.database).Collection("users")
	err = collection.FindOne(context.TODO(), bson.M{"username": l.Username}).Decode(&user)
	if err != nil {
		return err, ""
	}
	if !checkPassword(user.Password, l.Password) {
		return fmt.Errorf("invalid credentials"), ""
	}
	err, token := c.generateToken(user.Username)
	if err != nil {
		return err, ""
	}
	return nil , token
}

func (c *Connection) Logout(t string)  error {
	if _, exists := c.list[t]; exists {
		c.remuveToken(t)
		return nil
	}
	return fmt.Errorf("not loeed in")
}

// Funzione per criptare la password
func hashPassword(password string) (string, error) {
	hashed, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	return string(hashed), err
}

// Funzione per verificare la password
func checkPassword(hashedPassword, password string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hashedPassword), []byte(password))
	return err == nil
}

func (c *Connection) generateToken(username string) (error, string) {
	bytes := make([]byte, 16)
	_, err := rand.Read(bytes)
	if err != nil {
		return err, ""
	}
	token := hex.EncodeToString(bytes)
	var user = timers{
		time:     time.Now(),
		username: username,
	}
	c.list[token] = user
	return nil, token
}

func (c *Connection) RefreshToken(token string) (error,string) {
	if _, exists := c.list[token]; exists {
		val := c.list[token]
		val.time = time.Now()
		c.list[token] = val
		return nil,val.username
	} else {
		return fmt.Errorf("token non trovato"),""
	}
}

func (c *Connection) remuveToken(token string) {
	delete(c.list, token)
}

func (c *Connection) check() {

	go func() {
		for {
			expiration := time.Now().Add(-5 * time.Minute)
			for token, timestamp := range c.list {
				if timestamp.time.Before(expiration) {
					delete(c.list, token)
					log.Println("Token scaduto rimosso:", token)
				}
			}
			time.Sleep(3 * time.Minute)
		}
	}()

}
