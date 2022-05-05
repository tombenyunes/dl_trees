FROM nvidia/cuda:11.1.1-cudnn8-devel-ubuntu18.04
# use an older system (18.04) to avoid opencv incompatibility (issue#3524)

# due to nvidia rotating their GPG keys
RUN apt-key adv --fetch-keys https://developer.download.nvidia.com/compute/cuda/repos/ubuntu1804/x86_64/3bf863cc.pub

ENV DEBIAN_FRONTEND noninteractive

RUN apt-get update && apt-get install -y \
	python3-opencv ca-certificates python3-dev git wget sudo ninja-build
RUN ln -sv /usr/bin/python3 /usr/bin/python

# create a non-root user
ARG USER_ID=1000
RUN useradd -m --no-log-init --system  --uid ${USER_ID} appuser -g sudo
RUN echo '%sudo ALL=(ALL) NOPASSWD:ALL' >> /etc/sudoers
USER appuser
WORKDIR /home/appuser

ENV PATH="/home/appuser/.local/bin:${PATH}"
RUN wget https://bootstrap.pypa.io/pip/3.6/get-pip.py && \
	python3 get-pip.py --user && \
	rm get-pip.py

# cmake from apt-get is too old
RUN pip install --user tensorboard cmake
RUN pip install --user torch==1.10 torchvision==0.11.1 -f https://download.pytorch.org/whl/cu111/torch_stable.html

# set FORCE_CUDA because during `docker build` cuda is not accessible
ENV FORCE_CUDA="1"

# This will by default build detectron2 for all common cuda architectures and take a lot more time,
# because inside `docker build`, there is no way to tell which architecture will be used.
ARG TORCH_CUDA_ARCH_LIST="Kepler;Kepler+Tesla;Maxwell;Maxwell+Tegra;Pascal;Volta;Turing"
ENV TORCH_CUDA_ARCH_LIST="${TORCH_CUDA_ARCH_LIST}"

# stops error (debconf: delaying package configuration, since apt-utils is not installed)
# RUN sudo apt-get update && sudo apt-get install -y --no-install-recommends apt-utils

# install nodejs
RUN sudo apt-get update;
RUN sudo apt-get -y install curl
RUN sudo curl -sL https://deb.nodesource.com/setup_17.x
RUN sudo apt-get install -y nodejs;

# FAIR core library - provides essential functionality for detectron2
RUN pip install --user 'git+https://github.com/facebookresearch/fvcore'

# install detectron2 fork
RUN git clone https://github.com/tombenyunes/detectron2
RUN pip install -e ./detectron2/ --upgrade

# scikit-image > v17 requires python 3.7
RUN sudo apt-get install -y python3.7

# reinstall pip3 so it works with python3.7
RUN curl https://bootstrap.pypa.io/get-pip.py -o get-pip.py
RUN python3.7 get-pip.py --force-reinstall

RUN pip3 install numba
RUN pip3 install -U scikit-learn
RUN pip3 install -U scikit-image

RUN pip3 install git+https://github.com/sedthh/pyxelate.git

# Set a fixed model cache directory.
ENV FVCORE_CACHE="/tmp"
WORKDIR /home/appuser/detectron2_repo
