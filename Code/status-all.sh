#!/bin/bash

# UR Life - 查看所有服务状态

echo "======================================"
echo "  UR Life - 服务状态"
echo "======================================"
echo ""

# 颜色定义
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 获取脚本所在目录
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

# 1. 检查 Python 服务器
echo -e "${BLUE}[1] Python 服务器:${NC}"
if [ -f "server.pid" ]; then
    SERVER_PID=$(cat server.pid)
    if ps -p $SERVER_PID > /dev/null 2>&1; then
        echo -e "   ${GREEN}✓ 运行中${NC} (PID: $SERVER_PID)"
        echo -e "   端口: 8000"
    else
        echo -e "   ${RED}✗ 未运行${NC}"
    fi
else
    echo -e "   ${RED}✗ 未运行${NC} (无 PID 文件)"
fi

echo ""

# 2. 检查 ngrok
echo -e "${BLUE}[2] ngrok 隧道:${NC}"
if [ -f "ngrok.pid" ]; then
    NGROK_PID=$(cat ngrok.pid)
    if ps -p $NGROK_PID > /dev/null 2>&1; then
        echo -e "   ${GREEN}✓ 运行中${NC} (PID: $NGROK_PID)"

        # 获取公网地址
        PUBLIC_URL=$(curl -s http://localhost:4040/api/tunnels 2>/dev/null | python3 -c "import sys, json; data = json.load(sys.stdin); print(data['tunnels'][0]['public_url'] if data.get('tunnels') else '')" 2>/dev/null)

        if [ -n "$PUBLIC_URL" ]; then
            echo -e "   ${GREEN}公网地址:${NC}"
            echo -e "   ${BLUE}$PUBLIC_URL/index.html${NC}"
            echo ""
            echo -e "   ${BLUE}ngrok 管理界面: http://localhost:4040${NC}"
        else
            echo -e "   ${YELLOW}⚠ 无法获取公网地址${NC}"
        fi
    else
        echo -e "   ${RED}✗ 未运行${NC}"
    fi
else
    echo -e "   ${RED}✗ 未运行${NC} (无 PID 文件)"
fi

echo ""

# 3. 检查保活服务
echo -e "${BLUE}[3] 保活服务:${NC}"
if [ -f "keep-alive.pid" ]; then
    KEEPALIVE_PID=$(cat keep-alive.pid)
    if ps -p $KEEPALIVE_PID > /dev/null 2>&1; then
        echo -e "   ${GREEN}✓ 运行中${NC} (PID: $KEEPALIVE_PID)"
        echo -e "   每 5 分钟自动访问一次网站"

        # 显示最近的保活日志
        if [ -f "keep-alive.log" ]; then
            LAST_LOG=$(tail -1 keep-alive.log 2>/dev/null)
            if [ -n "$LAST_LOG" ]; then
                echo -e "   ${BLUE}最后访问:${NC} $LAST_LOG"
            fi
        fi
    else
        echo -e "   ${RED}✗ 未运行${NC}"
    fi
else
    echo -e "   ${RED}✗ 未运行${NC} (无 PID 文件)"
fi

echo ""
echo "======================================"

# 总结
SERVER_OK=false
NGROK_OK=false

if [ -f "server.pid" ] && ps -p $(cat server.pid) > /dev/null 2>&1; then
    SERVER_OK=true
fi

if [ -f "ngrok.pid" ] && ps -p $(cat ngrok.pid) > /dev/null 2>&1; then
    NGROK_OK=true
fi

if $SERVER_OK && $NGROK_OK; then
    echo -e "${GREEN}✓ 所有服务正常运行${NC}"
    echo -e "${GREEN}✓ 网站可以通过公网访问${NC}"
elif $SERVER_OK; then
    echo -e "${YELLOW}⚠ 服务器运行正常，但 ngrok 未运行${NC}"
    echo -e "${YELLOW}  运行 ./start-all.sh 启动 ngrok${NC}"
else
    echo -e "${RED}✗ 服务未运行${NC}"
    echo -e "${YELLOW}  运行 ./start-all.sh 启动所有服务${NC}"
fi

echo "======================================"
echo ""
