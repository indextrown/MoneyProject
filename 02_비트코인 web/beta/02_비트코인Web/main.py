# main.py
from fastapi import FastAPI
from fastapi.responses import HTMLResponse
import requests
from bs4 import BeautifulSoup

app = FastAPI()

# 비트코인 및 이더리움 가격 가져오기
def get_crypto_prices():
    try:
        btc_response = requests.get('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd')
        eth_response = requests.get('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd')
        
        btc_response.raise_for_status()
        eth_response.raise_for_status()
        
        btc_data = btc_response.json()
        eth_data = eth_response.json()
        
        btc_price = btc_data['bitcoin']['usd']
        eth_price = eth_data['ethereum']['usd']

        return btc_price, eth_price
    except requests.exceptions.RequestException:
        return "API 호출 실패", "API 호출 실패"

# 거래량 정보 가져오기
def get_volume_info():
    try:
        response = requests.get('https://api.coingecko.com/api/v3/global')
        response.raise_for_status()  # 응답이 성공적인지 확인
        data = response.json()
        
        # 'data' 키가 존재하는지 확인
        if 'data' in data and 'total_volume' in data['data']:
            return data['data']['total_volume']
        else:
            return "거래량 정보를 가져올 수 없습니다."
    except requests.exceptions.RequestException:
        return "API 호출 실패"

# 시가총액 가져오기
def get_market_cap():
    response = requests.get('https://api.coingecko.com/api/v3/global')
    data = response.json()
    return data['data']['total_market_cap']

# 암호화폐 뉴스 가져오기
def get_crypto_news():
    url = 'https://cryptopanic.com/'
    response = requests.get(url)
    soup = BeautifulSoup(response.text, 'html5lib')
    news_items = soup.find_all('div', class_='news-item')
    news_list = []
    for item in news_items[:5]:  # 최신 뉴스 5개 가져오기
        title = item.find('h2').text
        link = item.find('a')['href']
        news_list.append({'title': title, 'link': link})
    return news_list

@app.get("/", response_class=HTMLResponse)
async def read_root():
    btc_price, eth_price = get_crypto_prices()
    volume_info = get_volume_info()
    market_cap = get_market_cap()
    news = get_crypto_news()

    news_html = ''.join([f"<li><a href='{item['link']}' target='_blank'>{item['title']}</a></li>" for item in news])

    return f"""
    <html>
        <head>
            <title>CryptoScope</title>
            <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
            <style>
                body {{ font-family: Arial, sans-serif; background-color: #1e1e2f; color: white; }}
                .sidebar {{ width: 220px; float: left; background-color: #2a2a3c; padding: 20px; }}
                .sidebar h2 {{ color: #f0f0f0; }}
                .menu-item {{ padding: 10px; border-radius: 5px; transition: background 0.3s; }}
                .menu-item:hover {{ background-color: #3a3a4c; }}
                .menu-item a {{ color: #1e90ff; text-decoration: none; }}
                .content {{ margin-left: 240px; padding: 20px; }}
                .card {{ background-color: #2a2a3c; border: 1px solid #444; padding: 10px; margin: 10px; border-radius: 5px; }}
                h1, h2 {{ color: #f0f0f0; }}
                a {{ color: #1e90ff; }}
                .chart-container {{ position: relative; height: 40vh; width: 80vw; }}
            </style>
        </head>
        <body>
            <div class="sidebar">
                <h2>메뉴</h2>
                <div class="menu-item"><a href="#chart">실시간 차트</a></div>
                <div class="menu-item"><a href="#volume">거래량 정보</a></div>
                <div class="menu-item"><a href="#market-cap">시가총액</a></div>
                <div class="menu-item"><a href="#price-trend">시가 동향</a></div>
                <div class="menu-item"><a href="#news">암호화폐 뉴스</a></div>
                <div class="menu-item"><a href="#settings">설정</a></div>
            </div>
            <div class="content">
                <h1>비트코인 가격: <span id="btc-price">{btc_price}</span> USD</h1>
                <h1>이더리움 가격: <span id="eth-price">{eth_price}</span> USD</h1>
                <div class="card" id="chart">
                    <h2>실시간 차트</h2>
                    <div class="chart-container">
                        <canvas id="cryptoChart"></canvas>
                    </div>
                </div>
                <div class="card" id="volume">24시간 거래량: {volume_info} USD</div>
                <div class="card" id="market-cap">시가총액: {market_cap} USD</div>
                <div class="card" id="price-trend">시가 동향 내용</div>
                <div class="card" id="news">
                    <h3>암호화폐 뉴스</h3>
                    <ul>{news_html}</ul>
                </div>
                <div class="card" id="settings">설정 내용</div>
            </div>
            <script>
                async function fetchPrices() {{
                    const btcResponse = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd');
                    const ethResponse = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd');
                    const btcData = await btcResponse.json();
                    const ethData = await ethResponse.json();
                    document.getElementById('btc-price').innerText = btcData.bitcoin.usd;
                    document.getElementById('eth-price').innerText = ethData.ethereum.usd;
                }}

                // 5초마다 가격 업데이트
                setInterval(fetchPrices, 5000);
                fetchPrices(); // 페이지 로드 시 즉시 호출
            </script>
        </body>
    </html>
    """