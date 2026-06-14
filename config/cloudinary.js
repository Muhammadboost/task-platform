const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: 'dev5lc8hc',
  api_key: '286855121513453',
  api_secret: 'TnOepatriR4GIdcjgm3lhrvBYNs'
});

module.exports = cloudinary;
