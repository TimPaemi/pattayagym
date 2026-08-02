#!/usr/bin/env node
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const { GYMS } = require(path.join(ROOT, 'data.js'));
const yaml = `openapi: 3.1.0
info:
  title: Pattaya Gym Directory API
  description: |
    Read-only access to ${GYMS.length} current Pattaya.Gym directory records across gyms,
    Muay Thai camps, sport clubs, facilities and operators. Records expose their
    sources-reviewed date; published price snapshots carry a separate as-of date.
    No field implies a first-hand visit. License: CC BY 4.0.
  version: 1.1.0
  contact:
    email: info@pattaya-gym.com
    url: https://pattaya-gym.com/
  license:
    name: CC BY 4.0
    url: https://creativecommons.org/licenses/by/4.0/
servers:
  - url: https://pattaya-gym.com
    description: Production
paths:
  /api/venues.json:
    get:
      operationId: listVenues
      summary: Get the current Pattaya.Gym venue-record dataset
      responses:
        '200':
          description: Current source-checked directory records
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Directory'
components:
  schemas:
    Directory:
      type: object
      required: [name, generated, counts, venues]
      properties:
        name: { type: string }
        url: { type: string, format: uri }
        description: { type: string }
        generated: { type: string, format: date }
        license: { type: string }
        attribution: { type: string }
        counts:
          type: object
          properties:
            venues: { type: integer, example: ${GYMS.length} }
            categories: { type: integer }
        categories:
          type: array
          items: { $ref: '#/components/schemas/Category' }
        venues:
          type: array
          items: { $ref: '#/components/schemas/Venue' }
    Category:
      type: object
      properties:
        key: { type: string, example: muay-thai }
        label: { type: string, example: Muay Thai }
    Venue:
      type: object
      required: [id, name, url, category]
      properties:
        id: { type: string }
        name: { type: string }
        url: { type: string, format: uri }
        category: { type: string }
        categoryLabel: { type: string }
        area: { type: [string, 'null'] }
        address: { type: [string, 'null'] }
        phone: { type: [string, 'null'] }
        website: { type: [string, 'null'], format: uri }
        hours: { type: [string, 'null'] }
        priceRange: { type: [string, 'null'] }
        priceAsOf: { type: [string, 'null'], format: date }
        priceSourceUrl: { type: [string, 'null'], format: uri }
        description: { type: [string, 'null'] }
        tags: { type: array, items: { type: string } }
        mapsUrl: { type: [string, 'null'], format: uri }
        status: { type: [string, 'null'] }
        sourcesReviewed: { type: [string, 'null'], format: date }
`;
fs.writeFileSync(path.join(ROOT, 'openapi.yaml'), yaml, 'utf8');
console.log(`openapi.yaml written for ${GYMS.length} records.`);
