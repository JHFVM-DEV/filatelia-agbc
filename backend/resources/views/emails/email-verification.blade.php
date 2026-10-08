<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="es">
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="color-scheme" content="light only" />
    <title>Código de Verificación de Cuenta — Correos de Bolivia</title>
    <!-- Estilos para clientes webmail modernos y compatibilidad móvil -->
    <style type="text/css">
        body, table, td, p, a, li, blockquote { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
        table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; border-collapse: collapse; }
        img { -ms-interpolation-mode: bicubic; border: 0; outline: none; text-decoration: none; display: block; }
        body { margin: 0 !important; padding: 0 !important; width: 100% !important; background-color: #f4f5f8; }
        @media only screen and (max-width: 600px) {
            .email-container { width: 100% !important; max-width: 100% !important; }
            .content-padding { padding: 26px 18px !important; }
            .code-text { font-size: 30px !important; letter-spacing: 5px !important; line-height: 36px !important; }
        }
    </style>
</head>
<body bgcolor="#f4f5f8" style="margin: 0; padding: 0; background-color: #f4f5f8; font-family: Arial, Helvetica, sans-serif; -webkit-font-smoothing: antialiased;">

    <!-- Contenedor Maestro compatible con Zimbra / Webmail Institucional / Gmail / Outlook -->
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" bgcolor="#f4f5f8" style="background-color: #f4f5f8; margin: 0; padding: 30px 10px; width: 100% !important; border-collapse: collapse;">
        <tr>
            <td align="center" valign="top">

                <!-- Tarjeta Principal del Mensaje (580px de ancho fijo, compatible con vista dividida de Zimbra) -->
                <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="580" bgcolor="#ffffff" class="email-container" style="width: 580px; max-width: 580px; table-layout: fixed; background-color: #ffffff; border-radius: 12px; border: 1px solid #dcd8d0; border-collapse: separate; overflow: hidden;">
                    
                    <!-- 1. Cabecera Institucional Azul Marino con Borde Dorado -->
                    <tr>
                        <td align="center" valign="middle" bgcolor="#002B5B" style="background-color: #002B5B; padding: 28px 24px 24px 24px; border-bottom: 4px solid #f4c400; text-align: center;">
                            @php
                                $filateliaLogoPath = public_path('images/FILATELIA-1.png');
                            @endphp
                            @if(file_exists($filateliaLogoPath))
                                <table role="presentation" border="0" cellpadding="0" cellspacing="0" align="center" style="margin: 0 auto 14px auto;">
                                    <tr>
                                        <td align="center">
                                            <img src="{{ isset($message) ? $message->embed($filateliaLogoPath) : asset('images/FILATELIA-1.png') }}" 
                                                 alt="Filatelia Bolivia" 
                                                 width="150" 
                                                 border="0" 
                                                 style="display: block; width: 150px; max-width: 150px; height: auto; border: 0; outline: none; margin: 0 auto;" />
                                        </td>
                                    </tr>
                                </table>
                            @endif
                            <h1 style="margin: 0; padding: 0; color: #ffffff; font-family: Arial, Helvetica, sans-serif; font-size: 20px; font-weight: bold; letter-spacing: 0.5px; line-height: 26px;">
                                Filatelia Bolivia
                            </h1>
                            <p style="margin: 6px 0 0 0; padding: 0; color: #cbd5e1; font-family: Arial, Helvetica, sans-serif; font-size: 11px; font-weight: normal; letter-spacing: 1.5px; text-transform: uppercase; line-height: 16px;">
                                Correos de Bolivia
                            </p>
                        </td>
                    </tr>

                    <!-- 2. Cuerpo del Mensaje con Instrucciones y Código -->
                    <tr>
                        <td class="content-padding" bgcolor="#ffffff" valign="top" style="padding: 34px 32px 30px 32px; background-color: #ffffff; font-family: Arial, Helvetica, sans-serif; text-align: left;">
                            <div style="font-family: Arial, Helvetica, sans-serif; font-size: 16px; font-weight: bold; color: #002B5B; margin-bottom: 14px; line-height: 22px;">
                                Estimado(a) {{ $userName }},
                            </div>

                            <p style="font-family: Arial, Helvetica, sans-serif; font-size: 14px; line-height: 22px; color: #475569; margin: 0 0 16px 0;">
                                Gracias por registrarse en la plataforma oficial de Filatelia Bolivia de <strong>Correos de Bolivia</strong>.
                            </p>

                            <p style="font-family: Arial, Helvetica, sans-serif; font-size: 14px; line-height: 22px; color: #475569; margin: 0 0 20px 0;">
                                Para confirmar su correo electrónico (<strong style="color: #002B5B;">{{ $userEmail }}</strong>) y habilitar todas las funciones del sistema —incluyendo la adquisición de piezas bajo custodia, favoritos y emisión de certificados notariados— introduzca el siguiente código en la pantalla de verificación:
                            </p>

                            <!-- Recuadro del Código de 6 Dígitos (100% Inline Table con bgcolor y borde para Zimbra) -->
                            <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 20px 0 22px 0; border-collapse: separate;">
                                <tr>
                                    <td align="center" valign="middle" bgcolor="#fbf9f2" style="background-color: #fbf9f2; border: 2px dashed #f4c400; border-radius: 8px; padding: 22px 16px; text-align: center;">
                                        <div style="font-family: Arial, Helvetica, sans-serif; font-size: 11px; font-weight: bold; text-transform: uppercase; letter-spacing: 2px; color: #854d0e; margin-bottom: 8px; line-height: 16px;">
                                            CÓDIGO DE CONFIRMACIÓN
                                        </div>
                                        <div class="code-text" style="font-family: 'Courier New', Courier, monospace; font-size: 36px; font-weight: bold; letter-spacing: 6px; color: #002B5B; margin: 0; line-height: 42px; white-space: nowrap;">
                                            {{ $code }}
                                        </div>
                                        <div style="font-family: Arial, Helvetica, sans-serif; font-size: 11px; color: #b45309; font-weight: bold; margin-top: 10px; line-height: 16px;">
                                            ⏱ Vigente durante los próximos 15 minutos
                                        </div>
                                    </td>
                                </tr>
                            </table>

                            <!-- Aviso Notarial y de Seguridad -->
                            <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 20px 0 0 0; border-collapse: separate;">
                                <tr>
                                    <td bgcolor="#f8fafc" style="background-color: #f8fafc; border-left: 4px solid #002B5B; padding: 14px 16px; border-radius: 0 6px 6px 0; font-family: Arial, Helvetica, sans-serif; font-size: 12px; color: #64748b; line-height: 19px;">
                                        <strong style="color: #334155;">Aviso de Seguridad:</strong> Si usted no solicitó la creación de esta cuenta en Correos de Bolivia, puede desestimar este mensaje de forma segura.
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- 3. Pie de Página Oficial con Logo de Correos de Bolivia -->
                    <tr>
                        <td align="center" valign="middle" bgcolor="#f8fafc" style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 26px 30px; font-family: Arial, Helvetica, sans-serif; text-align: center;">
                            @php
                                $correosLogoPath = public_path('images/cropped-LOGOcen.png');
                                if (!file_exists($correosLogoPath)) {
                                    $correosLogoPath = public_path('images/LOGOcen.png');
                                }
                            @endphp
                            @if(file_exists($correosLogoPath))
                                <table role="presentation" border="0" cellpadding="0" cellspacing="0" align="center" style="margin: 0 auto 14px auto;">
                                    <tr>
                                        <td align="center">
                                            <img src="{{ isset($message) ? $message->embed($correosLogoPath) : asset('images/cropped-LOGOcen.png') }}" 
                                                 alt="Correos de Bolivia" 
                                                 width="170" 
                                                 border="0" 
                                                 style="display: block; width: 170px; max-width: 170px; height: auto; border: 0; outline: none; margin: 0 auto;" />
                                        </td>
                                    </tr>
                                </table>
                            @endif
                            <p style="margin: 0 0 4px 0; font-size: 12px; font-weight: bold; color: #334155; font-family: Arial, Helvetica, sans-serif; line-height: 18px;">
                                Filatelia Bolivia — Correos de Bolivia
                            </p>
                            <p style="margin: 0 0 6px 0; font-size: 11px; color: #64748b; line-height: 17px; font-family: Arial, Helvetica, sans-serif;">
                                Custodia patrimonial, peritaje numismático y filatélico oficial del Estado Plurinacional de Bolivia.
                            </p>
                            <p style="margin: 0; font-size: 10px; color: #94a3b8; font-family: Arial, Helvetica, sans-serif; line-height: 15px;">
                                Este es un correo automático de seguridad. Por favor no responda a este mensaje.
                            </p>
                        </td>
                    </tr>

                </table>

            </td>
        </tr>
    </table>

</body>
</html>
