# To Build (from root):
# sudo docker build --build-arg USER_ID=$UID -t detectron2:v0 ./detectron/

# To Run
docker run \
    --gpus all \
    --rm \
    -v `pwd`:/scratch \
    --shm-size=8gb \
    --env="DISPLAY" \
    --volume="/tmp/.X11-unix:/tmp/.X11-unix:rw" \
    --name=detectron2 detectron2:v0 \
    python3 /scratch/backend/site/scripts/TreeRecognition.py
    # sudo sh /scratch/backend/site/scripts/generate_image.sh
    # -it \
    # node ./backend/site/index.js
    # pip list | grep torch

# docker run --shm-size=2g --gpus all --rm -v `pwd`:/scratch --user $(id -u):$(id -g) \
#         --workdir=/scratch -e HOME=/scratch --network=host $IMAGE $@