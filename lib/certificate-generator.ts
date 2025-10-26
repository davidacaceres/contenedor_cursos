
import jsPDF from 'jspdf';

interface CertificateData {
  studentName: string;
  courseName: string;
  instructorName: string;
  completionDate: Date;
  certificateCode: string;
}

export function generateCertificatePDF(data: CertificateData): jsPDF {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });

  const width = doc.internal.pageSize.getWidth();
  const height = doc.internal.pageSize.getHeight();

  // Fondo y bordes
  doc.setFillColor(250, 249, 246);
  doc.rect(0, 0, width, height, 'F');
  
  // Borde decorativo exterior
  doc.setDrawColor(41, 128, 185);
  doc.setLineWidth(3);
  doc.rect(10, 10, width - 20, height - 20);
  
  // Borde decorativo interior
  doc.setDrawColor(52, 152, 219);
  doc.setLineWidth(1);
  doc.rect(15, 15, width - 30, height - 30);

  // Título "CERTIFICADO"
  doc.setFontSize(48);
  doc.setTextColor(41, 128, 185);
  doc.setFont('helvetica', 'bold');
  doc.text('CERTIFICADO', width / 2, 40, { align: 'center' });

  // Subtítulo
  doc.setFontSize(16);
  doc.setTextColor(100, 100, 100);
  doc.setFont('helvetica', 'normal');
  doc.text('de Finalización', width / 2, 50, { align: 'center' });

  // Línea decorativa
  doc.setDrawColor(41, 128, 185);
  doc.setLineWidth(0.5);
  doc.line(60, 55, width - 60, 55);

  // Texto "Se certifica que"
  doc.setFontSize(14);
  doc.setTextColor(80, 80, 80);
  doc.setFont('helvetica', 'normal');
  doc.text('Se certifica que', width / 2, 70, { align: 'center' });

  // Nombre del estudiante (destacado)
  doc.setFontSize(32);
  doc.setTextColor(41, 128, 185);
  doc.setFont('helvetica', 'bold');
  const maxNameWidth = width - 60;
  const nameLines = doc.splitTextToSize(data.studentName, maxNameWidth);
  doc.text(nameLines, width / 2, 85, { align: 'center' });

  // Línea debajo del nombre
  const nameYPosition = 85 + (nameLines.length - 1) * 10;
  doc.setDrawColor(41, 128, 185);
  doc.setLineWidth(0.3);
  doc.line(60, nameYPosition + 3, width - 60, nameYPosition + 3);

  // Texto "Ha completado exitosamente el curso"
  doc.setFontSize(14);
  doc.setTextColor(80, 80, 80);
  doc.setFont('helvetica', 'normal');
  doc.text('ha completado exitosamente el curso', width / 2, nameYPosition + 15, { align: 'center' });

  // Nombre del curso
  doc.setFontSize(22);
  doc.setTextColor(52, 73, 94);
  doc.setFont('helvetica', 'bold');
  const maxCourseWidth = width - 80;
  const courseLines = doc.splitTextToSize(data.courseName, maxCourseWidth);
  doc.text(courseLines, width / 2, nameYPosition + 28, { align: 'center' });

  // Fecha e instructor
  const bottomY = height - 50;
  doc.setFontSize(12);
  doc.setTextColor(100, 100, 100);
  doc.setFont('helvetica', 'normal');

  // Fecha
  const formattedDate = data.completionDate.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  doc.text(`Fecha de emisión: ${formattedDate}`, width / 2, bottomY, { align: 'center' });

  // Instructor
  doc.text(`Instructor: ${data.instructorName}`, width / 2, bottomY + 8, { align: 'center' });

  // Código de verificación
  doc.setFontSize(10);
  doc.setTextColor(120, 120, 120);
  doc.text(`Código de verificación: ${data.certificateCode}`, width / 2, bottomY + 16, { align: 'center' });
  
  // Nota de verificación
  doc.setFontSize(9);
  doc.setTextColor(150, 150, 150);
  doc.text('Verifica la autenticidad de este certificado en tu plataforma', width / 2, height - 15, { align: 'center' });

  return doc;
}

export function generateCertificateCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const segments = 4;
  const segmentLength = 4;
  
  let code = 'CERT';
  
  for (let i = 0; i < segments; i++) {
    code += '-';
    for (let j = 0; j < segmentLength; j++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
  }
  
  return code;
}
