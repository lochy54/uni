package main

import (
	"log"

	"github.com/kataras/iris"
	"github.com/rs/cors"
	"progettoUni.com/mongo"
)

var Conn = mongo.CreateCLient("mongodb://localhost:27017","uniGame")


func main() {
	app := iris.New()
	corsHandler := cors.New(cors.Options{
		AllowedOrigins:   []string{"*"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Content-Type", "Authorization"},
		AllowCredentials: true,
	}).ServeHTTP

	err := Conn.Connect()
	if err != nil {
		log.Fatal(err)
	}
	log.Println("connected to mongo")

	app.WrapRouter(corsHandler)
	app.Post("/login", login)
	app.Post("/logout", logout)
	app.Post("/chekToken", chekToken)
	app.Post("/register", register)
	app.Listen("0.0.0.0:8080")
}

func register(ctx iris.Context) {
	var user mongo.User
	if err := ctx.ReadJSON(&user); err != nil {
		ctx.StatusCode(iris.StatusBadRequest)
		ctx.JSON(err)
		return
	}
	err,token := Conn.Register(user)
	if err != nil {
		ctx.StatusCode(iris.StatusBadRequest)
		ctx.JSON(err)
		return
	}
	ctx.StatusCode(iris.StatusOK)
	ctx.JSON(token)
}

func chekToken(ctx iris.Context) {
	var t string
	if err := ctx.ReadJSON(&t); err != nil {
		ctx.StatusCode(iris.StatusBadRequest)
		ctx.JSON(err)
		return
	}
	err,user := Conn.RefreshToken(t);
	if  err != nil {
		ctx.StatusCode(iris.StatusBadRequest)
		ctx.JSON(err)
		return
	}
	ctx.StatusCode(iris.StatusOK)
	ctx.JSON(user)
}

func login(ctx iris.Context) {
	var l mongo.Login
	if err := ctx.ReadJSON(&l); err != nil {
		ctx.StatusCode(iris.StatusBadRequest)
		ctx.JSON(err)
		return
	}
	err,token := Conn.Login(l)
	if  err != nil {
		ctx.StatusCode(iris.StatusBadRequest)
		ctx.JSON(err)
		return
	}
	ctx.StatusCode(iris.StatusOK)
	ctx.JSON(token)
}


func logout(ctx iris.Context) {
	var t string
	if err := ctx.ReadJSON(&t); err != nil {
		ctx.StatusCode(iris.StatusBadRequest)
		ctx.JSON(err)
		return
	}
	if err:=Conn.Logout(t); err!=nil {
		ctx.StatusCode(iris.StatusBadRequest)
		ctx.JSON(err)
		return
	}
	ctx.StatusCode(iris.StatusOK)
}

