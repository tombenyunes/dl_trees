#!/bin/bash

# Remove any images currently in the output directory
if [ ! -d "/scratch/pyxelate/output" ]; then
	mkdir /scratch/pyxelate/output
fi

find /scratch/pyxelate/output/ -maxdepth 1 -type f -delete

# stylize image
python3.7 /scratch/pyxelate/Pyxelate.py