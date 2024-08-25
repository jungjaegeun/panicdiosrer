let currentPage = 'home';
let breatheState = 'inhale';
let tasks = [
    { id: 1, text: "5분 명상하기", completed: false },
    { id: 2, text: "긍정적인 자기 대화 연습", completed: false },
    { id: 3, text: "10분 걷기", completed: false }
];
let selectedDate = null;
let emotions = JSON.parse(localStorage.getItem('emotions')) || {};

function changePage(page) {
    currentPage = page;
    renderPage();
}

function renderPage() {
    const content = document.getElementById('content');
    content.innerHTML = '';

    switch (currentPage) {
        case 'home':
            renderHome();
            break;
        case 'panicButton':
            renderPanicButton();
            break;
        case 'breathe':
            renderBreathe();
            break;
        case 'tasks':
            renderTasks();
            break;
        case 'progress':
            renderProgress();
            break;
    }
}

function renderHome() {
    const content = document.getElementById('content');
    content.innerHTML = `
        <h1>안녕하세요</h1>
        <div class="card">
            <h2>오늘의 감정</h2>
            <div id="emotion-selector">
                <div class="emotion-row">
                    <button class="emotion" data-emotion="anger"><img src="anger.png" alt="화남"></button>
                    <button class="emotion" data-emotion="embarrassment"><img src="embarrassment.png" alt="당황"></button>
                    <button class="emotion" data-emotion="fear"><img src="fear.png" alt="두려움"></button>
                </div>
                <div class="emotion-row">
                    <button class="emotion" data-emotion="happiness"><img src="happiness.png" alt="행복"></button>
                    <button class="emotion" data-emotion="joy"><img src="joy.png" alt="기쁨"></button>
                    <button class="emotion" data-emotion="proud"><img src="proud.png" alt="자랑스러움"></button>
                </div>
                <div class="emotion-row">
                    <button class="emotion" data-emotion="sadness"><img src="sadness.png" alt="슬픔"></button>
                    <button class="emotion" data-emotion="upset"><img src="upset.png" alt="화남"></button>
                    <button class="emotion" data-emotion="worry"><img src="worry.png" alt="걱정"></button>
                </div>
            </div>
        </div>
        <div class="card">
            <h2>감정 캘린더</h2>
            <div id="calendar"></div>
        </div>
        <div class="card">
            <h2>빠른 액세스</h2>
            <button onclick="changePage('panicButton')" class="button">공황 버튼</button>
            <button onclick="changePage('breathe')" class="button">호흡 운동</button>
            <button onclick="changePage('tasks')" class="button">오늘의 과제</button>
        </div>
    `;
    renderCalendar();
    setupEmotionSelector();
}

function renderCalendar() {
    const calendar = document.getElementById('calendar');
    calendar.innerHTML = '';
    const date = new Date();
    const year = date.getFullYear();
    const month = date.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    for (let i = 0; i < firstDay.getDay(); i++) {
        calendar.appendChild(createDayElement(''));
    }

    for (let i = 1; i <= lastDay.getDate(); i++) {
        const dayElement = createDayElement(i);
        const dateString = `${year}-${month + 1}-${i}`;
        if (emotions[dateString]) {
            const img = document.createElement('img');
            img.src = `${emotions[dateString]}.png`;
            img.alt = emotions[dateString];
            img.className = 'emotion-img';
            dayElement.appendChild(img);
        }
        calendar.appendChild(dayElement);
    }
}

function createDayElement(day) {
    const dayElement = document.createElement('div');
    dayElement.className = 'day';
    dayElement.textContent = day;
    dayElement.addEventListener('click', () => selectDate(day));
    return dayElement;
}

function selectDate(day) {
    const date = new Date();
    selectedDate = `${date.getFullYear()}-${date.getMonth() + 1}-${day}`;
    document.querySelectorAll('.day').forEach(el => el.style.background = '');
    event.target.style.background = '#e6e6e6';
}

