# make client app by copying Makefile, base and client directories in imm to client
copy_client:
	cp "${HOME}/imm/client/Makefile" ~/client
	cp -r "${HOME}/imm/base" ~/client/base
	cp -r "${HOME}/imm/client" ~/client/client
	cp -r "${HOME}/imm/assess" ~/client/assess
	cp -r "${HOME}/imm/frontend" ~/client/frontend

# build client app
build_client:
	python3 -m venv ~/client/venv
	source ~/client/venv/bin/activate
	pip install --upgrade pip
	pip install -r ~/client/client/requirements.txt
	



