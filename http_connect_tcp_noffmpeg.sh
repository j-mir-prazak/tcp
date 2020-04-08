#!/bin/bash


HOST="localhost";
HTTP_PORT="8000";
PORT_NUM=$(curl -k https://"$HOST":"$HTTP_PORT/stream" -o - 2>/dev/null);

cat - | buffer -s 8192 | socat - openssl:"$HOST":"$PORT_NUM",verify=0
