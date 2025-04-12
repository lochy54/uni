package mongo

import (
	"context"
	"fmt"

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
	Username string `json:"username" bson:"username" validate:"required,min=3,max=20"`
	Password string `json:"password" bson:"password" validate:"required,min=6"`
}

type pression struct {
	Pression float64 `json:"pression" bson:"pression"`
	Timestap int     `json:"timestap" bson:"timestap"`
}
type SensRes struct {
	Player   string     `bson:"player"`
	Press    []pression `json:"pression" bson:"pression"`
}
type gameStat struct {
	MaxPression float64 `json:"maxPression"`
	MinPression float64 `json:"minPression"`
}

type StatResult struct {
	MaxPression float64    `json:"maxPression"`
	MinPression float64    `json:"minPression"`
	AvgPression float64    `json:"avgPression"`
	Games       []gameStat `json:"games"`
}

type Connection struct {
	database string
	url      string
	client   *mongo.Client
}

func CreateCLient(url string, database string) *Connection {
	return &Connection{
		database: database,
		url:      url,
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
	return nil
}

func (c *Connection) Register(user User) error {
	validate := validator.New()
	err := validate.Struct(user)
	if err != nil {
		return err
	}
	user.Password, err = hashPassword(user.Password)
	if err != nil {
		return err
	}
	session, err := c.client.StartSession()
	if err != nil {
		return err
	}
	defer session.EndSession(context.TODO())

	err = session.StartTransaction()
	if err != nil {
		return err
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
		return err
	}
	return nil
}

func (c *Connection) Login(l Login) error {
	validate := validator.New()
	err := validate.Struct(l)
	if err != nil {
		return err
	}
	var user User
	collection := c.client.Database(c.database).Collection("users")
	err = collection.FindOne(context.TODO(), bson.M{"username": l.Username}).Decode(&user)
	if err != nil {
		return err
	}
	if !checkPassword(user.Password, l.Password) {
		return fmt.Errorf("invalid credentials")
	}
	return nil
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

func (c *Connection) SaveSens(s SensRes) error {

	session, err := c.client.StartSession()
	if err != nil {
		return err
	}
	defer session.EndSession(context.TODO())

	err = session.StartTransaction()
	if err != nil {
		return err
	}

	defer func() {
		if err != nil {
			session.AbortTransaction(context.TODO())
		} else {
			err = session.CommitTransaction(context.TODO())
		}
	}()

	collection := c.client.Database(c.database).Collection("games")
	_, err = collection.InsertOne(context.TODO(), s)
	if err != nil {
		return err
	}
	return nil
}

func (c *Connection) GetSens(player string, offset, limit int, ) ([]SensRes, error) {
	var res []SensRes
	collection := c.client.Database(c.database).Collection("games")
	filter := bson.M{"player": player}
	opts := options.Find().
		SetSkip(int64(offset)).
		SetLimit(int64(limit))
	cursor, err := collection.Find(context.TODO(), filter, opts)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(context.TODO())
	for cursor.Next(context.TODO()) {
		var item SensRes
		if err := cursor.Decode(&item); err != nil {
			return nil, err
		}
		res = append(res, item)
	}
	if err := cursor.Err(); err != nil {
		return nil, err
	}

	return res, nil
}

func (c *Connection) GetPlayersAfter(afterPlayer string, limit int) ([]string, error) {
	collection := c.client.Database(c.database).Collection("games")
	filter := bson.M{
		"player": bson.M{
			"$gt": afterPlayer,
		},
	}
	opts := options.Find().
		SetSort(bson.D{{Key: "player", Value: 1}}).
		SetLimit(int64(limit))

	cursor, err := collection.Find(context.TODO(), filter, opts)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(context.TODO())

	playerSet := make(map[string]struct{})
	var players []string

	for cursor.Next(context.TODO()) {
		var item SensRes
		if err := cursor.Decode(&item); err != nil {
			return nil, err
		}
		if _, seen := playerSet[item.Player]; !seen {
			playerSet[item.Player] = struct{}{}
			players = append(players, item.Player)
		}
	}

	return players, cursor.Err()
}

func (c *Connection) GetStat(player string) (*StatResult, error) {
	partite, err := c.GetSens(player, 0, 1000)
	if err != nil {
		return nil, err
	}
	var maxGlobal float64 = 0
	var minGlobal  float64 =0
	var count int = 0
	var tot float64 = 0
	var g []gameStat
	for _, game := range partite {
		var max float64 = -1
		var min float64 = 1
		for _, p := range game.Press {
			if p.Pression != 0 {
				if p.Pression > max {
					max = p.Pression
				}
				if p.Pression < min {
					min = p.Pression
				}
				tot += p.Pression
				count++
			}
		}
		if(max==-1 && min == -1){
			continue
		}
		g = append(g, gameStat{
			MaxPression: max,
			MinPression: min,
		})
		if maxGlobal < max {
			maxGlobal = max
		}
		if minGlobal> min {
			minGlobal = min
		}
	}
	if(count == 0){
		tot = 0
	}else{
		tot = tot / float64(count)
	}
	return &StatResult{
		MaxPression:  maxGlobal,
		MinPression:  minGlobal,
		AvgPression:   tot,
		Games:      g,
	}, nil

}
