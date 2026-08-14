-- Atomically revokes all sessions for a user.
--
-- KEYS[1] = user:sessions:{userId}   (session index Set)
-- ARGV[1] = session key prefix, e.g. "session:{userId}:"
-- ARGV[2] = refresh key prefix, e.g. "refresh:{userId}:"
--
-- Reads SMEMBERS inside Lua (atomic), then DELetes all derived keys and the
-- index itself. No other client can interleave between the read and the deletes.
local sessionIds = redis.call('SMEMBERS', KEYS[1])
for _, sid in ipairs(sessionIds) do
    redis.call('DEL', ARGV[1] .. sid)
    redis.call('DEL', ARGV[2] .. sid)
end
redis.call('DEL', KEYS[1])
return #sessionIds
