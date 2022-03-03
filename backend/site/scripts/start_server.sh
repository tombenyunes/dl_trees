# install nodejs and start server

apt-get update;
apt-get -y install curl
curl -sL https://deb.nodesource.com/setup_17.x | bash
apt-get install -y nodejs;
node /scratch/backend/site/index.js;