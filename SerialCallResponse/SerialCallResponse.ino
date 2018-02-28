//onewire + dallastemperat library for temp sensors
#include <OneWire.h>
#include <DallasTemperature.h>
#define ONE_WIRE_BUS_PIN 3
//relays
#define RY1 11
#define RY2 12
#define RY3 8
#define RY4 7
#define RY5 6
#define RY6 5 //not used
#define RY7 4 
#define PUMP01 2

//Setup sensor on one wire pin
OneWire oneWire(ONE_WIRE_BUS_PIN);
DallasTemperature sensors(&oneWire);

DeviceAddress sTemp01 = { 0x28, 0xFF, 0x6F, 0x8F, 0x68, 0x14, 0x03, 0xC0 }; 
DeviceAddress sTemp02 = { 0x28, 0xFF, 0xF2, 0x36, 0x68, 0x14, 0x03, 0x99 };
DeviceAddress sTemp03 = { 0x28, 0xFF, 0xB1, 0x26, 0x60, 0x14, 0x04, 0xA0 };
DeviceAddress sTemp04 = { 0x28, 0xFF, 0x30, 0x90, 0x68, 0x14, 0x03, 0x98 };
DeviceAddress sTemp05 = { 0x28, 0xFF, 0x3C, 0x89, 0x6D, 0x14, 0x04, 0xA4 };
DeviceAddress sTemp06 = { 0x28, 0xFF, 0xCC, 0x63, 0x68, 0x14, 0x03, 0xE6 };

String outData = "";    
String inData = "";         
boolean serialAvailable = false;
//bind an event to this variables to turn on/off relays
boolean error = false;
boolean r1 = true;
boolean r2 = true;
boolean r3 = true;
boolean r4 = true;
boolean r5 = true;
boolean r6 = true;//not used
boolean r7 = true;
boolean r8 = true;

void setup() {
  //setup Relay OUTPUT
   pinMode(RY1, OUTPUT);
   pinMode(RY2, OUTPUT);
   pinMode(RY3, OUTPUT);
   pinMode(RY4, OUTPUT);
   pinMode(RY5, OUTPUT);
   pinMode(RY6, OUTPUT);//not used
   pinMode(RY7, OUTPUT);
   pinMode(PUMP01, OUTPUT);
   setClose();
  //sensors begin
  sensors.begin();
  
  // set the resolution to 10 bit (Can be 9 to 12 bits .. lower is faster)
  sensors.setResolution(sTemp01, 10);
  sensors.setResolution(sTemp02, 10);
  sensors.setResolution(sTemp03, 10);
  sensors.setResolution(sTemp04, 10);
  sensors.setResolution(sTemp05, 10);
  sensors.setResolution(sTemp06, 10);

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
    char buff[50];
    Serial.readBytes(buff, Serial.available());
    inData = String(buff);
    // Command all devices on bus to read temperature  
    sensors.requestTemperatures();  
    // get incoming byte:
    //inData = Serial.readString();
    inData.trim();
    //read sensors
    if(inData.startsWith("tank1t"))
    {
      outData = "{\"f\":\"tank1\",\"t\":" + String(getTemp(sTemp01)) + ",\"r\":"+String(r1)+"}";
    }
    if(inData.startsWith("tank2t"))
    {
      outData = "{\"f\":\"tank2\",\"t\":" + String(getTemp(sTemp02)) + ",\"r\":"+String(r2)+"}";
    }
     if(inData.startsWith("tank3t"))
    {
      outData = "{\"f\":\"tank3\",\"t\":" + String(getTemp(sTemp03)) + ",\"r\":"+String(r3)+"}";
    }
     if(inData.startsWith("tank4t"))
    {
      outData = "{\"f\":\"tank4\",\"t\":" + String(getTemp(sTemp04)) + ",\"r\":"+String(r4)+"}";
    }
     if(inData.startsWith("tank5t"))
    {
      outData = "{\"f\":\"tank5\",\"t\":" + String(getTemp(sTemp05)) + ",\"r\":"+String(r5)+"}";
    }
     if(inData.startsWith("bf1t"))
    {
      outData = "{\"f\":\"bf1\",\"t\":" + String(getTemp(sTemp06)) + ",\"r\":"+String(r7)+"}";
    }
    //realays
    if(inData.startsWith("tank1r"))
    {
      r1=!r1;
      digitalWrite(RY1,r1);
      outData ="n/r";
    }
    if(inData.startsWith("tank2r"))
    {
      r2=!r2;
      digitalWrite(RY2,r2);
      outData ="n/r";
    }
     if(inData.startsWith("tank3r"))
    {
      r3=!r3;
      digitalWrite(RY3,r3);
      outData ="n/r";
    }
     if(inData.startsWith("tank4r"))
    {
      r4=!r4;
      digitalWrite(RY4,r4);
      outData ="n/r";
    }
     if(inData.startsWith("tank5r"))
    {
      r5=!r5;
      digitalWrite(RY5,r5);
      outData ="n/r";
    }
     if(inData.startsWith("bf1r"))
    {
      r7=!r7;
      digitalWrite(RY7,r7);
      outData ="n/r";
    }
    //Decide si prender la bomba
     if(inData.startsWith("pmpOff"))
    {
      error = true;
      switchPump();
      outData ="n/r";
    }else
    {
      //esto requiere que se resetee manualmente
      //error = false;
      switchPump();
    }
    //response
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
  if (Serial.available()>0){
   char bufFlush[100];
   Serial.readBytes(bufFlush, Serial.available());
  }
  delay(100);
}
void switchPump()
{
  if((r1&&r2&&r3&&r4&&r5)||error)
  {
      r8=true;
      
  }else
  {
      r8=false;
  }
  digitalWrite(PUMP01,r8);
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
void setClose()
{
  digitalWrite(RY1,HIGH);  
  r1=true;
  digitalWrite(RY2,HIGH);  
  r2=true;
  digitalWrite(RY3,HIGH);  
  r3=true;
  digitalWrite(RY4,HIGH);  
  r4=true;
  digitalWrite(RY5,HIGH);  
  r5=true;
  digitalWrite(RY6,HIGH);  
  r6=true;
  digitalWrite(RY7,HIGH);  
  r7=true;
  digitalWrite(PUMP01,HIGH);
  r8=true;
}


