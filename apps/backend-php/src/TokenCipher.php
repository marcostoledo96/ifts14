<?php

declare(strict_types=1);

/**
 * Cifrado/descifrado reversible de tokens con AES-256-GCM.
 *
 * El token completo NO se persiste en texto plano: se guarda un envelope
 * textual `v1.<iv_b64url>.<tag_b64url>.<ciphertext_b64url>` generado con una
 * clave externa a Git que decodifica exactamente a 32 bytes. Falla cerrado
 * ante OpenSSL ausente, clave inválida, formato roto, IV/tag incorrectos o
 * descifrado fallido. Nunca loguea token, clave, IV, tag ni ciphertext.
 */
final class TokenCipher
{
    private const string VERSION = 'v1';
    private const int IV_BYTES = 12;
    private const int TAG_BYTES = 16;

    /**
     * Decodifica la clave de configuración a 32 bytes exactos (base64 o base64url).
     *
     * @throws RuntimeException Si la clave no decodifica a 32 bytes (fail closed).
     */
    public static function key(string $encoded): string
    {
        $raw = self::base64urlDecode($encoded);
        if ($raw === false) {
            $raw = base64_decode($encoded, true);
        }

        if (!is_string($raw) || strlen($raw) !== 32) {
            throw new RuntimeException('Token cipher key invalid.');
        }

        return $raw;
    }

    /**
     * Cifra el token y arma el envelope `v1.<iv>.<tag>.<ciphertext>` (b64url).
     *
     * @throws RuntimeException Si OpenSSL no está disponible o el cifrado falla.
     */
    public static function encrypt(string $token, string $key): string
    {
        if (strlen($key) !== 32) {
            throw new RuntimeException('Token cipher key invalid.');
        }

        $iv = random_bytes(self::IV_BYTES);
        $tag = '';

        $ciphertext = openssl_encrypt(
            $token,
            'aes-256-gcm',
            $key,
            OPENSSL_RAW_DATA,
            $iv,
            $tag,
            '',
            self::TAG_BYTES,
        );

        if ($ciphertext === false) {
            throw new RuntimeException('Token cipher encrypt failed.');
        }

        return self::VERSION
            . '.' . self::base64urlEncode($iv)
            . '.' . self::base64urlEncode($tag)
            . '.' . self::base64urlEncode($ciphertext);
    }

    /**
     * Descifra un envelope `v1.<iv_b64url>.<tag_b64url>.<ciphertext_b64url>`.
     *
     * Fail closed ante: clave != 32 bytes, formato distinto de 4 partes con
     * versión v1, IV decodificado != 12 bytes, tag decodificado != 16 bytes,
     * base64url inválido, o descifrado OpenSSL fallido.
     *
     * @throws RuntimeException Si el formato, IV, tag, clave o descifrado fallan.
     */
    public static function decrypt(string $envelope, string $key): string
    {
        if (strlen($key) !== 32) {
            throw new RuntimeException('Token cipher key invalid.');
        }

        $parts = explode('.', $envelope);
        if (count($parts) !== 4 || $parts[0] !== self::VERSION) {
            throw new RuntimeException('Token cipher envelope invalid.');
        }

        $iv = self::base64urlDecode($parts[1]);
        $tag = self::base64urlDecode($parts[2]);
        $ciphertext = self::base64urlDecode($parts[3]);

        if ($iv === false || $tag === false || $ciphertext === false) {
            throw new RuntimeException('Token cipher envelope invalid.');
        }

        if (strlen($iv) !== self::IV_BYTES) {
            throw new RuntimeException('Token cipher envelope invalid.');
        }
        if (strlen($tag) !== self::TAG_BYTES) {
            throw new RuntimeException('Token cipher envelope invalid.');
        }

        $token = openssl_decrypt(
            $ciphertext,
            'aes-256-gcm',
            $key,
            OPENSSL_RAW_DATA,
            $iv,
            $tag,
        );

        if ($token === false || $token === '') {
            throw new RuntimeException('Token cipher decrypt failed.');
        }

        return $token;
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
        $standard = strtr($encoded, '-_', '+/');

        return base64_decode($standard, true);
    }
}