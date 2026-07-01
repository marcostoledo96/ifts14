<?php

declare(strict_types=1);

/**
 * Contrato del adaptador de entrega por email.
 *
 * El token completo de validación viaja únicamente dentro del enlace enviado
 * al destinatario; el adaptador MUST NO loguear token ni credenciales.
 */
interface EmailDeliveryTransport
{
    /**
     * Lanza RuntimeException('DELIVERY_NOT_CONFIGURED') si el transporte no
     * está listo para enviar (modo stub o SMTP sin credenciales).
     *
     * @throws RuntimeException Cuando el envío real está deshabilitado.
     */
    public function assertConfigured(): void;

    /**
     * Envía el enlace público de validación al destinatario.
     *
     * @param string $recipient Email del destinatario.
     * @param string $validationUrl URL pública con el token completo.
     * @param array<string, mixed> $context Datos institucionales mínimos.
     *
     * @throws RuntimeException Si el envío falla.
     */
    public function sendValidationLink(string $recipient, string $validationUrl, array $context = []): void;
}