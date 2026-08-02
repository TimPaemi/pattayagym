'use strict';
/**
 * Retired cross-property block.
 * Pattaya.Gym identifies Tim and Paemi as authors and TimPaemi Co., Ltd. as
 * publisher, while linking only to timpaemi.com. No sister-site mesh is emitted.
 */
const fs = require('fs');
const path = require('path');

const SITE = 'https://pattaya-gym.com';
const ROOT = path.resolve(__dirname, '../..');

function guideCount() {
  const dir = path.join(ROOT, 'guides');
  if (!fs.existsSync(dir)) return 0;
  return fs.readdirSync(dir, { withFileTypes: true })
    .filter(entry => entry.isDirectory() && fs.existsSync(path.join(dir, entry.name, 'index.html')))
    .length;
}

module.exports = {
  SITE,
  NETWORK_SITES: [],
  guideCount,
  paNetworkHtml: () => '',
  sisterContextHtml: () => '',
  defaultSisterContextLinks: () => [],
};
