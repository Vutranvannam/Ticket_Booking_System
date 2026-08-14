package com.phuc.ticketbooking.common.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.databind.jsontype.BasicPolymorphicTypeValidator;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
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
 * auto-configured by Spring Boot and does not need to be declared here.
 * <p>
 * Note: {@code GenericJackson2JsonRedisSerializer} is deprecated since Spring
 * Data Redis 4.0 in favor of {@code GenericJacksonJsonRedisSerializer} (Jackson
 * 3-based). Staying on the Jackson 2-based serializer for now since Spring
 * Boot's default Jackson dependency is still Jackson 2; migrate once the
 * project upgrades to Jackson 3 / a Spring Boot version with first-class
 * support for it.
 */
@Configuration
@SuppressWarnings({ "removal", "deprecation" })
public class RedisConfig {

        @Bean
        public RedisTemplate<String, Object> redisTemplate(RedisConnectionFactory connectionFactory) {
                RedisTemplate<String, Object> template = new RedisTemplate<>();
                template.setConnectionFactory(connectionFactory);

                // Keys are always plain strings
                StringRedisSerializer stringSerializer = new StringRedisSerializer();
                template.setKeySerializer(stringSerializer);
                template.setHashKeySerializer(stringSerializer);

                // Dedicated ObjectMapper for Redis — the no-arg
                // GenericJackson2JsonRedisSerializer
                // constructor builds its own bare ObjectMapper that does NOT include
                // JavaTimeModule.
                // Without it, serializing any cached object with a java.time.* field (e.g.
                // Instant loginAt in SessionCache) throws InvalidDefinitionException at
                // runtime.
                ObjectMapper redisObjectMapper = new ObjectMapper();

                // Required to serialize java.time.* types (Instant, LocalDate, etc.)
                redisObjectMapper.registerModule(new JavaTimeModule());
                // Store dates as ISO-8601 strings, not numeric timestamps, for readability
                // when inspecting Redis values directly.
                redisObjectMapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);

                // Embed @class type metadata for all types, including Java records.
                // Java records are implicitly final, so DefaultTyping.NON_FINAL would skip
                // them and leave no type info in the JSON. When the template later reads the
                // value back as Object.class it would fail trying to resolve the type.
                // DefaultTyping.EVERYTHING covers final types too.
                // The strict BasicPolymorphicTypeValidator limits deserialization to safe
                // types.
                BasicPolymorphicTypeValidator ptv = BasicPolymorphicTypeValidator.builder()
                                .allowIfBaseType("com.phuc.ticketbooking.")
                                .allowIfBaseType("java.lang.")
                                .allowIfBaseType("java.util.")
                                .allowIfBaseType("java.time.")
                                .build();
                redisObjectMapper.activateDefaultTyping(
                                ptv,
                                ObjectMapper.DefaultTyping.EVERYTHING);

                GenericJackson2JsonRedisSerializer jsonSerializer = new GenericJackson2JsonRedisSerializer(
                                redisObjectMapper);
                template.setValueSerializer(jsonSerializer);
                template.setHashValueSerializer(jsonSerializer);

                template.afterPropertiesSet();
                return template;
        }
}