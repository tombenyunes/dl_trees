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

from PIL import Image



model_dir = "/scratch/detectron/models/"
inference_input_dir = "/scratch/gan/output/"
detectron_buffer_dir = "/scratch/detectron/buffer/"
detectron_output_dir = "/scratch/detectron/output/"

os.makedirs(detectron_buffer_dir, exist_ok=True)
os.makedirs(detectron_output_dir, exist_ok=True)



def clear_dir(dir):
  os.makedirs(dir, exist_ok=True)
  for f in os.listdir(dir):
      if not f.endswith(".png"):
          continue
      os.remove(os.path.join(dir, f))



def load_predictor():
  cfg = get_cfg()
  cfg.merge_from_file(model_zoo.get_config_file("COCO-InstanceSegmentation/mask_rcnn_R_50_FPN_3x.yaml"))
  cfg.DATASETS.TRAIN = ("category_train",)
  cfg.DATASETS.TEST = ()
  cfg.DATALOADER.NUM_WORKERS = 2
  cfg.MODEL.WEIGHTS = model_zoo.get_checkpoint_url("COCO-InstanceSegmentation/mask_rcnn_R_50_FPN_3x.yaml")
  cfg.SOLVER.IMS_PER_BATCH = 2
  cfg.SOLVER.BASE_LR = 0.00025
  cfg.SOLVER.MAX_ITER = 1000
  cfg.MODEL.ROI_HEADS.NUM_CLASSES = 1 # only trees
  cfg.OUTPUT_DIR = model_dir
  cfg.MODEL.WEIGHTS = os.path.join(cfg.OUTPUT_DIR, "detectron_final.pth") # model name
  cfg.MODEL.ROI_HEADS.SCORE_THRESH_TEST = 0.5 # cutoff point for detection
  cfg.DATASETS.TEST = ("category_test", )

  return DefaultPredictor(cfg)



def detect_trees_and_omitt_background_pixels():
  for img in os.listdir(inference_input_dir):
    image_name = img
    img = cv2.imread(os.path.join(inference_input_dir, img))

    # attempt to detect trees and draw segmentation mask around
    outputs = predictor(img)
    v = Visualizer(img[:, :, ::-1], scale=1.0, instance_mode=ColorMode.IMAGE_BW)

    # only draw pixels within the segmentation mask
    v2 = v.draw_masked_area(outputs["instances"].to("cpu"), True)

    # if a tree is detected
    if (v.get_image_score().size() != torch.Size([0])):
      img = v2.get_image()

      for score in v.get_image_score():
        name = str(score.item())
        cv2.imwrite(detectron_buffer_dir + image_name[:-4] + ".png", img) # same name - convert to png
    else:
      v2 = v.draw_instance_predictions(outputs["instances"].to("cpu"))
      img = v2.get_image()



def replace_white_pixels_with_transparency():
  for img in os.listdir(detectron_buffer_dir):
    image_name = img
    img = Image.open(os.path.join(detectron_buffer_dir, img))
    rgba = img.convert("RGBA")
    datas = rgba.getdata()

    # if pixel is white give it an alpha value of 0
    newData = []
    for item in datas:
        if item[0] == 255 and item[1] == 255 and item[2] == 255:
            newData.append((255, 255, 255, 0))
        else:
            newData.append(item)
      
    rgba.putdata(newData)
    rgba.save(detectron_output_dir + image_name[:-4] + ".png")





clear_dir(detectron_buffer_dir)

predictor = load_predictor()

detect_trees_and_omitt_background_pixels()
replace_white_pixels_with_transparency()