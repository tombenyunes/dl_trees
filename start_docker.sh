# start the docker container and run node server

# bash ./gan/docker_run.sh node ./backend/site/index.js;
# bash ./detectron/docker_run.sh node ./backend/site/index.js;
bash ./detectron/docker_run.sh sudo sh /scratch/backend/site/scripts/start_server.sh
# bash ./detectron/docker_run.sh sudo sh /scratch/backend/site/scripts/generate_image.sh
# bash ./detectron/docker_run.sh python3 /scratch/backend/site/scripts/TreeRecognition.py