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

// 실시간 데이터 업데이트
function connectWebSocket() {
    const ws = new WebSocket(`ws://${window.location.host}/ws`);

    ws.onmessage = function(event) {
        const data = JSON.parse(event.data);
        
        // 비트코인 데이터 업데이트
        document.querySelector('.col-md-6:first-child .price').textContent = 
            `$${parseFloat(data.btc.price).toFixed(2)}`;
        document.querySelector('.col-md-6:first-child .change').textContent = 
            `24h 변동: ${parseFloat(data.btc.change).toFixed(2)}%`;
        document.querySelector('.col-md-6:first-child p:last-child').textContent = 
            `거래량: ${parseFloat(data.btc.volume).toFixed(2)}`;

        // 이더리움 데이터 업데이트
        document.querySelector('.col-md-6:last-child .price').textContent = 
            `$${parseFloat(data.eth.price).toFixed(2)}`;
        document.querySelector('.col-md-6:last-child .change').textContent = 
            `24h 변동: ${parseFloat(data.eth.change).toFixed(2)}%`;
        document.querySelector('.col-md-6:last-child p:last-child').textContent = 
            `거래량: ${parseFloat(data.eth.volume).toFixed(2)}`;

        // 차트 데이터 업데이트
        const chart = priceChart;
        chart.data.labels.push(new Date().toLocaleTimeString());
        chart.data.datasets[0].data.push(data.btc.price);
        
        // 최대 20개 데이터포인트 유지
        if (chart.data.labels.length > 20) {
            chart.data.labels.shift();
            chart.data.datasets[0].data.shift();
        }
        
        chart.update();
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
}

// 초기 WebSocket 연결 시작
connectWebSocket();