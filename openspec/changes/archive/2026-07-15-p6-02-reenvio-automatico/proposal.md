# Propuesta: P6-02 — Reenvío automático tras regeneración (MVP)

## Intención

Cuando un PDF está desactualizado por cambios en asistencias o fechas, Bedelía necesita regenerarlo y obtener los datos de entrega actualizados. Hoy el botón "Regenerar PDF" es solo un link de descarga que no regenera nada. Se necesita un endpoint real de regeneración y que el frontend muestre los datos de entrega al completar.

## Alcance

### En alcance
- Backend: `POST /admin/certificados/{id}/regenerar-pdf` — regenera PDF con mismo token, actualiza `pdf_estado='vigente'`, audita
- Frontend: botón "Regenerar PDF" en preview llama al endpoint, muestra datos de entrega al finalizar
- Contrato: agregar `regenerarPdf()` a `CertificationsService`

### Fuera de alcance
- Envío de email (infraestructura SMTP/PHPMailer — fase posterior)
- Rotación de token (el token/QR es permanente por D1-15)

## Enfoque

Approach 2 del explore: regeneración real sin email, reutilizando P6-01 para mostrar datos de entrega.
