# To Build Image (from project root):
# sudo docker build --build-arg USER_ID=$UID -t detectron2:v0 .

echo "Docker Container Started. To exit, use the following command: 'sudo docker stop deep_learning_trees' from another terminal"

docker run \
    --gpus all \
    --rm \
    -v `pwd`:/scratch \
    --shm-size=8gb \
    --env="DISPLAY" \
    --volume="/tmp/.X11-unix:/tmp/.X11-unix:rw" \
    --network=host \
    --name="deep_learning_trees" detectron2:v0 \
    $@