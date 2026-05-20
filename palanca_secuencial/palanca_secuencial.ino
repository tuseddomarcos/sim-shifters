/**
 * Palanca de Cambios Secuencial - Pro Micro (ATmega32U4)
 *
 * Simula un shifter secuencial como joystick USB HID.
 * Requiere: ArduinoJoystickLibrary by MHeironimus
 *   https://github.com/MHeironimus/ArduinoJoystickLibrary
 *
 * Conexiones:
 *   Común       -> GND
 *   Subir gear  -> Pin 6
 *   Bajar gear  -> Pin 3
 *
 * Botón 0 = Subir  (Pin 6)
 * Botón 1 = Bajar  (Pin 3)
 */

#include <Joystick.h>

// Joystick con 2 botones, sin ejes
Joystick_ Joystick(
  JOYSTICK_DEFAULT_REPORT_ID,
  JOYSTICK_TYPE_JOYSTICK,
  2,     // número de botones
  0,     // hat switches
  false, false, false,  // X, Y, Z
  false, false, false,  // Rx, Ry, Rz
  false, false,         // Rudder, Throttle
  false, false, false   // Accelerator, Brake, Steering
);

const int PIN_SUBIR = 6;
const int PIN_BAJAR = 3;

// Estado anterior para detección de cambio
bool estadoAnterior[2] = {false, false};

void setup() {
  pinMode(PIN_SUBIR, INPUT_PULLUP);
  pinMode(PIN_BAJAR, INPUT_PULLUP);

  Joystick.begin(false); // false = envío manual con sendState()
}

void loop() {
  bool subir = !digitalRead(PIN_SUBIR); // LOW cuando pulsado (pull-up + común a GND)
  bool bajar = !digitalRead(PIN_BAJAR);

  // Solo enviar si cambió el estado (reduce tráfico USB)
  if (subir != estadoAnterior[0] || bajar != estadoAnterior[1]) {
    Joystick.setButton(0, subir);
    Joystick.setButton(1, bajar);
    Joystick.sendState();

    estadoAnterior[0] = subir;
    estadoAnterior[1] = bajar;
  }

  delay(10); // ~100 Hz polling
}
