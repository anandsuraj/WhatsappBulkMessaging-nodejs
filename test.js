const wbm = require('./src/index');
const csv = require('csv-parser');
const fs = require('fs');
const phones = [];

//import contact from csv
fs.createReadStream('contacts.csv')
    .pipe(csv())
    .on('data', function (row) { 
        phones.push(row.Phone)
    })
    .on('end', function () {         
     
});
//send message 
(async () => {
    await wbm.start({showBrowser: true}).then(async () => { 
    //const str1 ='Hi \r\n  \n' ;
    const str2 = 'Your Friend Neha earned 5000 Rs from Nojoto- Indian App to Show Talent & Become Famous  \r\n \n';   //line 1 
    const line = str2;
    const str3 = "Install Now & Earn upto 5000 Rs  \r\n \n";//line 2 
    const line2 = line.concat(str3);
    const str4 = 'https://p9zyj.app.goo.gl/NojotoTWA \r\n \n'; //line 3
    const message = line2.concat(str4);     
  
    console.log(phones)   
    console.log(message)
    
    await wbm.send(phones, message);
    await wbm.end();   
    }).catch(err => console.log(err));
})();

