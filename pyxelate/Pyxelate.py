import os
import shutil
import sys
import json
import numpy as np

from skimage import io
from pyxelate import Pyx, Pal


input_dir = "/scratch/detectron/output/"
output_dir = "/scratch/pyxelate/output/"

config_file_path = '/scratch/backend/site/config/config.json'

green_palette_path = '/scratch/pyxelate/palettes/seed0006.png'
orange_palette_path = '/scratch/pyxelate/palettes/seed0852.png'


def process_config(generating):
  f = open(config_file_path)
  read_data = json.load(f)

  global config_resolution
  config_resolution = int(read_data['resolution'])
  global config_same_seed
  config_same_seed = read_data['same_seed']
  global config_stylize
  config_stylize = read_data['stylize']
  global config_tailored_palette
  config_tailored_palette = read_data['tailored_palette']

  read_data['generating'] = generating
  read_data['resolution'] = read_data['resolution']
  read_data['same_seed'] = read_data['same_seed']
  read_data['stylize'] = read_data['stylize']

  f.close()

  serialized_data = json.dumps(read_data)

  with open(config_file_path, "w") as outfile:
    outfile.write(serialized_data)

def clear_output_dir(output_dir):
  os.makedirs(output_dir, exist_ok=True)

  # remove all images in output directory
  for f in os.listdir(output_dir):
      if not f.endswith(".png"):
          continue
      os.remove(os.path.join(output_dir, f))


def read_input_images(input_dir):
  # create array of images and image names in input dir
  images = [os.path.join(root, filename)
            for root, dirs, files in os.walk(input_dir)
            for filename in sorted(files)
            if filename.lower().endswith('.png')]

  image_names = [os.path.join(filename)
            for root, dirs, files in os.walk(input_dir)
            for filename in sorted(files)
            if filename.lower().endswith('.png')]

  image_arr = []
  for img in images:
      image_arr.append(io.imread(img))
  
  global input_image_arr
  global input_image_names

  input_image_arr = image_arr
  input_image_names = image_names


def stylize(image_index):
  if (config_tailored_palette == False):
    new_palette = Pyx(factor=config_resolution, palette=8, dither="naive", depth=1).fit(io.imread(green_palette_path))
  else:
    new_palette = Pyx(factor=config_resolution, palette=8, dither="naive").fit(input_image_arr[image_index])


  # if there is an image available to be stylized
  if (len(input_image_arr) > 0):
    new_image = new_palette.transform(input_image_arr[image_index])

    clear_output_dir(output_dir)
    io.imsave(output_dir + input_image_names[image_index], new_image)
  else:
    print("Image buffer appears to be empty. Please reload shortly, or restart the server.")


def copy_unstylized_image():
  clear_output_dir(output_dir)

  src = os.path.join(input_dir, input_image_names[image_index])
  dest = os.path.join(output_dir, input_image_names[image_index])
  shutil.copy(src, dest)



process_config(True)
read_input_images(input_dir)

image_index = 0 if config_same_seed == True else 1

if (config_stylize == True):
  stylize(image_index)
else:
  copy_unstylized_image()

process_config(False)