import time
import board
import busio
import smbus2
import RPi.GPIO as GPIO
import requests
import os
import uuid
from adafruit_ads1x15.ads1115 import ADS1115
from adafruit_ads1x15.analog_in import AnalogIn
from w1thermsensor import W1ThermSensor
from luma.core.interface.serial import spi
from luma.led_matrix.device import max7219
from luma.core.render import canvas
from dotenv import load_dotenv

# Cargar variables de entorno
load_dotenv()

# ==================== FUNCIÓN PARA OBTENER/GENERAR SERIAL ÚNICO ====================

def get_or_create_device_serial():
    """
    Obtiene o genera un serial único para el dispositivo.
    Prioridad:
    1. DEVICE_SERIAL del .env
    2. Serial de CPU de Raspberry Pi
    3. UUID guardado en archivo (persistente)
    4. Nuevo UUID generado
    """
    # 1. Intentar desde variable de entorno
    env_serial = os.getenv("DEVICE_SERIAL")
    if env_serial and env_serial.strip():
        print(f"Usando DEVICE_SERIAL del .env: {env_serial}")
        return env_serial.strip()
    
    # 2. Intentar leer serial de CPU de Raspberry Pi
    try:
        with open('/proc/cpuinfo', 'r') as f:
            for line in f:
                if line.startswith('Serial'):
                    cpu_serial = line.split(':')[1].strip()
                    if cpu_serial and len(cpu_serial) > 0:
                        # Formatear como "RPI-XXXXXXXX"
                        formatted_serial = f"RPI-{cpu_serial[-8:].upper()}"
                        print(f"Usando serial de CPU: {formatted_serial}")
                        return formatted_serial
    except Exception as e:
        print(f"No se pudo leer serial de CPU: {e}")
    
    # 3. Intentar leer UUID guardado en archivo (persistente)
    serial_file = os.path.join(os.path.dirname(__file__), '.device_serial')
    try:
        if os.path.exists(serial_file):
            with open(serial_file, 'r') as f:
                saved_serial = f.read().strip()
                if saved_serial:
                    print(f"Usando serial guardado: {saved_serial}")
                    return saved_serial
    except Exception as e:
        print(f"No se pudo leer archivo de serial: {e}")
    
    # 4. Generar nuevo UUID y guardarlo
    new_serial = f"RPI-{str(uuid.uuid4()).replace('-', '').upper()[:12]}"
    try:
        with open(serial_file, 'w') as f:
            f.write(new_serial)
        print(f"Nuevo serial generado y guardado: {new_serial}")
    except Exception as e:
        print(f"No se pudo guardar serial en archivo: {e}")
        print(f"Usando serial temporal: {new_serial}")
    
    return new_serial

# ==================== CONFIGURACIÓN ====================

# Backend URL
BACKEND_URL = os.getenv("BACKEND_URL", "https://ecoabackendecoa.vercel.app")
PLANT_ID = os.getenv("PLANT_ID", None)
DEVICE_SERIAL = get_or_create_device_serial()  # Siempre tendrá un valor
DEVICE_MODEL = os.getenv("DEVICE_MODEL", "Raspberry Pi")
DEVICE_LOCATION = os.getenv("DEVICE_LOCATION", "Unknown location")
FOUNDATION_ID = os.getenv("FOUNDATION_ID", None)

# Validar variable de entorno
if not BACKEND_URL:
    raise ValueError("Falta BACKEND_URL en el archivo .env")

# Mostrar información del dispositivo
print(f"Device Serial: {DEVICE_SERIAL}")
print(f"Device Model: {DEVICE_MODEL}")
print(f"Device Location: {DEVICE_LOCATION}")

# GPIO para sensor de humedad digital
DIGITAL_PIN = 17
GPIO.setmode(GPIO.BCM)
GPIO.setup(DIGITAL_PIN, GPIO.IN)

# I2C y ADC (Humedad del suelo)
i2c = busio.I2C(board.SCL, board.SDA)
ads = ADS1115(i2c)
chan = AnalogIn(ads, 0)

# Sensor de luminosidad BH1750
BH1750_ADDRESS = 0x23
BH1750_CONTINUOUS_HIGH_RES_MODE = 0x10
bus = smbus2.SMBus(1)

# Sensor de temperatura DS18B20
temp_sensor = W1ThermSensor()

# LED Matrix 8x8 MAX7219
serial = spi(port=0, device=0)
device = max7219(serial, cascaded=1, block_orientation=0, rotate=0)

# ==================== LÓGICA DE NEGOCIO ====================

