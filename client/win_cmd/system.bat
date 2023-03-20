rem This file is used to set the environment variables for the client.Save the file imm.bat and place it in the Startup folder. The Startup folder can be accessed by pressing the Windows key + R, then typing "shell:startup" and pressing Enter.
@echo off
setlocal enabledelayedexpansion
set "CMDOUTPUTBUFFER=8192"
set "PYTHONPATH=%PYTHONPATH%;%HOMEDRIVE%%HOMEPATH%\client"
set "PATH=%PATH%;%HOMEDRIVE%%HOMEPATH%\client\client\win_cmd"
setx PYTHONPATH "%PYTHONPATH%" /M


