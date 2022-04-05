import os
import random

os.environ['LC_ALL'] = "C.UTF-8"
os.environ['LANG'] = "C.UTF-8"


def clear_output_dir(output_dir):
  os.makedirs(output_dir, exist_ok=True)

  # remove all images in output directory
  for f in os.listdir(output_dir):
      if not f.endswith(".png"):
          continue
      os.remove(os.path.join(output_dir, f))


output_dir = "/scratch/gan/output/"
seed = random.randint(1, 10000)

clear_output_dir(output_dir)

os.system("python3 /scratch/gan/stylegan2-ada-pytorch/generate.py --outdir={out_dir} --trunc=1 --network=/scratch/gan/models/network-snapshot-000000.pkl --seeds={seed_lb}-{seed_ub}".format(out_dir = output_dir, seed_lb = seed, seed_ub = seed+100))