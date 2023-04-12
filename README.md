## Deep Learning Trees

<img width="226" alt="banner" src="https://user-images.githubusercontent.com/58710165/231551944-aa331fce-f1a6-45bf-acff-95fb3034449f.png">

## Details

Research into using deep learning to create unique assets for digital media.  

I researched the feasibility of using state of the art deep learning techniques to generate stylised 2D assets for games or other digital media. My approach involved three stages of processing: generative adversarial network, object detection/segmentation, and style transfer.  

The generative model was trained on a large personally assembled dataset of images, and outputs photorealistic images. These images are passed through a computer vision model for high precision segmentation masking, which was obtained by optimising pretrained models on a custom dataset of masked images. For the final stage, the resulting images are translated to a pixel-art aesthetic with a consistent colour palette, using an unsupervised ML method. Datasets were variously augmented to increase samples. Training results were systematically collated to optimise hyperparameters. The results are requested and displayed in a full stack NodeJS app, running from a GPU accelerated Docker container. There is real-time control over the stylisation of assets, and they are generated using an efficient batch system.  

Tech used included: Nvidia’s StyleGAN2-ada (implementation); FAIR’s Detectron2 (library), Python, Pyxelate, PyTorch, NumPy, OpenCV, PIL…

## Requirements

- Linux (for now)
- [NodeJS](https://nodejs.org/en/)
- [Docker](https://www.docker.com/)

## Build

```.bash
git clone https://github.com/tombenyunes/final_project

cd final_project

git submodule update --init

npm install ./backend/site

bash build_docker.sh
```

Download the [gan model](https://drive.google.com/file/d/1gDp4UQKOgRNVAyxh3gbo03uVLZx45ysl/view?usp=share_link) and the [detectron model](https://drive.google.com/file/d/1Ltsb6FtjXKpwuMMUZN5-QIdI72yKaqaB/view?usp=share_link) and place both in `./gan/models/` and `./detectron/models/` respectively

```.bash
sudo bash start_docker.sh

# the program has to be quit from another terminal
sudo docker stop gan_trees
```

Visit [localhost:8000](http://localhost:8000)

The page reloads when you generate a new image. This can take several seconds.

## Troubleshooting

- If there's an issue with running the docker container there's a good chance it's due to GPU drivers. Try running `nvidia-smi` and ensure you receive an output. AMD GPUs have not been tested.
