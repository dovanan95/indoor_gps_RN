from ctypes import sizeof
import json
from matplotlib.pyplot import switch_backend
import requests
import numpy
from flatten_json import flatten
import pandas as pd
import csv

from torch import le

def js_r(filename: str):
    with open(filename, encoding='utf8') as f_in:
        return json.load(f_in)

filename = "anan6254-default-rtdb-export.json"

acc_collection=[]
gyr_collection=[]
mag_collection=[]
data = js_r(filename)
for e in data["imu"]:
    x= data["imu"][e]
    if("x_acc" in x):
        acc_collection.append(x)
    elif("x_gyr" in x):
        gyr_collection.append(x)
    elif("x_mag" in x):
        mag_collection.append(x)

lenCol = [len(acc_collection), len(gyr_collection), len(mag_collection)]
N = min(lenCol)
data_array = []
for i in range(N):
    timestamp_data = acc_collection[i]["timestamp"]
    data_array.append([timestamp_data, gyr_collection[i]["x_gyr"], gyr_collection[i]["y_gyr"], gyr_collection[i]["z_gyr"], + \
           acc_collection[i]["x_acc"], acc_collection[i]["y_acc"], acc_collection[i]["z_acc"], mag_collection[i]["x_mag"], mag_collection[i]["y_mag"], mag_collection[i]["z_mag"]])
with open('data.csv','w', newline='', encoding='utf-8') as my_csv:
    csv_Writer = csv.writer(my_csv, delimiter=',')
    csv_Writer.writerows(data_array)
    data_array.clear()

