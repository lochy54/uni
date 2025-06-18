package main

import (
	"log"
	"strconv"
	"time"

	"github.com/kataras/iris/v12"
	"github.com/rs/cors"
	httpSwagger "github.com/swaggo/http-swagger"
	_ "progettoUni.com/docs"
	"progettoUni.com/models"
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
	app.Use(func(ctx iris.Context) {
		log.Printf("Request received at: %s", time.Now().Format(time.RFC3339))
		ctx.Next()
	})
	app.WrapRouter(corsHandler)
	api := app.Party("/api")
	api.Get("/swagger/{any:path}", iris.FromStd(httpSwagger.WrapHandler))

	api.Post("/login", login)
	api.Post("/register", register)
	api.Post("/chekCode", chekCode)
	api.Post("/saveSens/{player}", saveSens)
	api.Use(AuthInterceptor)
	api.Get("/chekToken", chekToken)
	api.Get("/generate", generateCode)
	api.Get("/getPlayerNames/{limit}/{index}", getPlayerNames)
	api.Get("/getPlayerNames/{limit}/{index}/{filter}", getPlayerNames)
	api.Get("/getPlayerGamesByName/{player}/{limit}/{index}", getPlayerGamesByName)
	api.Get("/getPlayerStats/{player}", getPlayerStats)

	app.Listen("0.0.0.0:3030")
}

func AuthInterceptor(ctx iris.Context) {
	authHeader := ctx.GetHeader("Authorization")
	if authHeader == "" {
		ctx.StatusCode(iris.StatusUnauthorized)
		ctx.JSON("Authorization header is missing")
		return
	}
	var t string
	if len(authHeader) > 7 && authHeader[:7] == "Bearer " {
		t = authHeader[7:]
	} else {
		ctx.StatusCode(iris.StatusUnauthorized)
		ctx.JSON("Invalid authorization format, Bearer token expected")
		return
	}
	err, user := token.ValidateJWT(t)
	if err != nil {
		ctx.StatusCode(iris.StatusBadRequest)
		ctx.JSON(err.Error())
		return
	}
	ctx.Values().Set("user", user)
	ctx.Next()
}

func register(ctx iris.Context) {
	var user models.User
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
	err, token := token.GenerateJWT(user.Username)
	if err != nil {
		ctx.StatusCode(iris.StatusBadRequest)
		ctx.JSON(err.Error())
		return
	}
	ctx.StatusCode(iris.StatusOK)
	ctx.JSON(token)
}

func chekToken(ctx iris.Context) {
	user := ctx.Values().Get("user").(string)
	ctx.StatusCode(iris.StatusOK)
	ctx.JSON(user)
}

func login(ctx iris.Context) {
	var l models.Login
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
	err, token := token.GenerateJWT(l.Username)
	if err != nil {
		ctx.StatusCode(iris.StatusBadRequest)
		ctx.JSON(err.Error())
		return
	}
	ctx.StatusCode(iris.StatusOK)
	ctx.JSON(token)
}

func generateCode(ctx iris.Context) {
	user := ctx.Values().Get("user").(string)
	code := Maps.GenerateCode(user)
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
	if err := Maps.IsCodeActive(c); err != nil {
		ctx.StatusCode(iris.StatusBadRequest)
		ctx.JSON(err.Error())
		return
	}
	ctx.StatusCode(iris.StatusOK)
}

func saveSens(ctx iris.Context) {
	player := ctx.Params().Get("player")
	if player == "" {
		ctx.StatusCode(iris.StatusBadRequest)
		ctx.JSON("ivalid param")
	}
	var s []models.Game
	if err := ctx.ReadJSON(&s); err != nil {
		ctx.StatusCode(iris.StatusBadRequest)
		ctx.JSON(err.Error())
		return
	}
	authHeader := ctx.GetHeader("Authorization")
	if authHeader == "" {
		ctx.StatusCode(iris.StatusUnauthorized)
		ctx.JSON("Authorization header is missing")
		return
	}
	err := Maps.IsCodeActive(authHeader)
	if err != nil {
		ctx.StatusCode(iris.StatusBadRequest)
		ctx.JSON(err.Error())
		return
	}
	if err := Conn.SaveSens(player, s); err != nil {
		ctx.StatusCode(iris.StatusBadRequest)
		ctx.JSON(err.Error())
		return
	}
	ctx.StatusCode(iris.StatusOK)
}

func getPlayerStats(ctx iris.Context) {
	player := ctx.Params().Get("player")
	if player == "" {
		ctx.StatusCode(iris.StatusBadRequest)
		ctx.JSON("ivalid param")
	}
	res, err := Conn.GetPlayerStats(player)
	if err != nil {
		ctx.StatusCode(iris.StatusBadRequest)
		ctx.JSON(err.Error())
		return
	}
	ctx.JSON(res)

}

func getPlayerNames(ctx iris.Context) {
	filter := ctx.Params().Get("filter")
	limitstr := ctx.Params().Get("limit")
	indexstr := ctx.Params().Get("index")
	if limitstr == "" || indexstr == "" {
		ctx.StatusCode(iris.StatusBadRequest)
		ctx.JSON("ivalid param")
	}
	limit, err := strconv.Atoi(limitstr)
	if err != nil {
		ctx.StatusCode(iris.StatusBadRequest)
		ctx.JSON(err.Error())
		return
	}
	index, err := strconv.Atoi(indexstr)
	if err != nil {
		ctx.StatusCode(iris.StatusBadRequest)
		ctx.JSON(err.Error())
		return
	}
	res, count, err := Conn.GetPlayerNames(limit, index, filter)
	if err != nil {
		ctx.StatusCode(iris.StatusBadRequest)
		ctx.JSON(err.Error())
		return
	}
	ctx.JSON(iris.Map{
		"res":   res,
		"count": count,
	})
}

func getPlayerGamesByName(ctx iris.Context) {
	limitstr := ctx.Params().Get("limit")
	indexstr := ctx.Params().Get("index")
	player := ctx.Params().Get("player")
	if limitstr == "" || indexstr == "" || player == "" {
		ctx.StatusCode(iris.StatusBadRequest)
		ctx.JSON("ivalid param")
	}
	limit, err := strconv.Atoi(limitstr)
	if err != nil {
		ctx.StatusCode(iris.StatusBadRequest)
		ctx.JSON(err.Error())
		return
	}
	index, err := strconv.Atoi(indexstr)
	if err != nil {
		ctx.StatusCode(iris.StatusBadRequest)
		ctx.JSON(err.Error())
		return
	}
	res, count, err := Conn.GetPlayerGamesByName(player, limit, index)
	if err != nil {
		ctx.StatusCode(iris.StatusBadRequest)
		ctx.JSON(err.Error())
		return
	}
	ctx.JSON(iris.Map{
		"res":   res,
		"count": count,
	})
}
