-- Atomically revokes a single session.
--
-- KEYS[1] = session:{userId}:{sessionId}   (session data key)
-- KEYS[2] = refresh:{userId}:{sessionId}   (refresh token hash key)
-- KEYS[3] = user:sessions:{userId}         (session index Set)
-- ARGV[1] = sessionId                      (bare UUID string -- Set member value)
redis.call('DEL', KEYS[1])
redis.call('DEL', KEYS[2])
redis.call('SREM', KEYS[3], ARGV[1])
return 1
