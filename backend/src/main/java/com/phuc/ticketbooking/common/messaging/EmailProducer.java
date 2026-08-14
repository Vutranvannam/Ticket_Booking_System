package com.phuc.ticketbooking.common.messaging;

import com.phuc.ticketbooking.common.config.RabbitMQConfig;
import lombok.RequiredArgsConstructor;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Component;

/**
 * Publishes email-related events to RabbitMQ.
 *
 * <p>Each {@code send*} method converts the payload to JSON (via
 * {@link org.springframework.amqp.support.converter.Jackson2JsonMessageConverter})
 * and publishes to {@code email.exchange} with the appropriate routing key.
 */
@Component
@RequiredArgsConstructor
public class EmailProducer {

    private final RabbitTemplate rabbitTemplate;

    /**
     * Publishes an OTP email event to the {@code email.otp.queue}.
     *
     * @param email recipient email address
     * @param otp   6-digit plaintext OTP (transmitted within internal network only)
     */
    public void sendOtpEmail(String email, String otp) {
        rabbitTemplate.convertAndSend(
                RabbitMQConfig.EMAIL_EXCHANGE,
                RabbitMQConfig.OTP_ROUTING_KEY,
                new EmailEvent("OTP_RESET_PASSWORD", email, otp));
    }
}
