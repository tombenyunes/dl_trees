#!/bin/bash

bash /home/jonah/dev/stylegan2-ada-pytorch/docker_run.sh python3 /scratch/stylegan2-ada-pytorch/generate.py --outdir=out --trunc=1 --seeds=69 --network=https://nvlabs-fi-cdn.nvidia.com/stylegan2-ada-pytorch/pretrained/metfaces.pkl
