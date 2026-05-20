"""
Tests para palanca_secuencial.ino
Verifican que el código fuente cumple la especificación de hardware:
  - Pin 6 = Subir (botón 0)
  - Pin 3 = Bajar  (botón 1)
  - 2 botones HID
  - Usa INPUT_PULLUP (común a GND)
  - Envía estado solo cuando hay cambio
"""

import re
from pathlib import Path

INO = Path(__file__).parent.parent / "palanca_secuencial" / "palanca_secuencial.ino"


def source() -> str:
    return INO.read_text(encoding="utf-8")


# ── Existencia del archivo ────────────────────────────────────────────────────

def test_archivo_existe():
    assert INO.exists(), f"No se encontró {INO}"


# ── Dependencia HID ───────────────────────────────────────────────────────────

def test_incluye_joystick_library():
    assert '#include <Joystick.h>' in source(), \
        "Debe incluir la ArduinoJoystickLibrary (#include <Joystick.h>)"


# ── Configuración del joystick ────────────────────────────────────────────────

def test_joystick_tiene_2_botones():
    """El tercer argumento del constructor Joystick_ es el número de botones."""
    match = re.search(r'Joystick_\s*\([^)]+\)', source(), re.DOTALL)
    assert match, "No se encontró el constructor Joystick_()"
    args = [a.strip() for a in match.group().split(',')]
    # args[2] = número de botones (índice 2 dentro de los parámetros)
    assert '2' in args[2], \
        f"Se esperaban 2 botones, se encontró: {args[2]}"


# ── Pines ─────────────────────────────────────────────────────────────────────

def test_pin_subir_es_6():
    assert re.search(r'PIN_SUBIR\s*=\s*6', source()), \
        "PIN_SUBIR debe estar asignado al pin 6"


def test_pin_bajar_es_3():
    assert re.search(r'PIN_BAJAR\s*=\s*3', source()), \
        "PIN_BAJAR debe estar asignado al pin 3"


# ── Configuración de pines ────────────────────────────────────────────────────

def test_usa_input_pullup_en_subir():
    assert re.search(r'pinMode\s*\(\s*PIN_SUBIR\s*,\s*INPUT_PULLUP\s*\)', source()), \
        "PIN_SUBIR debe configurarse como INPUT_PULLUP (común a GND)"


def test_usa_input_pullup_en_bajar():
    assert re.search(r'pinMode\s*\(\s*PIN_BAJAR\s*,\s*INPUT_PULLUP\s*\)', source()), \
        "PIN_BAJAR debe configurarse como INPUT_PULLUP (común a GND)"


# ── Lógica de lectura ─────────────────────────────────────────────────────────

def test_logica_activo_bajo():
    """Con pull-up + común a GND, el botón activo es LOW → negación con '!'."""
    assert '!digitalRead(PIN_SUBIR)' in source() or \
           '! digitalRead(PIN_SUBIR)' in source(), \
        "La lectura de PIN_SUBIR debe invertirse (activo bajo con INPUT_PULLUP)"
    assert '!digitalRead(PIN_BAJAR)' in source() or \
           '! digitalRead(PIN_BAJAR)' in source(), \
        "La lectura de PIN_BAJAR debe invertirse (activo bajo con INPUT_PULLUP)"


# ── Optimización USB ──────────────────────────────────────────────────────────

def test_send_state_condicional():
    """El reporte HID solo se envía cuando hay un cambio de estado."""
    src = source()
    assert 'estadoAnterior' in src, \
        "Debe existir un array/variable estadoAnterior para comparar cambios"
    assert 'Joystick.sendState()' in src, \
        "Debe llamar a Joystick.sendState() para enviar el reporte HID"


# ── Botones HID correctos ─────────────────────────────────────────────────────

def test_boton_0_es_subir():
    assert re.search(r'setButton\s*\(\s*0\s*,\s*subir\s*\)', source()), \
        "El botón HID 0 debe mapearse a 'subir'"


def test_boton_1_es_bajar():
    assert re.search(r'setButton\s*\(\s*1\s*,\s*bajar\s*\)', source()), \
        "El botón HID 1 debe mapearse a 'bajar'"


# ── Polling ───────────────────────────────────────────────────────────────────

def test_tiene_delay():
    assert re.search(r'delay\s*\(\s*10\s*\)', source()), \
        "Debe tener delay(10) para polling a ~100 Hz"
