# To Build Image (from project root):
# sudo docker build --build-arg USER_ID=$UID -t detectron2:v0 .

docker run \
    --gpus all \
    --rm \
    -v `pwd`:/scratch \
    --shm-size=8gb \
    --env="DISPLAY" \
    --volume="/tmp/.X11-unix:/tmp/.X11-unix:rw" \
    --network=host \
    --name="gan_trees" gan_trees:v0 \
    $@