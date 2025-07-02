import { jsPDF } from "jspdf";
import autoTable from 'jspdf-autotable';

/**
 * Generates a patient history PDF and opens it in a new tab
 * @param {Object} patient - Patient information
 * @param {Array} history - Array of patient history records
 * @param {String} title - Title for the PDF
 */
export const generatePatientHistoryPDF = (patient, history, title = 'Patient Medical History') => {
    if (!patient) return;

    const doc = new jsPDF();

    // Add title
    doc.setFontSize(18);
    doc.text(title, 105, 15, { align: 'center' });

    // Add patient info
    doc.setFontSize(14);
    doc.text('Patient Information', 14, 30);

    doc.setFontSize(12);
    doc.text(`Name: ${patient.name || `${patient.first_name} ${patient.last_name}`}`, 14, 40);
    doc.text(`Email: ${patient.email}`, 14, 47);

    // Add history records
    doc.setFontSize(14);
    doc.text('Medical History', 14, 60);

    if (!history || history.length === 0) {
        doc.setFontSize(12);
        doc.text('No medical history records found.', 14, 70);
    } else {
        // Create table for history records
        const tableColumn = ["Date", "Specialist", "Diagnosis", "Medications", "Notes"];
        const tableRows = [];

        history.forEach(record => {
            const recordData = [
                new Date(record.created_at).toLocaleDateString(),
                `Dr. ${record.specialist.first_name} ${record.specialist.last_name}`,
                record.diagnosis || '',
                record.medications || '',
                record.notes || ''
            ];
            tableRows.push(recordData);
        });

        // Use the plugin
        autoTable(doc, {
            startY: 70,
            head: [tableColumn],
            body: tableRows,
            headStyles: { fillColor: [66, 139, 202] }
        });
    }

    // Open in new tab
    const pdfBlob = doc.output('blob');
    const url = URL.createObjectURL(pdfBlob);
    window.open(url, '_blank');
};