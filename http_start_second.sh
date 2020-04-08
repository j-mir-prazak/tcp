#!/bin/bash


HOST="localhost";
HTTP_PORT="8000";
PORT_NUM=$(curl -k https://"$HOST":"$HTTP_PORT/second?9999" -o - 2>/dev/null);
