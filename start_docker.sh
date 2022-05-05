
# replace config with default config incase corruption
cp -a ./backend/site/config/default_config.json ./backend/site/config/config.json

# start docker container and run start server script
bash ./detectron/docker_run.sh sudo bash /scratch/backend/start_server.sh
