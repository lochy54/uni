package models

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

type Game struct {	
	Pression float64 `json:"pression" bson:"pression"`
	Timestap int     `json:"timestap" bson:"timestap"`
}

type PlayerStats struct {
	MaxPressure         float64 `json:"maxPressure"`
	MaxPressureDuration int     `json:"maxPressureDuration"`
	MaxPressureLast     []float64 `json:"maxPressureLast"`
	TotalGames          int     `json:"totalGames"`
}