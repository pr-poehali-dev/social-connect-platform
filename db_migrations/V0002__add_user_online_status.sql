ALTER TABLE t_p97947919_social_connect_platf.users 
ADD COLUMN IF NOT EXISTS last_online TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN IF NOT EXISTS is_online BOOLEAN DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_users_online ON t_p97947919_social_connect_platf.users(is_online);
CREATE INDEX IF NOT EXISTS idx_users_last_online ON t_p97947919_social_connect_platf.users(last_online);