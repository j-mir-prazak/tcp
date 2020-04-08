#!/usr/bin/env python

import socket;
import os;



TCP_IP = '127.0.0.1'
TCP_PORT = 5005
BUFFER_SIZE = 4096  # Normally 1024, but we want fast response

s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)



conn=0
pipe_name = 'pipe_test'
pipeout = os.open(pipe_name, os.O_WRONLY)


s.bind((TCP_IP, TCP_PORT))
s.listen(1)



conn, addr = s.accept()
print 'Connection address:', addr
while 1:
    
    data = conn.recv(BUFFER_SIZE)
    if not data: break
    #print data
    os.write(pipeout, data)



    #conn.send(data)  # echo
conn.close()
