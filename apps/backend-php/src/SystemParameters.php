<?php

declare(strict_types=1);

/**
 * Catálogo y validación de parámetros de sistema (cert_parametros_sistema).
 * Claves seed conocidas; el PUT solo acepta esas claves.
 */
final class SystemParameters
{
    public const int TEXT_MAX_LENGTH = 500;
    public const int TEXTAREA_MAX_LENGTH = 2000;

    /**
     * Metadatos canónicos (deben coincidir con el seed de la migración 013).
     *
     * @var array<string, array{type:string,group:string,label:string,default:string}>
     */
    public const array CATALOG = [
        'texto_institucional' => [
            'type' => 'textarea',
            'group' => 'identidad',
            'label' => 'Texto institucional base',
            'default' => 'El Instituto de Formación Técnica Superior N.° 14 depende de la Dirección de Formación Técnica Superior del Gobierno de la Ciudad de Buenos Aires.',
        ],
        'titulo_certificado' => [
            'type' => 'texto',
            'group' => 'certificados',
            'label' => 'Título del certificado',
            'default' => 'Certificado de Aprobación',
        ],
        'texto_qr' => [
            'type' => 'textarea',
            'group' => 'certificados',
            'label' => 'Texto de validación QR',
            'default' => 'Escaneá el código para verificar la autenticidad de este certificado en el sitio oficial del IFTS N.° 14.',
        ],
        'email_contacto' => [
            'type' => 'email',
            'group' => 'contacto',
            'label' => 'Email de contacto institucional',
            'default' => 'contacto@example.invalid',
        ],
        'texto_validacion' => [
            'type' => 'textarea',
            'group' => 'contacto',
            'label' => 'Texto aclaratorio (validación pública)',
            'default' => 'Este espacio permite verificar la validez de los certificados emitidos por el IFTS N.° 14.',
        ],
        'sitio_instituto' => [
            'type' => 'url',
            'group' => 'contacto',
            'label' => 'Enlace al sitio del instituto',
            'default' => 'www.ifts14.edu.ar',
        ],
        'msg_valido' => [
            'type' => 'textarea',
            'group' => 'validacion',
            'label' => 'Mensaje — Certificado válido',
            'default' => 'Certificado válido y vigente, emitido por el IFTS N.° 14.',
        ],
        'msg_revocado' => [
            'type' => 'textarea',
            'group' => 'validacion',
            'label' => 'Mensaje — Certificado revocado',
            'default' => 'Este certificado fue revocado por la institución y ya no es válido.',
        ],
        'msg_no_encontrado' => [
            'type' => 'textarea',
            'group' => 'validacion',
            'label' => 'Mensaje — Token no encontrado',
            'default' => 'No se encontró ningún certificado asociado a este código.',
        ],
    ];

    /** @return list<string> */
    public static function knownKeys(): array
    {
        return array_keys(self::CATALOG);
    }

    /**
     * @param array<string, string> $stored clave => valor desde DB
     * @return array<string, array{value:string,type:string,group:string,label:string}>
     */
    public static function dtoFromStored(array $stored): array
    {
        $out = [];
        foreach (self::CATALOG as $clave => $meta) {
            $value = array_key_exists($clave, $stored) ? $stored[$clave] : $meta['default'];
            $out[$clave] = [
                'value' => $value,
                'type' => $meta['type'],
                'group' => $meta['group'],
                'label' => $meta['label'],
            ];
        }

        return $out;
    }

    /**
     * Valida mapa plano clave => string del body PUT.
     *
     * @param mixed $parameters
     * @return array<string, string> valores normalizados (trim)
     */
    public static function assertAndNormalizeWrite(mixed $parameters): array
    {
        if ($parameters === null) {
            return [];
        }
        if (!is_array($parameters)) {
            throw new AdminCertificateException(400, 'VALIDATION_ERROR', 'Solicitud inválida.');
        }

        $normalized = [];
        foreach ($parameters as $clave => $valor) {
            if (!is_string($clave) || !isset(self::CATALOG[$clave])) {
                throw new AdminCertificateException(400, 'VALIDATION_ERROR', 'Solicitud inválida.');
            }
            if (!is_string($valor)) {
                throw new AdminCertificateException(400, 'VALIDATION_ERROR', 'Solicitud inválida.');
            }
            $meta = self::CATALOG[$clave];
            $trimmed = trim($valor);
            $max = $meta['type'] === 'textarea' ? self::TEXTAREA_MAX_LENGTH : self::TEXT_MAX_LENGTH;
            if (mb_strlen($trimmed) > $max) {
                throw new AdminCertificateException(400, 'VALIDATION_ERROR', 'Solicitud inválida.');
            }
            if ($meta['type'] === 'email' && $trimmed !== '' && filter_var($trimmed, FILTER_VALIDATE_EMAIL) === false) {
                throw new AdminCertificateException(400, 'VALIDATION_ERROR', 'Solicitud inválida.');
            }
            // url: aceptar host/path sin esquema (como el seed); validación laxa.
            if ($meta['type'] === 'url' && $trimmed !== '' && preg_match('/\s/', $trimmed) === 1) {
                throw new AdminCertificateException(400, 'VALIDATION_ERROR', 'Solicitud inválida.');
            }
            $normalized[$clave] = $trimmed;
        }

        return $normalized;
    }
}
