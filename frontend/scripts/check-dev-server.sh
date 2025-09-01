#!/bin/bash

# Check if Next.js dev server is already running on port 3000
check_dev_server() {
    # Try multiple methods to check if port 3000 is in use
    
    # Method 1: Try lsof (may not be available in all environments)
    if command -v lsof >/dev/null 2>&1; then
        if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1; then
            echo "✅ Dev server is already running on port 3000"
            return 0
        fi
    fi
    
    # Method 2: Try netstat
    if command -v netstat >/dev/null 2>&1; then
        if netstat -tln 2>/dev/null | grep -q ':3000 '; then
            echo "✅ Dev server is already running on port 3000"
            return 0
        fi
    fi
    
    # Method 3: Try ss (modern replacement for netstat)
    if command -v ss >/dev/null 2>&1; then
        if ss -tln 2>/dev/null | grep -q ':3000 '; then
            echo "✅ Dev server is already running on port 3000"
            return 0
        fi
    fi
    
    # Method 4: Try to connect to the port
    if curl -s -o /dev/null -w "%{http_code}" --max-time 1 http://localhost:3000 2>/dev/null | grep -q "200\|404\|304"; then
        echo "✅ Dev server is already running on port 3000"
        return 0
    fi
    
    # Method 5: Check if next dev process is running
    if pgrep -f "next dev" >/dev/null 2>&1; then
        echo "⚠️ Next dev process found but port 3000 may not be ready yet"
        return 0
    fi
    
    echo "❌ Dev server is not running on port 3000"
    return 1
}

# Start dev server in background if not running
start_dev_server_if_needed() {
    if ! check_dev_server; then
        echo "Starting dev server in background..."
        nohup pnpm run dev > /dev/null 2>&1 &
        echo "Waiting for server to start..."
        
        # Wait up to 30 seconds for server to start
        for i in {1..30}; do
            sleep 1
            if check_dev_server; then
                echo "✅ Dev server started successfully!"
                return 0
            fi
        done
        
        echo "❌ Failed to start dev server within 30 seconds"
        return 1
    fi
}

# Health check - verify server responds
health_check() {
    if curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 | grep -q "200\|304"; then
        echo "✅ Dev server is healthy and responding"
        return 0
    else
        echo "⚠️ Dev server is running but not responding properly"
        return 1
    fi
}

# Main execution
case "${1:-check}" in
    check)
        check_dev_server
        ;;
    start)
        start_dev_server_if_needed
        ;;
    health)
        check_dev_server && health_check
        ;;
    *)
        echo "Usage: $0 {check|start|health}"
        exit 1
        ;;
esac