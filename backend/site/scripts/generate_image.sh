#!/bin/bash

# Remove any images currently in the output directory
sudo rm -d ./gan/output -r

# Generate an image with a random seed to ./gan/output
bash ./gan/docker_run.sh python3 ./gan/stylegan2-ada-pytorch/generate.py --outdir=./gan/output --trunc=1 --seeds=`shuf -i 1-10000 -n 1` --network=./gan/models/network-snapshot-000120.pkl
