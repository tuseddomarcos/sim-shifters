# sim-shifters

Simuladores de cambios para simracing basados en **Pro Micro (ATmega32U4)**.
Se reconocen como joystick USB nativo en Windows, Linux y macOS — sin drivers adicionales.

Incluye dos proyectos independientes:

| Proyecto | Descripción | Botones HID |
|---|---|---|
| `palanca_secuencial` | Shifter secuencial (arriba / abajo) | 2 |
| `selectora_h` | Caja H de hasta 9 posiciones | 9 |

---

## Requisitos

### Hardware
- **Arduino Pro Micro** (ATmega32U4, 5 V o 3.3 V)
- Micro-switches o botones momentáneos (normalmente abiertos, NO)
- Cable USB Micro-B

### Software
- [Arduino IDE 2.x](https://www.arduino.cc/en/software) o superior
- Driver de placa **SparkFun Pro Micro** (ver sección [Instalar placa](#2-instalar-la-placa-pro-micro))
- Librería **ArduinoJoystickLibrary** (ver sección [Instalar librería](#3-instalar-la-librería-joystick))

---

## Instalación paso a paso

### 1. Instalar Arduino IDE

Descargá el instalador desde https://www.arduino.cc/en/software
Seguí el asistente con las opciones por defecto.

---

### 2. Instalar la placa Pro Micro

La Pro Micro no viene incluida en Arduino IDE. Hay que agregar el repositorio de SparkFun.

1. Abrí Arduino IDE.
2. Ir a **Archivo → Preferencias** (o `Ctrl + ,`).
3. En el campo **"URLs adicionales para el gestor de tarjetas"** pegá esta URL:

```
https://raw.githubusercontent.com/sparkfun/Arduino_Boards/main/IDE_Board_Manager/package_sparkfun_index.json
```

4. Hacer clic en **OK**.
5. Ir a **Herramientas → Placa → Gestor de tarjetas**.
6. Buscar `SparkFun AVR`.
7. Instalar **SparkFun AVR Boards**.

Para seleccionar la placa:
- **Herramientas → Placa → SparkFun AVR Boards → SparkFun Pro Micro**
- **Herramientas → Procesador → ATmega32U4 (5V, 16 MHz)** ← si tu Pro Micro es la versión 5 V
  (elegí 3.3 V, 8 MHz si tu placa dice 3.3 V)

---

### 3. Instalar la librería Joystick

1. Ir a **Herramientas → Administrar Bibliotecas**.
2. Buscar `Joystick`.
3. Instalar **"Joystick" de Matthew Heironimus**.

> Si no aparece, podés instalarla manualmente desde
> https://github.com/MHeironimus/ArduinoJoystickLibrary
> descargando el ZIP y usando **Programa → Incluir Biblioteca → Añadir biblioteca .ZIP**.

---

### 4. Cargar el sketch

1. Clonar o descargar este repositorio.
2. Abrir el `.ino` del proyecto que querés usar:
   - `palanca_secuencial/palanca_secuencial.ino`
   - `selectora_h/selectora_h.ino`
3. Conectar la Pro Micro por USB.
4. En **Herramientas → Puerto** seleccionar el puerto COM correspondiente.
5. Hacer clic en **Subir** (flecha →) o `Ctrl + U`.

> **Nota Pro Micro:** Si el IDE no reconoce la placa al conectarla, presioná el botón de reset dos veces rápido para entrar en modo bootloader (el LED RX/TX parpadea). Subí el sketch en esos pocos segundos.

---

## Esquemas de conexión

> **Principio general:** todos los botones tienen un terminal al **GND** de la Pro Micro y el otro terminal al pin de señal. El firmware usa `INPUT_PULLUP` interno, por lo que **no se necesitan resistencias externas**.

---

### Palanca Secuencial

```
Pro Micro
                         ┌─────────────────────────┐
                    GND ─┤ GND   [Pro Micro]        │
                         │                          │
  Botón SUBIR ───────────┤ Pin 6                    │
                         │                          │
  Botón BAJAR ───────────┤ Pin 3                    │
                         └─────────────────────────┘

Botón SUBIR:   un terminal → Pin 6   │  otro terminal → GND
Botón BAJAR:   un terminal → Pin 3   │  otro terminal → GND
```

| Terminal A | Terminal B | Función HID |
|---|---|---|
| Pin 6 | GND | Botón 0 — Subir marcha |
| Pin 3 | GND | Botón 1 — Bajar marcha |

---

### Selectora H

```
Pro Micro
                         ┌─────────────────────────┐
                    GND ─┤ GND   [Pro Micro]        │
                         │                          │
  1ª marcha  ────────────┤ Pin 2                    │
  2ª marcha  ────────────┤ Pin 3                    │
  3ª marcha  ────────────┤ Pin 4                    │
  4ª marcha  ────────────┤ Pin 5                    │
  5ª marcha  ────────────┤ Pin 6                    │
  6ª marcha  ────────────┤ Pin 7                    │
  7ª marcha  ────────────┤ Pin 8                    │
  Reversa    ────────────┤ Pin 9                    │
  Neutro     ────────────┤ Pin 10                   │
                         └─────────────────────────┘

Cada botón: un terminal al pin correspondiente, el otro terminal a GND.
```

| Pin | Marcha | Botón HID |
|---|---|---|
| Pin 2 | 1ª | 0 |
| Pin 3 | 2ª | 1 |
| Pin 4 | 3ª | 2 |
| Pin 5 | 4ª | 3 |
| Pin 6 | 5ª | 4 |
| Pin 7 | 6ª | 5 |
| Pin 8 | 7ª | 6 |
| Pin 9 | Reversa | 7 |
| Pin 10 | Neutro | 8 |

> El mapeo de pines puede cambiarse editando el array `PINES[]` en el sketch.

---

## Verificar que funciona

### Windows

1. Ir a **Panel de control → Dispositivos e impresoras**.
2. Hacer doble clic en el dispositivo **"Arduino Leonardo"** o **"SparkFun Pro Micro"**.
3. En la pestaña **"Probar"** verás los botones activarse al presionar cada switch.

O bien usando **joy.cpl**:
- Presionar `Win + R`, escribir `joy.cpl` y Enter.
- Seleccionar el dispositivo y hacer clic en **Propiedades**.

### Linux

```bash
# Ver el dispositivo
ls /dev/input/js*

# Probar botones en tiempo real
jstest /dev/input/js0
```

---

## Correr los tests

Los tests verifican la especificación de hardware contra el código fuente (no requieren placa conectada). Solo necesitás **Node.js 18+**.

```bash
node --test tests/test_palanca_secuencial.mjs
node --test tests/test_selectora_h.mjs

# O ambos juntos:
node --test tests/*.mjs
```

Salida esperada: `pass 28 / fail 0`

---

## Estructura del repositorio

```
sim-shifters/
├── palanca_secuencial/
│   └── palanca_secuencial.ino   # Sketch palanca secuencial
├── selectora_h/
│   └── selectora_h.ino          # Sketch selectora H
├── tests/
│   ├── test_palanca_secuencial.mjs   # 14 tests (Node.js)
│   └── test_selectora_h.mjs          # 14 tests (Node.js)
├── .gitignore
├── requirements.txt
└── README.md
```

---

## Licencia

MIT
