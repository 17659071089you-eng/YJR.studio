const fs = require('fs');

function unproxy(file) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/https:\/\/wsrv\.nl\/\?url=([^&]+)(&output=webp)?/g, (match, url) => {
    return decodeURIComponent(url);
  });
  
  // also add fetchpriority="high" and decoding="async"
  fs.writeFileSync(file, content);
}

unproxy('src/components/Gallery.tsx');
unproxy('src/components/Projects.tsx');
