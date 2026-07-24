<!-- File: README.md -->
# CSIF HeatSafe

CSIF HeatSafe es una PWA orientada a la evaluación del riesgo por estrés térmico en trabajos al aire libre. Incorpora meteorología en tiempo real, cálculos WBGT, recomendaciones, historial, gráficos, registro de síntomas y exportación a PDF.

## Instalación
1. Descarga o clona el proyecto.
2. Abre el archivo index.html en tu navegador o sirve la carpeta con un servidor estático.
3. Si abres el proyecto desde un servidor HTTP, la app puede instalarse como PWA.

## Uso
- Permite el acceso a la ubicación GPS para obtener datos meteorológicos y estimar el riesgo.
- Ajusta el tipo de trabajo, la ropa, la aclimatación y revisa las recomendaciones.
- Guarda registros y exporta informes desde la sección de historial.

## Arquitectura
- HTML5 + Bootstrap 5 para la interfaz.
- JavaScript modular sin frameworks.
- LocalStorage para configuración e historial.
- Service Worker y Manifest para capacidades PWA.

## Fórmulas WBGT
- Bulbo húmedo: aproximación basada en temperatura y humedad relativa.
- Temperatura de globo: aproximación con radiación solar.
- WBGT interior: $0.7 \times T_{bulbo} + 0.3 \times T_{globo}$
- WBGT exterior: $0.7 \times T_{bulbo} + 0.2 \times T_{globo} + 0.1 \times T_{aire}$

## Fuentes
- Open-Meteo para meteorología.
- Guía técnica del INSST y normativa ISO 7243 como referencia técnica.

## Licencia
MIT
