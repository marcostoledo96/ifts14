<?php

declare(strict_types=1);

final class InstitutionalConfig
{
    public const int NAME_MAX_LENGTH = 160;
    public const int ROLE_MAX_LENGTH = 80;
    public const int TEXT_MAX_LENGTH = 255;

    private const array DEFAULTS = [
        'institutionName' => 'IFTS N.° 14',
        'certificateText' => 'El Instituto de Formación Técnica Superior N.º 14 (IFTS 14) que integra la Dirección de Educación Técnica Superior, Agencia de Habilidades para el Futuro, certifica que:',
        'rectorName' => '',
        'rectorRole' => 'Rector/a',
        'advisorName' => '',
        'advisorRole' => 'Asesor/a Pedagógica',
    ];

    /**
     * @return array{
     *   institutionName:string,
     *   certificateText:string,
     *   rectorName:string,
     *   rectorRole:string,
     *   advisorName:string,
     *   advisorRole:string,
     *   rectorSignaturePath:?string,
     *   advisorSignaturePath:?string
     * }
     */
    public static function normalize(mixed $config): array
    {
        $config = is_array($config) ? $config : [];

        return [
            'institutionName' => self::value($config['institutionName'] ?? null, self::DEFAULTS['institutionName'], self::NAME_MAX_LENGTH),
            'certificateText' => self::value($config['certificateText'] ?? null, self::DEFAULTS['certificateText'], self::TEXT_MAX_LENGTH),
            'rectorName' => self::value($config['rectorName'] ?? null, self::DEFAULTS['rectorName'], self::NAME_MAX_LENGTH),
            'rectorRole' => self::value($config['rectorRole'] ?? null, self::DEFAULTS['rectorRole'], self::ROLE_MAX_LENGTH),
            'advisorName' => self::value($config['advisorName'] ?? null, self::DEFAULTS['advisorName'], self::NAME_MAX_LENGTH),
            'advisorRole' => self::value($config['advisorRole'] ?? null, self::DEFAULTS['advisorRole'], self::ROLE_MAX_LENGTH),
            'rectorSignaturePath' => self::optionalPath($config['rectorSignaturePath'] ?? null),
            'advisorSignaturePath' => self::optionalPath($config['advisorSignaturePath'] ?? null),
        ];
    }

    /** @param array<string, mixed> $body */
    public static function assertRequestWithinDatabaseLimits(array $body): void
    {
        $limits = [
            'institutionName' => self::NAME_MAX_LENGTH,
            'certificateText' => self::TEXT_MAX_LENGTH,
            'rectorName' => self::NAME_MAX_LENGTH,
            'rectorRole' => self::ROLE_MAX_LENGTH,
            'advisorName' => self::NAME_MAX_LENGTH,
            'advisorRole' => self::ROLE_MAX_LENGTH,
        ];

        foreach ($limits as $field => $max) {
            if (!array_key_exists($field, $body)) {
                continue;
            }
            if (!is_string($body[$field])) {
                throw new AdminCertificateException(400, 'VALIDATION_ERROR', 'Solicitud inválida.');
            }
            if (mb_strlen(trim($body[$field])) > $max) {
                throw new AdminCertificateException(400, 'VALIDATION_ERROR', 'Solicitud inválida.');
            }
        }
    }

    /**
     * @return array{
     *   institutionName:string,
     *   certificateText:string,
     *   rectorName:string,
     *   rectorRole:string,
     *   advisorName:string,
     *   advisorRole:string,
     *   rectorSignaturePath:?string,
     *   advisorSignaturePath:?string
     * }
     */
    public static function fromDatabaseRow(mixed $row, ?string $signatureStoragePath = null): array
    {
        if (!is_array($row)) {
            return self::normalize([]);
        }

        $base = self::normalize([
            'institutionName' => $row['institucion_nombre'] ?? null,
            'certificateText' => $row['texto_certificado'] ?? null,
            'rectorName' => $row['rector_nombre'] ?? null,
            'rectorRole' => $row['rector_cargo'] ?? null,
            'advisorName' => $row['asesor_nombre'] ?? null,
            'advisorRole' => $row['asesor_cargo'] ?? null,
        ]);

        if ($signatureStoragePath !== null && $signatureStoragePath !== '') {
            $base['rectorSignaturePath'] = self::resolveSignaturePath(
                $signatureStoragePath,
                $row['rector_firma_filename'] ?? null,
            );
            $base['advisorSignaturePath'] = self::resolveSignaturePath(
                $signatureStoragePath,
                $row['asesor_firma_filename'] ?? null,
            );
        }

        return $base;
    }

    private static function resolveSignaturePath(string $storage, mixed $filename): ?string
    {
        if (!is_string($filename) || $filename === '') {
            return null;
        }
        if (
            str_contains($filename, '/')
            || str_contains($filename, '\\')
            || str_contains($filename, '..')
            || preg_match('/\A(rector|asesor)\.(png|jpg)\z/', $filename) !== 1
        ) {
            return null;
        }

        $path = rtrim($storage, '/') . '/' . $filename;
        return is_file($path) && is_readable($path) ? $path : null;
    }

    private static function optionalPath(mixed $value): ?string
    {
        if (!is_string($value) || trim($value) === '') {
            return null;
        }

        return trim($value);
    }

    private static function value(mixed $value, string $default, int $maxLength): string
    {
        $value = is_string($value) ? trim($value) : '';
        return mb_substr($value === '' ? $default : $value, 0, $maxLength);
    }
}
