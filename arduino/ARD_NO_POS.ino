#include <ArduinoBLE.h>
#include <ESP32Servo.h>

// Dichiarazione delle librerie per la gestione BLE e del servo

// Servo
Servo myServo;  // Oggetto per il servo

// UUIDs per i servizi BLE
BLEService pressionService("19B10030-E8F2-537E-4F6C-D104768A1214");  // Servizio BLE per la pressione

// Caratteristiche BLE
BLEFloatCharacteristic pressionCharacteristic("19B10031-E8F2-537E-4F6C-D104768A1214", BLERead | BLENotify);  // Caratteristica per la lettura e la notifica della corrente

// Definizione dei pin e delle costanti
const int statusLED = 2;     // LED di stato su ESP32 (pin 2)
const int servoPin = 9;      // Pin a cui è connesso il servo (pin 9)
const int sensorPin = A6;    // Pin per il sensore ACS712 (pin analogico A6)
const float sensitivity = 0.185;  // Sensibilità del sensore ACS712 (mV/A)
const float offset = 2.5;    // Offset del sensore ACS712 (in V)
const float STALL_CURRENT =  0.24;       // Ampere, MG995 at 3.3 volt
const float STALL_TORQUE  = 6.88;      // kg·cm, MG995 at 3.3 volt
// Variabile globale per la connessione BLE
bool connected = false;

// Setup iniziale
void setup() {
  // Inizializzazione della comunicazione seriale per il debug
  Serial.begin(9600);

  // Setup del servo, con posizione iniziale a 20 gradi
  myServo.attach(servoPin);
  myServo.write(10);

  // Configurazione dei pin per il LED di stato e il sensore ACS712
  pinMode(statusLED, OUTPUT);
  pinMode(sensorPin, INPUT);


  // Inizializzazione della comunicazione BLE
  while (!BLE.begin()) {
    Serial.println("Errore: Impossibile avviare BLE!"); 
    delay(100);
  }


  // Setup BLE
  BLE.setLocalName("BLEController");  // Imposta il nome del dispositivo BLE
  BLE.setAdvertisedService(pressionService);  // Imposta il servizio BLE pubblicizzato
  pressionService.addCharacteristic(pressionCharacteristic);  // Aggiungi la caratteristica alla definizione del servizio
  BLE.addService(pressionService);  // Aggiungi il servizio BLE
  BLE.advertise();  // Inizia la pubblicità del servizio BLE
  Serial.println("BLE in attesa di connessione..."); 

  // Creazione dei task FreeRTOS
  xTaskCreatePinnedToCore(taskBLE, "TaskBLE", 4096, NULL, 1, NULL, NULL);  // Task per la gestione della connessione BLE
  xTaskCreatePinnedToCore(taskServoGest, "TaskServo", 4096, NULL, 2, NULL, NULL);  // Task per la gestione del servo
}

// Loop vuoto, tutto eseguito tramite i task FreeRTOS
void loop() {}

// Task per la lettura della corrente dal sensore ACS712
void taskServoGest(void *pvParameters) {
  while (true) {
    if (connected) {  
      float current = getFilteredCurrent(300); 
      float force = calculateForce(current);
      pressionCharacteristic.writeValue(force);  
    }
      vTaskDelay(10 / portTICK_PERIOD_MS);  
  }
}

// Metodo per leggere e filtrare la corrente (calcolata come media su un certo numero di campioni)
float getFilteredCurrent(int rateo) {
  float add = 0;
  for (int i = 0; i < rateo; i++) {
    float rawValue = analogRead(sensorPin); 
    delay(0.2);
    float voltage = (rawValue / 4095.0) * 3.3; 
    float current = (voltage - offset) / sensitivity; 
    Serial.println(String(voltage) +" "+String(current));
    add += current;   
  }
  float res = round((add / rateo) * 1000) / 1000; 
  if(res<=0.01){
    res = 0;
  }
  return res;
}

// Funzione per calcolare la forza
float calculateForce(float current) {
    float torque = (current / STALL_CURRENT) * STALL_TORQUE;
    float forceKg = torque ;
    return forceKg;
}


// Task per la gestione della connessione BLE
void taskBLE(void *pvParameters) {
  while (true) {
    BLEDevice central = BLE.central();  

    if (central) {  
      Serial.println("connected");
      connected = true;  
      digitalWrite(statusLED, HIGH);  

      while (central.connected()) {  
        vTaskDelay(100 / portTICK_PERIOD_MS);  
      }
      Serial.println("disconnected");
      connected = false;  
      digitalWrite(statusLED, LOW);  
      BLE.advertise(); 
    } else {
      digitalWrite(statusLED, HIGH);
      vTaskDelay(200 / portTICK_PERIOD_MS);  
      digitalWrite(statusLED, LOW);
      vTaskDelay(200 / portTICK_PERIOD_MS);  
    }
  }
}
