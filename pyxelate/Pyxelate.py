import os
import sys
import json
import numpy as np

from skimage import io
from pyxelate import Pyx, Pal


print("Stylizing Tree")

config_resolution = 4 # fallback resolution value
input_dir = "/scratch/detectron/output/"
output_dir = "/scratch/pyxelate/output/"


def process_config(generating):
  f = open('/scratch/backend/site/config.json')
  read_data = json.load(f)

  config_resolution = int(read_data['resolution'])
  read_data['generating'] = generating

  f.close()

  serialized_data = json.dumps(read_data)

  with open('/scratch/backend/site/config.json', "w") as outfile:
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


process_config(True)
read_input_images(input_dir)


# passed = False



# new_palette = Pyx(factor=7, palette=Pal.from_rgb([[139, 69, 19], [255, 255, 255], [144, 238, 144]]), dither="naive").fit(input_image_arr[i])
new_palette = Pyx(factor=config_resolution, palette=8, dither="naive", depth=1).fit(io.imread('/scratch/pyxelate/palettes/seed0006.png'))    # 0006

# print("resolution: " + sys.argv[1])

# for i in range(len(input_image_arr)):
# new_palette = Pyx(factor=7, palette=8, dither="naive").fit(input_image_arr[0])

  # if (input_image_names[i]=='seed0006.png'):
  #   passed = True
  #   new_palette = Pyx(factor=7, palette=8, dither="naive").fit(input_image_arr[i])

  # if (passed != True):
  #   new_palette = Pyx(factor=7, palette=Pal.from_rgb([[0, 255, 0], [0, 0, 0], [139, 69, 19]]), dither="naive").fit(input_image_arr[i])

  # new_image = Pyx(factor=8, palette=Pal.MICROSOFT_WINDOWS_PAINT, dither="none").fit_transform(input_image_arr[i])


new_image = new_palette.transform(input_image_arr[0])


# print(input_image_names[0])
clear_output_dir(output_dir)
io.imsave(output_dir + input_image_names[0], new_image)
  # io.imsave(output_dir + "tree.png", new_image)



process_config(False)