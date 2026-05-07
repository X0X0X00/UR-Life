#!/bin/bash

# UR Life - 停止所有服务

echo "======================================"
echo "  UR Life - 停止所有服务"
echo "======================================"
echo ""

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 获取脚本所在目录
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

# 1. 停止保活服务
echo -e "${YELLOW}停止保活服务...${NC}"
./stop-keep-alive.sh

# 2. 停止 Python 服务器
echo -e "${YELLOW}停止 Python 服务器...${NC}"
./stop-server.sh

# 3. 停止 ngrok
echo -e "${YELLOW}停止 ngrok...${NC}"
if [ -f "ngrok.pid" ]; then
    NGROK_PID=$(cat ngrok.pid)
    if ps -p $NGROK_PID > /dev/null 2>&1; then
        kill $NGROK_PID 2>/dev/null
        sleep 1
        if ps -p $NGROK_PID > /dev/null 2>&1; then
            kill -9 $NGROK_PID 2>/dev/null
        fi
        echo -e "${GREEN}✓ ngrok 已停止 (PID: $NGROK_PID)${NC}"
    else
        echo -e "  ngrok 进程不存在"
    fi
    rm -f ngrok.pid
else
    echo -e "  未找到 ngrok PID 文件"
fi

# 额外清理
pkill ngrok 2>/dev/null

echo ""
echo "======================================"
echo -e "  ${GREEN}✓ 所有服务已停止${NC}"
echo "======================================"
echo ""
