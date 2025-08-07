const crypto = require('crypto');

const secret = crypto.randomBytes(32).toString('hex');
console.log(secret); // Output: 3a41b7d5c5d5a7a60d77e5e7a65f87a80790fa562cfc33a9be7d6fc30f6a1c6
