#!/usr/bin/env python3
"""
UR Life Backend Server
提供数据持久化和多设备同步功能
"""

from http.server import HTTPServer, SimpleHTTPRequestHandler
import json
import os
from urllib.parse import urlparse, parse_qs
import threading

DATABASE_FILE = 'data/database.json'

class URLifeHandler(SimpleHTTPRequestHandler):
    """自定义请求处理器"""

    def _set_headers(self, status=200):
        """设置响应头"""
        self.send_response(status)
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def do_OPTIONS(self):
        """处理 CORS 预检请求"""
        self._set_headers(200)

    def do_GET(self):
        """处理 GET 请求"""
        parsed_path = urlparse(self.path)

        # API 路由
        if parsed_path.path == '/api/user':
            # 获取用户数据
            params = parse_qs(parsed_path.query)
            net_id = params.get('netId', [None])[0]

            if net_id:
                data = self.load_database()
                user_data = data['users'].get(net_id)

                if user_data:
                    self._set_headers(200)
                    # 不返回密码
                    response = {
                        'profile': user_data['profile'],
                        'tasks': user_data['tasks'],
                        'history': user_data['history'],
                        'mailingList': user_data['mailingList'],
                        'degreeProgress': user_data['degreeProgress']
                    }
                    self.wfile.write(json.dumps(response).encode())
                else:
                    self._set_headers(404)
                    self.wfile.write(json.dumps({'error': 'User not found'}).encode())
            else:
                self._set_headers(400)
                self.wfile.write(json.dumps({'error': 'Missing netId'}).encode())

        elif parsed_path.path == '/api/login':
            # 验证登录
            params = parse_qs(parsed_path.query)
            net_id = params.get('netId', [None])[0]
            password = params.get('password', [None])[0]

            if net_id and password:
                data = self.load_database()
                user = data['users'].get(net_id)

                if user and user['password'] == password:
                    self._set_headers(200)
                    self.wfile.write(json.dumps({
                        'success': True,
                        'profile': user['profile']
                    }).encode())
                else:
                    self._set_headers(401)
                    self.wfile.write(json.dumps({'success': False, 'error': 'Invalid credentials'}).encode())
            else:
                self._set_headers(400)
                self.wfile.write(json.dumps({'error': 'Missing credentials'}).encode())

        else:
            # 静态文件服务
            super().do_GET()

    def do_POST(self):
        """处理 POST 请求"""
        if self.path == '/api/user/save':
            # 保存用户数据
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)

            try:
                payload = json.loads(post_data.decode('utf-8'))
                net_id = payload.get('netId')
                user_data = payload.get('data')

                if net_id and user_data:
                    data = self.load_database()

                    if net_id in data['users']:
                        # 更新用户数据（保留密码）
                        data['users'][net_id]['tasks'] = user_data.get('tasks', [])
                        data['users'][net_id]['history'] = user_data.get('history', [])
                        data['users'][net_id]['mailingList'] = user_data.get('mailingList', {})
                        data['users'][net_id]['degreeProgress'] = user_data.get('degreeProgress', {})
                        data['users'][net_id]['courses'] = user_data.get('courses', [])

                        # 更新 profile（如果提供）
                        if 'profile' in user_data:
                            data['users'][net_id]['profile'] = user_data['profile']

                        self.save_database(data)

                        self._set_headers(200)
                        self.wfile.write(json.dumps({'success': True}).encode())
                    else:
                        self._set_headers(404)
                        self.wfile.write(json.dumps({'error': 'User not found'}).encode())
                else:
                    self._set_headers(400)
                    self.wfile.write(json.dumps({'error': 'Invalid data'}).encode())

            except Exception as e:
                self._set_headers(500)
                self.wfile.write(json.dumps({'error': str(e)}).encode())

        elif self.path == '/api/user/password':
            # 修改密码
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)

            try:
                payload = json.loads(post_data.decode('utf-8'))
                net_id = payload.get('netId')
                current_password = payload.get('currentPassword')
                new_password = payload.get('newPassword')

                if net_id and current_password and new_password:
                    data = self.load_database()

                    if net_id in data['users']:
                        # 验证当前密码
                        if data['users'][net_id]['password'] != current_password:
                            self._set_headers(401)
                            self.wfile.write(json.dumps({'success': False, 'error': 'Current password is incorrect'}).encode())
                            return

                        # 更新密码
                        data['users'][net_id]['password'] = new_password
                        self.save_database(data)

                        self._set_headers(200)
                        self.wfile.write(json.dumps({'success': True}).encode())
                    else:
                        self._set_headers(404)
                        self.wfile.write(json.dumps({'success': False, 'error': 'User not found'}).encode())
                else:
                    self._set_headers(400)
                    self.wfile.write(json.dumps({'success': False, 'error': 'Invalid data'}).encode())

            except Exception as e:
                self._set_headers(500)
                self.wfile.write(json.dumps({'success': False, 'error': str(e)}).encode())

        elif self.path == '/api/user/register':
            # 注册新用户
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)

            try:
                payload = json.loads(post_data.decode('utf-8'))
                net_id = payload.get('netId')
                password = payload.get('password')
                user_data = payload.get('userData')

                if not net_id or not password or not user_data:
                    self._set_headers(400)
                    self.wfile.write(json.dumps({'success': False, 'error': 'Missing required fields'}).encode())
                    return

                data = self.load_database()

                # 检查用户是否已存在
                if net_id in data['users']:
                    self._set_headers(409)
                    self.wfile.write(json.dumps({'success': False, 'error': 'User already exists'}).encode())
                    return

                # 创建新用户
                data['users'][net_id] = {
                    'password': password,
                    'profile': user_data.get('profile', {}),
                    'tasks': user_data.get('tasks', []),
                    'history': user_data.get('history', []),
                    'courses': user_data.get('courses', []),
                    'mailingList': user_data.get('mailingList', {}),
                    'degreeProgress': user_data.get('degreeProgress', {})
                }

                self.save_database(data)

                self._set_headers(201)
                self.wfile.write(json.dumps({'success': True, 'message': 'User created successfully'}).encode())

            except Exception as e:
                self._set_headers(500)
                self.wfile.write(json.dumps({'success': False, 'error': str(e)}).encode())

        else:
            self._set_headers(404)
            self.wfile.write(json.dumps({'error': 'Not found'}).encode())

    def load_database(self):
        """加载数据库"""
        if os.path.exists(DATABASE_FILE):
            with open(DATABASE_FILE, 'r', encoding='utf-8') as f:
                return json.load(f)
        return {'users': {}}

    def save_database(self, data):
        """保存数据库"""
        with open(DATABASE_FILE, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)

def run_server(port=8000):
    """启动服务器"""
    server_address = ('', port)
    httpd = HTTPServer(server_address, URLifeHandler)
    print(f'🚀 UR Life Server running on http://localhost:{port}')
    print(f'📊 Database: {DATABASE_FILE}')
    print(f'🌐 API Endpoints:')
    print(f'   - GET  /api/login?netId=xxx&password=xxx')
    print(f'   - GET  /api/user?netId=xxx')
    print(f'   - POST /api/user/register')
    print(f'   - POST /api/user/save')
    print(f'   - POST /api/user/password')
    print(f'\n按 Ctrl+C 停止服务器\n')
    httpd.serve_forever()

if __name__ == '__main__':
    run_server()
