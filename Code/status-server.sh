#!/bin/bash

# UR Life Server - 状态检查脚本

echo "======================================"
echo "  UR Life - 服务器状态"
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

PID_FILE="server.pid"
LOG_FILE="server.log"
PORT=8000

# 检查 PID 文件
if [ -f "$PID_FILE" ]; then
    PID=$(cat "$PID_FILE")

    if ps -p $PID > /dev/null 2>&1; then
        echo -e "${GREEN}✓ 服务器正在运行${NC}"
        echo ""
        echo -e "  进程 ID: ${BLUE}$PID${NC}"
        echo -e "  端口号:  ${BLUE}$PORT${NC}"

        # 显示进程信息
        echo ""
        echo -e "${BLUE}进程信息:${NC}"
        ps -p $PID -o pid,ppid,cmd,%cpu,%mem,etime

        # 检查端口
        echo ""
        if lsof -Pi :$PORT -sTCP:LISTEN -t >/dev/null 2>&1 ; then
            echo -e "${GREEN}✓ 端口 $PORT 正在监听${NC}"
        else
            echo -e "${YELLOW}⚠ 端口 $PORT 未在监听${NC}"
        fi

        # 显示访问地址
        echo ""
        echo -e "${GREEN}访问地址:${NC}"
        echo -e "  ${BLUE}http://localhost:$PORT/index.html${NC}"

        HOSTNAME=$(hostname)
        if [ -n "$HOSTNAME" ]; then
            echo -e "  ${BLUE}http://$HOSTNAME:$PORT/index.html${NC}"
        fi

        # 显示最近的日志
        if [ -f "$LOG_FILE" ]; then
            echo ""
            echo -e "${BLUE}最近的日志 (最后 5 行):${NC}"
            tail -5 "$LOG_FILE"
        fi

    else
        echo -e "${RED}✗ 服务器未运行 (PID 文件存在但进程不存在)${NC}"
        echo -e "${YELLOW}建议: 运行 ./start-server.sh 启动服务器${NC}"
    fi
else
    echo -e "${YELLOW}服务器未运行 (未找到 PID 文件)${NC}"

    # 检查端口是否被占用
    if lsof -Pi :$PORT -sTCP:LISTEN -t >/dev/null 2>&1 ; then
        echo -e "${YELLOW}⚠ 但端口 $PORT 正在被使用:${NC}"
        lsof -Pi :$PORT -sTCP:LISTEN
    fi

    echo ""
    echo -e "${YELLOW}建议: 运行 ./start-server.sh 启动服务器${NC}"
fi

echo ""
echo "======================================"
echo ""
