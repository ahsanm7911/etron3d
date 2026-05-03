import json
import os
import requests
from dotenv import load_dotenv
from pprint import pprint
import base64

load_dotenv()


api_key = os.getenv("AISTUDIO_API_KEY")
base_url = "https://api.3daistudio.com/"
task_id = "dc94cbca-f16a-4319-b52c-c88a750b25e5"
headers = {"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"}


def setup():
    ep = "account/user/wallet/"
    url = base_url + ep

    res = requests.get(url, headers=headers)
    if res.status_code == 200:
        return res.json()
    res.raise_for_status()


def request_generation_by_prompt(prompt):
    ep = "v1/3d-models/tencent/generate/rapid/"
    url = base_url + ep
    data = {"prompt": prompt, "enable_pbr": True}
    res = requests.post(url, headers=headers, json=data)
    if res.status_code == 200:
        return res.json()
    res.raise_for_status()


def request_generation_by_image(image):
    ep = "v1/3d-models/tencent/generate/rapid/"
    url = base_url + ep
    data = {"image": image, "enable_pbr": False, "enable_geometry": True}
    res = requests.post(url, headers=headers, json=data)
    if res.status_code == 200:
        return res.json()
    res.raise_for_status()


def check_status(task_id):
    ep = f"v1/generation-request/{task_id}/status/"
    url = base_url + ep
    res = requests.get(url, headers=headers)
    if res.status_code == 200:
        return res.json()
    res.raise_for_status()


if __name__ == "__main__":
    data = check_status(task_id)
    pprint(data)
