<?php

declare(strict_types=1);

final class InstitutionalConfig
{
    public const int NAME_MAX_LENGTH = 160;
    public const int ROLE_MAX_LENGTH = 80;
    public const int TEXT_MAX_LENGTH = 255;

    private const array DEFAULTS = [
        'institutionName' => 'IFTS N.° 14',
        'certificateText' => 'Se certifica que la persona indicada participó del curso detallado, según las fechas certificadas por la institución.',
        'rectorName' => '',
        'rectorRole' => 'Rector/a',
        'advisorName' => '',
        'advisorRole' => 'Asesor/a Pedagógica',
    ];

    /** @return array{institutionName:string,certificateText:string,rectorName:string,rectorRole:string,advisorName:string,advisorRole:string} */
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

    /** @return array{institutionName:string,certificateText:string,rectorName:string,rectorRole:string,advisorName:string,advisorRole:string} */
    public static function fromDatabaseRow(mixed $row): array
    {
        if (!is_array($row)) {
            return self::normalize([]);
        }

        return self::normalize([
            'institutionName' => $row['institucion_nombre'] ?? null,
            'certificateText' => $row['texto_certificado'] ?? null,
            'rectorName' => $row['rector_nombre'] ?? null,
            'rectorRole' => $row['rector_cargo'] ?? null,
            'advisorName' => $row['asesor_nombre'] ?? null,
            'advisorRole' => $row['asesor_cargo'] ?? null,
        ]);
    }

    private static function value(mixed $value, string $default, int $maxLength): string
    {
        $value = is_string($value) ? trim($value) : '';
        return mb_substr($value === '' ? $default : $value, 0, $maxLength);
    }
}