def calculate_plant_status(temperatura, luminosidad, humedad):
    """
    Calcula el estado de la planta basado en los valores de los sensores.
    
    Retorna: 'healthy', 'bad', o 'recovering'
    """
    # Rangos ideales (ajusta según tu tipo de planta)
    TEMP_MIN, TEMP_MAX = 18, 28  # °C
    LIGHT_MIN, LIGHT_MAX = 200, 800  # lx
    HUMIDITY_MIN, HUMIDITY_MAX = 40, 70  # %
    
    problems = 0
    warnings = 0
    
    # Evaluar temperatura
    if temperatura < TEMP_MIN - 5 or temperatura > TEMP_MAX + 5:
        problems += 1
    elif temperatura < TEMP_MIN or temperatura > TEMP_MAX:
        warnings += 1
    
    # Evaluar luminosidad
    if luminosidad < LIGHT_MIN * 0.5 or luminosidad > LIGHT_MAX * 1.5:
        problems += 1
    elif luminosidad < LIGHT_MIN or luminosidad > LIGHT_MAX:
        warnings += 1
    
    # Evaluar humedad
    if humedad < HUMIDITY_MIN - 15 or humedad > HUMIDITY_MAX + 15:
        problems += 1
    elif humedad < HUMIDITY_MIN or humedad > HUMIDITY_MAX:
        warnings += 1
    
    # Determinar estado
    if problems >= 2:
        return 'bad'
    elif problems == 1 or warnings >= 2:
        return 'recovering'
    else:
        return 'healthy'

# ==================== FUNCIONES DE LECTURA ====================

def read_soil_moisture():
    """Lee humedad del suelo (analógico y digital)"""
    try:
        value = chan.value
        volts = chan.voltage
        humedad = round(100 - (value / 32767.0) * 100, 2)
        estado_digital = GPIO.input(DIGITAL_PIN)
        estado_str = "HÚMEDO" if estado_digital == 0 else "SECO"
        
        return {
            "humedad_porcentaje": humedad,
            "voltaje": round(volts, 2),
            "estado_digital": estado_str
        }
    except Exception as e:
        print(f"Error leyendo humedad: {e}")
        return None

def read_light():
    """Lee luminosidad con BH1750"""
    try:
        bus.write_byte(BH1750_ADDRESS, BH1750_CONTINUOUS_HIGH_RES_MODE)
        time.sleep(0.2)
        data = bus.read_i2c_block_data(BH1750_ADDRESS, 0x00, 2)
        light_level = ((data[0] << 8) | data[1]) / 1.2
        return round(light_level, 2)
    except Exception as e:
        print(f"Error leyendo luminosidad: {e}")
        return None

def read_temperature():
    """Lee temperatura con DS18B20"""
    try:
        temperature = temp_sensor.get_temperature()
        return round(temperature, 2)
    except Exception as e:
        print(f"Error leyendo temperatura: {e}")
        return None

# ==================== COMUNICACIÓN CON BACKEND ====================

def send_sensor_data_to_backend(temperatura, luminosidad, humedad, plant_id=None):
    """
    Envía datos de sensores al BACKEND con el campo 'status' calculado.
    """
    try:
        # Calcular el estado de la planta
        status = calculate_plant_status(temperatura, luminosidad, humedad)
        
        data = {
            "temperature": temperatura,
            "light": luminosidad,
            "soil_moisture": humedad,
            "status": status,  # 'healthy', 'bad', o 'recovering'
            "recorded_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
        }
        
        # Agregar plant_id si está disponible
        target_plant_id = plant_id or PLANT_ID
        if target_plant_id:
            data["plant_id"] = target_plant_id
        
        # Siempre incluir device_serial (ahora siempre tiene valor)
        data["device_serial"] = DEVICE_SERIAL
        if DEVICE_MODEL:
            data["device_model"] = DEVICE_MODEL
        if DEVICE_LOCATION:
            data["device_location"] = DEVICE_LOCATION
        if FOUNDATION_ID:
            data["foundation_id"] = FOUNDATION_ID
        
        print(f"Enviando datos al backend...")
        print(f"   Status calculado: {status}")
        
        response = requests.post(
            f"{BACKEND_URL}/sensor-data",
            json=data,
            headers={"Content-Type": "application/json"},
            timeout=10
        )
        
        if response.status_code in [200, 201]:
            print("Datos enviados correctamente")
            result = response.json()
            if result.get("success"):
                print(f"   Respuesta: {result.get('message', 'OK')}")
            return True
        else:
            print(f"Error del backend: {response.status_code}")
            print(f"   Respuesta: {response.text}")
            return False
            
    except requests.exceptions.Timeout:
        print("Timeout: el backend tardó demasiado en responder")
        return False
    except requests.exceptions.ConnectionError:
        print("Error de conexión: no se puede alcanzar el backend")
        return False
    except Exception as e:
        print(f"Excepción enviando al backend: {e}")
        return False

def get_emoji_from_backend(plant_id=None):
    """
    Obtiene el emoji calculado desde el backend.
    """
    try:
        url = f"{BACKEND_URL}/emoji"
        target_plant_id = plant_id or PLANT_ID
        if target_plant_id:
            url = f"{url}?plant_id={target_plant_id}"
        
        response = requests.get(url, timeout=5)
        
        if response.status_code == 200:
            data = response.json()
            return data.get("matrix")
        else:
            print(f"Error obteniendo emoji: {response.status_code}")
            return None
            
    except Exception as e:
        print(f"Excepción obteniendo emoji: {e}")
        return None

