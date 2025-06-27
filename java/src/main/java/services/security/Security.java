package services.security;

import services.env.Env;
import org.mindrot.jbcrypt.BCrypt;

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
        } catch (NoSuchAlgorithmException | NoSuchPaddingException | IllegalBlockSizeException | BadPaddingException | InvalidKeyException e) {
            throw new RuntimeException(e);
        }
    }

    public static String encrypt(String value) {
        return encrypt(value, defaultKey);
    }

    public static String decrypt(String encryptedValue, String key) {
        try {
            SecretKeySpec keySpec = new SecretKeySpec(key.getBytes(), algo);
            Cipher cipher = Cipher.getInstance(algo);
            cipher.init(Cipher.DECRYPT_MODE, keySpec);
            byte[] decryptedValue = cipher.doFinal(Base64.getDecoder().decode(encryptedValue));
            return new String(decryptedValue);
        } catch (NoSuchAlgorithmException | NoSuchPaddingException | IllegalBlockSizeException | BadPaddingException | InvalidKeyException e) {
            throw new RuntimeException(e);
        }
    }

    public static String decrypt(String value) {
        return decrypt(value, defaultKey);
    }

    public static void setDefaultKey(String defaultKey) {
        Security.defaultKey = defaultKey;
    }

    private static String generateSalt() {
        SecureRandom secureRandom = new SecureRandom();
        byte[] salt = new byte[8];
        secureRandom.nextBytes(salt);
        StringBuilder hexString = new StringBuilder();
        for (byte b : salt) {
            hexString.append(String.format("%02x", b));
        }
        return hexString.toString();
    }

    public static String hash(String value) {
        try {
            String salt = generateSalt();
            System.out.println(salt);
            byte[] hash = java.security.MessageDigest.getInstance("SHA-256").digest((value + salt).getBytes());
            return Base64.getEncoder().encodeToString(hash) + salt;
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException(e);
        }
    }

    public static String hash(String value, String salt) {
        try {
            byte[] hash = java.security.MessageDigest.getInstance("SHA-256").digest((value + salt).getBytes());
            return Base64.getEncoder().encodeToString(hash) + salt;
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException(e);
        }
    }

    public static String getSaltOfHash(String hash) {
        return hash.substring(hash.length() - (Integer.parseInt(Env.dotenv.get("SALT_SIZE")) * 2));
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

    /**
     * Crée un hash bcrypt pour un mot de passe
     * @param password le mot de passe à hasher
     * @return le hash bcrypt
     */
    public static String hashBcrypt(String password) {
        return BCrypt.hashpw(password, BCrypt.gensalt());
    }

    /**
     * Crée un hash bcrypt pour un mot de passe avec un coût spécifique
     * @param password le mot de passe à hasher
     * @param rounds le nombre de rounds (coût) pour bcrypt (entre 4 et 31)
     * @return le hash bcrypt
     */
    public static String hashBcrypt(String password, int rounds) {
        return BCrypt.hashpw(password, BCrypt.gensalt(rounds));
    }

    /**
     * Compare un mot de passe en clair avec un hash bcrypt
     * @param password le mot de passe en clair à vérifier
     * @param hash le hash bcrypt stocké
     * @return true si le mot de passe correspond au hash, false sinon
     */
    public static boolean checkBcrypt(String password, String hash) {
        try {
            // Vérifications de base
            if (password == null || hash == null || hash.trim().isEmpty()) {
                return false;
            }

            hash = hash.trim();

            // Conversion $2b$ vers $2a$ pour compatibilité avec jBCrypt 0.4
            if (hash.startsWith("$2b$")) {
                hash = hash.replaceFirst("\\$2b\\$", "\\$2a\\$");
                System.out.println("Hash converti de $2b$ vers $2a$ pour compatibilité");
            }

            // Vérification du format BCrypt
            if (!hash.matches("^\\$2a\\$\\d{2}\\$.{53}$")) {
                System.out.println("Format de hash invalide: " + hash.substring(0, Math.min(10, hash.length())));
                return false;
            }

            return BCrypt.checkpw(password, hash);

        } catch (Exception e) {
            System.out.println("Erreur BCrypt: " + e.getMessage());
            return false;
        }
    }
}