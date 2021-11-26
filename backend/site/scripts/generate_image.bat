

:: Remove any images currently in the output directory
@RD /S /Q "./gan/output"

:: Generate an image with a random seed to ./gan/output
call ./gan/docker_run.bat python3 ./gan/stylegan2-ada-pytorch/generate.py --outdir=./gan/output --trunc=1 --seeds=%random% --network=./gan/models/network-snapshot-000120.pkl