# ==================== DISPLAY LED ====================

def display_matrix(matrix):
    """Muestra una matriz 8x8 en el LED"""
    if matrix and len(matrix) == 8:
        with canvas(device) as draw:
            for y, row in enumerate(matrix):
                for x, pixel in enumerate(row):
                    if pixel:
                        draw.point((x, y), fill="white")
    else:
        print("Matriz inválida recibida")

# ==================== EMOJIS POR DEFECTO ====================

default_emojis = {
    'healthy': [
        [0,0,1,1,1,1,0,0],
        [0,1,0,0,0,0,1,0],
        [1,0,1,0,0,1,0,1],
        [1,0,0,0,0,0,0,1],
        [1,0,1,0,0,1,0,1],
        [1,0,0,1,1,0,0,1],
        [0,1,0,0,0,0,1,0],
        [0,0,1,1,1,1,0,0]
    ],
    'recovering': [
        [0,0,1,1,1,1,0,0],
        [0,1,0,0,0,0,1,0],
        [1,0,1,0,0,1,0,1],
        [1,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,1],
        [1,0,1,1,1,1,0,1],
        [0,1,0,0,0,0,1,0],
        [0,0,1,1,1,1,0,0]
    ],
    'bad': [
        [0,0,1,1,1,1,0,0],
        [0,1,0,0,0,0,1,0],
        [1,0,1,0,0,1,0,1],
        [1,0,0,0,0,0,0,1],
        [1,0,0,1,1,0,0,1],
        [1,0,1,0,0,1,0,1],
        [0,1,0,0,0,0,1,0],
        [0,0,1,1,1,1,0,0]
    ]
}

# ==================== LOOP PRINCIPAL ====================

def main():
    print("Sistema de monitoreo de plantas iniciado")
    print(f"Backend: {BACKEND_URL}")
    print(f"Device Serial: {DEVICE_SERIAL}")
    if PLANT_ID:
        print(f"Plant ID: {PLANT_ID}")
    print("=" * 60)
    print("Flujo del sistema:")
    print("  1. Raspberry lee sensores cada 5 segundos")
    print("  2. Calcula el estado: healthy/recovering/bad")
    print("  3. Envía datos al backend (con status)")
    print("  4. Obtiene emoji del backend")
    print("  5. Muestra emoji en LED 8x8")
    print("=" * 60)
    
    last_sensor_read = 0
    last_emoji_check = 0
    current_status = 'healthy'
    
    SENSOR_INTERVAL = 5  # segundos
    EMOJI_INTERVAL = 3   # segundos
    
    try:
        while True:
            current_time = time.time()
            
            # ========== LEER Y ENVIAR SENSORES ==========
            if current_time - last_sensor_read >= SENSOR_INTERVAL:
                print("\n" + "─" * 60)
                print("Leyendo sensores...")
                
                temperatura = read_temperature()
                luminosidad = read_light()
                humedad_suelo = read_soil_moisture()
                
                if temperatura is not None:
                    print(f"  Temperatura: {temperatura}°C")
                if luminosidad is not None:
                    print(f"  Luminosidad: {luminosidad} lx")
                if humedad_suelo:
                    print(f"  Humedad: {humedad_suelo['humedad_porcentaje']}% ({humedad_suelo['estado_digital']})")
                
                # Enviar al backend si tenemos todos los datos
                if all([temperatura is not None, luminosidad is not None, humedad_suelo is not None]):
                    success = send_sensor_data_to_backend(
                        temperatura=temperatura,
                        luminosidad=luminosidad,
                        humedad=humedad_suelo['humedad_porcentaje']
                    )
                    
                    # Guardar el estado actual para usar emoji por defecto
                    if success:
                        current_status = calculate_plant_status(
                            temperatura, luminosidad, humedad_suelo['humedad_porcentaje']
                        )
                else:
                    print("Datos incompletos, no se envía al backend")
                
                last_sensor_read = current_time
            
            # ========== ACTUALIZAR EMOJI ==========
            if current_time - last_emoji_check >= EMOJI_INTERVAL:
                emoji_matrix = get_emoji_from_backend()
                
                if emoji_matrix:
                    print("Mostrando emoji del backend")
                    display_matrix(emoji_matrix)
                else:
                    print(f"Sin conexión, mostrando emoji por defecto ({current_status})")
                    display_matrix(default_emojis[current_status])
                
                last_emoji_check = current_time
            
            time.sleep(0.5)
            
    except KeyboardInterrupt:
        print("\n\nSistema detenido por el usuario")
    except Exception as e:
        print(f"\nError crítico: {e}")
        import traceback
        traceback.print_exc()
    finally:
        device.clear()
        GPIO.cleanup()
        print("Limpieza completada")

if __name__ == "__main__":
    main()