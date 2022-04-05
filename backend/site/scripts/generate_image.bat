

:: Remove any images currently in the output directory
cd ./gan
IF NOT EXIST ./output/ mkdir output
cd ./output
:: to avoid deleting all files in incorrect dir
if NOT %errorlevel% == 0 (exit /b 1)
del *.* /Q
cd ../../

:: Generate an image with a random seed to ./gan/output
call ./gan/docker_run.bat python3 ./gan/stylegan2-ada-pytorch/generate.py --outdir=./gan/output --trunc=1 --seeds=%random% --network=./gan/models/network-snapshot-000120.pkl