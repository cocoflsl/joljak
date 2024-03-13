from flask import Flask, render_template, request

app = Flask(__name__)

@app.route('/search', methods=['GET'])
def search():
    # 검색어를 URL 파라미터로 받아옴
    query = request.args.get('query')

    # 이미지 검색 API에 검색어를 전달하여 검색
    search_results = search_images(query)

    # 검색 결과를 처리하고 HTML 템플릿으로 전달하여 렌더링
    return render_template('search_results.html', results=search_results)

if __name__ == '__main__':
    app.run(debug=True)
