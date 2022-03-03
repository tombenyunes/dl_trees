FROM nvidia/cuda:11.1.1-cudnn8-devel-ubuntu18.04
# use an older system (18.04) to avoid opencv incompatibility (issue#3524)

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

# install dependencies
# See https://pytorch.org/ for other options if you use a different version of CUDA
RUN pip install --user tensorboard cmake   # cmake from apt-get is too old
RUN pip install --user torch==1.10 torchvision==0.11.1 -f https://download.pytorch.org/whl/cu111/torch_stable.html

RUN pip install --user 'git+https://github.com/facebookresearch/fvcore'

# install detectron2 fork
RUN git clone https://github.com/tombenyunes/detectron2
RUN pip install -e ./detectron2/ --upgrade

# set FORCE_CUDA because during `docker build` cuda is not accessible
ENV FORCE_CUDA="1"
# This will by default build detectron2 for all common cuda architectures and take a lot more time,
# because inside `docker build`, there is no way to tell which architecture will be used.
ARG TORCH_CUDA_ARCH_LIST="Kepler;Kepler+Tesla;Maxwell;Maxwell+Tegra;Pascal;Volta;Turing"
ENV TORCH_CUDA_ARCH_LIST="${TORCH_CUDA_ARCH_LIST}"

# install pyxelate
# RUN python3 -m pip install -U pip
# RUN sudo apt install -y python3.8
# RUN pip3 install -U pip
# RUN pip3 install --user --upgrade numpy scipy matplotlib
# RUN pip3 install --user --upgrade scikit-learn
# RUN pip3 install --user --upgrade scikit-image
# RUN pip3 install git+https://github.com/sedthh/pyxelate.git --upgrade
# RUN pip install numba

# RUN sudo apt purge -y python3.6-minimal
# RUN sudo apt-get install -y build-essential libpq-dev libssl-dev openssl libffi-dev zlib1g-dev
# RUN sudo apt-get install -y python3.7-dev
# RUN sudo apt-get install -y python3.7
# RUN ls -ls /usr/bin/python*
RUN python3 --version
RUN whereis python

RUN sudo apt-get install -y python3.7
RUN sudo update-alternatives --install /usr/bin/python3 python3 /usr/bin/python3.6 1
RUN sudo update-alternatives --install /usr/bin/python3 python3 /usr/bin/python3.7 2
RUN sudo update-alternatives --config python3

RUN sudo apt-get install -y python3-pip

RUN sudo apt-get -y install curl
RUN curl https://bootstrap.pypa.io/get-pip.py -o get-pip.py
RUN python3 get-pip.py --force-reinstall

RUN pip install numba
RUN pip install -U scikit-learn
RUN python -m pip install -U scikit-image
# RUN git clone -b v0.18.x https://github.com/scikit-image/scikit-image
# RUN python3 -m pip install -e scikit-image --upgrade

# RUN sudo apt-get install -y python-skimage
# RUN python3 -m pip list | grep sci
RUN pip install git+https://github.com/sedthh/pyxelate.git
# RUN git clone https://github.com/sedthh/pyxelate
# RUN pip install -e ./pyxelate/ --upgrade

# install nodejs
# RUN apt-get update;
# RUN apt-get -y install curl
# RUN curl -sL https://deb.nodesource.com/setup_17.x | bash
# RUN apt-get install -y nodejs;

# Set a fixed model cache directory.
ENV FVCORE_CACHE="/tmp"
WORKDIR /home/appuser/detectron2_repo

# run detectron2 under user "appuser":
# wget http://images.cocodataset.org/val2017/000000439715.jpg -O input.jpg
# python3 demo/demo.py  \
	#--config-file configs/COCO-InstanceSegmentation/mask_rcnn_R_50_FPN_3x.yaml \
	#--input input.jpg --output outputs/ \
	#--opts MODEL.WEIGHTS detectron2://COCO-InstanceSegmentation/mask_rcnn_R_50_FPN_3x/137849600/model_final_f10217.pkl
