/**
 * Encryption utilities for securing API credentials
 * Uses AES-256-GCM for authenticated encryption
 */

import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const KEY_LENGTH = 32; // 256 bits
const IV_LENGTH = 16;  // 128 bits
const TAG_LENGTH = 16; // 128 bits

// Get encryption key from environment or generate one
function getEncryptionKey() {
  const envKey = process.env.ENCRYPTION_KEY;
  
  if (envKey) {
    if (envKey.length !== 64) { // 32 bytes = 64 hex chars
      throw new Error('ENCRYPTION_KEY must be 64 hex characters (32 bytes)');
    }
    return Buffer.from(envKey, 'hex');
  }
  
  // Generate a random key for development (NOT FOR PRODUCTION)
  console.warn('⚠️ No ENCRYPTION_KEY found, generating random key (development only)');
  return crypto.randomBytes(KEY_LENGTH);
}

const ENCRYPTION_KEY = getEncryptionKey();

/**
 * Encrypt sensitive data (API keys, secrets)
 */
export function encrypt(text) {
  try {
    if (!text) return null;
    
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipher(ALGORITHM, ENCRYPTION_KEY);
    cipher.setAAD(Buffer.from('agnes-bot-pro', 'utf8'));
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const tag = cipher.getAuthTag();
    
    // Combine IV + tag + encrypted data
    return iv.toString('hex') + ':' + tag.toString('hex') + ':' + encrypted;
  } catch (error) {
    console.error('❌ Encryption failed:', error);
    throw new Error('Encryption failed');
  }
}

/**
 * Decrypt sensitive data
 */
export function decrypt(encryptedData) {
  try {
    if (!encryptedData) return null;
    
    const parts = encryptedData.split(':');
    if (parts.length !== 3) {
      throw new Error('Invalid encrypted data format');
    }
    
    const iv = Buffer.from(parts[0], 'hex');
    const tag = Buffer.from(parts[1], 'hex');
    const encrypted = parts[2];
    
    const decipher = crypto.createDecipher(ALGORITHM, ENCRYPTION_KEY);
    decipher.setAAD(Buffer.from('agnes-bot-pro', 'utf8'));
    decipher.setAuthTag(tag);
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    console.error('❌ Decryption failed:', error);
    throw new Error('Decryption failed');
  }
}

/**
 * Hash sensitive data for comparison (passwords, etc.)
 */
export function hash(text, salt = null) {
  try {
    const saltBuffer = salt ? Buffer.from(salt, 'hex') : crypto.randomBytes(16);
    const hash = crypto.pbkdf2Sync(text, saltBuffer, 10000, 64, 'sha512');
    
    return {
      hash: hash.toString('hex'),
      salt: saltBuffer.toString('hex')
    };
  } catch (error) {
    console.error('❌ Hashing failed:', error);
    throw new Error('Hashing failed');
  }
}

/**
 * Verify hashed data
 */
export function verifyHash(text, storedHash, storedSalt) {
  try {
    const { hash } = hash(text, storedSalt);
    return hash === storedHash;
  } catch (error) {
    console.error('❌ Hash verification failed:', error);
    return false;
  }
}

/**
 * Generate secure random string
 */
export function generateSecureToken(length = 32) {
  return crypto.randomBytes(length).toString('hex');
}

/**
 * Generate encryption key for new installations
 */
export function generateEncryptionKey() {
  return crypto.randomBytes(KEY_LENGTH).toString('hex');
}

// Validate encryption setup on import
if (process.env.NODE_ENV === 'production' && !process.env.ENCRYPTION_KEY) {
  console.error('🚨 SECURITY WARNING: ENCRYPTION_KEY not set in production!');
  console.log('Generate one with: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"');
}