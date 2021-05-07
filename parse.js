 
  const csv = require('csv-parser');
  const fs = require('fs');
          
  const users = [];
  fs.createReadStream('contacts.csv')
    .pipe(csv())
    .on('data', function (row) { 
      users.push(row.Phone)
    })
    .on('end', function () {      
        console.log(users)      
    })
