#!/bin/bash

rm -rf venv
rm -rf __pycache__
python3 -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt