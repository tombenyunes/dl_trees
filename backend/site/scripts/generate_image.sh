#!/bin/bash

bash ./../../../gan/docker_run.sh python3 generate.py --outdir=output --trunc=1 --seeds=76 --network=https://nvlabs-fi-cdn.nvidia.com/stylegan2-ada-pytorch/pretrained/metfaces.pkl
