import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

interface ViolationEmailData {
    agentName: string;
    breakType: string;
    expectedDuration: number; // in minutes
    actualDuration: number; // in minutes
    violationDuration: number; // in minutes
    startTime: Date;
    endTime: Date;
}

export const sendViolationEmail = async (
    recipients: string[],
    data: ViolationEmailData
) => {
    if (recipients.length === 0) return;

    const subject = `Break Violation Alert: ${data.agentName}`;
    const html = `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
            <h2 style="color: #d9534f;">Break Violation Detected</h2>
            <p><strong>Agent:</strong> ${data.agentName}</p>
            <p><strong>Break Type:</strong> ${data.breakType}</p>
            <hr />
            <p><strong>Start Time:</strong> ${data.startTime.toLocaleString()}</p>
            <p><strong>End Time:</strong> ${data.endTime.toLocaleString()}</p>
            <hr />
            <p><strong>Expected Duration:</strong> ${data.expectedDuration} minutes</p>
            <p><strong>Actual Duration:</strong> ${data.actualDuration} minutes</p>
            <p style="color: #d9534f; font-weight: bold;"><strong>Violation Overstay:</strong> ${data.violationDuration} minutes</p>
            <br />
            <p><em>BreakTrack System</em></p>
        </div>
    `;

    try {
        await transporter.sendMail({
            from: `"BreakTrack System" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
            to: recipients,
            subject,
            html,
        });
        console.log(`Violation email sent to: ${recipients.join(', ')}`);
    } catch (error) {
        console.error('Error sending violation email:', error);
    }
};
