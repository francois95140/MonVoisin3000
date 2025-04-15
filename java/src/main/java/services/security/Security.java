package services.security;

import services.env.Env;

import javax.crypto.BadPaddingException;
import javax.crypto.Cipher;
import javax.crypto.IllegalBlockSizeException;
import javax.crypto.NoSuchPaddingException;
import javax.crypto.spec.SecretKeySpec;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.util.Base64;

public class Security {

    private static String defaultKey;
    private static final String algo = "AES";
    public static String encrypt(String value, String key) {
        try {
            SecretKeySpec keySpec = new SecretKeySpec(key.getBytes(), algo);
            Cipher cipher = Cipher.getInstance(algo);
            cipher.init(Cipher.ENCRYPT_MODE, keySpec);
            byte[] encryptedValue = cipher.doFinal(value.getBytes());
            return Base64.getEncoder().encodeToString(encryptedValue);
        } catch (NoSuchAlgorithmException | NoSuchPaddingException | IllegalBlockSizeException | BadPaddingException | InvalidKeyException e) {throw new RuntimeException(e);}
    }
    public static String encrypt(String value) {
        return  encrypt(value, defaultKey);
    }
    public static String decrypt(String encryptedValue, String key) {
        try {
            SecretKeySpec keySpec = new SecretKeySpec(key.getBytes(), algo);
            Cipher cipher = Cipher.getInstance(algo);
            cipher.init(Cipher.DECRYPT_MODE, keySpec);
            byte[] decryptedValue = cipher.doFinal(Base64.getDecoder().decode(encryptedValue));
            return new String(decryptedValue);
        } catch (NoSuchAlgorithmException | NoSuchPaddingException | IllegalBlockSizeException | BadPaddingException | InvalidKeyException e) {throw new RuntimeException(e);}
    }
    public static String decrypt(String value) {
        return  decrypt(value, defaultKey);
    }
    public static void setDefaultKey(String defaultKey) {Security.defaultKey = defaultKey;}
    private static String generateSalt() {
        SecureRandom secureRandom = new SecureRandom();
        byte[] salt = new byte[8];
        secureRandom.nextBytes(salt);
        StringBuilder hexString = new StringBuilder();
        for (byte b : salt) {hexString.append(String.format("%02x", b));}
        return hexString.toString();
    }

    public static String hash(String value) {
        try {
            String salt = generateSalt();
            System.out.println(salt);
            byte[] hash = java.security.MessageDigest.getInstance("SHA-256").digest((value + salt).getBytes());
            return Base64.getEncoder().encodeToString(hash)+salt;
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException(e);
        }
    }
    public static String hash(String value, String salt) {
        try {
            byte[] hash = java.security.MessageDigest.getInstance("SHA-256").digest((value + salt).getBytes());
            return Base64.getEncoder().encodeToString(hash)+salt;
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException(e);
        }
    }
    public static String getSaltOfHash(String hash) {
        return hash.substring(hash.length()-(Integer.parseInt(Env.dotenv.get("SALT_SIZE"))*2));
    }
    public static boolean textEqualHash(String text, String hash) {
        String salt = getSaltOfHash(hash);
        return hash.equals(hash(text, salt));
    }

    public static String generateRandomCode(int length) {
    String characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    SecureRandom random = new SecureRandom();
    StringBuilder code = new StringBuilder(length);
    for (int i = 0; i < length; i++) {
        code.append(characters.charAt(random.nextInt(characters.length())));
    }
    return code.toString();
}


}

