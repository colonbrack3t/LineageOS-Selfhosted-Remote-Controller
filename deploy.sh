#!/bin/bash
PI="root@192.168.1.147"
KEY="my_private_key"
REMOTE="/data/local/remote"

scp -O -i "$KEY" server.sh handler.sh fast-server.sh "$PI:$REMOTE/" && \
scp -O -i "$KEY" static/* "$PI:$REMOTE/static/" && \
echo "Deployed. Restart with: ssh -i $KEY $PI 'killall nc; sh $REMOTE/server.sh &'"
