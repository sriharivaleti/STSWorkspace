package com.sumtotal.util.crypto;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.security.GeneralSecurityException;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.security.spec.AlgorithmParameterSpec;

import javax.crypto.Cipher;
import javax.crypto.SecretKeyFactory;
import javax.crypto.spec.IvParameterSpec;
import javax.crypto.spec.PBEKeySpec;
import javax.crypto.spec.SecretKeySpec;

import org.apache.commons.codec.binary.Base64;
import org.apache.commons.lang.ArrayUtils;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;

import java.security.Security;

public class PBAESCipher implements ICipher {

    private static Log log = LogFactory.getLog(PBAESCipher.class);
    private String keyAlgorithm = "AES";
    private String cipherTransformation = "AES/GCM/NoPadding"; // AES/GCM/NoPadding, AES/CTR/NoPadding, AES/CBC/PKCS5Padding
    private String passPhrase = "Provide your own pass phrase";//"0123456789abcdef";//"Provide your own pass phrase";
    private final int blockLengthInBytes = 16;
    // PBE parameters
    private int iterationCount = 1000;
  private final int keyLengthInBits = 128;

    public PBAESCipher() {
    	
    	Security.addProvider(new org.bouncycastle.jce.provider.BouncyCastleProvider());
    }

    /**
     * Decrypts a message
     *
     * @param encoded_salt_iv_cipherText the Base64 encoded representation
     *    of key salt, IV and encrypted message
     * @return the plain text message, or null if decryption failed
     * @see com.jaspersoft.jasperserver.api.common.crypto.CipherI#decrypt(java.lang.String)
     */
    @Override
    public String decrypt(String encoded_salt_iv_cipherText) {
        String decryptedText = null;
        try {
            byte[] salt_iv_cipherText = Base64.decodeBase64(encoded_salt_iv_cipherText);
            byte[] decryptedBytes = decryptBytes(salt_iv_cipherText);
            decryptedText = new String(decryptedBytes);
        } catch (Exception e) {
            log.warn("Decryption failed", e);
        }
        return decryptedText;
    }

    protected byte[] decryptBytes(byte[] salt_iv_cipherText)
        throws GeneralSecurityException {
        try {
            // First 16 bytes of salt_iv_cipherText contain the salt used
            // to generate encryption key
            byte[] salt = ArrayUtils.subarray(salt_iv_cipherText, 0, blockLengthInBytes);
            // Next 16 bytes of salt_iv_cipherText contain the IV used during encryption phase
            byte[] iv = ArrayUtils.subarray(salt_iv_cipherText, blockLengthInBytes, 2*blockLengthInBytes);
            // Remaining bytes of salt_iv_cipherText contain the cipher text proper
            // (and followed by the authentication tag, if using GCM only)
            byte[] cipherText =
                ArrayUtils.subarray(salt_iv_cipherText, 2*blockLengthInBytes, salt_iv_cipherText.length);
            byte[] key = deriveKey(iterationCount, keyLengthInBits, salt, getPassPhrase().toCharArray());
            byte[] decryptedBytes = doCrypto(iv, key, cipherText, Cipher.DECRYPT_MODE);
            return decryptedBytes;
        } catch (Exception e) {
            throw new GeneralSecurityException(e);
        }
    }

