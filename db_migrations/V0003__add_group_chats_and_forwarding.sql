CREATE TABLE IF NOT EXISTS t_p97947919_social_connect_platf.group_chats (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  avatar_url TEXT,
  created_by INTEGER REFERENCES t_p97947919_social_connect_platf.users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS t_p97947919_social_connect_platf.group_members (
  id SERIAL PRIMARY KEY,
  group_id INTEGER REFERENCES t_p97947919_social_connect_platf.group_chats(id),
  user_id INTEGER REFERENCES t_p97947919_social_connect_platf.users(id),
  role VARCHAR(20) DEFAULT 'member',
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(group_id, user_id)
);

ALTER TABLE t_p97947919_social_connect_platf.messages 
ADD COLUMN IF NOT EXISTS group_id INTEGER REFERENCES t_p97947919_social_connect_platf.group_chats(id),
ADD COLUMN IF NOT EXISTS forwarded_from INTEGER REFERENCES t_p97947919_social_connect_platf.messages(id),
ADD COLUMN IF NOT EXISTS is_forwarded BOOLEAN DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_group_members_group ON t_p97947919_social_connect_platf.group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_group_members_user ON t_p97947919_social_connect_platf.group_members(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_group ON t_p97947919_social_connect_platf.messages(group_id);
CREATE INDEX IF NOT EXISTS idx_messages_forwarded ON t_p97947919_social_connect_platf.messages(forwarded_from);