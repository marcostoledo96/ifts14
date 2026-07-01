<?php

declare(strict_types=1);

require_once __DIR__ . '/EmailDeliveryTransport.php';

/**
 * Transporte stub: nunca envía email real. Sirve como modo seguro por defecto
 * mientras no haya configuración SMTP confirmada.
 */
final class StubEmailDeliveryTransport implements EmailDeliveryTransport
{
    public function assertConfigured(): void
    {
        throw new RuntimeException('DELIVERY_NOT_CONFIGURED');
    }

    public function sendValidationLink(string $recipient, string $validationUrl, array $context = []): void
    {
        throw new RuntimeException('DELIVERY_NOT_CONFIGURED');
    }
}