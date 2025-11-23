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
        print(f"✅ Usando DEVICE_SERIAL del .env: {env_serial}")
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
                        print(f"✅ Usando serial de CPU: {formatted_serial}")
                        return formatted_serial
    except Exception as e:
        print(f"⚠️  No se pudo leer serial de CPU: {e}")
    
    # 3. Intentar leer UUID guardado en archivo (persistente)
    serial_file = os.path.join(os.path.dirname(__file__), '.device_serial')
    try:
        if os.path.exists(serial_file):
            with open(serial_file, 'r') as f:
                saved_serial = f.read().strip()
                if saved_serial:
                    print(f"✅ Usando serial guardado: {saved_serial}")
                    return saved_serial
    except Exception as e:
        print(f"⚠️  No se pudo leer archivo de serial: {e}")
    
    # 4. Generar nuevo UUID y guardarlo
    new_serial = f"RPI-{str(uuid.uuid4()).replace('-', '').upper()[:12]}"
    try:
        with open(serial_file, 'w') as f:
            f.write(new_serial)
        print(f"✅ Nuevo serial generado y guardado: {new_serial}")
    except Exception as e:
        print(f"⚠️  No se pudo guardar serial en archivo: {e}")
        print(f"   Usando serial temporal: {new_serial}")
    
    return new_serial

# ==================== CONFIGURACIÓN ====================

# Backend URL
BACKEND_URL = os.getenv("BACKEND_URL", "https://ecoa-ruddy.vercel.app")
PLANT_ID = os.getenv("PLANT_ID", None)
DEVICE_SERIAL = get_or_create_device_serial()  # Siempre tendrá un valor
DEVICE_MODEL = os.getenv("DEVICE_MODEL", "Raspberry Pi")
DEVICE_LOCATION = os.getenv("DEVICE_LOCATION", "Unknown location")
FOUNDATION_ID = os.getenv("FOUNDATION_ID", None)

# Validar variable de entorno
if not BACKEND_URL:
    raise ValueError("⚠️  Falta BACKEND_URL en el archivo .env")

# Mostrar información del dispositivo
print(f"🆔 Device Serial: {DEVICE_SERIAL}")
print(f"📱 Device Model: {DEVICE_MODEL}")
print(f"📍 Device Location: {DEVICE_LOCATION}")

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

def normalize_sensor_values(temperatura, luminosidad, humedad):
    """
    Normaliza los valores de los sensores.
    
    Args:
        temperatura: Temperatura en °C
        luminosidad: Luminosidad (0-1023 o 0-1 según sensor)
        humedad: Humedad del suelo en %
    
    Returns:
        tuple: (temp, light, humidity) valores normalizados
    """
    # Normalizar temperatura: rango aceptable 15-35°C
    TEMP_MIN = 15
    TEMP_MAX = 35
    temp = max(TEMP_MIN, min(TEMP_MAX, temperatura))
    
    # Normalizar luz: si está en rango 0-1, convertir a 0-1023
    # Asumimos que valores > 1 están en escala 0-1023
    normalized_light = luminosidad
    if luminosidad <= 1:
        normalized_light = luminosidad * 1023
    normalized_light = max(0, min(1023, normalized_light))
    
    # Normalizar humedad: 0-100%
    humidity = max(0, min(100, humedad))
    
    return (temp, normalized_light, humidity)

def compute_mood(temperatura, luminosidad, humedad):
    """
    Función unificada para calcular el mood index y estado de la planta.
    Misma lógica que en JavaScript.
    
    Reglas:
    - bad si luz demasiado alta (>900) o demasiado baja (<100)
    - bad si temperatura demasiado alta (>35) o demasiado baja (<15)
    - bad si humedad demasiado alta (>80)
    - healthy si valores dentro de rango
    - recovering si humedad ligeramente alta (70-80)
    
    Args:
        temperatura: Temperatura en °C
        luminosidad: Luminosidad (0-1023 o 0-1 según sensor)
        humedad: Humedad del suelo en %
    
    Returns:
        str: 'healthy', 'bad', o 'recovering'
    """
    # Normalizar valores
    temp, normalized_light, humidity = normalize_sensor_values(temperatura, luminosidad, humedad)
    
    # Rangos aceptables
    TEMP_MIN = 15
    TEMP_MAX = 35
    LIGHT_MIN = 100  # Mínimo aceptable
    LIGHT_MAX = 900  # Máximo aceptable
    HUMIDITY_MAX_ACCEPTABLE = 80  # Máximo aceptable
    HUMIDITY_RECOVERING_MIN = 70  # Inicio de rango "recovering"
    
    # Evaluar condiciones críticas (bad)
    is_bad = False
    reasons = []
    
    # Temperatura fuera de rango
    if temp < TEMP_MIN or temp > TEMP_MAX:
        is_bad = True
        reasons.append(f"temperatura {'muy baja' if temp < TEMP_MIN else 'muy alta'}")
    
    # Luz fuera de rango
    if normalized_light < LIGHT_MIN or normalized_light > LIGHT_MAX:
        is_bad = True
        reasons.append(f"luz {'muy baja' if normalized_light < LIGHT_MIN else 'muy alta'}")
    
    # Humedad demasiado alta
    if humidity > HUMIDITY_MAX_ACCEPTABLE:
        is_bad = True
        reasons.append('humedad muy alta')
    
    # Si hay alguna condición crítica, retornar bad
    if is_bad:
        return 'bad'
    
    # Evaluar condición recovering (humedad ligeramente alta)
    if HUMIDITY_RECOVERING_MIN <= humidity <= HUMIDITY_MAX_ACCEPTABLE:
        return 'recovering'
    
    # Si llegamos aquí, está healthy
    return 'healthy'

