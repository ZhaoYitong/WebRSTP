#!/bin/bash
echo "restart..."
pid=`ps -ef | grep ffmpeg | awk '{print $2}'`
for i in $pid
do
   echo "Kill the ffmpeg process [ $i ]"
   kill -9 $i
done
echo "kill pid finish..."
