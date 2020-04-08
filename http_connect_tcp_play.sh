#!/bin/bash

HOST="localhost";
HTTP_PORT="8000";
PORT_NUM=$(curl -k https://"$HOST":"$HTTP_PORT/play?9999" -o - 2>/dev/null);

ffmpeg -i tcp://"$HOST":"$PORT_NUM" -c copy -f matroska -
