/**
 * Tests para selectora_h.ino
 * Ejecutar con: node --test tests/test_selectora_h.mjs
 *
 * Verifica que el código cumple la especificación de hardware:
 *   - 9 botones HID (pines 2 al 10)
 *   - INPUT_PULLUP (común a GND → activo bajo)
 *   - Todos los pines 2-10 declarados en PINES[]
 *   - Envío condicional de estado HID
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const INO_PATH = join(ROOT, 'selectora_h', 'selectora_h.ino');

function src() {
  return readFileSync(INO_PATH, 'utf-8');
}

// ── Existencia del archivo ────────────────────────────────────────────────────

test('El archivo selectora_h.ino existe', () => {
  assert.ok(existsSync(INO_PATH), `No se encontró ${INO_PATH}`);
});

// ── Dependencia HID ───────────────────────────────────────────────────────────

test('Incluye ArduinoJoystickLibrary', () => {
  assert.ok(src().includes('#include <Joystick.h>'),
    'Debe incluir #include <Joystick.h>');
});

// ── Número de botones ─────────────────────────────────────────────────────────

test('NUM_BOTONES es 9', () => {
  assert.ok(/NUM_BOTONES\s*=\s*9/.test(src()),
    'NUM_BOTONES debe ser 9 (pines 2 al 10)');
});

test('Constructor Joystick_ usa NUM_BOTONES', () => {
  // El constructor es: Joystick_ Joystick( ... );
  const match = src().match(/Joystick_\s+\w+\s*\(([^;]+?)\);/s);
  assert.ok(match, 'No se encontró el constructor Joystick_()');
  assert.ok(match[1].includes('NUM_BOTONES'),
    'El constructor debe referenciar NUM_BOTONES');
});

// ── Pines declarados ──────────────────────────────────────────────────────────

test('PINES[] contiene exactamente los pines 2 al 10', () => {
  const match = src().match(/PINES\s*\[.*?\]\s*=\s*\{([^}]+)\}/s);
  assert.ok(match, 'No se encontró el array PINES[]');

  const valores = match[1]
    .split(',')
    .map(v => parseInt(v.trim(), 10))
    .filter(n => !isNaN(n));

  assert.equal(valores.length, 9, `PINES[] debe tener 9 elementos, tiene ${valores.length}`);

  for (let pin = 2; pin <= 10; pin++) {
    assert.ok(valores.includes(pin), `Pin ${pin} no está en PINES[]`);
  }
});

// ── INPUT_PULLUP ──────────────────────────────────────────────────────────────

test('Usa INPUT_PULLUP para todos los pines', () => {
  assert.ok(src().includes('INPUT_PULLUP'),
    'Debe usar INPUT_PULLUP (común a GND)');
});

test('Configura pines con bucle for en setup()', () => {
  assert.ok(/void\s+setup\s*\(\s*\)/.test(src()), 'Falta función setup()');
  assert.ok(/for\s*\(/.test(src()), 'setup() debe usar un for para configurar pines');
});

// ── Lógica activo bajo ────────────────────────────────────────────────────────

test('Lectura es activo bajo: !digitalRead(PINES[i])', () => {
  assert.ok(src().includes('!digitalRead(PINES[i])'),
    'Con INPUT_PULLUP + GND debe invertirse: !digitalRead(PINES[i])');
});

// ── Mapeo de botones HID ──────────────────────────────────────────────────────

test('setButton usa índice i del bucle', () => {
  assert.ok(/setButton\s*\(\s*i\s*,/.test(src()),
    'Joystick.setButton(i, ...) debe usar el índice del bucle');
});

// ── Optimización USB ──────────────────────────────────────────────────────────

test('Usa variable cambio para envío condicional', () => {
  assert.ok(src().includes('cambio'),
    'Debe existir una variable cambio para evitar envíos innecesarios');
});

test('sendState() solo si hay cambio', () => {
  assert.ok(/if\s*\(\s*cambio\s*\)/.test(src()),
    'Joystick.sendState() debe ejecutarse solo dentro de if (cambio)');
});

test('Llama a Joystick.sendState()', () => {
  assert.ok(src().includes('Joystick.sendState()'),
    'Debe enviar el reporte HID con sendState()');
});

test('Usa estadoAnterior[] para comparar cambios', () => {
  assert.ok(src().includes('estadoAnterior'),
    'Debe existir estadoAnterior[] para detectar cambios de estado');
});

// ── Polling ───────────────────────────────────────────────────────────────────

test('Tiene delay(10) para polling a ~100 Hz', () => {
  assert.ok(/delay\s*\(\s*10\s*\)/.test(src()),
    'Debe tener delay(10)');
});
