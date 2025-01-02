// WebSocket 연결 함수
function connectWebSocket() {
    const ws = new WebSocket(`ws://${window.location.host}/ws`);

    ws.onopen = function() {
        console.log("WebSocket 연결 성공");
    };

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
        const btcChart = btcChart;
        btcChart.data.labels.push(new Date().toLocaleTimeString());
        btcChart.data.datasets[0].data.push(data.btc.price);
        
        // 최대 20개 데이터포인트 유지
        if (btcChart.data.labels.length > 20) {
            btcChart.data.labels.shift();
            btcChart.data.datasets[0].data.shift();
        }
        
        // 이더리움 차트 데이터 업데이트
        const ethChart = ethChart;
        ethChart.data.labels.push(new Date().toLocaleTimeString());
        ethChart.data.datasets[0].data.push(data.eth.price);
        
        // 최대 20개 데이터포인트 유지
        if (ethChart.data.labels.length > 20) {
            ethChart.data.labels.shift();
            ethChart.data.datasets[0].data.shift();
        }
        
        // 차트 업데이트
        btcChart.update();
        ethChart.update();
    };

    ws.onclose = function(event) {
        console.error("WebSocket 연결 종료:", event);
        // 재연결 시도
        setTimeout(connectWebSocket, 5000); // 5초 후 재연결
    };

    ws.onerror = function(error) {
        console.error("WebSocket 오류:", error);
    };
}

// 초기 WebSocket 연결
connectWebSocket();

// 차트 초기화
const ctxBtc = document.getElementById('btcChart').getContext('2d');
let btcChart = new Chart(ctxBtc, {
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

const ctxEth = document.getElementById('ethChart').getContext('2d');
let ethChart = new Chart(ctxEth, {
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