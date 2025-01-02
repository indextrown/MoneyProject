import pyupbit
import pandas as pd
import requests

def get_balance_info(access_key, secret_key):
    # 업비트 객체 생성
    upbit = pyupbit.Upbit(access_key, secret_key)
    
    # 보유 중인 모든 암호화폐의 잔고 및 단가 정보
    my_balances = upbit.get_balances()

    # 업비트에서 지원하는 KRW 마켓 티커 목록 가져오기
    valid_tickers = pyupbit.get_tickers(fiat="KRW")

    print("내 잔고")
    # 보유 현금 조회
    print("현금: ", upbit.get_balance("KRW"), "\n")
    for coin_balance in my_balances:
        # 코인이름(티커)
        ticker = coin_balance['currency']
        market_ticker = f"KRW-{ticker}"
        
        # 해당하는 티커 무시
        # if ticker in ["KRW", "APENFT"]:
        #     continue

        # 업비트에서 지원되지 않는 티커 건너뛰기
        if market_ticker not in valid_tickers:
            # print(f"Unsupported ticker: {market_ticker}")
            continue
        
        # 마켓에서 거래되고 있는 코인 현재가격
        now_price = pyupbit.get_current_price("KRW-" + ticker)
        print(ticker, "보유잔고: ", coin_balance['balance'])
        print("평균매입단가 | 현재마켓거래가: ", coin_balance['avg_buy_price'], "|", now_price)
        
        # 매수평균가
        avg_price = float(coin_balance['avg_buy_price'])
        
        # 수익률 = (현재가격 - 매수평균가) / 매수평균가 * 100.0 
        revenu_rate = (now_price - avg_price) / avg_price * 100.0
        print("수익률: ", revenu_rate, "%") 
        print()
        print()

# RSI지표 수치를 구해준다. 첫번째: 분봉/일봉 정보, 두번째: 기간
# 정해진 숫자기간동안에서 전일대비 상승분의 평균/(전일대비 상승분의 평균+하락분의 평균)
def GetRSI(ohlcv,period):
    ohlcv["close"] = ohlcv["close"]
    delta = ohlcv["close"].diff()
    up, down = delta.copy(), delta.copy()
    up[up < 0] = 0
    down[down > 0] = 0
    _gain = up.ewm(com=(period - 1), min_periods=period).mean()
    _loss = down.abs().ewm(com=(period - 1), min_periods=period).mean()
    RS = _gain / _loss
    return pd.Series(100 - (100 / (1 + RS)), name="RSI")

def send_slack_message(token, channel, text):
    """
    Slack 메시지를 보내는 함수

    Args:
        token (str): Slack API 토큰
        channel (str): 메시지를 보낼 채널 이름 (예: "#srtauto매매")
        text (str): 전송할 메시지 텍스트
    """
    response = requests.post(
        "https://slack.com/api/chat.postMessage",
        headers={"Authorization": "Bearer " + token},
        data={"channel": channel, "text": text}
    )

    if response.status_code == 200:
        print("Slack 메시지 전송 성공")
    else:
        print("Slack 메시지 전송 실패")