function setupEmotionSelector() {
    const emotionButtons = document.querySelectorAll('.emotion');
    emotionButtons.forEach(button => {
        button.addEventListener('click', () => {
            const today = new Date();
            const dateString = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
            const emotion = button.getAttribute('data-emotion');
            emotions[dateString] = emotion;
            localStorage.setItem('emotions', JSON.stringify(emotions));
            renderCalendar();
        });
    });
}

function renderPanicButton() {
    const content = document.getElementById('content');
    content.innerHTML = `
        <h1>공황 버튼</h1>
        <button class="panic-button" onclick="startPanicRelief()">여기를 눌러주세요</button>
    `;
}
let isPlaying = false;
let audio;

function renderBreathe() {
    const content = document.getElementById('content');
    content.innerHTML = `
        <h1>호흡 운동</h1>
        <div class="breathe-circle" id="breatheCircle">
            들이쉬기
        </div>
        <button id="toggleAudio" class="button">음악 재생/일시정지</button>
    `;
    startBreathingExercise();
    setupAudio();
}

function setupAudio() {
    if (!audio) {
        audio = new Audio('명상음악.mp3');
        audio.loop = true;
    }

    const toggleButton = document.getElementById('toggleAudio');
    toggleButton.addEventListener('click', toggleAudio);

    // 자동 재생 시도
    audio.play().then(() => {
        isPlaying = true;
        toggleButton.textContent = '음악 일시정지';
    }).catch(error => {
        console.log("자동 재생 실패:", error);
        toggleButton.textContent = '음악 재생';
    });
}

function toggleAudio() {
    const toggleButton = document.getElementById('toggleAudio');
    if (isPlaying) {
        audio.pause();
        isPlaying = false;
        toggleButton.textContent = '음악 재생';
    } else {
        audio.play();
        isPlaying = true;
        toggleButton.textContent = '음악 일시정지';
    }
}

function renderTasks() {
    const content = document.getElementById('content');
    content.innerHTML = `
        <h1>오늘의 과제</h1>
        <div class="card">
            <ul class="task-list" id="taskList"></ul>
        </div>
    `;
    renderTaskList();
}

function renderProgress() {
    const content = document.getElementById('content');
    const completedTasks = tasks.filter(task => task.completed).length;
    const progressPercentage = (completedTasks / tasks.length) * 100;

    content.innerHTML = `
        <h1>진행 상황</h1>
        <div class="card">
            <h2>과제 완료율</h2>
            <div class="progress-bar">
                <div class="progress-bar-fill" style="width: ${progressPercentage}%"></div>
            </div>
            <p>${completedTasks}/${tasks.length} 완료</p>
        </div>
    `;
}

function saveMood() {
    const mood = document.getElementById('moodInput').value;
    console.log('Mood saved:', mood);
    alert('기분이 저장되었습니다.');
}

function startPanicRelief() {
    alert("깊게 숨을 들이쉬세요. 당신은 안전합니다. 이 순간에 집중하세요.");
    // 여기에 더 상세한 공황 완화 단계를 추가할 수 있습니다.
}

function startBreathingExercise() {
    const circle = document.getElementById('breatheCircle');
    setInterval(() => {
        if (breatheState === 'inhale') {
            circle.style.transform = 'scale(1.5)';
            circle.textContent = '내쉬기';
            breatheState = 'exhale';
        } else {
            circle.style.transform = 'scale(1)';
            circle.textContent = '들이쉬기';
            breatheState = 'inhale';
        }
    }, 4000);
}

function setupAudioControl() {
    const toggleButton = document.getElementById('toggleAudio');
    toggleButton.addEventListener('click', () => {
        if (isPlaying) {
            audio.pause();
            isPlaying = false;
            toggleButton.textContent = '음악 재생';
        } else {
            audio.play();
            isPlaying = true;
            toggleButton.textContent = '음악 일시정지';
        }
    });
}

// 페이지 전환 시 음악 정지
function changePage(page) {
    currentPage = page;
    if (isPlaying) {
        audio.pause();
        isPlaying = false;
    }
    renderPage();
}

