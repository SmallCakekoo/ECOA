# Plant Images - Recursos Locales

Esta carpeta contiene las imágenes de plantas que se usan como recursos locales (fallback) cuando las plantas no tienen una imagen propia o cuando hay errores al cargar imágenes del servidor.

## Estructura

```
plants/
├── plant-1.png
├── plant-2.png
├── plant-3.png
├── plant-4.png
├── plant-5.png
├── plant-6.png
├── plant-7.png
├── plant-8.png
├── plant-9.png
├── plant-10.png
└── README.md (este archivo)
```

## Cómo funciona

El sistema de imágenes de plantas funciona con el siguiente orden de prioridad:

1. **Imagen del backend** (prioridad máxima)
   - Si la planta tiene `image` o `image_url` en la base de datos, se usa esa imagen
   - Puede ser una data URL (base64), URL completa, o ruta relativa del servidor

2. **Imagen local basada en ID** (fallback)
   - Si no hay imagen del backend, se calcula un índice basado en el ID de la planta
   - Se usa: `plant-{índice}.png` donde el índice va del 1 al 10

3. **Imagen por defecto** (último recurso)
   - Si todo falla, se usa `../../src/assets/images/plant.png`

## Pantallas que usan estas imágenes

Las siguientes pantallas del cliente usan este sistema de recursos locales:

- **Adopt** (`/client/screens/Adopt`) - Lista de plantas disponibles para adopción
- **AdoptDetail** (`/client/screens/AdoptDetail`) - Detalle de una planta para adoptar
- **VirtualPet** (`/client/screens/VirtualPet`) - Vista detallada de la planta adoptada

## Cómo gestionar las imágenes

### Agregar nuevas imágenes

1. Coloca la nueva imagen en esta carpeta con el nombre `plant-{número}.png`
2. Asegúrate de que el número esté entre 1 y 10 (o extiende el rango si es necesario)
3. Las imágenes deben ser PNG y tener un tamaño razonable (recomendado: 400x400px o similar)

### Reemplazar imágenes existentes

1. Simplemente reemplaza el archivo `plant-{número}.png` con la nueva imagen
2. Mantén el mismo nombre de archivo
3. Asegúrate de que sea formato PNG

### Borrar imágenes

1. Puedes borrar cualquier imagen `plant-{número}.png`
2. Si una planta intenta usar una imagen que no existe, el sistema automáticamente usará la imagen por defecto (`plant.png`)

### Restaurar imágenes

1. Si necesitas restaurar una imagen borrada, simplemente vuelve a agregar el archivo `plant-{número}.png` en esta carpeta
2. El sistema la detectará automáticamente

## Especificaciones técnicas

- **Formato**: PNG (recomendado)
- **Tamaño recomendado**: 400x400px o similar
- **Peso**: Intenta mantener las imágenes bajo 200KB para mejor rendimiento
- **Nombres**: Deben seguir el patrón `plant-{número}.png` donde número va de 1 a 10

## Sistema de selección automática

El sistema selecciona automáticamente qué imagen usar basándose en el ID de la planta:

```javascript
// El sistema calcula un hash del ID de la planta
// y selecciona una imagen entre plant-1.png y plant-10.png
// Esto asegura que la misma planta siempre use la misma imagen local
```

## Notas importantes

- ⚠️ **No modifiques** el archivo `plant-images.js` a menos que sepas lo que estás haciendo
- ✅ Las imágenes se cargan automáticamente cuando las plantas no tienen imagen propia
- ✅ El sistema maneja errores automáticamente y hace fallback a imágenes locales
- ✅ Todas las pantallas mencionadas ya están configuradas para usar este sistema

## Solución de problemas

### Las imágenes no se muestran
1. Verifica que los archivos existan en esta carpeta
2. Verifica que los nombres de archivo sean correctos (`plant-1.png`, `plant-2.png`, etc.)
3. Verifica que el archivo `plant-images.js` esté cargado en la pantalla

### Error 404 en imágenes
- Asegúrate de que las rutas relativas sean correctas desde cada pantalla
- La ruta desde las pantallas es: `../../src/assets/images/plants/plant-{número}.png`

