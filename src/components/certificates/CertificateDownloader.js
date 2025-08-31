import React, { useState } from 'react';
import { Download } from 'lucide-react';
import jsPDF from 'jspdf';
import QRCode from 'qrcode';
import { certificateService } from '../../services';

const CertificateDownloader = ({ 
    certificateId, 
    certificateNumber,
    studentName,
    className = '',
    buttonText = 'Descargar PDF',
    showIcon = true,
    variant = 'primary' // 'primary', 'secondary', 'outline'
}) => {
    const [downloading, setDownloading] = useState(false);
    const [error, setError] = useState(null);

    const getButtonClasses = () => {
        const baseClasses = 'inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed';
        
        switch (variant) {
            case 'secondary':
                return `${baseClasses} bg-neutral-600 text-white hover:bg-neutral-700`;
            case 'outline':
                return `${baseClasses} border border-neutral-300 text-neutral-700 bg-white hover:bg-neutral-50`;
            default: // primary
                return `${baseClasses} bg-blue-600 text-white hover:bg-blue-700`;
        }
    };

    const loadImageAsync = (src) => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'anonymous'; // Para evitar problemas de CORS
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = src;
        });
    };

    const generateQRCode = async (data) => {
        try {
            return await QRCode.toDataURL(data, {
                width: 200,
                margin: 1,
                color: {
                    dark: '#000000',
                    light: '#FFFFFF'
                }
            });
        } catch (error) {
            console.error('Error generating QR code:', error);
            throw error;
        }
    };

    const downloadCertificate = async () => {
        if (!certificateId) {
            setError('ID de certificado requerido');
            return;
        }

        setDownloading(true);
        setError(null);

        try {
            console.log('Obteniendo datos de descarga para certificado:', certificateId);
            
            // 1. Obtener datos del backend
            const response = await certificateService.getCertificateDownloadData(certificateId);
            
            if (!response.success) {
                throw new Error(response.error || 'Error al obtener datos del certificado');
            }

            const { download_data } = response;
            const { certificate, template, qr_data } = download_data;

            console.log('Datos obtenidos:', { certificate: certificate.student_name, template: template.name });

            // 2. Generar QR Code
            const qrDataUrl = await generateQRCode(qr_data.verification_url);

            // 3. Crear PDF en formato landscape para certificado
            const pdf = new jsPDF('landscape', 'px', [800, 600]);

            // 4. Cargar plantilla como fondo
            if (template.background_image) {
                try {
                    const backgroundImg = await loadImageAsync(template.background_image);
                    pdf.addImage(backgroundImg, 'JPEG', 0, 0, 800, 600);
                } catch (imgError) {
                    console.warn('No se pudo cargar imagen de fondo, continuando sin ella:', imgError);
                    // Agregar fondo simple si no se puede cargar la imagen
                    pdf.setFillColor(248, 250, 252); // bg-slate-50
                    pdf.rect(0, 0, 800, 600, 'F');
                    
                    // Borde decorativo
                    pdf.setDrawColor(59, 130, 246); // border-blue-500
                    pdf.setLineWidth(8);
                    pdf.rect(20, 20, 760, 560);
                }
            } else {
                // Fondo simple si no hay template
                pdf.setFillColor(248, 250, 252);
                pdf.rect(0, 0, 800, 600, 'F');
                pdf.setDrawColor(59, 130, 246);
                pdf.setLineWidth(8);
                pdf.rect(20, 20, 760, 560);
            }

            // 5. Configurar fuente
            pdf.setFont('Arial', 'normal');

            // 6. Superponer datos del certificado usando posiciones de la plantilla o por defecto
            const config = template.config || {};
            
            // Título
            pdf.setFont('Arial', 'bold');
            pdf.setFontSize(config.title_size || 28);
            pdf.setTextColor(0, 0, 0);
            const titleY = config.title_position?.y || 200;
            pdf.text('CERTIFICADO DE FINALIZACIÓN', 400, titleY, { align: 'center' });

            // Línea decorativa bajo el título
            pdf.setDrawColor(234, 179, 8); // text-yellow-500
            pdf.setLineWidth(3);
            pdf.line(300, titleY + 15, 500, titleY + 15);

            // Nombre del estudiante
            pdf.setFont('Arial', 'bold');
            pdf.setFontSize(config.name_size || 32);
            pdf.setTextColor(37, 99, 235); // text-blue-600
            const nameY = config.name_position?.y || 280;
            pdf.text(certificate.student_name, 400, nameY, { align: 'center' });

            // Texto "ha completado exitosamente"
            pdf.setFont('Arial', 'normal');
            pdf.setFontSize(16);
            pdf.setTextColor(75, 85, 99); // text-gray-600
            pdf.text('ha completado exitosamente el curso', 400, nameY + 35, { align: 'center' });

            // Nombre del curso
            pdf.setFont('Arial', 'bold');
            pdf.setFontSize(config.course_size || 20);
            pdf.setTextColor(0, 0, 0);
            const courseY = config.course_position?.y || 360;
            pdf.text(certificate.course_title, 400, courseY, { align: 'center' });

            // Información adicional del curso
            pdf.setFont('Arial', 'normal');
            pdf.setFontSize(14);
            pdf.setTextColor(107, 114, 128); // text-gray-500
            
            const infoY = courseY + 40;
            const leftX = 200;
            const rightX = 600;
            
            pdf.text(`Nivel: ${certificate.course_level}`, leftX, infoY);
            pdf.text(`Duración: ${certificate.course_duration}`, rightX, infoY, { align: 'right' });
            
            pdf.text(`Categoría: ${certificate.course_category}`, leftX, infoY + 20);
            pdf.text(`Calificación: ${certificate.final_grade}`, rightX, infoY + 20, { align: 'right' });

            // Fecha e instructor
            pdf.setFont('Arial', 'normal');
            pdf.setFontSize(12);
            pdf.setTextColor(75, 85, 99);
            
            const bottomY = config.date_position?.y || 500;
            pdf.text(`Emitido el: ${certificate.issued_date}`, 100, bottomY);
            pdf.text(`Instructor: ${certificate.instructor_name}`, 100, bottomY + 20);

            // Número de certificado
            pdf.setFont('Arial', 'normal');
            pdf.setFontSize(10);
            pdf.setTextColor(107, 114, 128);
            pdf.text(`N° ${certificate.number}`, 400, bottomY + 40, { align: 'center' });

            // 7. Agregar QR Code
            try {
                const qrImg = await loadImageAsync(qrDataUrl);
                const qrX = config.qr_position?.x || 650;
                const qrY = config.qr_position?.y || 450;
                pdf.addImage(qrImg, 'PNG', qrX, qrY, 80, 80);
                
                // Texto del QR
                pdf.setFontSize(8);
                pdf.text('Escanea para verificar', qrX + 40, qrY + 90, { align: 'center' });
            } catch (qrError) {
                console.warn('No se pudo agregar QR code:', qrError);
                // Agregar texto de verificación como fallback
                pdf.setFontSize(10);
                pdf.text('Verificar en:', 650, 480);
                pdf.text(qr_data.public_url, 650, 495);
            }

            // 8. Pie de página
            pdf.setFont('Arial', 'normal');
            pdf.setFontSize(10);
            pdf.setTextColor(107, 114, 128);
            pdf.text('Centro de Formación Desarrollo Agropecuario (CFDA)', 400, 580, { align: 'center' });

            // 9. Guardar el PDF
            const fileName = `Certificado_${certificate.student_name.replace(/\s+/g, '_')}_${certificate.course_title.substring(0, 20).replace(/\s+/g, '_')}.pdf`;
            pdf.save(fileName);

            console.log('Certificado descargado exitosamente:', fileName);
            
        } catch (error) {
            console.error('Error descargando certificado:', error);
            setError(error.response?.data?.message || error.message || 'Error al descargar certificado');
        } finally {
            setDownloading(false);
        }
    };

    return (
        <div className={`relative ${className}`}>
            <button
                onClick={downloadCertificate}
                disabled={downloading}
                className={getButtonClasses()}
            >
                {showIcon && (
                    <Download className={`w-4 h-4 ${downloading ? 'animate-bounce' : ''} ${buttonText ? 'mr-2' : ''}`} />
                )}
                {downloading ? 'Descargando...' : buttonText}
            </button>
            
            {error && (
                <div className="absolute top-full left-0 mt-2 p-2 bg-red-100 border border-red-300 rounded text-red-700 text-xs whitespace-nowrap z-10">
                    {error}
                    <button 
                        onClick={() => setError(null)}
                        className="ml-2 text-red-500 hover:text-red-700"
                    >
                        ×
                    </button>
                </div>
            )}
        </div>
    );
};

export default CertificateDownloader;