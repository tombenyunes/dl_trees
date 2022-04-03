import os
import sys
import json
import numpy as np

from skimage import io
from pyxelate import Pyx, Pal

input_dir = '/scratch/detectron/output/'
output_dir = "/scratch/pyxelate/output/"

os.makedirs(output_dir, exist_ok=True)

# remove all images in output directory
for f in os.listdir(output_dir):
    if not f.endswith(".png"):
        continue
    os.remove(os.path.join(output_dir, f))

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

# passed = False


f = open('/scratch/backend/site/config.json')

data = json.load(f)
r = int(data['resolution'])
print(r)

f.close()


# new_palette = Pyx(factor=7, palette=Pal.from_rgb([[139, 69, 19], [255, 255, 255], [144, 238, 144]]), dither="naive").fit(image_arr[i])
new_palette = Pyx(factor=r, palette=8, dither="naive", depth=1).fit(io.imread('/scratch/pyxelate/palettes/seed0006.png'))    # 0006

# print("resolution: " + sys.argv[1])

# for i in range(len(image_arr)):
# new_palette = Pyx(factor=7, palette=8, dither="naive").fit(image_arr[0])

  # if (image_names[i]=='seed0006.png'):
  #   passed = True
  #   new_palette = Pyx(factor=7, palette=8, dither="naive").fit(image_arr[i])

  # if (passed != True):
  #   new_palette = Pyx(factor=7, palette=Pal.from_rgb([[0, 255, 0], [0, 0, 0], [139, 69, 19]]), dither="naive").fit(image_arr[i])

  # new_image = Pyx(factor=8, palette=Pal.MICROSOFT_WINDOWS_PAINT, dither="none").fit_transform(image_arr[i])
new_image = new_palette.transform(image_arr[0])

print(image_names[0])
io.imsave(output_dir + image_names[0], new_image)
  # io.imsave(output_dir + "tree.png", new_image)