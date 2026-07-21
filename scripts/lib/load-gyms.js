#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

function loadGyms(root) {
  const dataPath = path.join(root || path.resolve(__dirname, '../..'), 'data.js');
  const src = fs.readFileSync(dataPath, 'utf8');
  const fn = new Function(`${src}\nreturn GYMS;`);
  return fn();
}

module.exports = { loadGyms };
