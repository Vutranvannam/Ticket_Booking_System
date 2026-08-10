package com.phuc.ticketbooking.common.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.StringRedisSerializer;

/**
 * Redis configuration — provides a typed {@link RedisTemplate} with JSON
 * serialization.
 * <p>
 * Uses {@link GenericJackson2JsonRedisSerializer} so that cached objects
 * (e.g., UserVersionCache, UserSecurityCache) are stored as JSON with embedded
 * type information ({@code @class}) for safe deserialization.
 * <p>
 * {@link org.springframework.data.redis.core.StringRedisTemplate} is
 * auto-configured
 * by Spring Boot and does not need to be declared here.
 * <p>
 * Note: {@code GenericJackson2JsonRedisSerializer} is deprecated since Spring
 * Data
 * Redis 4.0 in favor of {@code GenericJacksonJsonRedisSerializer} (Jackson
 * 3-based).
 * Staying on the Jackson 2-based serializer for now since Spring Boot's default
 * Jackson dependency is still Jackson 2; migrate once the project upgrades to
 * Jackson 3 / a Spring Boot version with first-class support for it.
 */
@Configuration
@SuppressWarnings("removal")
public class RedisConfig {

    @Bean
    public RedisTemplate<String, Object> redisTemplate(RedisConnectionFactory connectionFactory) {
        RedisTemplate<String, Object> template = new RedisTemplate<>();
        template.setConnectionFactory(connectionFactory);

        // Keys are always plain strings
        StringRedisSerializer stringSerializer = new StringRedisSerializer();
        template.setKeySerializer(stringSerializer);
        template.setHashKeySerializer(stringSerializer);

        // Values are JSON with embedded @class type info for polymorphic
        // deserialization
        GenericJackson2JsonRedisSerializer jsonSerializer = new GenericJackson2JsonRedisSerializer();
        template.setValueSerializer(jsonSerializer);
        template.setHashValueSerializer(jsonSerializer);

        template.afterPropertiesSet();
        return template;
    }
}