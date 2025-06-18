package token

import (
	"fmt"
	"log"
	"math/rand"
	"time"
)

type timers struct {
	time     time.Time
	username string
}

type Tokens struct{
	codes map[string]timers
}


func CreateMaps() *Tokens {
	return &Tokens{
		codes: make(map[string]timers),
	}
}


func (m *Tokens) IsCodeActive(c string) error {
	if _, exists := m.codes[c]; exists {
		return   nil
	}
	return  fmt.Errorf("code not active")
}


func (m *Tokens) GenerateCode(username string) string {

	for k, v := range m.codes {
		if(v.username==username){
			return  k
		}
	}

	cod := fmt.Sprintf("%d%d%d%d%d%d",rand.Intn(10),rand.Intn(10),rand.Intn(10),rand.Intn(10),rand.Intn(10),rand.Intn(10))
	var user = timers{
		time:     time.Now(),
		username: username,
	}
	m.codes[cod] = user
	return cod
}


func (m *Tokens) Check() {
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
