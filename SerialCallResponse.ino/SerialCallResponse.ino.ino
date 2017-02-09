/*
  Serial Call and Response
 Language: Wiring/Arduino

 This program sends an ASCII A (byte of value 65) on startup
 and repeats that until it gets some data in.
 Then it waits for a byte in the serial port, and
 sends three sensor values whenever it gets a byte in.

 Thanks to Greg Shakar and Scott Fitzgerald for the improvements

   The circuit:
 * potentiometers attached to analog inputs 0 and 1
 * pushbutton attached to digital I/O 2

 Created 26 Sept. 2005
 by Tom Igoe
 modified 24 April 2012
 by Tom Igoe and Scott Fitzgerald

 This example code is in the public domain.

 http://www.arduino.cc/en/Tutorial/SerialCallResponse

 */

String outData = "";    
String inData = "";         
boolean serialAvailable = false;
//bind an event to this variables to turn on/off relays
boolean r1 = false;
boolean r2 = false;
void setup() {
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
    // get incoming byte:
    inData = Serial.readString();
    inData.trim();
    //Serial.println(inData);
    if(inData.startsWith("f1t"))
    {
      outData = "{\"f\":\"f1\",\"t\":20.5,\"r\":"+String(r1)+"}";
    }
    if(inData.startsWith("f2t"))
    {
      outData = "{\"f\":\"f2\",\"t\":19.2,\"r\":"+String(r2)+"}";
    }
    if(inData.startsWith("f1r"))
    {
      r1=!r1;
      outData ="n/r";
    }
    if(inData.startsWith("f2r"))
    {
      r2=!r2;
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

void establishContact() {
  while (Serial.available() <= 0 && serialAvailable==false) {
    Serial.println("ready");   
    serialAvailable=true;
    delay(300);
  }
}

