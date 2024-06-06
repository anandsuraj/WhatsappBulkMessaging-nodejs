const whatsapp = require('./src/index'); // Import the WhatsApp module
const csv = require('csv-parser'); // Import the CSV parser module
const fs = require('fs'); // Import the file system module
const phones = []; // Array to store phone numbers

// Function to read contacts from a CSV file
function readContactsFromCSV(filePath) {
    return new Promise((resolve, reject) => {
        const contacts = []; // Array to store contacts
        // Read the CSV file
        fs.createReadStream(filePath)
            .pipe(csv()) // Parse the CSV data
            .on('data', (row) => contacts.push(row.Phone)) // Extract phone numbers from each row
            .on('end', () => resolve(contacts)) // Resolve with the extracted contacts
            .on('error', (err) => reject(err)); // Reject if there's an error
    });
}

// Function to send WhatsApp messages
async function sendWhatsAppMessages(contacts, message) {
    try {
        // Start WhatsApp session
        await whatsapp.start({ showBrowser: true });
        // Send messages to contacts
        await whatsapp.send(contacts, message);
        // End WhatsApp session
        await whatsapp.end();
    } catch (err) {
        console.error(err); // Log any errors
    }
}

// Main function
(async () => {
    try {
        const contactsFilePath = 'contacts.csv'; // Path to the contacts CSV file
        const contacts = await readContactsFromCSV(contactsFilePath); // Read contacts from CSV file

        // Define the message to be sent
        const message = `
            Hello there,

            This is a dummy message. You can replace this text with any long message you want to send. 
            Make sure to customize this section with the content you wish to deliver to your recipients.

            Best regards,
            Your App Team

            Link to more info: https://example.com
        `;

        console.log(contacts); // Log the extracted contacts
        console.log(message); // Log the message

        // Send WhatsApp messages to contacts
        await sendWhatsAppMessages(contacts, message);
    } catch (err) {
        console.error('Error:', err); // Log any errors
    }
})();
