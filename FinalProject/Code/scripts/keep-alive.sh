#!/bin/bash

# UR Life - ngrok 保活脚本
# 定期访问网站，防止 ngrok 超时断开

echo "======================================"
echo "  UR Life - ngrok 保活服务"
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
INTERVAL=300  # 每5分钟访问一次（300秒）
LOG_FILE="keep-alive.log"
PID_FILE="keep-alive.pid"

# 检查是否已经在运行
if [ -f "$PID_FILE" ]; then
    OLD_PID=$(cat "$PID_FILE")
    if ps -p $OLD_PID > /dev/null 2>&1; then
        echo -e "${YELLOW}保活服务已经在运行 (PID: $OLD_PID)${NC}"
        exit 0
    fi
fi

# 保存当前进程 PID
echo $$ > "$PID_FILE"

echo -e "${GREEN}✓ 保活服务启动成功${NC}"
echo -e "  进程 ID: ${BLUE}$$${NC}"
echo -e "  访问间隔: ${BLUE}${INTERVAL}秒 ($(($INTERVAL / 60))分钟)${NC}"
echo -e "  日志文件: ${BLUE}$LOG_FILE${NC}"
echo ""
echo -e "${YELLOW}服务已在后台运行，你可以断开 SSH 连接${NC}"
echo -e "${YELLOW}停止服务: ./stop-keep-alive.sh${NC}"
echo ""

# 获取公网地址的函数
get_public_url() {
    curl -s http://localhost:4040/api/tunnels 2>/dev/null | \
    python3 -c "import sys, json; data = json.load(sys.stdin); print(data['tunnels'][0]['public_url'] if data.get('tunnels') else '')" 2>/dev/null
}

# 主循环
while true; do
    # 获取当前时间
    TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')

    # 获取公网地址
    PUBLIC_URL=$(get_public_url)

    if [ -n "$PUBLIC_URL" ]; then
        # 访问主页
        HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "$PUBLIC_URL/index.html" 2>/dev/null)

        if [ "$HTTP_CODE" = "200" ]; then
            echo "[$TIMESTAMP] ✓ 访问成功 - HTTP $HTTP_CODE - $PUBLIC_URL" >> "$LOG_FILE"
            echo -e "${GREEN}[$TIMESTAMP]${NC} ✓ 保活请求成功"
        else
            echo "[$TIMESTAMP] ⚠ 访问失败 - HTTP $HTTP_CODE - $PUBLIC_URL" >> "$LOG_FILE"
            echo -e "${YELLOW}[$TIMESTAMP]${NC} ⚠ 访问失败 (HTTP $HTTP_CODE)"
        fi
    else
        echo "[$TIMESTAMP] ✗ 无法获取 ngrok 地址" >> "$LOG_FILE"
        echo -e "${RED}[$TIMESTAMP]${NC} ✗ ngrok 未运行"
    fi

    # 等待下一次访问
    sleep $INTERVAL
done
