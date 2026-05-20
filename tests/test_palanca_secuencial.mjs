/**
 * Tests para palanca_secuencial.ino
 * Ejecutar con: node --test tests/test_palanca_secuencial.mjs
 *
 * Verifica que el código cumple la especificación de hardware:
 *   - Pin 6 = Subir (botón HID 0)
 *   - Pin 3 = Bajar  (botón HID 1)
 *   - 2 botones HID
 *   - INPUT_PULLUP (común a GND → activo bajo)
 *   - Envío condicional de estado HID
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const INO_PATH = join(ROOT, 'palanca_secuencial', 'palanca_secuencial.ino');

function src() {
  return readFileSync(INO_PATH, 'utf-8');
}

// ── Existencia del archivo ────────────────────────────────────────────────────

test('El archivo palanca_secuencial.ino existe', () => {
  assert.ok(existsSync(INO_PATH), `No se encontró ${INO_PATH}`);
});

// ── Dependencia HID ───────────────────────────────────────────────────────────

test('Incluye ArduinoJoystickLibrary', () => {
  assert.ok(src().includes('#include <Joystick.h>'),
    'Debe incluir #include <Joystick.h>');
});

// ── Configuración del joystick ────────────────────────────────────────────────

test('Joystick declara 2 botones', () => {
  // El constructor es: Joystick_ Joystick( ... )
  const match = src().match(/Joystick_\s+\w+\s*\(([^;]+?)\);/s);
  assert.ok(match, 'No se encontró el constructor Joystick_()');
  const args = match[1].split(',').map(s => s.trim());
  // 3er argumento (índice 2) = número de botones
  assert.ok(args[2].includes('2'), `Se esperaban 2 botones, se encontró: ${args[2]}`);
});

// ── Pines ─────────────────────────────────────────────────────────────────────

test('PIN_SUBIR está asignado al pin 6', () => {
  assert.ok(/PIN_SUBIR\s*=\s*6/.test(src()),
    'PIN_SUBIR debe ser el pin 6');
});

test('PIN_BAJAR está asignado al pin 3', () => {
  assert.ok(/PIN_BAJAR\s*=\s*3/.test(src()),
    'PIN_BAJAR debe ser el pin 3');
});

// ── INPUT_PULLUP ──────────────────────────────────────────────────────────────

test('PIN_SUBIR configurado como INPUT_PULLUP', () => {
  assert.ok(/pinMode\s*\(\s*PIN_SUBIR\s*,\s*INPUT_PULLUP\s*\)/.test(src()),
    'PIN_SUBIR debe usar INPUT_PULLUP (común a GND)');
});

test('PIN_BAJAR configurado como INPUT_PULLUP', () => {
  assert.ok(/pinMode\s*\(\s*PIN_BAJAR\s*,\s*INPUT_PULLUP\s*\)/.test(src()),
    'PIN_BAJAR debe usar INPUT_PULLUP (común a GND)');
});

// ── Lógica activo bajo ────────────────────────────────────────────────────────

test('Lectura de PIN_SUBIR es activo bajo (negación)', () => {
  assert.ok(src().includes('!digitalRead(PIN_SUBIR)'),
    'Con INPUT_PULLUP + GND debe invertirse: !digitalRead(PIN_SUBIR)');
});

test('Lectura de PIN_BAJAR es activo bajo (negación)', () => {
  assert.ok(src().includes('!digitalRead(PIN_BAJAR)'),
    'Con INPUT_PULLUP + GND debe invertirse: !digitalRead(PIN_BAJAR)');
});

// ── Mapeo de botones HID ──────────────────────────────────────────────────────

test('Botón HID 0 mapeado a subir', () => {
  assert.ok(/setButton\s*\(\s*0\s*,\s*subir\s*\)/.test(src()),
    'setButton(0, subir) debe mapear el botón de subir');
});

test('Botón HID 1 mapeado a bajar', () => {
  assert.ok(/setButton\s*\(\s*1\s*,\s*bajar\s*\)/.test(src()),
    'setButton(1, bajar) debe mapear el botón de bajar');
});

// ── Optimización USB ──────────────────────────────────────────────────────────

test('Usa estadoAnterior para comparar cambios', () => {
  assert.ok(src().includes('estadoAnterior'),
    'Debe existir estadoAnterior[] para envío condicional');
});

test('Llama a Joystick.sendState()', () => {
  assert.ok(src().includes('Joystick.sendState()'),
    'Debe enviar el reporte HID con sendState()');
});

// ── Polling ───────────────────────────────────────────────────────────────────

test('Tiene delay(10) para polling a ~100 Hz', () => {
  assert.ok(/delay\s*\(\s*10\s*\)/.test(src()),
    'Debe tener delay(10)');
});
