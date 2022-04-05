#!/bin/bash

export OPENCV_OPENCL_RUNTIME=999

# Remove any images currently in the output directory
if [ ! -d "/scratch/detectron/output" ]; then
	mkdir /scratch/detectron/output
fi

find /scratch/detectron/buffer/ -maxdepth 1 -type f -delete

# detect tree
python3 /scratch/detectron/TreeRecognition.py