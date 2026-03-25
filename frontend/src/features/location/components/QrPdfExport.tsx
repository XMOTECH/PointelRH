import jsPDF from 'jspdf';
import type { Site } from '../api/locations.api';

export async function exportQrPdf(site: Site, qrSvgElement: SVGSVGElement) {
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  // Convert SVG to canvas
  const svgData = new XMLSerializer().serializeToString(qrSvgElement);
  const canvas = document.createElement('canvas');
  canvas.width = 600;
  canvas.height = 600;
  const ctx = canvas.getContext('2d')!;
  const img = new Image();

  await new Promise<void>((resolve) => {
    img.onload = () => {
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, 600, 600);
      ctx.drawImage(img, 0, 0, 600, 600);
      resolve();
    };
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  });

  const qrDataUrl = canvas.toDataURL('image/png');
  const pageWidth = 210;

  // Header
  pdf.setFillColor(0, 65, 200);
  pdf.rect(0, 0, pageWidth, 40, 'F');
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(22);
  pdf.setFont('helvetica', 'bold');
  pdf.text('PointelRH', pageWidth / 2, 18, { align: 'center' });
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'normal');
  pdf.text('Terminal QR - Point de Pointage', pageWidth / 2, 30, { align: 'center' });

  // Site name
  pdf.setTextColor(30, 30, 30);
  pdf.setFontSize(18);
  pdf.setFont('helvetica', 'bold');
  pdf.text(site.name, pageWidth / 2, 60, { align: 'center' });

  // QR Code
  const qrSize = 80;
  pdf.addImage(qrDataUrl, 'PNG', (pageWidth - qrSize) / 2, 70, qrSize, qrSize);

  // Instructions
  pdf.setFontSize(12);
  pdf.setTextColor(80, 80, 80);
  pdf.setFont('helvetica', 'normal');
  pdf.text('Scannez ce code QR pour pointer votre présence.', pageWidth / 2, 165, { align: 'center' });

  // Footer info
  pdf.setFontSize(9);
  pdf.setTextColor(150, 150, 150);
  pdf.text(`Rayon de géo-fencing : ${site.radius_meters}m`, pageWidth / 2, 180, { align: 'center' });
  pdf.text(`Coordonnées : ${site.latitude.toFixed(6)}, ${site.longitude.toFixed(6)}`, pageWidth / 2, 186, { align: 'center' });
  pdf.text(`Statut : ${site.is_active ? 'Actif' : 'Inactif'}`, pageWidth / 2, 192, { align: 'center' });

  pdf.save(`QR-Terminal-${site.name.replace(/\s+/g, '-')}.pdf`);
}
