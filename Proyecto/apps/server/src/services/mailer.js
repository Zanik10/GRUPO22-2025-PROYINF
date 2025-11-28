
import nodemailer from "nodemailer";

const {
  SMTP_HOST,
  SMTP_PORT,
  SMTP_USER,
  SMTP_PASS,
  MAIL_FROM,
} = process.env;

// Transport genérico. Ajusta HOST/PORT/secure según tu proveedor.
const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT ? Number(SMTP_PORT) : 587,
  secure: false, 
  auth: SMTP_USER && SMTP_PASS ? { user: SMTP_USER, pass: SMTP_PASS } : undefined,
});


export async function sendLoanStatusEmail({
  to,
  name,
  solicitudId,
  estado,
  score,
  motivoRechazo,
}) {
  if (!to || !SMTP_HOST) {
    console.warn(
      "[mailer] Falta configuración SMTP o email destino, no se envía correo."
    );
    return;
  }

  const subject = `Estado de tu solicitud de préstamo #${solicitudId}: ${estado}`;

  let intro = `Hola${name ? ` ${name}` : ""},\n\n`;
  let cuerpo = "";

  switch (estado) {
    case "PRE_APROBADO":
      cuerpo =
        "Tu solicitud de préstamo ha sido PRE-APROBADA en base a tu perfil y al análisis de scoring.\n\n" +
        "Ahora debes subir un comprobante en formato PDF dentro del plazo indicado en la plataforma para completar la aprobación final.\n";
      break;
    case "RECHAZADO":
      cuerpo =
        "Tu solicitud de préstamo ha sido RECHAZADA según el análisis de scoring.\n\n";
      if (motivoRechazo) {
        cuerpo += `Motivo: ${motivoRechazo}\n`;
      }
      break;
    case "APROBADA_FINAL":
      cuerpo =
        "¡Felicitaciones! Tu solicitud de préstamo ha sido APROBADA de forma FINAL.\n\n" +
        "El documento requerido fue recibido correctamente dentro del plazo.\n";
      break;
    case "RECHAZADA_TEMPORAL":
      cuerpo =
        "Tu solicitud de préstamo ha sido RECHAZADA de forma TEMPORAL.\n\n" +
        "No se recibió el documento solicitado dentro del plazo establecido.\n";
      break;
    default:
      cuerpo =
        `El estado de tu solicitud de préstamo ha cambiado a: ${estado}.\n\n`;
  }

  if (typeof score === "number") {
    cuerpo += `\nScore de evaluación crediticia: ${score.toFixed(2)}\n`;
  }

  cuerpo +=
    "\nPuedes revisar más detalles ingresando a la plataforma del banco.\n\n" +
    "Saludos,\nEquipo del Banco (proyecto INF236)\n";

  const mailOptions = {
    from: MAIL_FROM || SMTP_USER,
    to,
    subject,
    text: intro + cuerpo,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(
      `[mailer] Correo de estado "${estado}" enviado a ${to} para solicitud #${solicitudId}`
    );
  } catch (err) {
    console.error("[mailer] Error al enviar correo:", err);
  }
}
