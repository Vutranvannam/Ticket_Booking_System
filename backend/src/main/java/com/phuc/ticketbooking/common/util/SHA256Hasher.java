package com.phuc.ticketbooking.common.util;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Base64;

/**
 * Utility for hashing strings with SHA-256.
 * Used to hash refresh tokens before storing in Redis.
 */
public final class SHA256Hasher {

    private SHA256Hasher() {
    }

    public static String hash(String input) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(input.getBytes(StandardCharsets.UTF_8));
            return Base64.getEncoder().encodeToString(hash);
        } catch (Exception e) {
            throw new RuntimeException("Error hashing input with SHA-256", e);
        }
    }
}
