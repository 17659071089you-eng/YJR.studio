const fs = require('fs');

function addProxy(file) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/img: 'https:\/\/pub-cbcd9711af7a442cbd9648e4bf4cea91\.r2\.dev\/([^']+)'/g, (match, path) => {
    const rawUrl = 'https://pub-cbcd9711af7a442cbd9648e4bf4cea91.r2.dev/' + path;
    const proxied = `https://wsrv.nl/?url=${encodeURIComponent(rawUrl)}&w=800&q=80&output=webp`;
    return `img: '${proxied}'`;
  });
  
  content = content.replace(/image: 'https:\/\/pub-cbcd9711af7a442cbd9648e4bf4cea91\.r2\.dev\/([^']+)'/g, (match, path) => {
    const rawUrl = 'https://pub-cbcd9711af7a442cbd9648e4bf4cea91.r2.dev/' + path;
    const proxied = `https://wsrv.nl/?url=${encodeURIComponent(rawUrl)}&w=800&q=80&output=webp`;
    return `image: '${proxied}'`;
  });

  content = content.replace(/detailsImage: 'https:\/\/pub-cbcd9711af7a442cbd9648e4bf4cea91\.r2\.dev\/([^']+)'/g, (match, path) => {
    const rawUrl = 'https://pub-cbcd9711af7a442cbd9648e4bf4cea91.r2.dev/' + path;
    const proxied = `https://wsrv.nl/?url=${encodeURIComponent(rawUrl)}&w=1200&q=85&output=webp`;
    return `detailsImage: '${proxied}'`;
  });

  fs.writeFileSync(file, content);
}

addProxy('src/components/Gallery.tsx');
addProxy('src/components/Projects.tsx');
