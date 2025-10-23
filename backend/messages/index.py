import json
import os
from typing import Dict, Any
import psycopg2
from psycopg2.extras import RealDictCursor

def get_db_connection():
    return psycopg2.connect(os.environ['DATABASE_URL'])

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Send and retrieve messages
    Args: event - dict with httpMethod, body, queryStringParameters
          context - object with request_id attribute
    Returns: HTTP response dict with messages data
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    try:
        if method == 'POST':
            body_data = json.loads(event.get('body', '{}'))
            sender_id = body_data.get('sender_id')
            receiver_id = body_data.get('receiver_id')
            text = body_data.get('text')
            file_url = body_data.get('file_url')
            audio_url = body_data.get('audio_url')
            image_url = body_data.get('image_url')
            
            cur.execute(
                """INSERT INTO t_p97947919_social_connect_platf.messages (sender_id, receiver_id, text, file_url, audio_url, image_url) 
                   VALUES (%s, %s, %s, %s, %s, %s) 
                   RETURNING id, sender_id, receiver_id, text, file_url, audio_url, image_url, read, created_at""",
                (sender_id, receiver_id, text, file_url, audio_url, image_url)
            )
            message = dict(cur.fetchone())
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'message': message}),
                'isBase64Encoded': False
            }
        
        elif method == 'GET':
            params = event.get('queryStringParameters', {}) or {}
            user_id = params.get('user_id')
            chat_with = params.get('chat_with')
            
            cur.execute(
                """SELECT m.id, m.sender_id, m.receiver_id, m.text, m.file_url, m.audio_url, m.image_url, 
                   m.read, m.created_at, u.nickname, u.avatar_url
                   FROM t_p97947919_social_connect_platf.messages m
                   JOIN t_p97947919_social_connect_platf.users u ON m.sender_id = u.id
                   WHERE (m.sender_id = %s AND m.receiver_id = %s) OR (m.sender_id = %s AND m.receiver_id = %s)
                   ORDER BY m.created_at ASC""",
                (user_id, chat_with, chat_with, user_id)
            )
            messages = [dict(row) for row in cur.fetchall()]
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'messages': messages}),
                'isBase64Encoded': False
            }
        
        else:
            return {
                'statusCode': 405,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Method not allowed'}),
                'isBase64Encoded': False
            }
    
    finally:
        cur.close()
        conn.close()