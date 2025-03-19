package main

import (
	"log"

	"github.com/kataras/iris/v12"
	"github.com/rs/cors"
	"progettoUni.com/mongo"
	"progettoUni.com/token"
)

var Conn = mongo.CreateCLient("mongodb://localhost:27017", "uniGame")
var Maps = token.CreateMaps()

func main() {
	app := iris.New()
	corsHandler := cors.New(cors.Options{
		AllowedOrigins:   []string{"*"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Content-Type", "Authorization"},
		AllowCredentials: true,
	}).ServeHTTP

	err := Conn.Connect()
	Maps.Check()
	if err != nil {
		log.Fatal(err)
	}
	log.Println("connected to mongo")

	app.WrapRouter(corsHandler)
	app.Post("/login", login)
	app.Post("/logout", logout)
	app.Post("/chekToken", chekToken)
	app.Post("/register", register)
	app.Post("/generate", generateCode)
	app.Post("/chekCode", chekCode)

	app.Listen("0.0.0.0:8080")
}

func register(ctx iris.Context) {
	var user mongo.User
	if err := ctx.ReadJSON(&user); err != nil {
		ctx.StatusCode(iris.StatusBadRequest)
		ctx.JSON(err.Error())
		return
	}
	err := Conn.Register(user)
	if err != nil {
		ctx.StatusCode(iris.StatusBadRequest)
		ctx.JSON(err.Error())
		return
	}
	err, token := Maps.GenerateToken(user.Username)
	if err != nil {
		ctx.StatusCode(iris.StatusBadRequest)
		ctx.JSON(err.Error())
		return
	}
	ctx.StatusCode(iris.StatusOK)
	ctx.JSON(token)
}

func chekToken(ctx iris.Context) {
	var t string
	if err := ctx.ReadJSON(&t); err != nil {
		ctx.StatusCode(iris.StatusBadRequest)
		ctx.JSON(err.Error())
		return
	}
	err, user := Maps.RefreshToken(t)
	if err != nil {
		ctx.StatusCode(iris.StatusBadRequest)
		ctx.JSON(err.Error())
		return
	}
	ctx.StatusCode(iris.StatusOK)
	ctx.JSON(user)
}

func login(ctx iris.Context) {
	var l mongo.Login
	if err := ctx.ReadJSON(&l); err != nil {
		ctx.StatusCode(iris.StatusBadRequest)
		ctx.JSON(err.Error())
		return
	}

	if err := Conn.Login(l); err != nil {
		ctx.StatusCode(iris.StatusBadRequest)
		ctx.JSON(err.Error())
		return
	}
	err, token := Maps.GenerateToken(l.Username)
	if err != nil {
		ctx.StatusCode(iris.StatusBadRequest)
		ctx.JSON(err.Error())
		return
	}
	ctx.StatusCode(iris.StatusOK)
	ctx.JSON(token)
}

func logout(ctx iris.Context) {
	var t string
	if err := ctx.ReadJSON(&t); err != nil {
		ctx.StatusCode(iris.StatusBadRequest)
		ctx.JSON(err.Error())
		return
	}
	if err := Maps.DeleteToken(t); err != nil {
		ctx.StatusCode(iris.StatusBadRequest)
		ctx.JSON(err.Error())
		return
	}
	ctx.StatusCode(iris.StatusOK)
}

func generateCode(ctx iris.Context) {
	var t string
	if err := ctx.ReadJSON(&t); err != nil {
		ctx.StatusCode(iris.StatusBadRequest)
		ctx.JSON(err.Error())
		return
	}
	err, username := Maps.RefreshToken(t)
	if err != nil {
		ctx.StatusCode(iris.StatusBadRequest)
		ctx.JSON(err.Error())
		return
	}
	err, code := Maps.GenerateCode(username)
	if err != nil {
		ctx.StatusCode(iris.StatusBadRequest)
		ctx.JSON(err.Error())
		return
	}
	ctx.StatusCode(iris.StatusOK)
	ctx.JSON(code)
}

func chekCode(ctx iris.Context) {
	var c string
	if err := ctx.ReadJSON(&c); err != nil {
		ctx.StatusCode(iris.StatusBadRequest)
		ctx.JSON(err.Error())
		return
	}
	if err:= Maps.IsCodeActive(c); err!= nil {
		ctx.StatusCode(iris.StatusBadRequest)
		ctx.JSON(err.Error())
		return
	}
	ctx.StatusCode(iris.StatusOK)
}


//da fare parte gestione codici (tap to play invio) e inizio gioco inserimento username e connessione pluethho
