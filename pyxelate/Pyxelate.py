import os
import numpy as np

from skimage import io
from pyxelate import Pyx, Pal

input_dir = '/scratch/detectron/output/'
output_dir = "/scratch/pyxelate/output/"

os.makedirs(output_dir, exist_ok=True)

images = [os.path.join(root, filename)
          for root, dirs, files in os.walk(input_dir)
          for filename in files
          if filename.lower().endswith('.png')]

image_names = [os.path.join(filename)
          for root, dirs, files in os.walk(input_dir)
          for filename in files
          if filename.lower().endswith('.png')]

image_arr = []
for img in images:
    image_arr.append(io.imread(img))

passed = False

# new_palette = Pyx(factor=7, palette=Pal.from_rgb([[139, 69, 19], [255, 255, 255], [144, 238, 144]]), dither="naive").fit(image_arr[i])
new_palette = Pyx(factor=7, palette=8, dither="naive").fit(io.imread('/scratch/pyxelate/palettes/seed0006.png'))

for i in range(len(image_arr)):
  # new_palette = Pyx(factor=7, palette=8, dither="naive").fit(image_arr[i])

  # if (image_names[i]=='seed0006.png'):
  #   passed = True
  #   new_palette = Pyx(factor=7, palette=8, dither="naive").fit(image_arr[i])

  # if (passed != True):
  #   new_palette = Pyx(factor=7, palette=Pal.from_rgb([[0, 255, 0], [0, 0, 0], [139, 69, 19]]), dither="naive").fit(image_arr[i])

  new_image = new_palette.transform(image_arr[i])
  
  print(image_names[i])
  io.imsave(output_dir + image_names[i], new_image)