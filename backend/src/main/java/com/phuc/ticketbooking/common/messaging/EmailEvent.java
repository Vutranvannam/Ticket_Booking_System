package com.phuc.ticketbooking.common.messaging;

/**
 * Immutable event message published to RabbitMQ for email sending.
 *
 * <p>Security note: {@code otp} is plaintext here, which is acceptable because
 * the RabbitMQ broker runs inside the Docker bridge network and is not exposed
 * externally. This follows the standard internal-queue pattern.
 *
 * @param type    Event type discriminator (e.g., {@code "OTP_RESET_PASSWORD"})
 * @param toEmail Recipient email address
 * @param otp     Plaintext OTP code — only transmitted within the internal network
 */
public record EmailEvent(
        String type,
        String toEmail,
        String otp
) {
}
