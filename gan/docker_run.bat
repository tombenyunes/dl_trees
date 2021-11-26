
:: Run docker and mount the root project dir
:: This is necessary so that the container has access to all the relevant files

docker run --shm-size=2g --gpus all --rm -v %cd%:/scratch --workdir=/scratch -e HOME=/scratch sg2ada:latest %*