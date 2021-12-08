@echo off
echo '===begin==='
for /f "tokens=1,2 delims= ," %%a in ('tasklist /m ^| findstr "ffmpeg.exe"') do (
    echo name=%%a, PID = %%b, and will kill it.
    TASKKILL /PID %%a
)
echo "====end===="
pause