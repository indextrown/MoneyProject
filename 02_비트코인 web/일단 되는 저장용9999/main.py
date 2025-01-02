from fastapi import FastAPI, Request, WebSocket
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse
import aiohttp
import json
import asyncio

app = FastAPI()

# 정적 파일과 템플릿 설정
app.mount("/static", StaticFiles(directory="static"), name="static")
templates = Jinja2Templates(directory="templates")

# 코인 가격 API URL
BINANCE_API_URL = "https://api.binance.com/api/v3/ticker/24hr"

# WebSocket 클라이언트 저장
active_connections = []

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    active_connections.append(websocket)
    try:
        while True:
            await asyncio.sleep(1)
            try:
                async with aiohttp.ClientSession() as session:
                    # 비트코인 데이터 가져오기
                    async with session.get(f"{BINANCE_API_URL}?symbol=BTCUSDT") as resp:
                        btc_data = await resp.json()
                    
                    # 이더리움 데이터 가져오기
                    async with session.get(f"{BINANCE_API_URL}?symbol=ETHUSDT") as resp:
                        eth_data = await resp.json()

                    # 데이터 가공
                    data = {
                        'btc': {
                            'price': float(btc_data['lastPrice']),
                            'change': float(btc_data['priceChangePercent']),
                            'volume': float(btc_data['volume'])
                        },
                        'eth': {
                            'price': float(eth_data['lastPrice']),
                            'change': float(eth_data['priceChangePercent']),
                            'volume': float(eth_data['volume'])
                        }
                    }
                    await websocket.send_json(data)
            except Exception as e:
                print(f"Error fetching data: {e}")
                await websocket.close()  # 연결 종료
                break  # 루프 종료
    except Exception as e:
        print(f"WebSocket error: {e}")
    finally:
        active_connections.remove(websocket)

@app.get("/", response_class=HTMLResponse)
async def read_root(request: Request):
    try:
        async with aiohttp.ClientSession() as session:
            # 초기 데이터 로드
            async with session.get(f"{BINANCE_API_URL}?symbol=BTCUSDT") as resp:
                btc_data = await resp.json()
            async with session.get(f"{BINANCE_API_URL}?symbol=ETHUSDT") as resp:
                eth_data = await resp.json()

            formatted_btc = {
                'price': float(btc_data['lastPrice']),
                'change': float(btc_data['priceChangePercent']),
                'volume': float(btc_data['volume'])
            }
            
            formatted_eth = {
                'price': float(eth_data['lastPrice']),
                'change': float(eth_data['priceChangePercent']),
                'volume': float(eth_data['volume'])
            }

        return templates.TemplateResponse("index.html", {
            "request": request,
            "btc_data": formatted_btc,
            "eth_data": formatted_eth
        })
    except Exception as e:
        print(f"Error: {e}")
        default_data = {'price': 0.0, 'change': 0.0, 'volume': 0.0}
        return templates.TemplateResponse("index.html", {
            "request": request,
            "btc_data": default_data,
            "eth_data": default_data
        })