function renderTaskList() {
    const taskList = document.getElementById('taskList');
    taskList.innerHTML = '';
    tasks.forEach(task => {
        const li = document.createElement('li');
        li.className = 'task-item';
        li.innerHTML = `
            <span>${task.text}</span>
            <input type="checkbox" ${task.completed ? 'checked' : ''} onchange="toggleTask(${task.id})">
        `;
        taskList.appendChild(li);
    });
}

function toggleTask(id) {
    const task = tasks.find(t => t.id === id);
    if (task) {
        task.completed = !task.completed;
        renderTaskList();
    }
}

const panicGuides = [
    {
        title: "1. 공황발작 받아들이기",
        content: "공황발작은 위험하지 않습니다. 그저 받아들이면 증상 지속 시간을 단축시킬 수 있습니다.",
        duration: 10000 // 10초
    },
    {
        title: "2. 주변 사물에 집중하기",
        content: "먼 거리에 있는 물건을 찾아 집중해보세요. 이는 마음을 더 편하게 해줍니다.",
        duration: 10000 // 10초
    },
    {
        title: "3. 복식 호흡하기",
        content: "1. 한 손을 복부에 놓으세요.\n2. 코로 깊게 숨을 들이마시세요.\n3. 숨을 잠시 멈추세요.\n4. 천천히 숨을 내뱉으세요.\n5. 10번 반복하세요.",
        duration: 30000 // 30초
    },
    {
        title: "4. 이완요법 시행하기",
        content: "1. 주먹을 쥐었다 펴기 (5-7초 쥐고, 15-20초 펴기)\n2. 팔을 들었다 내리기 (5-7초 들고, 15-20초 내리기)\n3. 어깨를 으쓱했다 내리기 (5-7초 올리고, 15-20초 내리기)\n4. 2-3회 반복하기",
        duration: 30000 // 30초
    },
    {
        title: "5. 긍정적인 혼잣말하기",
        content: "\"나는 이 증상을 조절할 수 있어\"\n\"단순히 순간적인 불안일 뿐이야\"\n\"공황발작은 실제 위험하지 않아\"",
        duration: 15000 // 15초
    },
    {
        title: "6. 조용한 장소 찾기",
        content: "가능하다면 조용한 장소를 찾아 10-15분 동안 머물러보세요. 두려움이 사라질 때까지 기다립니다.",
        duration: 15000 // 15초
    }
];

let currentGuideIndex = 0;
let progressInterval;

function startPanicRelief() {
    currentGuideIndex = 0;
    document.getElementById('panic-guide').classList.remove('hidden');
    showNextGuide();
}

function showNextGuide() {
    if (currentGuideIndex < panicGuides.length) {
        const guide = panicGuides[currentGuideIndex];
        const guideContent = document.getElementById('guide-content');
        guideContent.innerHTML = `<h3>${guide.title}</h3><p>${guide.content}</p>`;
        guideContent.classList.remove('fade-in');
        void guideContent.offsetWidth; // 리플로우 강제
        guideContent.classList.add('fade-in');

        startProgress(guide.duration);
    } else {
        closePanicGuide();
    }
}

function startProgress(duration) {
    let startTime = Date.now();
    const progressBar = document.getElementById('progress');

    clearInterval(progressInterval);
    progressBar.style.width = '0%';

    progressInterval = setInterval(() => {
        let elapsedTime = Date.now() - startTime;
        let progress = (elapsedTime / duration) * 100;

        if (progress >= 100) {
            clearInterval(progressInterval);
            progress = 100;
            currentGuideIndex++;
            setTimeout(showNextGuide, 500); // 0.5초 후 다음 단계로 넘어감
        }

        progressBar.style.width = `${progress}%`;
    }, 50); // 50ms마다 업데이트
}

function closePanicGuide() {
    clearInterval(progressInterval);
    document.getElementById('panic-guide').classList.add('hidden');
}

function renderPanicButton() {
    const content = document.getElementById('content');
    content.innerHTML = `
        <h1>공황 버튼</h1>
        <button class="panic-button" onclick="startPanicRelief()">여기를 눌러주세요</button>
    `;
}

