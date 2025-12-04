"""
UR Life Backend Server
"""

from http.server import HTTPServer, SimpleHTTPRequestHandler
import json
import os
from urllib.parse import urlparse, parse_qs
import threading
from openai import OpenAI
import requests
import json
import re
import html

BASE = "https://ccc.rochester.edu"
API_URL = "https://ccc.rochester.edu/mobile_ws/v17/mobile_events_list?range=0&limit=100"

resp = requests.get(API_URL)
resp.raise_for_status()

ccc_data = resp.json()
events = ccc_data

filtered_data = []

for i in range(0, len(events)):
    if events[i].get("p3") == "False":
        continue

    filtered_ev = {}
    filtered_ev["title"] = events[i].get("p3")

    raw_time_html = events[i].get("p4")

    if raw_time_html:
        text = html.unescape(raw_time_html)
        text = re.sub(r"</p>\s*<p", "</p> <p", text)
        no_tags = re.sub(r"<.*?>", "", text)
        no_tags = re.sub(r"\s+", " ", no_tags).strip()
        readable_time = no_tags.replace("–", "→").strip()
    else:
        readable_time = ""

    filtered_ev["time"] = readable_time
    filtered_ev["location"] = events[i].get("p6")
    filtered_ev["url"] = "https://ccc.rochester.edu/" + events[i].get("p8") + events[i].get("p18")
    filtered_data.append(filtered_ev)

with open("filtered_data.json", "w", encoding="utf-8") as f:
    json.dump(filtered_data, f, indent=2, ensure_ascii=False)

DATABASE_FILE = 'data/database.json'

with open("filtered_data.json", "r", encoding="utf-8") as f:
    event_data = json.load(f)

event_data = json.dumps(event_data, ensure_ascii=False, indent=2)

# 加载 UR CS 搜索数据库
try:
    with open("ur_cs_data.json", "r", encoding="utf-8") as f:
        ur_cs_search_data = json.load(f)
    print(f"✅ 加载搜索数据库: {len(ur_cs_search_data.get('courses', []))} 门课程, {len(ur_cs_search_data.get('people', []))} 位教职员工")
except FileNotFoundError:
    ur_cs_search_data = {'courses': [], 'people': []}
    print("⚠️ 搜索数据库未找到,请运行 parse_data.py")

class llm:
    def __init__(self, model="qwen2.5:7b"):
        self.model=model
        self.messages=list()

    def add_user_message(self, message):
        self.messages.insert(-1, {"role": "user", "content": message})

    def clear_messages(self):
        self.messages=[{"role": "system", "content": """You are Rocky, the friendly campus assistant for the University of Rochester!

You're a comprehensive UR campus helper who can assist with ALL aspects of student life, not just events:

**What You Can Help With:**
1. 📅 Campus Events - Suggest activities from the event database
2. 📚 Academic Advice - Study tips, time management, course planning
3. 🏫 Campus Life - Dorms, dining, facilities, transportation
4. 🤝 Student Resources - Clubs, tutoring, counseling, career services
5. 🎯 Personal Goals - Motivation, stress management, social life
6. 📍 Campus Navigation - Locations, buildings, popular spots
7. 💡 General Questions - Anything about UR student experience!

**UR Knowledge Base:**
- Motto: "Meliora" (Ever Better)
- Mascot: Yellow Jackets 🐝
- Location: River Campus, Rochester, NY
- Known for: Strong academics, research opportunities, close-knit community
- Popular spots: Rush Rhees Library, Danforth Dining, Eastman Theatre
- Student life: Greek life, 250+ clubs, Division III athletics
- Key resources: Writing Center, Career Center, UCC (University Counseling)

**Your Personality:**
- Warm, encouraging upperclassman mentor
- Knowledgeable about UR culture and resources
- Balance casual friendliness with helpful professionalism
- Reference UR traditions and campus culture naturally
- Always supportive and student-focused"""},
                       {"role": "system", "content": f"""***UNIVERSITY OF ROCHESTER CAMPUS EVENTS DATABASE***
                       {event_data}

Note: Use this database ONLY when students ask about events or activities. For other questions (academic advice, campus info, etc.), provide helpful guidance based on general UR knowledge."""},
                       {"role": "system", "content": """

**Response Guidelines:**

1. **Identify the Question Type:**
   - Event request? → Suggest from event database with details
   - Academic question? → Provide study tips, time management advice
   - Campus life? → Share info about facilities, resources, traditions
   - Personal advice? → Be supportive, reference UR resources
   - General chat? → Be friendly and relatable

2. **For Event Suggestions:**
   - Include: Event name, time, location, URL
   - Explain WHY it's great for UR students
   - Suggest 2-5 events when possible
   - Use student-friendly language

3. **For Non-Event Questions:**
   - Provide practical, actionable advice
   - Reference UR-specific resources when relevant (e.g., "Check out the Writing Center in Rush Rhees!")
   - Be encouraging and relatable
   - Share tips from a student perspective

4. **Always:**
   - Use a warm, conversational tone
   - Reference UR culture/values when natural
   - Be concise but thorough
   - End with encouragement or next steps

Remember: You're here for ALL aspects of UR student life, not just events. Meliora! 🐝"""}]
                       
        
    def call(self):
        try:
            client = OpenAI(
                base_url="https://router.huggingface.co/v1",
                api_key=os.environ.get("HF_TOKEN"),
            )

            response = client.chat.completions.create(
                model="Qwen/Qwen2.5-7B-Instruct",
                messages=self.messages,
            )

            reply = response.choices[0].message.content
            self.messages.append({"role": "assistant", "content": reply})
            return reply
        except Exception as e:
            error_msg = f"AI Error: {str(e)}\n\nPlease check:\n1. HF_TOKEN has 'Inference Providers' permission\n2. Visit https://huggingface.co/settings/tokens to create new token"
            print(f"❌ {error_msg}")
            return error_msg

