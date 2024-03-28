# sendToFlask.py

from flask import Flask, render_template, request
import json
from PIL import Image
from io import BytesIO
import base64
import numpy as np
import tensorflow as tf
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing.image import load_img

app = Flask(__name__, static_folder='static', static_url_path='/static')

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/intro')
def intro():
    return render_template('serviceIntro.html')

@app.route('/use')
def notice():
    return render_template('serviceUse.html')

@app.route('/drawing')
def drawing_page():
    return render_template('serviceDrawBoard.html')

@app.route('/drawing/popup')
def identifier_call():
    return render_template('idPopUp.html')

@app.route('/drawing/analyze', methods=['POST'])
def analyze():
    data = request.form.to_dict()
    identifier = data.get('identifier')

    # 이미지 로드
    if identifier == 'top':
        image_path = 'C:/Users/jico0/OneDrive/바탕 화면/졸업 프로젝트/테스트 이미지/image_top.png'  # 로컬 이미지 파일 경로
    elif identifier == 'bottom':
        image_path = 'C:/Users/jico0/OneDrive/바탕 화면/졸업 프로젝트/테스트 이미지/image_bottom.png'  # 로컬 이미지 파일 경로
    else :
        image_path = 'C:/Users/jico0/OneDrive/바탕 화면/졸업 프로젝트/테스트 이미지/KakaoTalk_20240329_005631543.png'  # 로컬 이미지 파일 경로
    image = load_img(image_path, target_size=(256, 256))

    # 이미지 전처리
    image = np.array(image)
    image = (image - 127.5) / 127.5
    image = np.array([image])

    # 상하의에 따라 모델 불러오기
    if identifier == 'top':
        gen_model = tf.keras.models.load_model(r'C:/Users/jico0/.vscode/joljak-main/main-branch/models/gen_model_3_upwear.h5')
    elif identifier == 'bottom':
        gen_model = tf.keras.models.load_model(r'C:/Users/jico0/.vscode/joljak-main/main-branch/models/gen_model_bottomwear.h5')
    else:
        return render_template('serviceResult.html', error='Invalid identifier')

    # 모델에 입력해 이미지 생성
    generated_image = gen_model.predict(image)
    generated_image = (generated_image + 1) / 2.0
    generated_image = generated_image[0]
    generated_image = (generated_image * 255).astype(np.uint8)
    generated_image = Image.fromarray(generated_image)

    # 생성된 이미지를 Base64 문자열로 인코딩
    buffered = BytesIO()
    generated_image.save(buffered, format="PNG")
    generated_image_base64 = base64.b64encode(buffered.getvalue()).decode('utf-8')

    return render_template('serviceModelResult.html', generated_image_base64=generated_image_base64)

@app.route('/render')
def model_result():
    return render_template('serviceModelResult.html')

@app.route('/search')
def search_result():
    return render_template('serviceSearchResult.html')

if __name__ == '__main__':
    app.run(debug=True)

@app.route('/previous')
def drawing_page():
    return render_template('previous.html')

@app.route('/login')
def drawing_page():
    return render_template('login.html')

#@app.route('/signup')
#def drawing_page():
    #return render_template('login.html')