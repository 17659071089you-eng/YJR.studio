import fs from 'fs';
import https from 'https';
import sizeOf from 'image-size';

const urls = [
'https://pub-cbcd9711af7a442cbd9648e4bf4cea91.r2.dev/apple-tv.jpg',
'https://pub-cbcd9711af7a442cbd9648e4bf4cea91.r2.dev/apple-tv1.jpg',
'https://pub-cbcd9711af7a442cbd9648e4bf4cea91.r2.dev/baseball2.jpg',
'https://pub-cbcd9711af7a442cbd9648e4bf4cea91.r2.dev/baseball3.jpg',
'https://pub-cbcd9711af7a442cbd9648e4bf4cea91.r2.dev/baseball4.jpg',
'https://pub-cbcd9711af7a442cbd9648e4bf4cea91.r2.dev/baseball5.jpg',
'https://pub-cbcd9711af7a442cbd9648e4bf4cea91.r2.dev/baseball6.jpg',
'https://pub-cbcd9711af7a442cbd9648e4bf4cea91.r2.dev/baseball%E4%BA%BA%E7%89%A9-KV.jpg',
'https://pub-cbcd9711af7a442cbd9648e4bf4cea91.r2.dev/car10.jpg',
'https://pub-cbcd9711af7a442cbd9648e4bf4cea91.r2.dev/car5.jpg',
'https://pub-cbcd9711af7a442cbd9648e4bf4cea91.r2.dev/car6.jpg',
'https://pub-cbcd9711af7a442cbd9648e4bf4cea91.r2.dev/car7.jpg',
'https://pub-cbcd9711af7a442cbd9648e4bf4cea91.r2.dev/car8.jpg',
'https://pub-cbcd9711af7a442cbd9648e4bf4cea91.r2.dev/demon.jpg',
'https://pub-cbcd9711af7a442cbd9648e4bf4cea91.r2.dev/girl1.jpg',
'https://pub-cbcd9711af7a442cbd9648e4bf4cea91.r2.dev/girl2.jpg',
'https://pub-cbcd9711af7a442cbd9648e4bf4cea91.r2.dev/ip1.jpg',
'https://pub-cbcd9711af7a442cbd9648e4bf4cea91.r2.dev/ip4.jpg',
'https://pub-cbcd9711af7a442cbd9648e4bf4cea91.r2.dev/ip5.jpg',
'https://pub-cbcd9711af7a442cbd9648e4bf4cea91.r2.dev/ks1.jpg',
'https://pub-cbcd9711af7a442cbd9648e4bf4cea91.r2.dev/robot1.jpg',
'https://pub-cbcd9711af7a442cbd9648e4bf4cea91.r2.dev/tb1.jpg',
'https://pub-cbcd9711af7a442cbd9648e4bf4cea91.r2.dev/tb2.jpg',
'https://pub-cbcd9711af7a442cbd9648e4bf4cea91.r2.dev/tinny1.jpg',
'https://pub-cbcd9711af7a442cbd9648e4bf4cea91.r2.dev/toystory.jpg',
'https://pub-cbcd9711af7a442cbd9648e4bf4cea91.r2.dev/vh1.jpg',
'https://pub-cbcd9711af7a442cbd9648e4bf4cea91.r2.dev/vh2.jpg',
'https://pub-cbcd9711af7a442cbd9648e4bf4cea91.r2.dev/%E5%9C%A3%E8%AF%9E.jpg',
'https://pub-cbcd9711af7a442cbd9648e4bf4cea91.r2.dev/%E6%8D%A2%E8%A3%851.jpg',
'https://pub-cbcd9711af7a442cbd9648e4bf4cea91.r2.dev/%E5%A4%8F%E6%97%A5kv-%E6%8B%B7%E8%B4%9D.jpg',
'https://pub-cbcd9711af7a442cbd9648e4bf4cea91.r2.dev/%E6%8D%A2%E8%A3%852.jpg',
'https://pub-cbcd9711af7a442cbd9648e4bf4cea91.r2.dev/%E6%AF%94%E8%B5%9B.jpg',
'https://pub-cbcd9711af7a442cbd9648e4bf4cea91.r2.dev/%E9%87%8F%E5%AD%90%E9%A3%9E%E8%B7%83%E8%AE%A1%E5%88%92.jpg'
];

async function run() {
  for (const url of urls) {
    try {
      const p = new Promise(resolve => {
        https.get(url, (response) => {
          const chunks = [];
          response.on('data', function (chunk) {
            chunks.push(chunk);
          }).on('end', function() {
            try {
              const buffer = Buffer.concat(chunks);
              const dimensions = sizeOf(buffer);
              resolve(`${url}: ${dimensions.width / dimensions.height}`);
            } catch (e) {
              resolve(`${url}: error ${e.message}`);
            }
          });
        });
      });
      console.log(await p);
    } catch(e) {}
  }
}
run();
