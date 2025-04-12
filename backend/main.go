package main

import (
	"log"
	"strconv"

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
	api := app.Party("/api")

	api.Post("/login", login)
	api.Get("/chekToken", chekToken)
	api.Post("/register", register)
	api.Get("/generate", generateCode)
	api.Post("/chekCode", chekCode)
	api.Post("/saveSens", saveSens)
	api.Get("/getSens/{player}/{offset}/{limit}", getSens)
	api.Get("/getStat/{player}", getStat)
	api.Get("/getPlayer/{after}/{limit}", getPlayer)
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

	err, username := token.ValidateJWT(t)
	if err != nil {
		ctx.StatusCode(iris.StatusBadRequest)
		ctx.JSON(err.Error())
		return
	}
	code := Maps.GenerateCode(username)
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

func saveSens(ctx iris.Context) {
	
	var s mongo.SensRes
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

	err := Maps.IsCodeActive(authHeader);
	if err!= nil {
		ctx.StatusCode(iris.StatusBadRequest)
		ctx.JSON(err.Error())
		return
	}
	if err := Conn.SaveSens(s); err!= nil {
		ctx.StatusCode(iris.StatusBadRequest)
		ctx.JSON(err.Error())
		return
	}
	ctx.StatusCode(iris.StatusOK)
}

func getSens(ctx iris.Context) {
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
	player := ctx.Params().Get("player")
	offsetStr := ctx.Params().Get("offset")
	limitStr := ctx.Params().Get("limit")

	if offsetStr == "" || limitStr == ""  || player == ""{
		ctx.StatusCode(iris.StatusBadRequest)
		ctx.JSON("Invalid param")
		return
	}

	offset, err := strconv.Atoi(offsetStr)
	if err != nil {
		ctx.StatusCode(iris.StatusBadRequest)
		ctx.JSON("Invalid offset parameter")
		return
	}
	limit, err := strconv.Atoi(limitStr)
	if err != nil {
		ctx.StatusCode(iris.StatusBadRequest)
		ctx.JSON("Invalid limit parameter")
		return
	}


	err, _ = token.ValidateJWT(t)
	if err != nil {
		ctx.StatusCode(iris.StatusBadRequest)
		ctx.JSON(err.Error())
		return
	}
	res, err := Conn.GetSens(player , offset , limit)
	if err != nil {
		ctx.StatusCode(iris.StatusBadRequest)
		ctx.JSON(err.Error())
		return
	}
	ctx.JSON(res)
}

func getPlayer(ctx iris.Context) {
	after := ctx.Params().Get("after")
	limitStr := ctx.Params().Get("limit")

	if limitStr == "" {
		ctx.StatusCode(iris.StatusBadRequest)
		ctx.JSON("Invalid param")
		return
	}
	limit, err := strconv.Atoi(limitStr)
	if err != nil {
		ctx.StatusCode(iris.StatusBadRequest)
		ctx.JSON("Invalid limit parameter")
		return
	}
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
	err, _ = token.ValidateJWT(t)
	if err != nil {
		ctx.StatusCode(iris.StatusBadRequest)
		ctx.JSON(err.Error())
		return
	}
	res , err :=Conn.GetPlayersAfter(after,limit)
	if err != nil {
		ctx.StatusCode(iris.StatusBadRequest)
		ctx.JSON(err.Error())
		return
	}
	ctx.JSON(res)
}


func getStat(ctx iris.Context) {
	player := ctx.Params().Get("player")

	if player == ""{
		ctx.StatusCode(iris.StatusBadRequest)
		ctx.JSON("Invalid param")
		return
	}

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
	err, _ := token.ValidateJWT(t)
	if err != nil {
		ctx.StatusCode(iris.StatusBadRequest)
		ctx.JSON(err.Error())
		return
	}
	res , err :=Conn.GetStat(player)
	if err != nil {
		ctx.StatusCode(iris.StatusBadRequest)
		ctx.JSON(err.Error())
		return
	}
	ctx.JSON(res)
}