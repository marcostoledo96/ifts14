<?php

declare(strict_types=1);

require_once __DIR__ . '/EmailDeliveryTransport.php';
require_once __DIR__ . '/StubEmailDeliveryTransport.php';
require_once __DIR__ . '/SmtpEmailDeliveryTransport.php';
require_once __DIR__ . '/Config.php';

/**
 * Selecciona el transporte de email según `delivery_transport` de la config
 * normalizada por `Config::requireDeliveryConfig()`.
 */
final class EmailDeliveryTransportFactory
{
    /**
     * @param array<string, mixed> $config
     * @throws RuntimeException Si el modo no es `stub|smtp` (lo valida Config).
     */
    public static function make(array $config): EmailDeliveryTransport
    {
        $transport = strtolower(trim((string) ($config['delivery_transport'] ?? 'stub')));

        return match ($transport) {
            'stub' => new StubEmailDeliveryTransport(),
            'smtp' => new SmtpEmailDeliveryTransport($config),
            default => throw new RuntimeException('DELIVERY_NOT_CONFIGURED'),
        };
    }
}