#!/bin/bash

export LC_ALL=C.UTF-8
export LANG=C.UTF-8

# Remove any images currently in the output directory
if [ ! -d "/scratch/gan/output" ]; then
	mkdir /scratch/gan/output
fi

find /scratch/gan/output/ -maxdepth 1 -type f -delete

# Generate an image with a random seed to ./gan/output
python3 /scratch/gan/stylegan2-ada-pytorch/generate.py \
    --outdir=/scratch/gan/output \
    --trunc=1 \
	--seeds=`shuf -i 1-10000 -n 1` \
	--network=/scratch/gan/models/network-snapshot-000000.pkl
	# --seeds=1-100 \