def calculate_plant_status(temperatura, luminosidad, humedad):
    """
    Calcula el estado de la planta basado en los valores de los sensores.
    Usa la función compute_mood unificada.
    
    Retorna: 'healthy', 'bad', o 'recovering'
    """
    return compute_mood(temperatura, luminosidad, humedad)

def get_emoji_matrix_from_status(status):
    """
    Obtiene la matriz LED correspondiente al estado calculado localmente.
    Esto asegura que la matriz LED refleje el estado real calculado en la Raspberry,
    no dependa del backend.
    
    Args:
        status: 'healthy', 'bad', o 'recovering'
    
    Returns:
        list: Matriz 8x8 para el LED
    """
    return default_emojis.get(status, default_emojis['healthy'])

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
        print(f"❌ Error leyendo humedad: {e}")
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
        print(f"❌ Error leyendo luminosidad: {e}")
        return None

def read_temperature():
    """Lee temperatura con DS18B20"""
    try:
        temperature = temp_sensor.get_temperature()
        return round(temperature, 2)
    except Exception as e:
        print(f"❌ Error leyendo temperatura: {e}")
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
            "status": status,  # 🔥 CAMPO REQUERIDO: 'healthy', 'bad', o 'recovering'
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
        
        print(f"📤 Enviando datos al backend...")
        print(f"   Status calculado: {status}")
        
        response = requests.post(
            f"{BACKEND_URL}/sensor-data",
            json=data,
            headers={"Content-Type": "application/json"},
            timeout=10
        )
        
        if response.status_code in [200, 201]:
            print("✅ Datos enviados correctamente")
            result = response.json()
            if result.get("success"):
                print(f"   Respuesta: {result.get('message', 'OK')}")
            return True
        else:
            print(f"❌ Error del backend: {response.status_code}")
            print(f"   Respuesta: {response.text}")
            return False
            
    except requests.exceptions.Timeout:
        print("❌ Timeout: el backend tardó demasiado en responder")
        return False
    except requests.exceptions.ConnectionError:
        print("❌ Error de conexión: no se puede alcanzar el backend")
        return False
    except Exception as e:
        print(f"❌ Excepción enviando al backend: {e}")
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
            print(f"❌ Error obteniendo emoji: {response.status_code}")
            return None
            
    except Exception as e:
        print(f"❌ Excepción obteniendo emoji: {e}")
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
        print("⚠️  Matriz inválida recibida")

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
    print("🌱 Sistema de monitoreo de plantas iniciado")
    print(f"🔗 Backend: {BACKEND_URL}")
    print(f"🆔 Device Serial: {DEVICE_SERIAL}")
    if PLANT_ID:
        print(f"🌿 Plant ID: {PLANT_ID}")
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
                print("📊 Leyendo sensores...")
                
                temperatura = read_temperature()
                luminosidad = read_light()
                humedad_suelo = read_soil_moisture()
                
                if temperatura is not None:
                    print(f"  🌡️  Temperatura: {temperatura}°C")
                if luminosidad is not None:
                    print(f"  💡 Luminosidad: {luminosidad} lx")
                if humedad_suelo:
                    print(f"  💧 Humedad: {humedad_suelo['humedad_porcentaje']}% ({humedad_suelo['estado_digital']})")
                
                # Enviar al backend si tenemos todos los datos
                if all([temperatura is not None, luminosidad is not None, humedad_suelo is not None]):
                    # Calcular estado LOCALMENTE antes de enviar al backend
                    # Esto asegura que la matriz LED muestre el estado correcto inmediatamente
                    current_status = calculate_plant_status(
                        temperatura, luminosidad, humedad_suelo['humedad_porcentaje']
                    )
                    
                    # Obtener matriz LED basada en el cálculo local
                    local_emoji_matrix = get_emoji_matrix_from_status(current_status)
                    
                    # Mostrar matriz LED inmediatamente (no esperar al backend)
                    print(f"😊 Mostrando emoji calculado localmente: {current_status}")
                    display_matrix(local_emoji_matrix)
                    
                    # Enviar datos al backend
                    success = send_sensor_data_to_backend(
                        temperatura=temperatura,
                        luminosidad=luminosidad,
                        humedad=humedad_suelo['humedad_porcentaje']
                    )
                    
                    if success:
                        print("✅ Datos enviados al backend correctamente")
                        # Opcional: actualizar desde backend después de enviar (para sincronización)
                        # Pero la matriz LED ya se mostró basada en el cálculo local
                        emoji_matrix = get_emoji_from_backend()
                        if emoji_matrix:
                            print("🔄 Sincronizando emoji desde backend (opcional)")
                            display_matrix(emoji_matrix)
                            last_emoji_check = current_time  # Resetear el timer
                    else:
                        print(f"⚠️  Error enviando al backend, usando emoji local ({current_status})")
                else:
                    print("⚠️  Datos incompletos, no se envía al backend")
                
                last_sensor_read = current_time
            
            # ========== ACTUALIZAR EMOJI ==========
            if current_time - last_emoji_check >= EMOJI_INTERVAL:
                emoji_matrix = get_emoji_from_backend()
                
                if emoji_matrix:
                    print("😊 Mostrando emoji del backend")
                    display_matrix(emoji_matrix)
                else:
                    print(f"⚠️  Sin conexión, mostrando emoji por defecto ({current_status})")
                    display_matrix(default_emojis[current_status])
                
                last_emoji_check = current_time
            
            time.sleep(0.5)
            
    except KeyboardInterrupt:
        print("\n\n🛑 Sistema detenido por el usuario")
    except Exception as e:
        print(f"\n❌ Error crítico: {e}")
        import traceback
        traceback.print_exc()
    finally:
        device.clear()
        GPIO.cleanup()
        print("✅ Limpieza completada")

if __name__ == "__main__":
    main()