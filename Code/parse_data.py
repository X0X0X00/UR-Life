"""
Parse UR CS course and people data from HTML
"""
import re
import json

def parse_course_data(html_content):
    """Extract course information from HTML tables"""
    courses = []

    # 定义学期标识
    terms = {
        'Fall 2025': [],
        'Spring 2026': [],
        'Summer 2025': []
    }

    # 使用正则表达式提取课程行
    # 匹配模式: CSC XXX-XX<Title><Instructor>TR 11:05AM - 12:20PM
    course_pattern = r'CSC (\d+(?:-\d+)?)(.*?)([A-Z][a-z]+(?: [A-Z][a-z]+)*)((?:M|T|W|R|F|U|TR|MW|MWF|TW|TWR|TWRF)+ \d{1,2}:\d{2}[AP]M - \d{1,2}:\d{2}[AP]M|–)'

    current_term = None
    for line in html_content.split('\n'):
        # 检测学期
        if 'Fall 2025' in line:
            current_term = 'Fall 2025'
        elif 'Spring 2026' in line:
            current_term = 'Spring 2026'
        elif 'Summer 2025' in line:
            current_term = 'Summer 2025'

        # 匹配课程行
        match = re.search(course_pattern, line)
        if match and current_term:
            course_num = match.group(1)
            title_raw = match.group(2)
            instructor = match.group(3)
            time = match.group(4)

            # 清理课程名称
            title = re.sub(r'[^A-Za-z\s&:-]', ' ', title_raw).strip()
            title = re.sub(r'\s+', ' ', title)

            course = {
                'code': f'CSC {course_num}',
                'title': title,
                'instructor': instructor.strip(),
                'time': time if time != '–' else 'TBA',
                'term': current_term
            }
            courses.append(course)

    return courses


def parse_people_data(html_content):
    """Extract faculty and staff information"""
    people = []

    # 更新的模式:匹配 Email 后面的邮箱地址
    # 使用更灵活的匹配方式
    email_pattern = r'Email\s*→?\s*\n?([a-z0-9._%+-]+@[a-z0-9.-]+\.edu)'

    # 找到所有邮箱
    for match in re.finditer(email_pattern, html_content):
        email = match.group(1)

        # 获取邮箱前的文本 (更大范围)
        start_pos = max(0, match.start() - 800)
        preceding_text = html_content[start_pos:match.start()]

        # 查找姓名 - 寻找最后一个大写字母开头的名字
        # 格式: Lastname, Firstname 或 Firstname Lastname
        name_matches = re.findall(r'→\s*([A-Z][a-z]+(?:,\s*[A-Z][a-z]+)?(?:\s+[A-Z][a-z]+(?:\s+[A-Z]\.)?)*)\s*\n', preceding_text)
        if not name_matches:
            name_matches = re.findall(r'\n([A-Z][a-z]+(?:,\s*[A-Z][a-z]+)?(?:\s+[A-Z][a-z]+(?:\s+[A-Z]\.)?)*)\n', preceding_text)

        name = name_matches[-1] if name_matches else 'Unknown'

        # 查找职位 - 扩展模式列表
        role_patterns = [
            r'(Professor Emeritus[^\n]*)',
            r'(Assistant Professor[^\n]*)',
            r'(Associate Professor[^\n]*)',
            r'(Professor[^\n]*)',
            r'(PhD Student)',
            r'(MS Student)',
            r'(Instructor[^\n]*)',
            r'(Postdoctoral Associate)',
            r'(Program Coordinator)',
            r'(Department Coordinator)',
            r'(Manager[^\n]*)',
            r'(Programmer[^\n]*)',
            r'(Accountant)',
            r'(Visiting Student)',
            r'(Visiting Research Professor)',
            r'(Adjunct[^\n]*)',
            r'(Sr Financial[^\n]*)',
            r'(Grants[^\n]*)'
        ]

        role = 'Faculty'
        for pattern in role_patterns:
            role_match = re.search(pattern, preceding_text)
            if role_match:
                role = role_match.group(1).strip()
                break

        # 查找办公室 - 更宽松的匹配
        office_match = re.search(r'Office Location\s*→?\s*\n?([^→\n]+?(?:Hall|Building|Room))', preceding_text + html_content[match.end():match.end()+200])
        office = office_match.group(1).strip() if office_match else 'N/A'

        # 清理姓名
        name = name.replace('\n', ' ').replace('→', '').strip()

        # 跳过无效的名字
        if len(name) < 3 or name in ['Profile Photo', 'Photo', 'Headshot', 'Email']:
            continue

        person = {
            'name': name,
            'role': role,
            'email': email,
            'office': office
        }
        people.append(person)

    # 去重 (基于邮箱)
    unique_people = {}
    for p in people:
        if p['email'] not in unique_people:
            unique_people[p['email']] = p

    return list(unique_people.values())


def main():
    # 读取数据文件
    with open('../data_stroed.txt', 'r', encoding='utf-8') as f:
        content = f.read()

    # 解析课程和人员数据
    courses = parse_course_data(content)
    people = parse_people_data(content)

    # 创建搜索数据库
    search_database = {
        'courses': courses,
        'people': people,
        'generated_at': '2025-12-03',
        'source': 'UR CS Department Website'
    }

    # 保存为 JSON
    with open('ur_cs_data.json', 'w', encoding='utf-8') as f:
        json.dump(search_database, f, indent=2, ensure_ascii=False)

    print(f'✅ 成功解析:')
    print(f'   - 课程: {len(courses)} 条')
    print(f'   - 人员: {len(people)} 条')
    print(f'   - 已保存到: ur_cs_data.json')


if __name__ == '__main__':
    main()
