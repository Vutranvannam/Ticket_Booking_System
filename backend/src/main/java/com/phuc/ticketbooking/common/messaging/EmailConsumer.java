package com.phuc.ticketbooking.common.messaging;

import com.phuc.ticketbooking.common.email.EmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

/**
 * Consumes email events from RabbitMQ and delegates to {@link EmailService}.
 *
 * <p>Retry behaviour is handled by the container factory configured in
 * {@link com.phuc.ticketbooking.common.config.RabbitMQConfig}:
 * up to 3 attempts with 2-second back-off. If all attempts fail, the message
 * is republished to {@code email.dlq} by {@code RepublishMessageRecoverer}.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class EmailConsumer {

    private final EmailService emailService;

    /**
     * Handles OTP email events from {@code email.otp.queue}.
     *
     * @param event deserialized {@link EmailEvent} from JSON
     */
    @RabbitListener(queues = "#{T(com.phuc.ticketbooking.common.config.RabbitMQConfig).OTP_QUEUE}")
    public void handleOtpEmail(EmailEvent event) {
        log.info("Consuming OTP email event for: {}", event.toEmail());
        emailService.sendPasswordResetOtp(event.toEmail(), event.otp());
    }
}
