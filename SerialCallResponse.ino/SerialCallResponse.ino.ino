//onewire + dallastemperat library for temp sensors
#include <OneWire.h>
#include <DallasTemperature.h>
#define ONE_WIRE_BUS_PIN 3
//relays
#define RY1 13
#define RY2 12
#define RY3 8
#define RY4 7
#define RY5 4
#define PUMP01 2

//Setup sensor on one wire pin
OneWire oneWire(ONE_WIRE_BUS_PIN);
DallasTemperature sensors(&oneWire);

DeviceAddress sTemp01 = { 0x28, 0xFF, 0x6F, 0x8F, 0x68, 0x14, 0x03, 0xC0 }; 
DeviceAddress sTemp02 = { 0x28, 0xFF, 0xF2, 0x36, 0x68, 0x14, 0x03, 0x99 };

String outData = "";    
String inData = "";         
boolean serialAvailable = false;
//bind an event to this variables to turn on/off relays
boolean r1 = false;
boolean r2 = false;

void setup() {
  //setup Relay OUTPUT
   pinMode(RY1, OUTPUT);
   pinMode(RY2, OUTPUT);
   pinMode(RY3, OUTPUT);
   pinMode(RY4, OUTPUT);
   pinMode(RY5, OUTPUT);
   pinMode(PUMP01, OUTPUT);
   
  //sensors begin
  sensors.begin();
  // set the resolution to 10 bit (Can be 9 to 12 bits .. lower is faster)
  sensors.setResolution(sTemp01, 10);
  sensors.setResolution(sTemp02, 10);
  
  // start serial port at 9600 bps:
  Serial.begin(9600);
  outData.reserve(200);
  inData.reserve(200);
  while (!Serial) {
    ; // wait for serial port to connect. Needed for native USB port only
  }
 
  establishContact();  // send a byte to establish contact until receiver responds
}

void loop() {
  // if we get a valid byte, read analog ins:
  //if (serialEvent()) {
  if (Serial.available()>0){
    // Command all devices on bus to read temperature  
    sensors.requestTemperatures();  
    // get incoming byte:
    inData = Serial.readString();
    inData.trim();
    //Serial.println(inData);
    if(inData.startsWith("f1t"))
    {
      outData = "{\"f\":\"f1\",\"t\":" + String(getTemp(sTemp01)) + ",\"r\":"+String(r1)+"}";
    }
    if(inData.startsWith("f2t"))
    {
      outData = "{\"f\":\"f2\",\"t\":" + String(getTemp(sTemp02)) + ",\"r\":"+String(r2)+"}";
    }
    if(inData.startsWith("f1r"))
    {
      r1=!r1;
      digitalWrite(RY1,r1);
      outData ="n/r";
    }
    if(inData.startsWith("f2r"))
    {
      r2=!r2;
      digitalWrite(RY2,r2);
      outData ="n/r";
    }
    if(outData=="")
    {
      outData = "YDU";
    }
    if(outData !="n/r"){
      Serial.println(outData);
    }
  }
  outData="";
  inData="";
  //Serial.flush();
}
void switchPump()
{
  
}
void establishContact() {
  while (Serial.available() <= 0 && serialAvailable==false) {
    Serial.println("ready");   
    serialAvailable=true;
    delay(300);
  }
}
float getTemp(DeviceAddress deviceAddress)
{
  float tempC = sensors.getTempC(deviceAddress);
  if (tempC == -127.00) 
  {
   //throw error
  } 
  return  tempC;
}

