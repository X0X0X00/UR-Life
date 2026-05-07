#!/bin/bash

# Campus Assistant 快速启动脚本

echo "======================================"
echo "  Campus Assistant - 启动中..."
echo "======================================"
echo ""

# 颜色定义
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 获取脚本所在目录
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# 进入项目目录
cd "$SCRIPT_DIR"

# 停止可能正在运行的服务
echo -e "${YELLOW}正在清理旧服务...${NC}"
lsof -ti:8000 | xargs kill -9 2>/dev/null
lsof -ti:4040 | xargs kill -9 2>/dev/null
pkill -9 ngrok 2>/dev/null
sleep 1

# 启动本地服务器
echo -e "${BLUE}启动本地服务器 (端口 8000)...${NC}"
python3 -m http.server 8000 > /dev/null 2>&1 &
SERVER_PID=$!
sleep 2

# 检查服务器是否启动成功
if lsof -ti:8000 > /dev/null; then
    echo -e "${GREEN}✓ 本地服务器启动成功!${NC}"
else
    echo -e "${YELLOW}✗ 本地服务器启动失败${NC}"
    exit 1
fi

# 启动 ngrok
echo -e "${BLUE}启动 ngrok 隧道...${NC}"
ngrok http 8000 > /tmp/ngrok.log 2>&1 &
NGROK_PID=$!
sleep 3

# 获取公网地址
echo -e "${BLUE}获取公网地址...${NC}"
sleep 2

PUBLIC_URL=$(curl -s http://localhost:4040/api/tunnels | python3 -c "import sys, json; data = json.load(sys.stdin); print(data['tunnels'][0]['public_url'] if data.get('tunnels') else '')" 2>/dev/null)

echo ""
echo "======================================"
echo -e "  ${GREEN}✓ 启动完成!${NC}"
echo "======================================"
echo ""

if [ -n "$PUBLIC_URL" ]; then
    echo -e "${GREEN}🌐 公网访问地址:${NC}"
    echo -e "   ${BLUE}$PUBLIC_URL${NC}"
    echo ""
    echo -e "${GREEN}📝 登录页面:${NC}"
    echo -e "   ${BLUE}$PUBLIC_URL${NC}"
    echo ""
    echo -e "${GREEN}🏠 主应用:${NC}"
    echo -e "   ${BLUE}$PUBLIC_URL/campus-assistant.html${NC}"
    echo ""
fi

# 获取本地IP
LOCAL_IP=$(ipconfig getifaddr en0 2>/dev/null || ipconfig getifaddr en1 2>/dev/null)

if [ -n "$LOCAL_IP" ]; then
    echo -e "${GREEN}💻 本地访问地址:${NC}"
    echo -e "   ${BLUE}http://localhost:8000${NC}"
    echo ""
    echo -e "${GREEN}📱 同一WiFi访问:${NC}"
    echo -e "   ${BLUE}http://$LOCAL_IP:8000${NC}"
    echo ""
fi

echo -e "${GREEN}📊 ngrok 管理面板:${NC}"
echo -e "   ${BLUE}http://localhost:4040${NC}"
echo ""

echo "======================================"
echo -e "${YELLOW}演示账号:${NC}"
echo ""
echo -e "  🦊 ${BLUE}fox123${NC} / rochester2025"
echo -e "     Computer Science Junior"
echo ""
echo -e "  🐻 ${BLUE}bear456${NC} / yellowjacket"
echo -e "     Mathematics Senior"
echo ""
echo -e "  🐱 ${BLUE}cat789${NC} / meowmeow123"
echo -e "     Biology Sophomore"
echo ""
echo "======================================"
echo ""
echo -e "${YELLOW}停止服务:${NC} 按 Ctrl+C 或运行 ./stop.sh"
echo ""
echo "======================================"

# 等待用户中断
wait
