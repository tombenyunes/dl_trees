

---  

**Requirements**

- Linux (for now)
- [NodeJS](https://nodejs.org/en/)
- [Docker](https://www.docker.com/)

---

**Instructions**

```.bash
git clone https://gitlab.doc.gold.ac.uk/tbeny001/final_project

cd final_project

git submodule update --init

npm install ./backend/site

sudo docker build --build-arg USER_ID=$UID -t detectron2:v0 .
```

Download the [gan model](https://drive.google.com/file/d/1ZtJD0Rw0W36YV0dr4viDRr-wzQ6B87pd/view?usp=sharing) and the [detectron model](https://drive.google.com/file/d/1OR_9EnyjhWV2QMo8-OHW7fz5BpSPbLFZ/view?usp=sharing) and place both in `./gan/models/` and `./detectron/models/` respectively

```.bash
sudo sh start_docker.sh

# the program has to be quit from another terminal
sudo docker stop deep_learning_trees
```

Visit localhost:8000/

The page reloads when you generate a new image. This can take several seconds.

---