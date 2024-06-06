const csv = require('csv-parser'); // Import the CSV parser module
const fs = require('fs'); // Import the file system module

const users = []; // Array to store phone numbers

// Read contacts from the CSV file using csv-parser
fs.createReadStream('contacts.csv')
    .pipe(csv()) // Parse the CSV data
    .on('data', function (row) { 
        users.push(row.Phone); // Extract phone numbers from each row and push them to the users array
    })
    .on('end', function () {      
        console.log(users); // Log the extracted phone numbers once parsing is complete     
    });
