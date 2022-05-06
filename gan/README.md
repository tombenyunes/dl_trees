**GAN**

Handles the generation of images from StyleGAN2-ada-pytorch. The model checkpoint is stored in ./models/. The generated images are stored in ./output/. The output directory is cleared in between batches and never contains >100 images. StyleGAN is stored here as a submodule for easy access. 