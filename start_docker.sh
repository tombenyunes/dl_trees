# start docker container and run start server script

cp -a ./backend/site/default_config.json ./backend/site/config.json
bash ./detectron/docker_run.sh sudo sh /scratch/backend/site/scripts/start_server.sh