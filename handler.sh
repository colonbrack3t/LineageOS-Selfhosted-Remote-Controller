#!/system/bin/sh
#
# Static file handler — spawned by nc for each connection.
# stdin/stdout are the client socket.
#

STATIC="/data/local/remote/static"

log() { [ "$REMOTE_VERBOSE" = "1" ] && echo "[$(date)] $1" >&2; }

read -r method path version
path=$(printf '%s' "$path" | tr -d '\r')
path="${path%%\?*}"

# Consume headers
while IFS= read -r header; do
    [ -z "$(printf '%s' "$header" | tr -d '\r')" ] && break
done

log "$method $path"

[ "$path" = "/" ] && path="/index.html"

case "$path" in
    /cmd/mutestate)
        muted=$(/system/bin/cmd audio is-stream-mute 3 2>/dev/null)
        if printf '%s' "$muted" | grep -q "true"; then
            body='{"muted":true}'
        else
            body='{"muted":false}'
        fi
        len=$(printf '%s' "$body" | wc -c)
        printf "HTTP/1.1 200 OK\r\nContent-Type: application/json\r\nContent-Length: %d\r\nConnection: close\r\n\r\n%s" \
            "$len" "$body"
        exit 0
        ;;
    *..*) printf 'HTTP/1.1 403 Forbidden\r\nConnection: close\r\n\r\n';;
    *)
        file="${STATIC}${path}"
        if [ ! -f "$file" ]; then
            printf 'HTTP/1.1 404 Not Found\r\nConnection: close\r\n\r\n'
            exit 0
        fi
        case "$file" in
            *.html) mime="text/html";;
            *.css)  mime="text/css";;
            *.js)   mime="application/javascript";;
            *.png)  mime="image/png";;
            *)      mime="application/octet-stream";;
        esac
        size=$(wc -c < "$file")
        printf "HTTP/1.1 200 OK\r\nContent-Type: %s\r\nContent-Length: %d\r\nConnection: close\r\n\r\n" \
            "$mime" "$size"
        cat "$file"
        ;;
esac
