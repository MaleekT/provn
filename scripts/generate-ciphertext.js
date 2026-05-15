/**
 * Generates the Entity Secret Ciphertext required by Circle's console.
 *
 * Usage:
 *   1. Run the PowerShell command to save circle-pubkey.pem (see instructions below)
 *   2. node scripts/generate-ciphertext.js
 *   3. Paste the output into Circle Console → DEV CONTROLLED → Configurator
 */

const { createPublicKey, publicEncrypt, constants } = require('crypto')
const { readFileSync } = require('fs')
const { resolve } = require('path')

// ── Load .env.local ───────────────────────────────────────────────────────────
function loadEnvLocal() {
  try {
    const lines = readFileSync(resolve(__dirname, '../.env.local'), 'utf-8').split('\n')
    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) continue
      const eqIdx = trimmed.indexOf('=')
      if (eqIdx === -1) continue
      const key = trimmed.slice(0, eqIdx).trim()
      const value = trimmed.slice(eqIdx + 1).trim()
      if (key && !(key in process.env)) process.env[key] = value
    }
  } catch { /* rely on existing env */ }
}

loadEnvLocal()

const entitySecretHex = process.env.CIRCLE_ENTITY_SECRET
if (!entitySecretHex) {
  console.error('❌ CIRCLE_ENTITY_SECRET is not set in .env.local')
  process.exit(1)
}
if (!/^[0-9a-fA-F]{64}$/.test(entitySecretHex)) {
  console.error('❌ CIRCLE_ENTITY_SECRET must be a 64-character hex string (32 bytes)')
  process.exit(1)
}

const PUB_KEY_PATH = resolve(__dirname, '../circle-pubkey.pem')

try {
  const pubKeyPem = readFileSync(PUB_KEY_PATH, 'utf-8').trim()
  const secretBytes = Buffer.from(entitySecretHex, 'hex')

  const publicKey = createPublicKey(pubKeyPem)

  const encrypted = publicEncrypt(
    { key: publicKey, padding: constants.RSA_PKCS1_OAEP_PADDING, oaepHash: 'sha256' },
    secretBytes
  )

  const ciphertext = encrypted.toString('base64')

  console.log('\n✅ Entity Secret Ciphertext (' + ciphertext.length + ' chars):')
  console.log('\n' + ciphertext + '\n')
  console.log('Paste this into: Circle Console → DEV CONTROLLED → Configurator → Entity Secret\n')
} catch (err) {
  if (err.code === 'ENOENT') {
    console.error('\n❌ circle-pubkey.pem not found. Run this PowerShell command first:\n')
    console.error('  $h = @{ Authorization = "Bearer $env:CIRCLE_API_KEY" }')
    console.error('  $r = Invoke-RestMethod -Uri "https://api.circle.com/v1/w3s/config/entity/publicKey" -Headers $h')
    console.error('  $r.data.publicKey | Out-File "circle-pubkey.pem" -Encoding utf8\n')
  } else {
    console.error('\n❌ Error:', err.message)
  }
  process.exit(1)
}
