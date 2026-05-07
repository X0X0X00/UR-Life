#!/bin/bash

# UR Life Server - 停止服务脚本

echo "======================================"
echo "  UR Life - 停止服务器"
echo "======================================"
echo ""

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 获取脚本所在目录
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

PID_FILE="server.pid"
PORT=8000

# 检查 PID 文件
if [ -f "$PID_FILE" ]; then
    PID=$(cat "$PID_FILE")

    if ps -p $PID > /dev/null 2>&1; then
        echo -e "${YELLOW}停止服务器 (PID: $PID)...${NC}"
        kill $PID

        # 等待进程结束
        sleep 2

        # 如果还在运行，强制停止
        if ps -p $PID > /dev/null 2>&1; then
            echo -e "${YELLOW}强制停止...${NC}"
            kill -9 $PID
        fi

        echo -e "${GREEN}✓ 服务器已停止${NC}"
    else
        echo -e "${YELLOW}服务器进程不存在 (PID: $PID)${NC}"
    fi

    rm -f "$PID_FILE"
else
    echo -e "${YELLOW}未找到 PID 文件${NC}"
fi

# 额外清理：停止占用端口的进程
if lsof -Pi :$PORT -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    echo -e "${YELLOW}清理端口 $PORT 上的进程...${NC}"
    lsof -ti:$PORT | xargs kill -9 2>/dev/null
    echo -e "${GREEN}✓ 端口已清理${NC}"
fi

echo ""
echo "======================================"
echo -e "  ${GREEN}所有服务已停止${NC}"
echo "======================================"
echo ""
