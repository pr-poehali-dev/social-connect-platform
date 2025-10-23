import json
import os
import hashlib
import secrets
from typing import Dict, Any
import psycopg2
from psycopg2.extras import RealDictCursor

def get_db_connection():
    return psycopg2.connect(os.environ['DATABASE_URL'])

def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: User registration and login
    Args: event - dict with httpMethod, body
          context - object with request_id attribute
    Returns: HTTP response dict with user data or error
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
    
    body_data = json.loads(event.get('body', '{}'))
    action = body_data.get('action')
    
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    try:
        if action == 'register':
            username = body_data.get('username')
            nickname = body_data.get('nickname')
            email = body_data.get('email')
            password = body_data.get('password')
            avatar_url = body_data.get('avatar_url')
            
            user_id = f"user_{secrets.token_hex(6)}"
            password_hash = hash_password(password)
            
            cur.execute(
                "INSERT INTO t_p97947919_social_connect_platf.users (user_id, username, nickname, email, password_hash, avatar_url) VALUES (%s, %s, %s, %s, %s, %s) RETURNING id, user_id, username, nickname, email, avatar_url, verified, online",
                (user_id, username, nickname, email, password_hash, avatar_url)
            )
            user = dict(cur.fetchone())
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'user': user}),
                'isBase64Encoded': False
            }
        
        elif action == 'login':
            email = body_data.get('email')
            password = body_data.get('password')
            password_hash = hash_password(password)
            
            cur.execute(
                "SELECT id, user_id, username, nickname, email, avatar_url, verified, online FROM t_p97947919_social_connect_platf.users WHERE email = %s AND password_hash = %s",
                (email, password_hash)
            )
            user = cur.fetchone()
            
            if user:
                user = dict(user)
                cur.execute("UPDATE t_p97947919_social_connect_platf.users SET online = TRUE WHERE id = %s", (user['id'],))
                conn.commit()
                user['online'] = True
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'user': user}),
                    'isBase64Encoded': False
                }
            else:
                return {
                    'statusCode': 401,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Invalid credentials'}),
                    'isBase64Encoded': False
                }
        
        else:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Invalid action'}),
                'isBase64Encoded': False
            }
    
    finally:
        cur.close()
        conn.close()