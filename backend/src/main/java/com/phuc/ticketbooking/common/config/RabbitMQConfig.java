package com.phuc.ticketbooking.common.config;

import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.core.QueueBuilder;
import org.springframework.amqp.core.TopicExchange;
import org.springframework.amqp.rabbit.config.RetryInterceptorBuilder;
import org.springframework.amqp.rabbit.config.SimpleRabbitListenerContainerFactory;
import org.springframework.amqp.rabbit.config.StatelessRetryOperationsInterceptor;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.rabbit.retry.RepublishMessageRecoverer;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * RabbitMQ topology for the email notification subsystem.
 *
 * <p>
 * Exchange / Queue / Binding layout:
 * 
 * <pre>
 *   email.exchange (TopicExchange, durable)
 *       └─ email.otp.queue  [routing: email.otp]  (durable)
 *
 *   email.dlq (Queue, durable) — receives messages after 3 failed delivery attempts
 *             via RepublishMessageRecoverer
 * </pre>
 *
 * <p>
 * Consumer-side retry is handled by Spring Retry:
 * 3 attempts max with 2-second back-off. After all retries are exhausted,
 * {@link RepublishMessageRecoverer} forwards the message to {@code email.dlq}.
 */
@Configuration
@SuppressWarnings("removal")
public class RabbitMQConfig {

    // ── Constants ──────────────────────────────────────────────────────────────

    public static final String EMAIL_EXCHANGE = "email.exchange";
    public static final String OTP_QUEUE = "email.otp.queue";
    public static final String OTP_ROUTING_KEY = "email.otp";
    public static final String DLQ = "email.dlq";

    // ── Exchange ───────────────────────────────────────────────────────────────

    @Bean
    public TopicExchange emailExchange() {
        return new TopicExchange(EMAIL_EXCHANGE, /* durable */ true, /* autoDelete */ false);
    }

    // ── Queues ─────────────────────────────────────────────────────────────────

    /** Main OTP queue. */
    @Bean
    public Queue otpQueue() {
        return QueueBuilder.durable(OTP_QUEUE).build();
    }

    /**
     * Dead-letter queue — receives messages that exhausted all consumer retries.
     */
    @Bean
    public Queue deadLetterQueue() {
        return QueueBuilder.durable(DLQ).build();
    }

    // ── Binding ────────────────────────────────────────────────────────────────

    @Bean
    public Binding otpBinding(Queue otpQueue, TopicExchange emailExchange) {
        return BindingBuilder.bind(otpQueue).to(emailExchange).with(OTP_ROUTING_KEY);
    }

    // ── Message Converter ──────────────────────────────────────────────────────

    /**
     * Uses Jackson to serialize/deserialize messages as JSON.
     * Required because {@link com.phuc.ticketbooking.common.messaging.EmailEvent}
     * is a
     * Java record — the default {@code SimpleMessageConverter} cannot handle
     * records cleanly.
     */
    @Bean
    public MessageConverter jsonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }

    // ── RabbitTemplate ─────────────────────────────────────────────────────────

    @Bean
    public RabbitTemplate rabbitTemplate(ConnectionFactory cf, MessageConverter converter) {
        RabbitTemplate template = new RabbitTemplate(cf);
        template.setMessageConverter(converter);
        return template;
    }

    // ── Consumer retry interceptor ─────────────────────────────────────────────

    /**
     * Stateless retry interceptor: up to 3 attempts with a 2-second fixed back-off.
     * Messages that exhaust all retries are republished to {@code email.dlq}.
     */
    @Bean
    public StatelessRetryOperationsInterceptor retryInterceptor(RabbitTemplate rabbitTemplate) {
        return RetryInterceptorBuilder.stateless()
                .maxRetries(2) // 2 retries after initial = 3 total
                .backOffOptions(2_000L, 1.0, 2_000L) // 2s fixed back-off
                .recoverer(new RepublishMessageRecoverer(rabbitTemplate, "", DLQ))
                .build();
    }

    // ── Consumer container factory ─────────────────────────────────────────────

    /**
     * Configures the listener container with JSON message converter and retry
     * interceptor.
     */
    @Bean
    public SimpleRabbitListenerContainerFactory rabbitListenerContainerFactory(
            ConnectionFactory cf,
            MessageConverter converter,
            StatelessRetryOperationsInterceptor retryInterceptor) {

        SimpleRabbitListenerContainerFactory factory = new SimpleRabbitListenerContainerFactory();
        factory.setConnectionFactory(cf);
        factory.setMessageConverter(converter);
        factory.setAdviceChain(retryInterceptor);
        return factory;
    }
}
