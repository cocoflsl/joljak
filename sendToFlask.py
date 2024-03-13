# sendToFlask.py

from flask import Flask, request

app = Flask(__name__)

# 모델로부터 이미지를 받아오는 함수 (예시)
def get_image_from_model():
    # 이미지를 얻는 코드 작성
    # 이 예시에서는 이미지를 바이너리로 가정
    return b'image_binary_data_here'

# 이미지 데이터를 데이터 URI로 변환하는 함수
def image_to_data_uri(image_data):
    base64_encoded = base64.b64encode(image_data).decode('utf-8')
    data_uri = 'data:image/png;base64,' + base64_encoded
    return data_uri

@app.route('/')
def index():
    # 모델로부터 이미지를 받아옴
    image_data = get_image_from_model()
    # 이미지를 데이터 URI로 변환
    data_uri = image_to_data_uri(image_data)
    # HTML 템플릿 렌더링 시 이미지 데이터 URI 전달
    return render_template('index.html', image_data_uri=data_uri)

if __name__ == '__main__':
    app.run(debug=True)

def search_images(query):
    # 네이버 이미지 검색 API 요청을 위한 설정
    url = "https://openapi.naver.com/v1/search/image"
    headers = {
        "X-Naver-Client-Id": "4Sp15uY4YdnUCuBQsGff",
        "X-Naver-Client-Secret": "NKMcmD5JS0"
    }
    params = {
        "query": query,
        "display": 10,  # 검색 결과 수
        "start": 1,     # 시작 위치
        "sort": "sim"   # 정렬 순서
    }

    # API에 GET 요청을 보내고 응답을 받음
    response = requests.get(url, headers=headers, params=params)

    # 응답을 JSON 형식으로 파싱하여 반환
    return response.json()
