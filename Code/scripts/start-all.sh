#!/bin/bash

# UR Life - 完整启动脚本（服务器 + ngrok）

echo "======================================"
echo "  UR Life - 启动所有服务"
echo "======================================"
echo ""

# 颜色定义
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 获取脚本所在目录的父目录（Code 目录）
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )/.." && pwd )"
cd "$SCRIPT_DIR"

# 1. 启动 Python 服务器
echo -e "${BLUE}[1/2] 启动 Python 服务器...${NC}"
./scripts/start-server.sh

# 检查服务器是否启动成功
if [ $? -ne 0 ]; then
    echo -e "${RED}✗ 服务器启动失败${NC}"
    exit 1
fi

echo ""

# 2. 启动 ngrok
echo -e "${BLUE}[2/2] 启动 ngrok 隧道...${NC}"

# 停止旧的 ngrok
pkill ngrok 2>/dev/null
sleep 1

# 启动 ngrok（使用 nohup 让它持久运行）
nohup ~/bin/ngrok http 8000 > logs/ngrok.log 2>&1 &
NGROK_PID=$!
echo $NGROK_PID > logs/ngrok.pid

# 等待 ngrok 启动
sleep 5

# 获取公网地址
PUBLIC_URL=$(curl -s http://localhost:4040/api/tunnels 2>/dev/null | python3 -c "import sys, json; data = json.load(sys.stdin); print(data['tunnels'][0]['public_url'] if data.get('tunnels') else '')" 2>/dev/null)

if [ -n "$PUBLIC_URL" ]; then
    echo -e "${GREEN}✓ ngrok 隧道启动成功!${NC}"
    echo ""
    echo "======================================"
    echo -e "${GREEN}🎉 所有服务启动完成！${NC}"
    echo "======================================"
    echo ""
    echo -e "${GREEN}🌐 公网访问地址:${NC}"
    echo -e "   ${BLUE}$PUBLIC_URL/index.html${NC}"
    echo ""
    echo -e "${YELLOW}📋 复制这个地址分享给其他人！${NC}"
    echo -e "${YELLOW}💡 提示: 如果看不到更新，请使用 Ctrl+Shift+R 强制刷新${NC}"
    echo ""
    echo "======================================"
    echo -e "${GREEN}演示账号:${NC}"
    echo -e "  🦊 fox123 / rochester2025"
    echo -e "  🐻 bear456 / yellowjacket"
    echo -e "  🐱 cat789 / meowmeow123"
    echo ""
    echo "======================================"
    echo -e "${BLUE}服务信息:${NC}"
    echo -e "  Python 服务器 PID: $(cat logs/server.pid)"
    echo -e "  ngrok PID: $NGROK_PID"
    echo -e "  ngrok 管理界面: ${BLUE}http://localhost:4040${NC}"
    echo ""
    echo "======================================"
    echo -e "${YELLOW}管理命令:${NC}"
    echo -e "  查看服务状态: ${BLUE}./scripts/status-all.sh${NC}"
    echo -e "  停止所有服务: ${BLUE}./scripts/stop-all.sh${NC}"
    echo -e "  查看服务器日志: ${BLUE}tail -f logs/server.log${NC}"
    echo -e "  查看 ngrok 日志: ${BLUE}tail -f logs/ngrok.log${NC}"
    echo "======================================"
    echo ""

    # 3. 启动保活服务
    echo -e "${BLUE}[3/3] 启动保活服务...${NC}"
    nohup ./scripts/keep-alive.sh > /dev/null 2>&1 &
    sleep 1

    if [ -f "logs/keep-alive.pid" ]; then
        KEEPALIVE_PID=$(cat logs/keep-alive.pid)
        echo -e "${GREEN}✓ 保活服务启动成功${NC} (PID: $KEEPALIVE_PID)"
        echo -e "   每 5 分钟自动访问一次，保持 ngrok 连接"
    fi

    echo ""
    echo "======================================"
    echo -e "${GREEN}✅ 所有服务已在后台运行，你可以安全地断开 SSH 连接${NC}"
    echo -e "${GREEN}✅ 保活服务会自动保持 ngrok 连接活跃${NC}"
    echo ""
else
    echo -e "${RED}✗ ngrok 启动失败${NC}"
    echo -e "${YELLOW}查看日志: cat ngrok.log${NC}"
    exit 1
fi
