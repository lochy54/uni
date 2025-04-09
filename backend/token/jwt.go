package token

import (
	"fmt"
	"time"
	"github.com/golang-jwt/jwt/v4"
)

var jwtKey = []byte("AbbsQSDIQ026pXwiNSCUwRoJLukmiCmi")

type Claims struct {
	Username string `json:"username"`
	jwt.RegisteredClaims
}

func GenerateJWT(username string) (error, string) {
	claims := &Claims{
		Username: username,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(10 * time.Hour)),
			Issuer:    "uniapp",
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)

	tokenString, err := token.SignedString(jwtKey)
	if err != nil {
		return  fmt.Errorf("tostring error") , ""
	}

	return nil ,tokenString 
}

func ValidateJWT(tokenString string) (error,string) {
	token, err := jwt.ParseWithClaims(tokenString, &Claims{}, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}
		return jwtKey, nil
	})

	if err != nil {
		return err , ""
	}
	claims, ok := token.Claims.(*Claims)
	if !ok || !token.Valid {
		return  fmt.Errorf("invalid token") , ""
	}

	return nil , claims.Username 
}
