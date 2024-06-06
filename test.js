const whatsapp = require('./src/index');
const csv = require('csv-parser');
const fs = require('fs');
const phones = [];

// Function to read contacts from CSV
function readContactsFromCSV(filePath) {
    return new Promise((resolve, reject) => {
        const contacts = [];
        fs.createReadStream(filePath)
            .pipe(csv())
            .on('data', (row) => contacts.push(row.Phone))
            .on('end', () => resolve(contacts))
            .on('error', (err) => reject(err));
    });
}

// Function to send WhatsApp messages
async function sendWhatsAppMessages(contacts, message) {
    try {
        await whatsapp.start({ showBrowser: true });
        await whatsapp.send(contacts, message);
        await whatsapp.end();
    } catch (err) {
        console.error(err);
    }
}

// Main function
(async () => {
    try {
        const contactsFilePath = 'contacts.csv'; // Path to your contacts CSV file
        const contacts = await readContactsFromCSV(contactsFilePath);

        // Define your message here
        const message = `
            Hello there,

            This is a dummy message. You can replace this text with any long message you want to send. 
            Make sure to customize this section with the content you wish to deliver to your recipients.

            Best regards,
            Your App Team

            Link to more info: https://example.com
        `;

        console.log(contacts);
        console.log(message);

        await sendWhatsAppMessages(contacts, message);
    } catch (err) {
        console.error('Error:', err);
    }
})();
