import os
import random

os.environ['LC_ALL'] = "C.UTF-8"
os.environ['LANG'] = "C.UTF-8"


gan_output_dir = "/scratch/gan/output/"
seed = random.randint(1, 10000)


def clear_output_dir(dir):
  os.makedirs(dir, exist_ok=True)
  for f in os.listdir(dir):
      if not f.endswith(".png"):
          continue
      os.remove(os.path.join(dir, f))


clear_output_dir(gan_output_dir)

# generate batch of 100 images from GAN
os.system("python3 /scratch/gan/stylegan2-ada-pytorch/generate.py --outdir={out_dir} --trunc=1 --network=/scratch/gan/models/gan_final.pkl --seeds={seed_lb}-{seed_ub}".format(out_dir = gan_output_dir, seed_lb = seed, seed_ub = seed+100))