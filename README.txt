HAVYCO BINGO PROFESIONAL V4 — MONETIZACIÓN POR LICENCIAS

QUÉ INCLUYE
- PWA instalable Android, iPhone/iPad, Windows y macOS.
- PLAN GRATIS: ruleta, voz, historial y hasta 100 cartones.
- PLAN PRO: límite definido por licencia (por defecto hasta 10.000), ventas y premios.
- Activación PRO mediante licencias ECDSA P-256 firmadas.
- La app pública solo contiene la clave pública; no puede crear licencias válidas.
- Funciona offline después de cargarse.

PUBLICAR EN GITHUB
1. Sube SOLO el contenido de HAVYCO_Bingo_V4 a tu repositorio HAVYCO-Bingo.
2. NO SUBAS la carpeta HAVYCO_Licencias_Admin_V4.
3. Commit changes. GitHub Pages actualizará automáticamente.

CÓMO VENDER UNA LICENCIA
Usa el ZIP separado HAVYCO_Licencias_Admin_V4_PRIVADO.zip en tu Mac.
Ejemplo:
  python3 -m pip install cryptography
  python3 generar_licencia.py --cliente "Cliente Ejemplo" --vence 2027-08-07 --max-cartones 10000

El script imprimirá un código HV4.... Envías ese código al cliente. El cliente abre Cuenta / PRO, pega el código y pulsa Activar licencia.

SEGURIDAD IMPORTANTE
- PRIVATE_KEY_HAVYCO_V4.pem es la clave maestra para emitir licencias.
- NUNCA la subas a GitHub, WhatsApp público, web, Drive compartido ni la incluyas en la PWA.
- Guarda una copia privada de respaldo.

LIMITACIÓN
Este sistema protege la EMISIÓN de licencias mediante firma criptográfica y funciona sin servidor. Sin embargo, como la PWA está publicada como código web visible, un usuario técnico podría modificar su propia copia del JavaScript para eliminar bloqueos. Para un SaaS con protección comercial más fuerte, cuentas y pagos automáticos, la siguiente etapa es un backend (Firebase/Supabase/Cloudflare) y verificación del lado servidor.

COMPRA PRO
Edita config.js y coloca tu enlace de pago/WhatsApp en purchaseUrl.


ACTUALIZACIÓN V4.2 - COMPRA PRO POR WHATSAPP
- Botón COMPRAR PRO POR WHATSAPP.
- Redirige al número +593 98 442 3035.
- Mensaje automático solicitando datos para depósito y activación de licencia.
- Botón compacto flotante en móvil.
