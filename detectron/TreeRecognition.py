import os
import math
import numpy as np
import json
import random

import torch
import torchvision
import cv2

from detectron2.structures import BoxMode
from detectron2.data import DatasetCatalog, MetadataCatalog

from detectron2 import model_zoo
from detectron2.engine import DefaultTrainer, DefaultPredictor
from detectron2.config import get_cfg
from detectron2.utils.visualizer import ColorMode, Visualizer

import detectron2
from detectron2.utils.logger import setup_logger
setup_logger()

from detectron2.data import MetadataCatalog, DatasetCatalog



train = False
train_data_path = "/content/drive/MyDrive/_datasets/_masks/" + "acacia" + "/"
train_model_dir = "/content/drive/MyDrive/_models/_detectron/" + "acacia" + "/"

saved_model_dir = "/scratch/models/"



def get_data_dicts(directory, classes):
    dataset_dicts = []

    for filename in [file for file in os.listdir(directory) if file.endswith('.json')]:
        json_file = os.path.join(directory, filename)
        with open(json_file) as f:
            img_anns = json.load(f)

        record = {}
        
        filename = os.path.join(directory, img_anns["imagePath"])
        height, width = cv2.imread(filename).shape[:2]
        
        record["file_name"] = filename
        record["height"] = height
        record["width"] = width
      
        annos = img_anns["shapes"]
        objs = []
        
        for anno in annos:
            px = [a[0] for a in anno['points']] # x coord
            py = [a[1] for a in anno['points']] # y-coord
            poly = [(x, y) for x, y in zip(px, py)] # poly for segmentation
            poly = [p for x in poly for p in x]

            obj = {
                "bbox": [np.min(px), np.min(py), np.max(px), np.max(py)],
                "bbox_mode": BoxMode.XYXY_ABS,
                "segmentation": [poly],
                "category_id": classes.index(anno['label']),
                "iscrowd": 0
            }
            objs.append(obj)
            
        record["annotations"] = objs
        dataset_dicts.append(record)

    return dataset_dicts



DatasetCatalog.clear() # incase dataset is already registered

classes = ['tree']

data_path = train_data_path

DatasetCatalog.register(
    "category_train", 
    lambda: get_data_dicts(data_path, classes)
)
MetadataCatalog.get("category_train").set(thing_classes=classes)

microcontroller_metadata = MetadataCatalog.get("category_train")



cfg = get_cfg()
cfg.merge_from_file(model_zoo.get_config_file("COCO-InstanceSegmentation/mask_rcnn_R_50_FPN_3x.yaml"))
cfg.DATASETS.TRAIN = ("category_train",)
cfg.DATASETS.TEST = ()
cfg.DATALOADER.NUM_WORKERS = 2
cfg.MODEL.WEIGHTS = model_zoo.get_checkpoint_url("COCO-InstanceSegmentation/mask_rcnn_R_50_FPN_3x.yaml")
cfg.SOLVER.IMS_PER_BATCH = 2
cfg.SOLVER.BASE_LR = 0.00025
cfg.SOLVER.MAX_ITER = 1000
cfg.MODEL.ROI_HEADS.NUM_CLASSES = 1

if (train):
  cfg.OUTPUT_DIR = train_model_dir
  os.makedirs(cfg.OUTPUT_DIR, exist_ok=True)
  
  trainer = DefaultTrainer(cfg) 
  trainer.resume_or_load(resume=False)
  trainer.train()

else:
  cfg.OUTPUT_DIR = saved_model_dir

cfg.MODEL.WEIGHTS = os.path.join(cfg.OUTPUT_DIR, "model_final.pth")
cfg.MODEL.ROI_HEADS.SCORE_THRESH_TEST = 0.5
cfg.DATASETS.TEST = ("category_test", )

predictor = DefaultPredictor(cfg)







inference_input_dir = "/scratch/gan/output/"
inference_output_dir = "/scratch/detectron/buffer/"

os.makedirs(inference_output_dir, exist_ok=True)

# img = cv2.imread("/content/drive/MyDrive/masks/test_images/8.jpg")
# cv2_imshow(img)    # raw image

for img in os.listdir(inference_input_dir):
  image_name = img
  print(image_name[:-4])
  img = cv2.imread(os.path.join(inference_input_dir, img))

  outputs = predictor(img)

  v = Visualizer(img[:, :, ::-1],
                  metadata=microcontroller_metadata, 
                  scale=1.0, 
                  instance_mode=ColorMode.IMAGE_BW
  )

  # v2 = v.draw_instance_predictions(outputs["instances"].to("cpu"))
  v2 = v.draw_masked_area(outputs["instances"].to("cpu"), True)

  # assert v.get_image_score().size() != torch.Size([0])    # tree must be detected

  if (v.get_image_score().size() != torch.Size([0])):

    img = v2.get_image()
    # cv2_imshow(img)    # detected image

    if (v.get_image_boxes().tensor.size(0) != 0):

      y1 = int(v.get_image_boxes().tensor[0][1])
      y2 = int(v.get_image_boxes().tensor[0][3])
      x1 = int(v.get_image_boxes().tensor[0][0])
      x2 = int(v.get_image_boxes().tensor[0][2])

      img = img[y1:y2, x1:x2, ::-1]

    # cv2_imshow(img)    # cropped image

    xsize = img.shape[1]
    ysize = img.shape[0]
    if (xsize != ysize):
      lsize = max(xsize, ysize)
      if (xsize == lsize):
        tbuff = int(math.ceil((xsize - ysize) / 2))
        bbuff = int(math.floor((xsize - ysize) / 2))
        lbuff = 0
        rbuff = 0
      elif (ysize == lsize):
        tbuff = 0
        bbuff = 0
        lbuff = int(math.ceil((ysize - xsize) / 2))
        rbuff = int(math.floor((ysize - xsize) / 2))
    else:
      print("already square")
      tbuff = 0
      bbuff = 0
      lbuff = 0
      rbuff = 0

    img = cv2.copyMakeBorder(
        img,
        top = tbuff,
        bottom = bbuff,
        left = lbuff,
        right = rbuff,
        borderType = cv2.BORDER_CONSTANT,
        value = (255, 255, 255)
    )

    # cv2_imshow(img)

    assert img.shape[0] == img.shape[1] # img must be square

    for score in v.get_image_score():
      name = str(score.item())
      # cv2.imwrite(inference_output_dir + name[2:6] + ".jpg", img)    # named after accuracy
      # cv2.imwrite(inference_output_dir + image_name, img)    # same name
      cv2.imwrite(inference_output_dir + image_name[:-4] + ".png", img)    # same name - convert to png
  else:
    print("no tree found")
    v2 = v.draw_instance_predictions(outputs["instances"].to("cpu"))
    img = v2.get_image()
    # cv2_imshow(img)





from PIL import Image

input_dir = "/scratch/detectron/buffer/"
output_dir = "/scratch/detectron/output/"

os.makedirs(output_dir, exist_ok=True)

for img in os.listdir(input_dir):
  image_name = img
  print(image_name[:-4])
  # img = cv2.imread(os.path.join(input_dir, img))
  img = Image.open(os.path.join(input_dir, img))
  # img = Image.open('reals.png')
  rgba = img.convert("RGBA")
  datas = rgba.getdata()
    
  newData = []
  for item in datas:
      if item[0] == 255 and item[1] == 255 and item[2] == 255:
          newData.append((255, 255, 255, 0))
          # newData.append((255, 0, 0))
      else:
          newData.append(item)
    
  rgba.putdata(newData)
  rgba.save(output_dir + image_name[:-4] + ".png")