echo %Copy base to client\base%
xcopy ..\..\base %HOMEDRIVE%%HOMEPATH%\client\base /E /I /H /Y

echo %Copy assess to client\assess%
xcopy ..\..\assess %HOMEDRIVE%%HOMEPATH%\client\assess /E /I /H /Y

echo %Copy client to client\client%
xcopy ..\..\client %HOMEDRIVE%%HOMEPATH%\client\client /E /I /H /Y



echo %Install python venv%
python3 -m venv  %HOMEDRIVE%%HOMEPATH%\client\venv
call %HOMEDRIVE%%HOMEPATH%\client\venv\Scripts\activate.bat

echo %Update pip and install requirements%
%HOMEDRIVE%%HOMEPATH%\client\venv\Scripts\python.exe -m pip install --upgrade pip
cd ..
pip install -r  requirements_win.txt
cd %HOMEDRIVE%%HOMEPATH%\client