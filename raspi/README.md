# 🌱 Documentation - Raspberry Pi

Hello, welcome to the documentation for the Raspberry Pi 400 IoT integration part of this project.

## 📋 Hardware Requirements

- Raspberry Pi (400 :D)
- Sensors:
  - DS18B20 (Temperature)
  - BH1750 (Luminosity)  
  - ADS1115 + YL-69 (Soil Moisture)
  - MAX7219 (8x8 LED Matrix)

## 🚀 Quick Installation

#### 1. Clone repository

```bash
git clone https://github.com/SmallCakekoo/ECOA
cd ECOA
cd raspi
```

#### 2. Install system dependencies

```bash
sudo apt-get update
sudo apt-get install -y python3-pip python3-dev i2c-tools python3-smbus git
```

#### 3. Install Python packages

```bash
pip3 install -r requirements.txt


# or alternatively:
pip3 install adafruit-circuitpython-ads1x15 smbus2 w1thermsensor luma.led-matrix requests python-dotenv RPi.GPIO adafruit-blinka 
```

#### 4. Enable I2C, SPI and 1-Wire

```bash
sudo raspi-config
```

- Go to: **Interface Options** → Enable **I2C**, **SPI** and **1-Wire**
- Or edit `/boot/config.txt` and add:

```bash
dtparam=i2c_arm=on
dtparam=spi=on
dtoverlay=w1-gpio
```

#### 5. Configure environment variables

```env
BACKEND_URL=https://your-deployed-backend.vercel.app/api
```

#### 6. Add user to groups

```bash
sudo usermod -a -G i2c,spi,gpio $USER
```

#### 7. Reboot

```bash
sudo reboot
```

#### 8. Run (inside the project directory)

```bash
python3 main.py
```

## 🔍 Verify Sensors

### Check connected I2C devices:

```bash
i2cdetect -y 1
```

You should see:
- `0x23` → BH1750 (Luminosity)
- `0x48` → ADS1115 (Analog converter)

### Check DS18B20 temperature sensor:

```bash
ls /sys/bus/w1/devices/
```

You should see a device like `28-xxxxxxxxxxxx`

## 📁 Project Structure

```
ECOA/raspi
├── main.py                    # Main script
├── requirements.txt           # Python dependencies
├── .env                       # Environment variables (not uploaded, lol)
└── README.md                  # This file
```

## 🔒 Security

- ✅ **`.env`** is in `.gitignore` and **NEVER** uploaded to GitHub
- ✅ The idea is that each Raspberry Pi has its own local `.env` with real credentials

## 📡 API Endpoints

Your backend should implement:

### GET /status/emoji or similar
To return a face to display on the LED screen

```json
{
  "matrix": [
    [0,0,1,1,1,1,0,0],
    [0,1,0,0,0,0,1,0],
    [1,0,1,0,0,1,0,1],
    [1,0,0,0,0,0,0,1],
    [1,0,1,0,0,1,0,1],
    [1,0,0,1,1,0,0,1],
    [0,1,0,0,0,0,1,0],
    [0,0,1,1,1,1,0,0]
  ]
}
```

### Supabase Table: sensor_data

```sql
CREATE TABLE plant_stats (
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
plant_id uuid NOT NULL,
soil_moisture REAL,            -- humedad (float4)
temperature REAL,             -- temperatura (float4)
light REAL,                   -- luminosidad (float4)
recorded_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

### Error: "Missing environment variables"
```bash
# Check that .env exists and has values
cat .env
```

### I2C permission errors:
```bash
sudo usermod -a -G i2c,spi,gpio $USER
sudo reboot
```

### Temperature sensor not detected:
```bash
# Load kernel modules
sudo modprobe w1-gpio
sudo modprobe w1-therm

# Check detection
ls /sys/bus/w1/devices/
```

### LED Matrix not working:
```bash
# Check SPI is enabled
ls /dev/spi*

# Should show: /dev/spidev0.0 /dev/spidev0.1
```

## 📞 Support

If you have problems:

1. Check physical sensor connections
2. Run `i2cdetect -y 1` to verify I2C devices
3. Check logs: `tail -f ~/sensor_system.log`
4. Verify that the `.env` file has the correct credentials
5. Make a SmallCakekoo-signal.
