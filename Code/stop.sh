#!/bin/bash

# Campus Assistant 停止脚本

echo "======================================"
echo "  Campus Assistant - 停止服务..."
echo "======================================"
echo ""

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 停止本地服务器
echo -e "${YELLOW}停止本地服务器...${NC}"
lsof -ti:8000 | xargs kill -9 2>/dev/null
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ 本地服务器已停止${NC}"
else
    echo -e "  (没有运行的服务器)"
fi

# 停止 ngrok
echo -e "${YELLOW}停止 ngrok...${NC}"
lsof -ti:4040 | xargs kill -9 2>/dev/null
pkill -9 ngrok 2>/dev/null
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ ngrok 已停止${NC}"
else
    echo -e "  (没有运行的 ngrok)"
fi

# 清理其他可能的进程
pkill -9 lt 2>/dev/null

echo ""
echo "======================================"
echo -e "  ${GREEN}✓ 所有服务已停止${NC}"
echo "======================================"
echo ""
