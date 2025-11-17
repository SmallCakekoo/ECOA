import time
import board
import busio
import smbus2
import RPi.GPIO as GPIO
import requests
import os
from adafruit_ads1x15.ads1115 import ADS1115
from adafruit_ads1x15.analog_in import AnalogIn
from w1thermsensor import W1ThermSensor
from luma.core.interface.serial import spi
from luma.led_matrix.device import max7219
from luma.core.render import canvas
from dotenv import load_dotenv

# Cargar variables de entorno
load_dotenv()

# ==================== CONFIGURACIÓN ====================

# Backend URL (el backend maneja TODO)
BACKEND_URL = "https://ecoabackendecoa.vercel.app/"

# Plant ID opcional (si no se proporciona, el backend usará la primera planta adoptada)
# Puedes configurarlo en el archivo .env como PLANT_ID
PLANT_ID = os.getenv("PLANT_ID", None)

# Validar variable de entorno
if not BACKEND_URL:
    raise ValueError("⚠️  Falta BACKEND_URL en el archivo .env")

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

# ==================== FUNCIONES DE COMUNICACIÓN CON BACKEND ====================

def send_sensor_data_to_backend(temperatura, luminosidad, humedad, plant_id=None):
    """
    Envía datos de sensores al BACKEND.
    El backend se encarga de:
    1. Recibir los datos
    2. Calcular qué emoji mostrar según la lógica
    3. Guardar en Supabase (plant_stats y plant_status)
    4. Actualizar el emoji en la base de datos
    """
    try:
        data = {
            "temperature": temperatura,
            "light": luminosidad,
            "soil_moisture": humedad
        }
        
        # Agregar plant_id si está disponible (global o parámetro)
        target_plant_id = plant_id or PLANT_ID
        if target_plant_id:
            data["plant_id"] = target_plant_id
        
        response = requests.post(
            f"{BACKEND_URL}/sensor-data",  # Endpoint para recibir datos de sensores
            json=data,
            headers={"Content-Type": "application/json"},
            timeout=10
        )
        
        if response.status_code in [200, 201]:
            print("✓ Datos enviados al backend correctamente")
            result = response.json()
            print(f"  Backend respondió: {result}")
            return True
        else:
            print(f"✗ Error del backend: {response.status_code}")
            print(f"  Respuesta: {response.text}")
            return False
            
    except Exception as e:
        print(f"✗ Excepción enviando al backend: {e}")
        return False

def get_emoji_from_backend(plant_id=None):
    """
    Obtiene el emoji calculado desde el backend.
    El backend ya hizo el cálculo basado en los últimos datos
    y devuelve la matriz 8x8 para mostrar.
    """
    try:
        # Construir URL con plant_id si está disponible
        url = f"{BACKEND_URL}/emoji"
        target_plant_id = plant_id or PLANT_ID
        if target_plant_id:
            url = f"{url}?plant_id={target_plant_id}"
        
        response = requests.get(
            url,  # Endpoint que devuelve el emoji actual
            timeout=5
        )
        
        if response.status_code == 200:
            data = response.json()
            # Espera: {"matrix": [[0,1,...], [0,0,...],...]}
            return data.get("matrix")
        else:
            print(f"Error obteniendo emoji: {response.status_code}")
            return None
            
    except Exception as e:
        print(f"Excepción obteniendo emoji: {e}")
        return None

# ==================== FUNCIÓN PARA MOSTRAR EN LED ====================

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

# ==================== CARITAS POR DEFECTO ====================

# Caritas de respaldo si no hay conexión con el backend
default_emojis = [
    # Feliz
    [
        [0,0,1,1,1,1,0,0],
        [0,1,0,0,0,0,1,0],
        [1,0,1,0,0,1,0,1],
        [1,0,0,0,0,0,0,1],
        [1,0,1,0,0,1,0,1],
        [1,0,0,1,1,0,0,1],
        [0,1,0,0,0,0,1,0],
        [0,0,1,1,1,1,0,0]
    ],
    # Neutral
    [
        [0,0,1,1,1,1,0,0],
        [0,1,0,0,0,0,1,0],
        [1,0,1,0,0,1,0,1],
        [1,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,1],
        [1,0,1,1,1,1,0,1],
        [0,1,0,0,0,0,1,0],
        [0,0,1,1,1,1,0,0]
    ],
    # Triste
    [
        [0,0,1,1,1,1,0,0],
        [0,1,0,0,0,0,1,0],
        [1,0,1,0,0,1,0,1],
        [1,0,0,0,0,0,0,1],
        [1,0,0,1,1,0,0,1],
        [1,0,1,0,0,1,0,1],
        [0,1,0,0,0,0,1,0],
        [0,0,1,1,1,1,0,0]
    ]
]

# ==================== LOOP PRINCIPAL ====================

def main():
    print("🌱 Sistema de monitoreo iniciado")
    print(f"🔗 Backend: {BACKEND_URL}")
    print("-" * 50)
    print("El flujo es:")
    print("  1. Raspberry lee sensores")
    print("  2. Envía datos al backend")
    print("  3. Backend calcula emoji y guarda en Supabase")
    print("  4. Raspberry obtiene emoji del backend")
    print("  5. Muestra emoji en LED\n")
    
    emoji_index = 0
    last_backend_check = 0
    last_sensor_read = 0
    SENSOR_READ_INTERVAL = 5  # Leer sensores cada 5 segundos
    EMOJI_CHECK_INTERVAL = 3  # Actualizar emoji cada 3 segundos
    
    try:
        while True:
            current_time = time.time()
            
            # ========== LEER Y ENVIAR DATOS DE SENSORES ==========
            if current_time - last_sensor_read >= SENSOR_READ_INTERVAL:
                print("\n📊 Leyendo sensores...")
                
                temperatura = read_temperature()
                luminosidad = read_light()
                humedad_suelo = read_soil_moisture()
                
                # Mostrar en consola
                print(f"  🌡️  Temperatura: {temperatura}°C")
                print(f"  💡 Luminosidad: {luminosidad} lx")
                if humedad_suelo:
                    print(f"  💧 Humedad: {humedad_suelo['humedad_porcentaje']}% ({humedad_suelo['estado_digital']})")
                
                # Enviar al backend (si tenemos todos los datos)
                if temperatura is not None and luminosidad is not None and humedad_suelo is not None:
                    print("\n📤 Enviando datos al backend...")
                    send_sensor_data_to_backend(
                        temperatura=temperatura,
                        luminosidad=luminosidad,
                        humedad=humedad_suelo['humedad_porcentaje']
                    )
                
                last_sensor_read = current_time
            
            # ========== OBTENER Y MOSTRAR EMOJI ==========
            if current_time - last_backend_check >= EMOJI_CHECK_INTERVAL:
                print("\n😊 Obteniendo emoji del backend...")
                emoji_matrix = get_emoji_from_backend()
                
                if emoji_matrix:
                    print("  ✓ Emoji recibido, mostrando en LED")
                    display_matrix(emoji_matrix)
                else:
                    print("  ✗ Sin conexión, usando emoji por defecto")
                    display_matrix(default_emojis[emoji_index % len(default_emojis)])
                    emoji_index += 1
                
                last_backend_check = current_time
            
            # Pequeña pausa para no saturar el CPU
            time.sleep(0.5)
            
    except KeyboardInterrupt:
        print("\n\n🛑 Sistema detenido por el usuario")
    except Exception as e:
        print(f"\n❌ Error crítico: {e}")
    finally:
        device.clear()
        GPIO.cleanup()
        print("✓ Limpieza completada")

if __name__ == "__main__":
    main()