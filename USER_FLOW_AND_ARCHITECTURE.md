# Donaji Ramirez — Arquitectura Final, CMS Curatorial y Guía para Vercel

## 1. Cómo Abrir el Estudio Curatorial (CMS Integrado)

El portafolio incluye una **Mesa de Luz y CMS Curatorial** invisible para los visitantes públicos pero accesible al instante para ti en cualquier entorno (local o ya alojado en Vercel):

- **Por teclado**: Presiona **`Shift + E`** en cualquier momento dentro de la galería.
- **Por URL**: Entra a **`tudominio.com/?cms`** o **`tudominio.com/#cms`**.

---

## 2. Qué Puedes Hacer Mientras Planeas tus Series y Seleccionas Fotos

1. **Mesa de Luz en Vivo (`1. Series y Fotos`)**:
   - **Cargar fotos desde tu computadora (`+ Agregar fotos locales` o `Reemplazar serie`)**:
     - Selecciona varias fotografías a la vez desde tu Mac/PC.
     - El CMS analiza las dimensiones reales de cada imagen y le asigna automáticamente su proporción más cercana (**`3:4`**, **`4:3`**, **`16:9`** o **`1:1`**).
     - Todas las fotografías cargadas se guardan en la base de datos local de tu navegador (**`IndexedDB`**), por lo que no se pierden al recargar la página ni tienen el límite de 5MB de `localStorage`.
   - **Probar combinaciones del Barajeo**:
     - Reordena las fotos con `↑` y `↓` para elegir cuál abre al centro (`#1`), cuál asoma a la derecha (`#2`) y cuál a la izquierda (`última`) mientras ves el escenario real actualizarse al instante detrás del panel.
     - Si una serie tiene **`3 fotos o menos`**, queda contenida en Nivel 1. Si agregas **`4 o más fotos`**, se activan automáticamente el asomo de pliegos traseros y el círculo con flecha (`↗`) hacia la sala de Nivel 2.
   - **Ajustar proporción y encuadre en vivo**:
     - Cambia con un clic entre `3:4`, `4:3`, `16:9` y `1:1`, o ajusta el punto de encuadre (`Centro`, `Arriba`, `Abajo`, `Izq`, `Der`).
   - **Crear, reordenar o eliminar series**:
     - Usa **`+ Nueva Serie`** para añadir más capítulos fotográficos, o las flechas `↑` / `↓` para cambiar el orden de las series.
   - **Vimeo (`00`)**:
     - Pega cualquier enlace de Vimeo (`https://vimeo.com/...`) o su ID numérico y el reproductor de portada se actualizará en vivo.

2. **Guardar y Comparar Distintas Curadurías (`3. Vercel / Export` → `A. Borradores`)**:
   -Mientras sigues seleccionando fotos, puedes pulsar **`↓ Guardar borrador (.json)`** para guardar una versión completa de tu curaduría (incluyendo las fotos de prueba) y **`↑ Cargar borrador (.json)`** para comparar otra selección distinta cuando quieras.

---

## 3. Cómo Publicar tu Selección Definitiva en Vercel

Tienes **dos caminos** listos en la pestaña **`3. Vercel / Export`** sin pagar servidores ni bases de datos externas:

### Camino 1 — Publicación Directa en 1 Clic desde el Navegador (GitHub API → Vercel)
1. En la sección **`B. Publicar directo a Vercel`**, escribe tu repositorio (`usuario/repositorio`), la rama (`main`) y un *Personal Access Token* de GitHub con permiso `repo` / `contents:write`.
2. Pulsa **`Publicar cambios a Vercel ahora`**.
3. El propio CMS subirá automáticamente las fotografías nuevas a la carpeta `public/obras/` de tu repositorio y actualizará `public/portfolio.json`. Vercel detectará el *commit* y actualizará tu sitio público en ~20 segundos.

### Camino 2 — Exportación Manual a tu Carpeta Local
1. Pulsa **`↓ Descargar portfolio.json`** (para colocarlo en `public/portfolio.json`) o **`↓ Descargar portfolioData.ts`** (para reemplazar `src/data/portfolioData.ts`).
2. Descarga las fotografías listadas y colócalas dentro de la carpeta **`public/obras/`** de tu proyecto antes de hacer `git push`.
