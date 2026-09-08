#!/bin/bash
PI="root@192.168.1.147"
KEY="my_private_key"

ssh -i $KEY $PI 'killall nc; sh /data/local/remote/server.sh &'