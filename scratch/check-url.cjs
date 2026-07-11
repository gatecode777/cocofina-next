// scratch/check-url.cjs
const https = require('https');

const urls = [
  'https://ik.imagekit.io/zjd5xircoy/cocofina/products/products-1779689235854-64517.png',
  'https://ik.imagekit.io/zjd5xircoy/products/products-1779689235854-64517.png',
  'https://ik.imagekit.io/zjd5xircoy/products-1779689235854-64517.png',
  'https://ik.imagekit.io/zjd5xircoy/cocofina/products-1779689235854-64517.png'
];

function checkUrl(url) {
  return new Promise((resolve) => {
    https.request(url, { method: 'HEAD' }, (res) => {
      console.log(`URL: ${url} -> Status: ${res.statusCode}`);
      resolve({ url, status: res.statusCode });
    }).on('error', (err) => {
      console.log(`URL: ${url} -> Error: ${err.message}`);
      resolve({ url, status: 0 });
    }).end();
  });
}

async function run() {
  for (const url of urls) {
    await checkUrl(url);
  }
}

run();
