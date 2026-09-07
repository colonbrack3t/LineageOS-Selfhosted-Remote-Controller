#!/system/bin/sh
#
# Fast remote control server — single persistent process, no forking.
# Port 8081: GET /kc/<keycode> sends any Android keyevent by number.
# The main server.sh on 8080 serves the UI.
#

PORT=8081
VERBOSE=0
[ "$1" = "-v" ] && VERBOSE=1

log() { [ "$VERBOSE" = "1" ] && echo "[$(date)] $1" >&2; }

RESP="/data/local/remote/.resp"
mkdir -p "$RESP"
printf 'HTTP/1.1 200 OK\r\nAccess-Control-Allow-Origin: *\r\nContent-Length: 2\r\nConnection: close\r\n\r\nok' > "$RESP/ok"

echo "Fast keyevent server on port $PORT"

while true; do
    req=$(nc -l -p "$PORT" < "$RESP/ok" 2>/dev/null | head -1)
    [ -z "$req" ] && continue

    path=$(printf '%s' "$req" | cut -d' ' -f2 | tr -d '\r')

    case "$path" in
        /cmd/screenshot)
            /system/bin/screencap -p /data/local/remote/static/screen.png 2>/dev/null
            log "screenshot"
            continue
            ;;
    esac

    kc="${path#/kc/}"

    case "$kc" in
        ''|*[!0-9]*) continue ;;
    esac

    log "kc $kc"
    /system/bin/cmd input keyevent "$kc" >/dev/null 2>&1 &
done
