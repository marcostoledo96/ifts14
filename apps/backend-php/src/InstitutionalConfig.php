<?php

declare(strict_types=1);

final class InstitutionalConfig
{
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
            'institutionName' => self::value($config['institutionName'] ?? null, self::DEFAULTS['institutionName']),
            'certificateText' => self::value($config['certificateText'] ?? null, self::DEFAULTS['certificateText']),
            'rectorName' => self::value($config['rectorName'] ?? null, self::DEFAULTS['rectorName']),
            'rectorRole' => self::value($config['rectorRole'] ?? null, self::DEFAULTS['rectorRole']),
            'advisorName' => self::value($config['advisorName'] ?? null, self::DEFAULTS['advisorName']),
            'advisorRole' => self::value($config['advisorRole'] ?? null, self::DEFAULTS['advisorRole']),
        ];
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

    private static function value(mixed $value, string $default): string
    {
        $value = is_string($value) ? trim($value) : '';
        return mb_substr($value === '' ? $default : $value, 0, self::TEXT_MAX_LENGTH);
    }
}
