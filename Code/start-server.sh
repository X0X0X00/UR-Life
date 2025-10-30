#!/bin/bash

# UR Life Server - 后台运行脚本
# 适用于学校服务器长期运行

echo "======================================"
echo "  UR Life - 启动服务器"
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

# 配置
PORT=8000
LOG_FILE="server.log"
PID_FILE="server.pid"

# 检查端口是否被占用
if lsof -Pi :$PORT -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    echo -e "${RED}错误: 端口 $PORT 已被占用${NC}"
    echo -e "${YELLOW}正在尝试停止旧服务...${NC}"
    lsof -ti:$PORT | xargs kill -9 2>/dev/null
    sleep 2
fi

# 检查是否已有服务在运行
if [ -f "$PID_FILE" ]; then
    OLD_PID=$(cat "$PID_FILE")
    if ps -p $OLD_PID > /dev/null 2>&1; then
        echo -e "${YELLOW}发现已运行的服务 (PID: $OLD_PID)${NC}"
        echo -e "${YELLOW}正在停止...${NC}"
        kill $OLD_PID 2>/dev/null
        sleep 1
    fi
    rm -f "$PID_FILE"
fi

# 启动服务器
echo -e "${BLUE}启动 UR Life 服务器...${NC}"
nohup python3 server.py > "$LOG_FILE" 2>&1 &
SERVER_PID=$!

# 保存 PID
echo $SERVER_PID > "$PID_FILE"

# 等待服务器启动
sleep 2

# 检查服务器是否启动成功
if ps -p $SERVER_PID > /dev/null 2>&1; then
    echo -e "${GREEN}✓ 服务器启动成功!${NC}"
    echo ""
    echo "======================================"
    echo -e "${GREEN}服务器信息:${NC}"
    echo "======================================"
    echo -e "  进程 ID: ${BLUE}$SERVER_PID${NC}"
    echo -e "  端口号:  ${BLUE}$PORT${NC}"
    echo -e "  日志文件: ${BLUE}$LOG_FILE${NC}"
    echo ""
    echo -e "${GREEN}访问地址:${NC}"
    echo -e "  本地: ${BLUE}http://localhost:$PORT/index.html${NC}"

    # 尝试获取主机名
    HOSTNAME=$(hostname)
    if [ -n "$HOSTNAME" ]; then
        echo -e "  远程: ${BLUE}http://$HOSTNAME:$PORT/index.html${NC}"
    fi

    echo ""
    echo -e "${GREEN}演示账号:${NC}"
    echo -e "  🦊 fox123 / rochester2025"
    echo -e "  🐻 bear456 / yellowjacket"
    echo -e "  🐱 cat789 / meowmeow123"
    echo ""
    echo "======================================"
    echo -e "${YELLOW}管理命令:${NC}"
    echo -e "  查看日志: ${BLUE}tail -f $LOG_FILE${NC}"
    echo -e "  停止服务: ${BLUE}./stop-server.sh${NC}"
    echo -e "  查看状态: ${BLUE}./status-server.sh${NC}"
    echo "======================================"
    echo ""
else
    echo -e "${RED}✗ 服务器启动失败${NC}"
    echo -e "${YELLOW}查看日志: cat $LOG_FILE${NC}"
    exit 1
fi
