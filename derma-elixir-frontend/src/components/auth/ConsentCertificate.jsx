import React from 'react';
import { jsPDF } from 'jspdf';
import { v4 as uuidv4 } from 'uuid';

class ConsentCertificate extends React.Component {
    generateCertificate = () => {
        const { userData, onCertificateGenerated } = this.props;

        // Generate a UUID for the certificate number
        const certificateNumber = uuidv4();

        const doc = new jsPDF();

        // Add clinic logo/header
        doc.setFontSize(22);
        doc.setTextColor(0, 71, 171); // Blue color
        doc.text("DERMA ELIXIR STUDIO", 105, 20, { align: "center" });

        doc.setFontSize(12);
        doc.setTextColor(100, 100, 100);
        doc.text("Advanced Skin Care Clinic", 105, 28, { align: "center" });

        // Add horizontal line
        doc.setDrawColor(0, 71, 171);
        doc.setLineWidth(0.5);
        doc.line(20, 35, 190, 35);

        // Certificate title
        doc.setFontSize(16);
        doc.setTextColor(0, 0, 0);
        doc.text("PATIENT CONSENT CERTIFICATE", 105, 45, { align: "center" });

        // Certificate Number
        doc.setFontSize(10);
        doc.text(`Certificate Number: ${certificateNumber}`, 20, 55);

        // Patient information
        doc.setFontSize(12);
        doc.text("PATIENT INFORMATION", 20, 70);

        doc.setFontSize(10);
        doc.text(`Name: ${userData.first_name} ${userData.last_name}`, 20, 80);
        doc.text(`CNIC: ${userData.cnic}`, 20, 90);
        doc.text(`Contact: ${userData.mobile}`, 20, 100);
        doc.text(`Email: ${userData.email}`, 20, 110);
        doc.text(`Address: ${userData.city}, ${userData.state}`, 20, 120);

        // Consent statement
        doc.setFontSize(12);
        doc.text("CONSENT DECLARATION", 20, 140);

        const consentText =
            "I hereby provide my consent to Derma Elixir Studio to collect, " +
            "store, and process my personal information for the purpose of providing healthcare " +
            "services. I understand that my information will be used for appointment scheduling, " +
            "treatment planning, and communication regarding my care. I acknowledge that I have " +
            "the right to access, modify, or withdraw this consent at any time by contacting " +
            "Derma Elixir Studio administration.";

        doc.setFontSize(10);
        const textLines = doc.splitTextToSize(consentText, 170);
        doc.text(textLines, 20, 150);

        // Agreement statement (replacing signature)
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);

        const agreementText =
            "By downloading and uploading this certificate during the registration process, " +
            "I acknowledge that I have read, understood, and agree to the terms outlined in " +
            "this consent declaration. This electronic acceptance serves as my formal consent " +
            "and is legally binding as of the date shown below.";

        const agreementLines = doc.splitTextToSize(agreementText, 170);
        doc.text(agreementLines, 20, 180);

        // Date
        doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 205);

        // Footer
        doc.setFontSize(8);
        doc.setTextColor(100, 100, 100);
        doc.text("Derma Elixir Studio - Your Skin, Our Priority", 105, 280, { align: "center" });
        doc.text("© 2025 Derma Elixir Studio. All rights reserved.", 105, 285, { align: "center" });

        // Generate filename
        const fileName = `consent_certificate_${userData.first_name.toLowerCase()}_${userData.last_name.toLowerCase()}.pdf`;

        // Get PDF as base64 string
        const pdfDataUri = doc.output('datauristring');

        // Save the PDF locally for user download
        doc.save(fileName);

        // Pass data back to parent component
        if (onCertificateGenerated) {
            onCertificateGenerated(fileName, pdfDataUri);
        }

        return fileName;
    };

    render() {
        return (
            <button
                onClick={this.generateCertificate}
                className="w-full py-3 rounded-lg text-white font-semibold transition duration-300 bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 mb-4"
            >
                Download Consent Certificate
            </button>
        );
    }
}

export default ConsentCertificate;