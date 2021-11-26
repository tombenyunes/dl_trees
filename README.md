
**Project Structure**

[/GAN](https://gitlab.doc.gold.ac.uk/tbeny001/final_project/-/tree/main/gan)

- Contains:

	- Pickle files (./models)

	- A submodule of stylegan2-ada-pytorch

	- Notebook for training StyleGAN (used with Google Colab)

	- Images generated by StyleGAN (./output)

	- Shell and batch scripts for running docker containers

[/Backend](https://gitlab.doc.gold.ac.uk/tbeny001/final_project/-/tree/main/backend)

- A Node API that exposes functionality to generated randomly seeded images.

- Requests:

	- /api

---  

**Requirements**

- [NodeJS](https://nodejs.org/en/)
- [Docker](https://www.docker.com/)
- [WSL2](https://docs.docker.com/desktop/windows/wsl/) (if on windows)

---

**Instructions**

```
git clone https://gitlab.doc.gold.ac.uk/tbeny001/final_project

cd final_project

git submodule update --init

sudo docker build --tag sg2ada:latest ./gan/stylegan2-ada-pytorch (remove sudo on windows)

npm install ./backend/site

# Download model from https://drive.google.com/file/d/1wEthBUvAKimz8A-0H-awBWvjjzh_ln0b/view?usp=sharing and place in ./gan/models

# Must be called from project root
node ./backend/site/index.js

# Visit localhost:8000/api and refresh for a new image
# Please note the first load will take a little while. Avoid refreshing the page while loading
```

---