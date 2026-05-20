/**
 * Selectora H (H-Pattern Shifter) - Pro Micro (ATmega32U4)
 *
 * Simula una caja de cambios en H como joystick USB HID.
 * Requiere: ArduinoJoystickLibrary by MHeironimus
 *   https://github.com/MHeironimus/ArduinoJoystickLibrary
 *
 * Conexiones:
 *   Común  -> GND
 *   Pin 2  -> Botón 0 (1ª marcha)
 *   Pin 3  -> Botón 1 (2ª marcha)
 *   Pin 4  -> Botón 2 (3ª marcha)
 *   Pin 5  -> Botón 3 (4ª marcha)
 *   Pin 6  -> Botón 4 (5ª marcha)
 *   Pin 7  -> Botón 5 (6ª marcha)
 *   Pin 8  -> Botón 6 (7ª marcha)
 *   Pin 9  -> Botón 7 (Reversa)
 *   Pin 10 -> Botón 8 (Neutro)
 *
 * Nota: ajusta el mapeo de marchas según tu layout físico de la H.
 */

#include <Joystick.h>

const int NUM_BOTONES = 9;

// Joystick con 9 botones, sin ejes
Joystick_ Joystick(
  JOYSTICK_DEFAULT_REPORT_ID,
  JOYSTICK_TYPE_JOYSTICK,
  NUM_BOTONES, // número de botones
  0,           // hat switches
  false, false, false,  // X, Y, Z
  false, false, false,  // Rx, Ry, Rz
  false, false,         // Rudder, Throttle
  false, false, false   // Accelerator, Brake, Steering
);

// Pines físicos en orden de botón 0..8
const int PINES[NUM_BOTONES] = {2, 3, 4, 5, 6, 7, 8, 9, 10};

// Nombres para referencia (no usados en código, solo documentación)
// const char* NOMBRES[NUM_BOTONES] = {
//   "1a", "2a", "3a", "4a", "5a", "6a", "7a", "R", "N"
// };

// Estado anterior para detección de cambio
bool estadoAnterior[NUM_BOTONES];

void setup() {
  for (int i = 0; i < NUM_BOTONES; i++) {
    pinMode(PINES[i], INPUT_PULLUP);
    estadoAnterior[i] = false;
  }

  Joystick.begin(false); // false = envío manual con sendState()
}

void loop() {
  bool cambio = false;

  for (int i = 0; i < NUM_BOTONES; i++) {
    bool pulsado = !digitalRead(PINES[i]); // LOW cuando pulsado (pull-up + común a GND)

    if (pulsado != estadoAnterior[i]) {
      Joystick.setButton(i, pulsado);
      estadoAnterior[i] = pulsado;
      cambio = true;
    }
  }

  // Solo enviar reporte USB si hubo cambio
  if (cambio) {
    Joystick.sendState();
  }

  delay(10); // ~100 Hz polling
}
