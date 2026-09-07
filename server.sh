#!/system/bin/sh
#
# Remote control server for LineageOS using only toybox nc.
# No Python, no Java, no Termux — just shell.
#

PORT=8080
STATIC="/data/local/remote/static"
export REMOTE_VERBOSE=0

if [ "$1" = "-v" ]; then
    export REMOTE_VERBOSE=1
fi

echo "Remote control server starting on port $PORT"
echo "Serving static files from $STATIC"

# Start fast keyevent server in background (port 8081, no forking)
sh /data/local/remote/fast-server.sh $@ &
echo "Fast keyevent server started on port 8081"

nc -L -p "$PORT" /data/local/remote/handler.sh
