// WebSocket 연결
const ws = new WebSocket(`ws://${window.location.host}/ws`);

// 차트 초기화
const ctx = document.getElementById('priceChart').getContext('2d');

let priceChart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: [],
        datasets: [{
            label: 'BTC/USDT',
            data: [],
            borderColor: 'rgb(75, 192, 192)',
            tension: 0.1
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: true,
        scales: {
            y: {
                beginAtZero: false
            }
        },
        plugins: {
            legend: {
                position: 'top',
            }
        },
        interaction: {
            intersect: false,
            mode: 'index'
        }
    }
});

// 현재 선택된 차트
let currentChart = 'btc';

// 차트 선택 기능
const chartSelector = document.getElementById('chartSelector');
chartSelector.addEventListener('change', function() {
    const selectedValue = this.value;
    if (selectedValue === 'btc') {
        currentChart = 'btc';
        priceChart.data.datasets[0].label = 'BTC/USDT';
        priceChart.data.labels = [];
        priceChart.data.datasets[0].data = [];
    } else {
        currentChart = 'eth';
        priceChart.data.datasets[0].label = 'ETH/USDT';
        priceChart.data.labels = [];
        priceChart.data.datasets[0].data = [];
    }
    priceChart.update();
});

// 실시간 데이터 업데이트
ws.onmessage = function(event) {
    const data = JSON.parse(event.data);

    // 비트코인 데이터 업데이트
    document.getElementById('btc-price').textContent = `$${Number(data.btc.price).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
    const btcChange = document.getElementById('btc-change');
    const btcChangeValue = data.btc.change;
    btcChange.textContent = `24h 변동: ${btcChangeValue > 0 ? '+' : ''}${btcChangeValue.toFixed(2)}%`;
    btcChange.className = `change ${btcChangeValue >= 0 ? 'positive-change' : 'negative-change'}`;
    document.getElementById('btc-volume').textContent = `거래량: ${Number(data.btc.volume).toLocaleString('en-US', {maximumFractionDigits: 2})}`;

    // 이더리움 데이터 업데이트
    document.getElementById('eth-price').textContent = `$${Number(data.eth.price).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
    const ethChange = document.getElementById('eth-change');
    const ethChangeValue = data.eth.change;
    ethChange.textContent = `24h 변동: ${ethChangeValue > 0 ? '+' : ''}${ethChangeValue.toFixed(2)}%`;
    ethChange.className = `change ${ethChangeValue >= 0 ? 'positive-change' : 'negative-change'}`;
    document.getElementById('eth-volume').textContent = `거래량: ${Number(data.eth.volume).toLocaleString('en-US', {maximumFractionDigits: 2})}`;

    // 차트 업데이트 (기존 코드)
    if (currentChart === 'btc') {
        priceChart.data.labels.push(new Date().toLocaleTimeString());
        priceChart.data.datasets[0].data.push(data.btc.price);
    } else {
        priceChart.data.labels.push(new Date().toLocaleTimeString());
        priceChart.data.datasets[0].data.push(data.eth.price);
    }
    priceChart.update();
};

// WebSocket 에러 처리
ws.onerror = function(error) {
    console.error('WebSocket 에러:', error);
};ㅊ

ws.onclose = function() {
    console.log('WebSocket 연결 종료');
    // 연결 재시도
    setTimeout(connectWebSocket, 5000);
};

// 초기 WebSocket 연결 시작
connectWebSocket();