// WebSocket 연결 함수 정의
function connectWebSocket() {
    const ws = new WebSocket(`ws://${window.location.host}/ws`);

    ws.onopen = function() {
        console.log('WebSocket 연결 성공');
    };

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

        // 차트 업데이트
        if (currentChart === 'btc') {
            priceChart.data.labels.push(new Date().toLocaleTimeString());
            priceChart.data.datasets[0].data.push(data.btc.price);
        } else {
            priceChart.data.labels.push(new Date().toLocaleTimeString());
            priceChart.data.datasets[0].data.push(data.eth.price);
        }
        priceChart.update();
    };

    ws.onerror = function(error) {
        console.error('WebSocket 에러:', error);
    };

    ws.onclose = function() {
        console.log('WebSocket 연결 종료');
    };
}

// WebSocket 연결 호출
connectWebSocket();

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
        maintainAspectRatio: false,
        scales: {
            y: {
                beginAtZero: false,
                ticks: {
                    font: {
                        size: 12
                    }
                }
            },
            x: {
                ticks: {
                    font: {
                        size: 12
                    }
                }
            }
        },
        plugins: {
            legend: {
                position: 'top',
                labels: {
                    font: {
                        size: 14
                    }
                }
            }
        },
        interaction: {
            intersect: false,
            mode: 'index'
        },
        elements: {
            point: {
                radius: 3
            },
            line: {
                borderWidth: 2
            }
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

// 다크모드 토글 기능
const darkModeToggle = document.getElementById('darkModeToggle');

// 로컬 스토리지에서 다크모드 상태 가져오기
if (localStorage.getItem('darkMode') === 'enabled') {
    document.body.classList.add('dark-mode');
    document.getElementById('sidebar').classList.add('dark-mode');
    document.querySelectorAll('.card').forEach(card => card.classList.add('dark-mode'));
    darkModeToggle.checked = true;
}

// 다크모드 토글 이벤트 리스너
darkModeToggle.addEventListener('change', function() {
    if (this.checked) {
        document.body.classList.add('dark-mode');
        document.getElementById('sidebar').classList.add('dark-mode');
        document.querySelectorAll('.card').forEach(card => card.classList.add('dark-mode'));
        document.querySelectorAll('.chart-container').forEach(container => container.classList.add('dark-mode'));
        document.querySelectorAll('.card-body').forEach(body => body.classList.add('dark-mode'));
        localStorage.setItem('darkMode', 'enabled');
    } else {
        document.body.classList.remove('dark-mode');
        document.getElementById('sidebar').classList.remove('dark-mode');
        document.querySelectorAll('.card').forEach(card => card.classList.remove('dark-mode'));
        document.querySelectorAll('.chart-container').forEach(container => container.classList.remove('dark-mode'));
        document.querySelectorAll('.card-body').forEach(body => body.classList.remove('dark-mode'));
        localStorage.setItem('darkMode', 'disabled');
    }
});