function initApp() {
    renderPage(); // 초기 페이지 렌더링

    // 이벤트 리스너 추가
    document.getElementById('next-step').addEventListener('click', () => {
        clearInterval(progressInterval);
        currentGuideIndex++;
        showNextGuide();
    });
    document.getElementById('close-guide').addEventListener('click', closePanicGuide);
}

// DOM 로드 완료 시 initApp 함수 실행
document.addEventListener('DOMContentLoaded', initApp);
// 초기 페이지 렌더링
renderPage();

let diaryEntries = JSON.parse(localStorage.getItem('diaryEntries')) || [];

function renderDiary() {
    const content = document.getElementById('content');
    content.innerHTML = `
        <h1>당신의 일기와 개인 문서</h1>
        <div id="diary-entries"></div>
        <button onclick="showNewEntryForm()" class="button">새 일기 작성</button>
    `;
    renderDiaryEntries();
}

function renderDiaryEntries() {
    const entriesContainer = document.getElementById('diary-entries');
    entriesContainer.innerHTML = '';
    diaryEntries.sort((a, b) => new Date(b.date) - new Date(a.date));
    diaryEntries.forEach(entry => {
        const entryElement = document.createElement('div');
        entryElement.className = 'diary-entry';
        entryElement.innerHTML = `
            <h2>${formatDate(entry.date)}</h2>
            <p>${entry.emotion} ${getEmotionEmoji(entry.emotion)}</p>
            <p>${entry.content}</p>
            ${entry.image ? `<img src="${entry.image}" alt="일기 이미지" class="diary-image">` : ''}
        `;
        entriesContainer.appendChild(entryElement);
    });
}

function showNewEntryForm() {
    const content = document.getElementById('content');
    content.innerHTML = `
        <h1>새 일기 작성</h1>
        <form id="new-entry-form">
            <input type="date" id="entry-date" required>
            <select id="entry-emotion" required>
                <option value="">감정 선택</option>
                <option value="행복">행복</option>
                <option value="슬픔">슬픔</option>
                <option value="화남">화남</option>
                <option value="불안">불안</option>
                <option value="평온">평온</option>
            </select>
            <textarea id="entry-content" placeholder="오늘의 일기를 작성하세요..." required></textarea>
            <input type="file" id="entry-image" accept="image/*">
            <button type="submit" class="button">저장</button>
        </form>
    `;
    document.getElementById('new-entry-form').addEventListener('submit', saveNewEntry);
}

function saveNewEntry(event) {
    event.preventDefault();
    const date = document.getElementById('entry-date').value;
    const emotion = document.getElementById('entry-emotion').value;
    const content = document.getElementById('entry-content').value;
    const imageFile = document.getElementById('entry-image').files[0];

    if (imageFile) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const newEntry = { date, emotion, content, image: e.target.result };
            diaryEntries.push(newEntry);
            localStorage.setItem('diaryEntries', JSON.stringify(diaryEntries));
            renderDiary();
        };
        reader.readAsDataURL(imageFile);
    } else {
        const newEntry = { date, emotion, content };
        diaryEntries.push(newEntry);
        localStorage.setItem('diaryEntries', JSON.stringify(diaryEntries));
        renderDiary();
    }
}

function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('ko-KR', options);
}

function getEmotionEmoji(emotion) {
    const emojis = {
        '행복': '😊',
        '슬픔': '😢',
        '화남': '😠',
        '불안': '😰',
        '평온': '😌'
    };
    return emojis[emotion] || '';
}

// changePage 함수에 새로운 페이지 추가
function changePage(page) {
    currentPage = page;
    switch(page) {
        case 'home':
            renderHome();
            break;
        case 'panicButton':
            renderPanicButton();
            break;
        case 'breathe':
            renderBreathe();
            break;
        case 'diary':
            renderDiary();
            break;
        case 'tasks':
            renderTasks();
            break;
        case 'progress':
            renderProgress();
            break;
    }
}
