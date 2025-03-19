package token

import (
	"encoding/hex"
	"fmt"
	"log"
	"math/rand"
	"time"
)

type timers struct {
	time     time.Time
	username string
}

type code struct {
	time     time.Time
	username string
}

type Maps struct {
	list  map[string]timers 
	codes map[string]code
}

func CreateMaps() *Maps {
	return &Maps{
		list:  make(map[string]timers),
		codes: make(map[string]code),
	}
}

func (m *Maps) GenerateToken(username string) (error, string) {
	for k, v := range m.list {
		if(v.username==username){
			return nil, k
		}
	}
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
	m.list[token] = user
	return nil, token
}

func (m *Maps) RefreshToken(token string) (error, string) {
	if _, exists := m.list[token]; exists {
		val := m.list[token]
		val.time = time.Now()
		m.list[token] = val
		return nil, val.username
	} else {
		return fmt.Errorf("token non trovato"), ""
	}
}


func (m *Maps) DeleteToken(t string) error {
	if _, exists := m.list[t]; exists {
		delete(m.list, t)
		return nil
	}
	return fmt.Errorf("not logged in")
}



func (m *Maps) IsCodeActive(c string) error {
	if _, exists := m.codes[c]; exists {
		return nil
	}
	return fmt.Errorf("code not active")
}


func (m *Maps) GenerateCode(username string) (error, string) {

	for k, v := range m.codes {
		if(v.username==username){
			return nil , k
		}
	}

	cod := fmt.Sprintf("%d%d%d%d%d%d",rand.Intn(10),rand.Intn(10),rand.Intn(10),rand.Intn(10),rand.Intn(10),rand.Intn(10))
	var user = code{
		time:     time.Now(),
		username: username,
	}
	m.codes[cod] = user
	return nil, cod
}


func (m *Maps) Check() {

	go func() {
		for {
			expiration := time.Now().Add(-5 * time.Minute)
			for token, timestamp := range m.list {
				if timestamp.time.Before(expiration) {
					delete(m.list, token)
					log.Println("Token scaduto rimosso:", token)
				}
			}
			time.Sleep(3 * time.Minute)
		}
	}()

	go func() {
		for {
			expiration := time.Now().Add(-1 * time.Hour)
			for code, timestamp := range m.codes {
				if timestamp.time.Before(expiration) {
					delete(m.codes, code)
					log.Println("Code scaduto rimosso:", code)
				}
			}
			time.Sleep(3 * time.Minute)
		}
	}()

}
