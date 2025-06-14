// 학급용 디지털 타이머
let timer = null;
let timeLeft = 0;
let isRunning = false;

const hoursEl = document.getElementById('hours');
const minutesEl = document.getElementById('minutes');
const secondsEl = document.getElementById('seconds');
const startBtn = document.getElementById('startBtn');
const resetBtn = document.getElementById('resetBtn');
const hoursInput = document.getElementById('hours-input');
const minutesInput = document.getElementById('minutes-input');
const secondsInput = document.getElementById('seconds-input');
const titleInput = document.getElementById('title-input');
const titleEditBtn = document.getElementById('title-edit-btn');
const themeToggle = document.getElementById('theme-toggle');
const themeIcon = themeToggle.querySelector('.theme-icon');

function updateDisplay() {
    const hours = Math.floor(timeLeft / 3600);
    const minutes = Math.floor((timeLeft % 3600) / 60);
    const seconds = timeLeft % 60;
    hoursEl.textContent = String(hours).padStart(2, '0');
    minutesEl.textContent = String(minutes).padStart(2, '0');
    secondsEl.textContent = String(seconds).padStart(2, '0');
}

function setTimeFromInput() {
    const hours = parseInt(hoursInput.value) || 0;
    const minutes = parseInt(minutesInput.value) || 0;
    const seconds = parseInt(secondsInput.value) || 0;
    
    timeLeft = hours * 3600 + minutes * 60 + seconds;
    updateDisplay();
}

function startTimer() {
    if (timeLeft <= 0) return;
    isRunning = true;
    startBtn.textContent = '정지';
    timer = setInterval(() => {
        if (timeLeft > 0) {
            timeLeft--;
            updateDisplay();
        } else {
            clearInterval(timer);
            isRunning = false;
            startBtn.textContent = '시작';
            playAlarm();
        }
    }, 1000);
}

function pauseTimer() {
    isRunning = false;
    startBtn.textContent = '재시작';
    clearInterval(timer);
}

function resetTimer() {
    pauseTimer();
    setTimeFromInput();
    startBtn.textContent = '시작';
}

function toggleTimer() {
    if (!isRunning) {
        if (timeLeft === 0) setTimeFromInput();
        startTimer();
    } else {
        pauseTimer();
    }
}

function playAlarm() {
    try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const masterGain = ctx.createGain();
        masterGain.connect(ctx.destination);
        masterGain.gain.value = 0.15;

        // 메인 알람음 (상승하는 주파수)
        const mainOsc = ctx.createOscillator();
        const mainGain = ctx.createGain();
        mainOsc.type = 'sine';
        mainOsc.frequency.setValueAtTime(440, ctx.currentTime);
        mainOsc.frequency.linearRampToValueAtTime(880, ctx.currentTime + 0.5);
        mainOsc.frequency.linearRampToValueAtTime(440, ctx.currentTime + 1);
        mainOsc.connect(mainGain);
        mainGain.connect(masterGain);
        mainGain.gain.setValueAtTime(0, ctx.currentTime);
        mainGain.gain.linearRampToValueAtTime(1, ctx.currentTime + 0.1);
        mainGain.gain.linearRampToValueAtTime(0, ctx.currentTime + 4);
        mainOsc.start();

        // 보조 알람음 (떨어지는 주파수)
        const subOsc = ctx.createOscillator();
        const subGain = ctx.createGain();
        subOsc.type = 'triangle';
        subOsc.frequency.setValueAtTime(880, ctx.currentTime);
        subOsc.frequency.linearRampToValueAtTime(440, ctx.currentTime + 0.5);
        subOsc.frequency.linearRampToValueAtTime(880, ctx.currentTime + 1);
        subOsc.connect(subGain);
        subGain.connect(masterGain);
        subGain.gain.setValueAtTime(0, ctx.currentTime);
        subGain.gain.linearRampToValueAtTime(0.5, ctx.currentTime + 0.1);
        subGain.gain.linearRampToValueAtTime(0, ctx.currentTime + 4);
        subOsc.start();

        // 리듬 효과 (짧은 비프음)
        function playBeep(time) {
            const beepOsc = ctx.createOscillator();
            const beepGain = ctx.createGain();
            beepOsc.type = 'square';
            beepOsc.frequency.value = 660;
            beepOsc.connect(beepGain);
            beepGain.connect(masterGain);
            beepGain.gain.setValueAtTime(0.3, time);
            beepGain.gain.linearRampToValueAtTime(0, time + 0.1);
            beepOsc.start(time);
            beepOsc.stop(time + 0.1);
        }

        // 리듬 패턴 재생
        const beepTimes = [0.2, 0.4, 1.2, 1.4, 2.2, 2.4, 3.2, 3.4];
        beepTimes.forEach(time => playBeep(ctx.currentTime + time));

        // 4초 후 정리
        setTimeout(() => {
            mainOsc.stop();
            subOsc.stop();
            ctx.close();
        }, 4000);
    } catch (e) {
        console.error('알람 소리 재생 중 오류:', e);
    }
}

// 제목 입력 필드 처리
function handleTitleInput() {
    if (titleInput.value.trim() === '') {
        titleInput.value = '학급용 디지털 타이머';
    }
}

titleEditBtn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const isCurrentlyEditing = !titleInput.readOnly;
    if (isCurrentlyEditing) {
        // 완료 버튼을 눌렀을 때
        handleTitleInput();
        titleInput.blur(); // 명시적으로 blur 처리
        titleInput.readOnly = true;
        titleEditBtn.textContent = '수정';
        titleEditBtn.classList.remove('editing');
    } else {
        // 수정 버튼을 눌렀을 때
        titleInput.readOnly = false;
        titleEditBtn.textContent = '완료';
        titleEditBtn.classList.add('editing');
        setTimeout(() => {
            titleInput.focus();
            titleInput.select();
        }, 0);
    }
});

// blur 이벤트는 수정 모드일 때만 처리
titleInput.addEventListener('blur', (e) => {
    if (!titleInput.readOnly && e.relatedTarget !== titleEditBtn) {
        handleTitleInput();
        titleInput.readOnly = true;
        titleEditBtn.textContent = '수정';
        titleEditBtn.classList.remove('editing');
    }
});

// Enter 키 이벤트도 수정 모드일 때만 처리
titleInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !titleInput.readOnly) {
        e.preventDefault();
        handleTitleInput();
        titleInput.blur();
        titleInput.readOnly = true;
        titleEditBtn.textContent = '수정';
        titleEditBtn.classList.remove('editing');
    }
});

startBtn.addEventListener('click', toggleTimer);
resetBtn.addEventListener('click', resetTimer);
hoursInput.addEventListener('change', setTimeFromInput);
minutesInput.addEventListener('change', setTimeFromInput);
secondsInput.addEventListener('change', setTimeFromInput);

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', () => {
    setTimeFromInput();
});

// 테마 토글 기능
function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    themeIcon.textContent = theme === 'dark' ? '☀️' : '🌙';
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
}

// 저장된 테마 불러오기
const savedTheme = localStorage.getItem('theme') || 'light';
setTheme(savedTheme);

themeToggle.addEventListener('click', toggleTheme); 