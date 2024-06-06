# WhatsBulkMessenger
> WhatsBulkMessenger is an **unofficial** API to send bulk messages in WhatsApp.

<p align="center"> 
<img style="border-radius: 5px" src="assets/demo.gif">
</p>

## Installation
```bash
> npm install wbm
```

## Usage
**At the beginning, it will display a QR Code on the terminal, just scan it using the WhatsApp app.<br />
Your session will be remembered, there is no need to authenticate every time.**

### Send the same message to every contact

```javascript
const WhatsBulkMessenger = require('wbm');

WhatsBulkMessenger.start().then(async () => {
    const phones = ['1234567890', '0987654321', '1122334455'];
    const message = 'This is a long dummy message. You can replace this text with any long message you want to send. Make sure to customize this section with the content you wish to deliver to your recipients. Include all necessary details and information clearly and concisely.';
    await WhatsBulkMessenger.send(phones, message);
    await WhatsBulkMessenger.end();
}).catch(err => console.log(err));

```
### Send custom messages to every contact

```javascript
const WhatsBulkMessenger = require('wbm');

WhatsBulkMessenger.start().then(async () => {
    const contacts = [
        { phone: '1234567890', name: 'Alice', age: 25 },
        { phone: '0987654321', name: 'Bob', age: 30 }
    ];
    const message = 'Hi {{name}}, your age is {{age}}';
    // Hi Alice, your age is 25
    // Hi Bob, your age is 30
    await WhatsBulkMessenger.send(contacts, message);
    await WhatsBulkMessenger.end();
}).catch(err => console.log(err));
```

### Send custom messages using YOUR OWN RULE

```javascript
const WhatsBulkMessenger = require('wbm');

WhatsBulkMessenger.start().then(async () => {
    const contacts = [
        { phone: '1234567890', name: 'Alice', group: 'friend' }, 
        { phone: '0987654321', name: 'Bob', group: 'customer' }
    ];
    for (const contact of contacts) {
        let message = 'hi';
        if(contact.group === 'customer') {
            message = 'Good morning ' + contact.name;
        }
        else if(contact.group === 'friend') {
            message = 'Hey ' + contact.name + '. Wassup?';
        }
        await WhatsBulkMessenger.sendTo(contact.phone, message);
    }
    await WhatsBulkMessenger.end();
}).catch(err => console.log(err));

```

## API
### start(options)
* **options**<br />
    Object containing optional parameters as attribute.<br />
    Type: `object`<br />
    * **showBrowser**<br />
    Show browser running the script.<br />
    Default: `false`<br />
    Type: `boolean`<br />
    * **qrCodeData**<br />
    Instead of generating the QR Code, returns the data used to generate the QR Code as a promise.<br />
    Default: `false`<br />
    Type: `boolean`<br />
    * **session**<br />
    Keep user session, so the user must scan the QR Code once.<br />
    Default: `true`<br />
    Type: `boolean`

```javascript
// It will open a browser, return the QR code data as a promise, and not keep user session
WhatsBulkMessenger.start({showBrowser: true, qrCodeData: true, session: false})
.then(async qrCodeData => {
    console.log(qrCodeData); // show data used to generate QR Code
    await WhatsBulkMessenger.waitQRCode();
    // waitQRCode() is necessary when qrCodeData is true
    // ...
    await WhatsBulkMessenger.end();
} ).catch(err => { console.log(err); });
```

### send(phoneOrContacts, message)

Send a message to every phone number.

- **phoneOrContacts**<br />
Array of phone numbers: ['1234567890', ...].<br />
Or <br />
Array of contacts: [{phone: '1234567890', name: 'Alice', group: 'partner', age: 25', any: 'anything', ...}, ...]<br />
Type: `array`

- **message**<br />
Message to send to every phone number.<br />
Text inside curly braces like {{attribute}} will be replaced by the contact object's respective attribute.<br />
Type: `string`

```javascript
WhatsBulkMessenger.start().then(async () => {
    const contacts = [
        {phone: '1234567890', name: 'Alice'},
        {phone: '0987654321', name: 'Bob'}
    ];
    await WhatsBulkMessenger.send(contacts, 'Hey {{name}}');
    // Hey Alice
    // Hey Bob
    await WhatsBulkMessenger.send(['1234567890', '0987654321'], 'Hey there'); 
    // Hey there
    // Hey there
    await WhatsBulkMessenger.end();
}).catch(err => { console.log(err); });
```

### sendTo(phoneOrContact, message)

Send a message to a single phone number.

- **phoneOrContact**<br />
Phone number. Example '1234567890'.<br />
Type: `string`<br />
Or
Contact object. Example: {phone: '1234567890', name: 'Alice', group: 'partner'}<br />
Type: `object`

- **message**<br />
Message to send to the phone number.<br />
Text inside curly braces like {{attribute}} will be replaced by the contact object's respective attribute.<br />
Type: `string`

```javascript
WhatsBulkMessenger.start().then(async () => {
    await WhatsBulkMessenger.sendTo({phone: '1234567890', name: 'Alice'}, 'Hey {{name}}');
    // Hey Alice
    await WhatsBulkMessenger.sendTo('0987654321', 'Hey there');
    // Hey there
    await WhatsBulkMessenger.end();
}).catch(err => { console.log(err); });
```

### end()
This method must be used at the end of WhatsBulkMessenger.start() to finish the browser session.


## Note
**WhatsBulkMessenger** is an **unofficial** solution. It's not recommended to use **WhatsBulkMessenger** in your company or for marketing purposes.

## Contributing

Feel free to create pull requests. For major changes, please open an issue first to discuss what you would like to change.

## License

[MIT](https://choosealicense.com/licenses/mit/)