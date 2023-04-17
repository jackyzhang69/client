# make client app by copying Makefile, base and client directories in imm to client
copy_client:
	cp "${HOME}/imm/client/Makefile" ~/client
	cp -rf "${HOME}/imm/base" ~/client/base
	cp -rf "${HOME}/imm/client" ~/client/client
	cp -rf "${HOME}/imm/assess" ~/client/assess
	cp -rf "${HOME}/imm/frontend" ~/client/frontend

# build client app
build_client:
	python3 -m venv ~/client/venv
	source ~/client/venv/bin/activate
	pip install --upgrade pip
	pip install -r ~/client/client/requirements.txt
	

copy_bcpnp:
	rm -rf ~/client/frontend/formfilling/bcpnp
	cp -Rf "${HOME}/imm/frontend/formfilling/bcpnp" ~/client/frontend/formfilling/bcpnp

copy_lmia:
	rm -rf ~/client/frontend/formfilling/lmia
	cp -Rf "${HOME}/imm/frontend/formfilling/lmia" ~/client/frontend/formfilling/lmia

copy_pr:
	rm -rf ~/client/frontend/formfilling/pr
	cp -Rf "${HOME}/imm/frontend/formfilling/pr" ~/client/frontend/formfilling/pr


