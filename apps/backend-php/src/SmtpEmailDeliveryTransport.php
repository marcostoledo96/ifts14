<?php

declare(strict_types=1);

require_once __DIR__ . '/EmailDeliveryTransport.php';

/**
 * Transporte SMTP basado en PHPMailer. No loguea token completo ni credenciales.
 * Requiere credenciales externas (nunca versionadas) y `public_base_url`.
 */
final class SmtpEmailDeliveryTransport implements EmailDeliveryTransport
{
    /**
     * @param array<string, mixed> $config Config ya normalizada por Config::requireDeliveryConfig().
     */
    public function __construct(private readonly array $config)
    {
    }

    public function assertConfigured(): void
    {
        foreach (['smtp_host', 'smtp_username', 'smtp_password', 'mail_from', 'public_base_url'] as $key) {
            if (!isset($this->config[$key]) || !is_string($this->config[$key]) || trim($this->config[$key]) === '') {
                throw new RuntimeException('DELIVERY_NOT_CONFIGURED');
            }
        }

        $port = $this->config['smtp_port'] ?? null;
        if (!is_int($port) || $port <= 0 || $port > 65535) {
            throw new RuntimeException('DELIVERY_NOT_CONFIGURED');
        }
    }

    public function sendValidationLink(string $recipient, string $validationUrl, array $context = []): void
    {
        $this->assertConfigured();

        // Carga diferida de PHPMailer: solo se requiere si se envía real.
        if (!class_exists(PHPMailer\PHPMailer\PHPMailer::class)) {
            require_once __DIR__ . '/../vendor/phpmailer/phpmailer/src/PHPMailer.php';
            require_once __DIR__ . '/../vendor/phpmailer/phpmailer/src/SMTP.php';
            require_once __DIR__ . '/../vendor/phpmailer/phpmailer/src/Exception.php';
        }

        $mail = new PHPMailer\PHPMailer\PHPMailer(true);

        try {
            $mail->isSMTP();
            $mail->Host = (string) $this->config['smtp_host'];
            $mail->Port = (int) $this->config['smtp_port'];
            $mail->SMTPAuth = true;
            $mail->Username = (string) $this->config['smtp_username'];
            $mail->Password = (string) $this->config['smtp_password'];

        // Config ya garantizó smtp_secure ∈ {tls, ssl} (no vacío).
        $secure = strtolower((string) $this->config['smtp_secure']);
        $mail->SMTPSecure = $secure === 'ssl'
            ? PHPMailer\PHPMailer\PHPMailer::ENCRYPTION_SMTPS
            : PHPMailer\PHPMailer\PHPMailer::ENCRYPTION_STARTTLS;

            $mail->CharSet = 'UTF-8';
            $mail->setFrom((string) $this->config['mail_from'], (string) ($this->config['mail_from_name'] ?? ''));
            $mail->addAddress($recipient);

            $mail->Subject = 'Certificado IFTS 14 — Enlace de validación';
            $mail->isHTML(false);
            $mail->Body = $this->buildBody($validationUrl, $context);

            $mail->send();
        } catch (PHPMailer\PHPMailer\Exception | Throwable $exception) {
            // No exponemos credenciales ni token en el mensaje de error.
            throw new RuntimeException('DELIVERY_FAILED', 0, $exception);
        }
    }

    /**
     * Construye el cuerpo del email con solo el enlace y datos institucionales.
     * Sin PDF adjunto, sin token fuera del enlace.
     *
     * @param array<string, mixed> $context
     */
    private function buildBody(string $validationUrl, array $context): string
    {
        $institute = 'IFTS 14 — Instituto de Formación Técnica Superior N.º 14';
        $lines = [
            $institute,
            '',
            'Se adjunta el enlace público de validación de su certificado:',
            '',
            $validationUrl,
            '',
            'Si no solicitó este envío, ignore este correo.',
        ];

        return implode("\r\n", $lines);
    }
}