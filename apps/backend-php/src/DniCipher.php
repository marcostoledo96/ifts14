<?php

declare(strict_types=1);

/**
 * Cifrado reversible de DNI con el mismo envelope AES-256-GCM usado para tokens.
 * La clave real vive fuera de Git y debe decodificar a 32 bytes.
 */
final class DniCipher
{
    private const string VERSION = 'v1';
    private const int IV_BYTES = 12;
    private const int TAG_BYTES = 16;

    public static function key(string $encoded): string
    {
        $raw = self::base64urlDecode($encoded);
        if ($raw === false) {
            $raw = base64_decode($encoded, true);
        }

        if (!is_string($raw) || strlen($raw) !== 32) {
            throw new RuntimeException('DNI cipher key invalid.');
        }

        return $raw;
    }

    public static function encrypt(string $documentNumber, string $key): string
    {
        if (strlen($key) !== 32) {
            throw new RuntimeException('DNI cipher key invalid.');
        }

        $iv = random_bytes(self::IV_BYTES);
        $tag = '';
        $ciphertext = openssl_encrypt(
            $documentNumber,
            'aes-256-gcm',
            $key,
            OPENSSL_RAW_DATA,
            $iv,
            $tag,
            '',
            self::TAG_BYTES,
        );

        if ($ciphertext === false) {
            throw new RuntimeException('DNI cipher encrypt failed.');
        }

        return self::VERSION
            . '.' . self::base64urlEncode($iv)
            . '.' . self::base64urlEncode($tag)
            . '.' . self::base64urlEncode($ciphertext);
    }

    public static function decrypt(string $envelope, string $key): string
    {
        if (strlen($key) !== 32) {
            throw new RuntimeException('DNI cipher key invalid.');
        }

        $parts = explode('.', $envelope);
        if (count($parts) !== 4 || $parts[0] !== self::VERSION) {
            throw new RuntimeException('DNI cipher envelope invalid.');
        }

        $iv = self::base64urlDecode($parts[1]);
        $tag = self::base64urlDecode($parts[2]);
        $ciphertext = self::base64urlDecode($parts[3]);

        if ($iv === false || $tag === false || $ciphertext === false || strlen($iv) !== self::IV_BYTES || strlen($tag) !== self::TAG_BYTES) {
            throw new RuntimeException('DNI cipher envelope invalid.');
        }

        $documentNumber = openssl_decrypt($ciphertext, 'aes-256-gcm', $key, OPENSSL_RAW_DATA, $iv, $tag);
        if ($documentNumber === false || $documentNumber === '') {
            throw new RuntimeException('DNI cipher decrypt failed.');
        }

        return $documentNumber;
    }

    public static function envelopeLooksValid(?string $envelope): bool
    {
        if (!is_string($envelope) || $envelope === '') {
            return false;
        }

        $parts = explode('.', $envelope);

        return count($parts) === 4 && $parts[0] === self::VERSION;
    }

    private static function base64urlEncode(string $binary): string
    {
        return rtrim(strtr(base64_encode($binary), '+/', '-_'), '=');
    }

    private static function base64urlDecode(string $encoded): string|false
    {
        return base64_decode(strtr($encoded, '-_', '+/'), true);
    }
}
