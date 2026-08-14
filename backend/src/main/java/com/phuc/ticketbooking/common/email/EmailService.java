package com.phuc.ticketbooking.common.email;

/**
 * Contract for sending application emails via JavaMailSender.
 */
public interface EmailService {

    /**
     * Sends an HTML password-reset OTP email to the specified address.
     *
     * @param toEmail recipient address
     * @param otp     6-digit OTP code (plaintext, transmitted from RabbitMQ consumer)
     */
    void sendPasswordResetOtp(String toEmail, String otp);
}
