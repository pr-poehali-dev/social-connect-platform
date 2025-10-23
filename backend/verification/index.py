import json
import os
from typing import Dict, Any
import psycopg2
from psycopg2.extras import RealDictCursor

def get_db_connection():
    return psycopg2.connect(os.environ['DATABASE_URL'])

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Submit and manage verification requests
    Args: event - dict with httpMethod, body, queryStringParameters
          context - object with request_id attribute
    Returns: HTTP response dict with verification data
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
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
            user_id = body_data.get('user_id')
            selfie_url = body_data.get('selfie_url')
            contact_email = body_data.get('contact_email')
            contact_phone = body_data.get('contact_phone', '')
            social_links = body_data.get('social_links', '')
            description = body_data.get('description')
            reason = body_data.get('reason')
            
            cur.execute(
                "INSERT INTO verification_requests (user_id, selfie_url, contact_email, contact_phone, social_links, description, reason) VALUES (%s, %s, %s, %s, %s, %s, %s) RETURNING id, status, created_at",
                (user_id, selfie_url, contact_email, contact_phone, social_links, description, reason)
            )
            request = dict(cur.fetchone())
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'request': request}),
                'isBase64Encoded': False
            }
        
        elif method == 'GET':
            params = event.get('queryStringParameters', {}) or {}
            status = params.get('status', 'pending')
            
            cur.execute(
                """SELECT vr.id, vr.user_id, vr.selfie_url, vr.contact_email, vr.contact_phone, 
                   vr.social_links, vr.description, vr.reason, vr.status, vr.admin_comment, 
                   vr.created_at, vr.reviewed_at, u.username, u.nickname, u.avatar_url
                   FROM verification_requests vr
                   JOIN users u ON vr.user_id = u.id
                   WHERE vr.status = %s
                   ORDER BY vr.created_at DESC""",
                (status,)
            )
            requests = [dict(row) for row in cur.fetchall()]
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'requests': requests}),
                'isBase64Encoded': False
            }
        
        elif method == 'PUT':
            body_data = json.loads(event.get('body', '{}'))
            request_id = body_data.get('request_id')
            status = body_data.get('status')
            admin_comment = body_data.get('admin_comment', '')
            
            cur.execute(
                "UPDATE verification_requests SET status = %s, admin_comment = %s, reviewed_at = CURRENT_TIMESTAMP WHERE id = %s RETURNING user_id",
                (status, admin_comment, request_id)
            )
            result = cur.fetchone()
            
            if result and status == 'approved':
                user_id = result['user_id']
                cur.execute("UPDATE users SET verified = TRUE WHERE id = %s", (user_id,))
            
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'message': 'Request updated successfully'}),
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
