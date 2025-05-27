package mongo

import (
	"context"
	"fmt"

	"github.com/go-playground/validator/v10"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"golang.org/x/crypto/bcrypt"
	"progettoUni.com/models"
)

type sensRes struct {
	Player     string          `bson:"player"`
	Games      [][]models.Game `bson:"games"`
	TotalGames int             `bson:"totalGames"`
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

func (c *Connection) Register(user models.User) error {
	validate := validator.New()
	err := validate.Struct(user)
	if err != nil {
		return err
	}

	user.Password, err = hashPassword(user.Password)
	if err != nil {
		return err
	}

	collection := c.client.Database(c.database).Collection("users")
	_, err = collection.InsertOne(context.TODO(), user)
	if err != nil {
		return fmt.Errorf("failed to insert user: %v", err)
	}

	return nil
}

func (c *Connection) Login(l models.Login) error {
	validate := validator.New()
	err := validate.Struct(l)
	if err != nil {
		return err
	}
	var user models.User
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

func (c *Connection) SaveSens(player string, newSession []models.Game) error {
	collection := c.client.Database(c.database).Collection("games")
	filter := bson.M{"player": player}
	update := bson.M{
		"$push": bson.M{
			"games": newSession,
		},
	}
	opts := options.Update().SetUpsert(true)
	_, err := collection.UpdateOne(context.TODO(), filter, update, opts)
	if err != nil {
		return fmt.Errorf("failed to save sensor data: %v", err)
	}
	return nil
}

func (c *Connection) GetPlayerNames(limit int, index int, filter string) ([]string, int, error) {
	collection := c.client.Database(c.database).Collection("games")

	query := bson.M{}
	if filter != "" {
		query["player"] = bson.M{"$regex": filter, "$options": "i"} // case-insensitive match
	}

	totalCount, err := collection.CountDocuments(context.TODO(), query)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to count players: %v", err)
	}
	skip := index
	cursor, err := collection.Find(context.TODO(), query, options.Find().SetSkip(int64(skip)).SetLimit(int64(limit)))
	if err != nil {
		return nil, 0, fmt.Errorf("failed to find players: %v", err)
	}
	defer cursor.Close(context.TODO())
	var playerNames []string
	for cursor.Next(context.TODO()) {
		var player sensRes
		if err := cursor.Decode(&player); err != nil {
			return nil, 0, fmt.Errorf("failed to decode player data: %v", err)
		}
		playerNames = append(playerNames, player.Player)
	}
	if err := cursor.Err(); err != nil {
		return nil, 0, fmt.Errorf("cursor error: %v", err)
	}
	return playerNames, int(totalCount), nil
}

func (c *Connection) GetPlayerGamesByName(playerName string, limit int, index int) ([][]models.Game, int, error) {
	collection := c.client.Database(c.database).Collection("games")
	skip := index
	pipeline := mongo.Pipeline{
		{{
			Key: "$match", Value: bson.D{{Key: "player", Value: playerName}},
		}},
		{{
			Key: "$project", Value: bson.D{
				{Key: "player", Value: 1},
				{Key: "games", Value: bson.D{{Key: "$slice", Value: []interface{}{"$games", skip, limit}}}},
				{Key: "totalGames", Value: bson.D{{Key: "$size", Value: "$games"}}},
			},
		}},
	}
	cursor, err := collection.Aggregate(context.TODO(), pipeline)
	if err != nil {
		return nil, 0, fmt.Errorf("aggregation failed: %v", err)
	}
	defer cursor.Close(context.TODO())
	var result sensRes
	if cursor.Next(context.TODO()) {
		if err := cursor.Decode(&result); err != nil {
			return nil, 0, fmt.Errorf("failed to decode player data: %v", err)
		}
	}
	if err := cursor.Err(); err != nil {
		return nil, 0, fmt.Errorf("cursor error: %v", err)
	}
	if result.TotalGames == 0 {
		return nil, 0, fmt.Errorf("player not found or no games available")
	}
	return result.Games, result.TotalGames, nil
}

func (c *Connection) GetPlayerStats(playerName string) (models.PlayerStats, error) {
	collection := c.client.Database(c.database).Collection("games")

	pipeline := mongo.Pipeline{
		{{
			Key: "$match", Value: bson.D{{Key: "player", Value: playerName}},
		}},
		{{
			Key: "$project", Value: bson.D{
				{Key: "player", Value: 1},
				{Key: "games", Value: bson.D{{Key: "$slice", Value: []interface{}{"$games", 100}}}},
				{Key: "totalGames", Value: bson.D{{Key: "$size", Value: "$games"}}},
			},
		}},
	}

	cursor, err := collection.Aggregate(context.TODO(), pipeline)
	if err != nil {
		return models.PlayerStats{}, fmt.Errorf("aggregation failed: %v", err)
	}
	defer cursor.Close(context.TODO())

	var result sensRes
	if cursor.Next(context.TODO()) {
		if err := cursor.Decode(&result); err != nil {
			return models.PlayerStats{}, fmt.Errorf("failed to decode result: %v", err)
		}
	} else {
		return models.PlayerStats{}, fmt.Errorf("player not found")
	}
	if err := cursor.Err(); err != nil {
		return models.PlayerStats{}, fmt.Errorf("cursor error: %v", err)
	}

	// Calcolo delle statistiche solo sulle prime 100 partite
	var maxPressure float64
	var maxPressureDuration int
	var maxPressureLast []float64

	for _, game := range result.Games {
		var localMax float64
		for i := 0; i < len(game); i++ {
			pressure := game[i].Pression
			if pressure > localMax {
				localMax = pressure
				if i > 0 {
					maxPressureDuration = game[i].Timestap - game[i-1].Timestap
				}
			}
		}
		maxPressureLast = append(maxPressureLast, localMax)
		if localMax > maxPressure {
			maxPressure = localMax
		}
	}

	stats := models.PlayerStats{
		MaxPressure:         maxPressure,
		MaxPressureDuration: maxPressureDuration,
		MaxPressureLast:     maxPressureLast,
		TotalGames:          result.TotalGames,
	}
	return stats, nil
}
