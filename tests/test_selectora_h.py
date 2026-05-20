"""
Tests para selectora_h.ino
Verifican que el código fuente cumple la especificación de hardware:
  - 9 botones HID (pines 2 al 10)
  - Usa INPUT_PULLUP (común a GND)
  - Lógica activo bajo (negación del digitalRead)
  - Envía estado solo cuando hay cambio
  - Todos los pines 2-10 están declarados
"""

import re
from pathlib import Path

INO = Path(__file__).parent.parent / "selectora_h" / "selectora_h.ino"


def source() -> str:
    return INO.read_text(encoding="utf-8")


# ── Existencia del archivo ────────────────────────────────────────────────────

def test_archivo_existe():
    assert INO.exists(), f"No se encontró {INO}"


# ── Dependencia HID ───────────────────────────────────────────────────────────

def test_incluye_joystick_library():
    assert '#include <Joystick.h>' in source(), \
        "Debe incluir la ArduinoJoystickLibrary (#include <Joystick.h>)"


# ── Número de botones ─────────────────────────────────────────────────────────

def test_num_botones_es_9():
    assert re.search(r'NUM_BOTONES\s*=\s*9', source()), \
        "NUM_BOTONES debe ser 9 (pines 2 al 10)"


def test_joystick_constructor_usa_num_botones():
    match = re.search(r'Joystick_\s*\([^)]+\)', source(), re.DOTALL)
    assert match, "No se encontró el constructor Joystick_()"
    assert 'NUM_BOTONES' in match.group(), \
        "El constructor debe usar NUM_BOTONES como cantidad de botones"


# ── Pines declarados ──────────────────────────────────────────────────────────

def test_pines_2_al_10_declarados():
    """Todos los pines del 2 al 10 deben estar en el array PINES."""
    src = source()
    match = re.search(r'PINES\s*\[.*?\]\s*=\s*\{([^}]+)\}', src, re.DOTALL)
    assert match, "No se encontró el array PINES[]"
    valores = [int(v.strip()) for v in match.group(1).split(',') if v.strip().isdigit()]
    for pin in range(2, 11):  # 2..10 inclusive
        assert pin in valores, f"Pin {pin} no está declarado en PINES[]"


def test_pines_son_exactamente_9():
    src = source()
    match = re.search(r'PINES\s*\[.*?\]\s*=\s*\{([^}]+)\}', src, re.DOTALL)
    assert match, "No se encontró el array PINES[]"
    valores = [v.strip() for v in match.group(1).split(',') if v.strip()]
    assert len(valores) == 9, \
        f"PINES[] debe tener exactamente 9 elementos, tiene {len(valores)}"


# ── Configuración INPUT_PULLUP ────────────────────────────────────────────────

def test_usa_input_pullup_en_loop():
    assert 'INPUT_PULLUP' in source(), \
        "Debe usar INPUT_PULLUP para todos los pines (común a GND)"


def test_configura_pines_en_setup():
    src = source()
    assert re.search(r'void\s+setup\s*\(\s*\)', src), "Falta función setup()"
    # Dentro de setup debe haber un for que configura los pines
    assert re.search(r'for\s*\(.*\)', src, re.DOTALL), \
        "setup() debe usar un bucle for para configurar los pines"


# ── Lógica activo bajo ────────────────────────────────────────────────────────

def test_logica_activo_bajo():
    """Con pull-up + común a GND, LOW = pulsado → se niega el digitalRead."""
    assert '!digitalRead(PINES[i])' in source() or \
           '! digitalRead(PINES[i])' in source(), \
        "La lectura debe invertirse: !digitalRead(PINES[i]) (activo bajo)"


# ── Mapeo de botones HID ──────────────────────────────────────────────────────

def test_setbutton_usa_indice_i():
    assert re.search(r'setButton\s*\(\s*i\s*,', source()), \
        "Joystick.setButton debe usar el índice i del bucle"


# ── Optimización USB ──────────────────────────────────────────────────────────

def test_send_state_condicional():
    src = source()
    assert 'cambio' in src, \
        "Debe existir una variable 'cambio' para envío condicional del reporte"
    assert 'if (cambio)' in src or 'if(cambio)' in src, \
        "sendState() debe ejecutarse solo si hubo cambio de estado"
    assert 'Joystick.sendState()' in src, \
        "Debe llamar a Joystick.sendState()"


def test_estado_anterior_declarado():
    assert 'estadoAnterior' in source(), \
        "Debe existir array estadoAnterior[] para comparar cambios"


# ── Polling ───────────────────────────────────────────────────────────────────

def test_tiene_delay():
    assert re.search(r'delay\s*\(\s*10\s*\)', source()), \
        "Debe tener delay(10) para polling a ~100 Hz"
