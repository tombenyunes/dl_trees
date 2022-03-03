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
    --network=host \
    --name=detectron2 detectron2:v0 \
    $@