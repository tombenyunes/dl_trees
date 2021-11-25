#!/bin/bash

bash ./../../../gan/docker_run.sh python3 ./gan/stylegan2-ada-pytorch/generate.py --outdir=./gan/output --trunc=1 --seeds=`shuf -i 1-10000 -n 1` --network=https://nvlabs-fi-cdn.nvidia.com/stylegan2-ada-pytorch/pretrained/metfaces.pkl