llm = llm()

class URLifeHandler(SimpleHTTPRequestHandler):

    def _set_headers(self, status=200):
        self.send_response(status)
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def do_OPTIONS(self):
        self._set_headers(200)

    def do_GET(self):
        parsed_path = urlparse(self.path)

        if parsed_path.path == '/api/user':
            params = parse_qs(parsed_path.query)
            net_id = params.get('netId', [None])[0]

            if net_id:
                data = self.load_database()
                user_data = data['users'].get(net_id)

                if user_data:
                    self._set_headers(200)
                   
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
            
            super().do_GET()

    def do_POST(self):
        
        if self.path == '/api/user/save':
            
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)

            try:
                payload = json.loads(post_data.decode('utf-8'))
                net_id = payload.get('netId')
                user_data = payload.get('data')

                if net_id and user_data:
                    data = self.load_database()

                    if net_id in data['users']:
                        
                        data['users'][net_id]['tasks'] = user_data.get('tasks', [])
                        data['users'][net_id]['history'] = user_data.get('history', [])
                        data['users'][net_id]['mailingList'] = user_data.get('mailingList', {})
                        data['users'][net_id]['degreeProgress'] = user_data.get('degreeProgress', {})
                        data['users'][net_id]['courses'] = user_data.get('courses', [])

                      
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
                    
                        if data['users'][net_id]['password'] != current_password:
                            self._set_headers(401)
                            self.wfile.write(json.dumps({'success': False, 'error': 'Current password is incorrect'}).encode())
                            return

                    
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

        
                if net_id in data['users']:
                    self._set_headers(409)
                    self.wfile.write(json.dumps({'success': False, 'error': 'User already exists'}).encode())
                    return

        
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
        elif self.path == '/api/chat':
            content_length = int(self.headers.get('Content-Length', 0))
            post_data = self.rfile.read(content_length)
            try:
                payload = json.loads(post_data.decode('utf-8'))
                user_message = payload.get('message', '')

                llm.clear_messages()
                llm.add_user_message(user_message)
                reply = llm.call()

                self._set_headers(200)
                self.wfile.write(json.dumps({'reply': reply}, ensure_ascii=False).encode('utf-8'))
            except Exception as e:
                self._set_headers(500)
                self.wfile.write(json.dumps({'error': str(e)}).encode('utf-8'))

        elif self.path.startswith('/api/search'):
            # 处理搜索请求
            parsed_path = urlparse(self.path)
            params = parse_qs(parsed_path.query)
            query = params.get('q', [''])[0].lower().strip()

            if not query or len(query) < 2:
                self._set_headers(200)
                self.wfile.write(json.dumps({'results': []}).encode('utf-8'))
                return

            results = []

            # 搜索课程
            for course in ur_cs_search_data.get('courses', []):
                search_text = f"{course.get('code', '')} {course.get('title', '')} {course.get('instructor', '')} {course.get('term', '')}".lower()
                if query in search_text:
                    results.append({
                        'type': 'course',
                        'title': f"{course.get('code', '')} - {course.get('title', '')}",
                        'description': f"{course.get('instructor', 'TBA')} | {course.get('time', 'TBA')} | {course.get('term', '')}",
                        'data': course
                    })

            # 搜索教职员工
            for person in ur_cs_search_data.get('people', []):
                search_text = f"{person.get('name', '')} {person.get('role', '')} {person.get('email', '')} {person.get('office', '')}".lower()
                if query in search_text:
                    results.append({
                        'type': 'faculty',
                        'title': person.get('name', ''),
                        'description': f"{person.get('role', '')} | {person.get('email', '')} | {person.get('office', 'N/A')}",
                        'data': person
                    })

            # 限制结果数量
            results = results[:15]

            self._set_headers(200)
            self.wfile.write(json.dumps({'results': results}, ensure_ascii=False).encode('utf-8'))

        else:
            self._set_headers(404)
            self.wfile.write(json.dumps({'error': 'Not found'}).encode())

    def load_database(self):
 
        if os.path.exists(DATABASE_FILE):
            with open(DATABASE_FILE, 'r', encoding='utf-8') as f:
                return json.load(f)
        return {'users': {}}

    def save_database(self, data):
    
        with open(DATABASE_FILE, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)

def run_server(port=8000):

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
    print(f'\nPress Ctrl+C to stop server.\n')
    httpd.serve_forever()

if __name__ == '__main__':
    run_server()
