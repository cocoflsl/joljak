# sendToFlask.py

from flask import Flask, render_template, request, jsonify
import base64
from PIL import Image
from io import BytesIO
import requests
import numpy as np
import tensorflow as tf
from tensorflow.keras.models import load_model

app = Flask(__name__)

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/drawing')
def drawing_page():
    return render_template('serviceDrawBoard.html')

@app.route('/analyze', methods=['POST'])
def analyze():
    data = request.form.to_dict()
    identifier = data.get('identifier')

    # 이미지 base64 디코딩
    image_data = data.get('imageData')
    image_data = base64.b64decode(image_data.split(',')[1])
    image = Image.open(BytesIO(image_data))
    image = image.resize((256, 256))

    # 이미지 전처리
    image = np.array(image)
    image = (image - 127.5) / 127.5
    image = np.array([image])

    # 상하의에 따라 모델 불러오기
    if identifier == 'top':
        gen_model = tf.keras.models.load_model('gen_model_3_upwear.h5')
    elif identifier == 'bottom':
        gen_model = tf.keras.models.load_model('gen_model_bottomwear.h5')
    else:
        result = {'error': 'Invalid identifier'}

    # 모델에 입력해 이미지 생성
    generated_image = gen_model.predict(image)
    generated_image = (generated_image + 1) / 2.0
    generated_image = generated_image[0]
    generated_image = (generated_image*255).astype(np.uint8)
    generated_image = Image.fromarray(generated_image)

    # 생성된 이미지를 Base64 문자열로 인코딩
    buffered = BytesIO()
    generated_image.save(buffered, format="PNG")
    encoded_image = base64.b64encode(buffered.getvalue())

    # Bing Visual Search API 호출
    headers = {'Ocp-Apim-Subscription-Key': '84900ec94e08423b9468f053da33eff9', 'Content-Type': 'application/octet-stream'}
    params = {'mkt': 'en-US'}
    response = requests.post(
        "https://api.bing.microsoft.com/v7.0/images/visualsearch",
        headers=headers,
        params=params,
        data=buffered.getvalue()
     )

    # 검색 결과 처리
    search_results = response.json()

    # 결과 페이지로 이동 및 검색 결과 데이터 전달
    return render_template('serviceResult.html', result=result, search_results=search_results)

@app.route('/result', methods=['GET', 'POST'])
def result():
    if request.method == 'POST':
        # 검색 결과를 처리하는 로직 작성
        return "Search results received and processed!"
    else:
        return "Invalid request method for this endpoint."

if __name__ == '__main__':
    app.run(debug=True)
