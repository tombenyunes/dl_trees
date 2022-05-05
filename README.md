
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

bash build_docker.sh
```

Download the [gan model](https://drive.google.com/file/d/1ZtJD0Rw0W36YV0dr4viDRr-wzQ6B87pd/view?usp=sharing) and the [detectron model](https://drive.google.com/file/d/1OR_9EnyjhWV2QMo8-OHW7fz5BpSPbLFZ/view?usp=sharing) and place both in `./gan/models/` and `./detectron/models/` respectively

```.bash
sudo bash start_docker.sh

# the program has to be quit from another terminal
sudo docker stop gan_trees
```

Visit [localhost:8000](http://localhost:8000)

The page reloads when you generate a new image. This can take several seconds.

---

**Troubleshooting**

- If there's an issue with running the docker container there's a good chance it's due to GPU drivers. Try running `nvidia-smi` and ensure you receive an output. AMD GPUs have not been tested.

---