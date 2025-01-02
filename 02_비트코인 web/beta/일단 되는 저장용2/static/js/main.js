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
        scales: {
            y: {
                beginAtZero: false
            }
        }
    }
});

// 이더리움 차트 초기화
const ethCtx = document.getElementById('ethChart').getContext('2d');
let ethChart = new Chart(ethCtx, {
    type: 'line',
    data: {
        labels: [],
        datasets: [{
            label: 'ETH/USDT',
            data: [],
            borderColor: 'rgb(255, 99, 132)',
            tension: 0.1
        }]
    },
    options: {
        responsive: true,
        scales: {
            y: {
                beginAtZero: false
            }
        }
    }
});

// 실시간 데이터 업데이트
ws.onmessage = function(event) {
    const data = JSON.parse(event.data);
    
    // 비트코인 데이터 업데이트
    document.querySelector('.col-md-6:first-child .price').textContent = data.btc.price;

    // 이더리움 데이터 업데이트
    document.querySelector('.col-md-6:last-child .price').textContent = data.eth.price;

    // 차트 데이터 업데이트
    const currentTime = new Date().toLocaleTimeString(); // 현재 시간
    priceChart.data.labels.push(currentTime);
    priceChart.data.datasets[0].data.push(data.btc.price);
    priceChart.update();

    ethChart.data.labels.push(currentTime);
    ethChart.data.datasets[0].data.push(data.eth.price);
    ethChart.update();
};

// WebSocket 에러 처리
ws.onerror = function(error) {
    console.error('WebSocket 에러:', error);
};

ws.onclose = function() {
    console.log('WebSocket 연결 종료');
    // 연결 재시도
    setTimeout(connectWebSocket, 5000);
};

// 초기 WebSocket 연결 시작
connectWebSocket();