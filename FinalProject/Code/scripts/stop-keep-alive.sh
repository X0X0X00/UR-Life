#!/bin/bash

# UR Life - 停止保活服务

echo "======================================"
echo "  UR Life - 停止保活服务"
echo "======================================"
echo ""

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 获取脚本所在目录
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

PID_FILE="keep-alive.pid"

if [ -f "$PID_FILE" ]; then
    PID=$(cat "$PID_FILE")

    if ps -p $PID > /dev/null 2>&1; then
        echo -e "${YELLOW}停止保活服务 (PID: $PID)...${NC}"
        kill $PID 2>/dev/null
        sleep 1

        # 如果还在运行，强制停止
        if ps -p $PID > /dev/null 2>&1; then
            kill -9 $PID 2>/dev/null
        fi

        echo -e "${GREEN}✓ 保活服务已停止${NC}"
    else
        echo -e "${YELLOW}保活服务进程不存在 (PID: $PID)${NC}"
    fi

    rm -f "$PID_FILE"
else
    echo -e "${YELLOW}保活服务未运行${NC}"
fi

echo ""
echo "======================================"
echo ""
