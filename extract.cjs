const sharp = require('sharp');
const fs = require('fs');

async function process() {
  if (!fs.existsSync('public/images')) {
    fs.mkdirSync('public/images', { recursive: true });
  }

  // 1. Logo
  await sharp('assets/ark-clinic-hero-reference.png')
    .extract({ left: 65, top: 4, width: 88, height: 88 })
    .toFile('public/images/ark-logo.png');

  // 2. Clean reception visual (no bottom bar sliver, pure interior)
  await sharp('assets/ark-clinic-hero-reference.png')
    .extract({ left: 652, top: 88, width: 1020, height: 605 })
    .toFile('public/images/ark-clinic-reception.png');

  console.log('Saved clean reception and logo!');
}

process().catch(console.error);