    /**
     * Encrypts a message using AES with a key derived from a pass phrase.
     * The encryption operates in a non-deterministic fashion using a random
     * Initial Vector (IV). Thus the output of this method is unpredictable.
     * <p>
     * In pseudo-code:
     * <pre><code>
     *   message = input plain text
     *
     *   passPhrase = the pass phrase set for this cipher class
     *   iterationCount = 1000
     *   salt = 16 random bytes
     *   key = PBKDF2WithHmacSHA1 (passPhrase, salt, iterationCount)
     *   IV = 16 random bytes
     *
     *   output = Base64 ( salt || IV || AES ( key, IV, message ) )
     * </code></pre>
     * @param plainText the message to encrypt
     * @return the Base64 encoded representation of the concatenation of the
     * key generation salt, IV, and encrypted message, or null if encryption failed
     * @see com.jaspersoft.jasperserver.api.common.crypto.CipherI#encrypt(java.lang.String)
     */
    @Override
    public String encrypt(String plainText) {
        String encoded_salt_iv_cipherText = null;
        try {
            byte[] salt_iv_cipherText = encryptBytes(plainText.getBytes(StandardCharsets.UTF_8));
            encoded_salt_iv_cipherText = new String(Base64.encodeBase64(salt_iv_cipherText));
        } catch (Exception e) {
            log.warn("Encryption failed", e);
        }
        return encoded_salt_iv_cipherText;
    }

    protected byte[] encryptBytes(byte[] plainTextBytes)
        throws GeneralSecurityException {
        try{
            byte[] salt = getRandomBytes(blockLengthInBytes);
            byte[] iv = getRandomBytes(blockLengthInBytes);
            byte[] key = deriveKey(iterationCount, keyLengthInBits, salt, getPassPhrase().toCharArray());
            byte[] cipherText = doCrypto(iv, key, plainTextBytes, Cipher.ENCRYPT_MODE);
            byte[] salt_iv_cipherText = concatenateBytes(salt,iv,cipherText);
            return salt_iv_cipherText;
        } catch (Exception e) {
            throw new GeneralSecurityException(e);
        }
    }

    protected byte[] deriveKey(int iterations, int keyLengthInBits, byte[] salt, char[] password)
        throws GeneralSecurityException {
        try {
            PBEKeySpec spec = new PBEKeySpec(password, salt, iterations, keyLengthInBits);
            SecretKeyFactory skf = SecretKeyFactory.getInstance("PBKDF2WithHmacSHA1");
            byte[] key = skf.generateSecret(spec).getEncoded();
            return key;
        } catch (Exception e) {
            throw new GeneralSecurityException(e);
        }
    }

    protected byte[] getRandomBytes(int length) throws NoSuchAlgorithmException {
        SecureRandom sr = SecureRandom.getInstance("SHA1PRNG");
        byte[] salt = new byte[length];
        sr.nextBytes(salt);
        return salt;
    }

    protected byte[] concatenateBytes(byte[]... arrays) throws IOException {
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        for (byte[] array : arrays)
            outputStream.write(array);
        return outputStream.toByteArray();
    }

    protected byte[] doCrypto(byte[] iv, byte[] key, byte[] text, int mode)
        throws GeneralSecurityException {
        try {
            AlgorithmParameterSpec ivSpec = new IvParameterSpec(iv);
            SecretKeySpec secretKeySpec = new SecretKeySpec(key, getKeyAlgorithm());
            Cipher cipher = Cipher.getInstance(getCipherTransformation());
           cipher.init(mode, secretKeySpec, ivSpec);
//            cipher.init(mode, secretKeySpec,  new IvParameterSpec(new byte[16]));
           
            return cipher.doFinal(text);
        } catch (Exception e) {
            throw new GeneralSecurityException(e);
        }
    }

    public String getPassPhrase() {
        return passPhrase;
    }

    public void setPassPhrase(String passPhrase) {
        this.passPhrase = passPhrase;
    }

    public int getIterationCount() {
        return iterationCount;
    }

    public void setIterationCount(int iterationCount) {
        this.iterationCount = iterationCount;
    }

    public String getCipherTransformation() {
        return cipherTransformation;
    }

    public void setCipherTransformation(String cipherTransformation) {
        this.cipherTransformation = cipherTransformation;
    }

    public String getKeyAlgorithm() {
        return keyAlgorithm;
    }

    public void setKeyAlgorithm(String keyAlgorithm) {
        this.keyAlgorithm = keyAlgorithm;
    }
}
