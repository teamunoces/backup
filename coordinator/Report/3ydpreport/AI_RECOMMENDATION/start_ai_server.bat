@echo off
cd /d "C:\wamp64\www\SYSTEM_VERSION_!\coordinator\Report\3ydpreport\AI_RECOMMENDATION"
set "PYTHONPATH=C:\Users\ELSIE DANUCO\AppData\Roaming\Python\Python313\site-packages;%PYTHONPATH%"
"c:\python313\python.exe" -u "AI.py" >> "ai_server.log" 2>&1
