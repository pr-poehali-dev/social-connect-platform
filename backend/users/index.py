import json
import os
from typing import Dict, Any
import psycopg2
from psycopg2.extras import RealDictCursor

SCHEMA = 't_p97947919_social_connect_platf'

def get_db_connection():
    return psycopg2.connect(os.environ['DATABASE_URL'], options=f'-c search_path={SCHEMA}')

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Search users and manage friend requests
    Args: event - dict with httpMethod, body, queryStringParameters
          context - object with request_id attribute
    Returns: HTTP response dict with users or friends data
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    try:
        if method == 'GET':
            params = event.get('queryStringParameters', {}) or {}
            action = params.get('action', 'search')
            
            if action == 'search':
                query = params.get('query', '')
                cur.execute(
                    """SELECT id, nickname, user_id, avatar_url 
                       FROM users 
                       WHERE nickname ILIKE %s OR user_id ILIKE %s
                       LIMIT 20""",
                    (f'%{query}%', f'%{query}%')
                )
                users = [dict(row) for row in cur.fetchall()]
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'users': users}),
                    'isBase64Encoded': False
                }
            
            elif action == 'friends':
                user_id = params.get('user_id')
                cur.execute(
                    """SELECT u.id, u.nickname, u.user_id, u.avatar_url, f.status, f.created_at
                       FROM friendships f
                       JOIN users u ON (f.user_id = u.id OR f.friend_id = u.id)
                       WHERE (f.user_id = %s OR f.friend_id = %s) AND u.id != %s AND f.status = 'accepted'""",
                    (user_id, user_id, user_id)
                )
                friends = [dict(row) for row in cur.fetchall()]
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'friends': friends}),
                    'isBase64Encoded': False
                }
            
            elif action == 'requests':
                user_id = params.get('user_id')
                cur.execute(
                    """SELECT u.id, u.nickname, u.user_id, u.avatar_url, f.id as request_id, f.created_at
                       FROM friendships f
                       JOIN users u ON f.user_id = u.id
                       WHERE f.friend_id = %s AND f.status = 'pending'""",
                    (user_id,)
                )
                requests = [dict(row) for row in cur.fetchall()]
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'requests': requests}),
                    'isBase64Encoded': False
                }
        
        elif method == 'POST':
            body_data = json.loads(event.get('body', '{}'))
            user_id = body_data.get('user_id')
            friend_id = body_data.get('friend_id')
            
            cur.execute(
                """INSERT INTO friendships (user_id, friend_id, status) 
                   VALUES (%s, %s, 'pending') 
                   RETURNING id, user_id, friend_id, status, created_at""",
                (user_id, friend_id)
            )
            request = dict(cur.fetchone())
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'request': request}),
                'isBase64Encoded': False
            }
        
        elif method == 'PUT':
            body_data = json.loads(event.get('body', '{}'))
            request_id = body_data.get('request_id')
            status = body_data.get('status')
            
            cur.execute(
                """UPDATE friendships SET status = %s WHERE id = %s 
                   RETURNING id, user_id, friend_id, status, created_at""",
                (status, request_id)
            )
            request = dict(cur.fetchone())
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'request': request}),
                'isBase64Encoded': False
            }
        
        elif method == 'DELETE':
            params = event.get('queryStringParameters', {}) or {}
            request_id = params.get('request_id')
            
            cur.execute("DELETE FROM friendships WHERE id = %s", (request_id,))
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'success': True}),
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
