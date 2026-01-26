// State Management
let state = {
    tasks: JSON.parse(localStorage.getItem('tasks')) || [],
    stats: JSON.parse(localStorage.getItem('stats')) || { onTime: 0, missed: 0 },
    habits: JSON.parse(localStorage.getItem('habits')) || [],
    timeLogs: JSON.parse(localStorage.getItem('timeLogs')) || {},
    theme: localStorage.getItem('theme') || 'nature',
    wallpaper: localStorage.getItem('wallpaper') || '',
    userQuotes: JSON.parse(localStorage.getItem('userQuotes')) || [],
    quoteIndex: parseInt(localStorage.getItem('quoteIndex')) || 0,
    // Gamification
    gamification: JSON.parse(localStorage.getItem('gamification')) || {
        totalXP: 0,
        currentStreak: 0,
        lastStreakDate: null,
        dailyMinutes: {},
        streakFreezes: 0,
        rank: 1,
        badges: []
    },
    // Timer
    timer: JSON.parse(localStorage.getItem('timerState')) || {
        isRunning: false,
        isPaused: false,
        totalSeconds: 25 * 60,
        remainingSeconds: 25 * 60,
        endTime: null,
        quoteIndex: 0,
        lastQuoteMinute: -1
    }
};

// Configuration
const HEATMAP_DAYS = 30;
const DEFAULT_QUOTES = [
    '"The future belongs to those who believe in the beauty of their dreams."',
    '"Happiness is not something ready made. It comes from your own actions."',
    '"Believe you can and you\'re halfway there."',
    '"The only way to do great work is to love what you do."',
    '"Your time is limited, don\'t waste it living someone else\'s life."',
    '"Everything you\'ve ever wanted is on the other side of fear."',
    '"Dream big and dare to fail."',
    '"Act as if what you do makes a difference. It does."',
    '"Keep your face always toward the sunshine—and shadows will fall behind you."',
    '"The secret of getting ahead is getting started."'
];

const RANK_NAMES = [
    "Rank 0", "Rank 1", "Rank 2", "Rank 3", "Rank 4", "Rank 5",
    "Rank 6", "Rank 7", "Rank 8", "Rank 9", "Rank 10",
    "Rank 11", "Rank 12", "Rank 13", "Rank 14", "Rank 15"
];

// DOM Elements
const dom = {
    body: document.body,
    settingsBtn: document.getElementById('settings-btn'),
    settingsModal: document.getElementById('settings-modal'),
    closeSettings: document.getElementById('close-settings'),
    themeOptions: document.querySelectorAll('.theme-option'),
    wallpaperOptions: document.querySelectorAll('.wallpaper-btn'),
    customWallpaperInput: document.getElementById('custom-wallpaper-input'),
    applyCustomWallpaper: document.getElementById('apply-custom-wallpaper'),

    newQuoteInput: document.getElementById('new-quote-input'),
    addQuoteBtn: document.getElementById('add-quote-btn'),
    quoteText: document.getElementById('quote-text'),

    // Data Management
    exportDataBtn: document.getElementById('export-data-btn'),
    importDataBtn: document.getElementById('import-data-btn'),
    importFileInput: document.getElementById('import-file-input'),

    tabs: document.querySelectorAll('.nav-btn'),
    views: document.querySelectorAll('.view-section'),

    // Tasks
    taskList: document.getElementById('task-list'),
    taskInput: document.getElementById('task-desc'),
    taskTagsInput: document.getElementById('task-tags'),
    dateInput: document.getElementById('task-deadline'),
    addBtn: document.getElementById('add-btn'),
    statsOnTime: document.getElementById('stats-ontime'),
    statsMissed: document.getElementById('stats-missed'),

    // Completed Tasks
    completedTaskList: document.getElementById('completed-task-list'),
    completedSearch: document.getElementById('completed-search'),

    // Habits
    habitName: document.getElementById('habit-name'),
    habitColor: document.getElementById('habit-color'),
    addHabitBtn: document.getElementById('add-habit-btn'),
    habitsContainer: document.getElementById('habits-container'),

    // Time Log
    logActivity: document.getElementById('log-activity'),
    logDuration: document.getElementById('log-duration'),
    logColor: document.getElementById('log-color'),
    addLogBtn: document.getElementById('add-log-btn'),
    todayChartCanvas: document.getElementById('todayChart'),
    todayLegend: document.getElementById('today-legend'),

    // History
    historyGrid: document.getElementById('history-grid'),
    viewHistoryBtn: document.getElementById('view-history-btn'),
    backToTimeLogBtn: document.getElementById('back-to-timelog'),

    // Profile
    rankImage: document.getElementById('rank-image'),
    currentRank: document.getElementById('current-rank'),
    streakDisplay: document.getElementById('streak-display'),
    multiplierDisplay: document.getElementById('multiplier-display'),
    xpFill: document.getElementById('xp-fill'),
    xpText: document.getElementById('xp-text'),
    freezeStreakBtn: document.getElementById('freeze-streak-btn'),
    reducePenaltyBtn: document.getElementById('reduce-penalty-btn'),
    badgesGrid: document.getElementById('badges-grid'),

    // Timer 
    timerRingProgress: document.getElementById('timer-ring-progress'),
    timerMinutes: document.getElementById('timer-minutes'),
    timerSeconds: document.getElementById('timer-seconds'),
    timerDuration: document.getElementById('timer-duration'),
    timerStart: document.getElementById('timer-start'),
    timerPause: document.getElementById('timer-pause'),
    timerReset: document.getElementById('timer-reset'),
    timerQuote: document.getElementById('timer-quote'),

    // Global Header
    globalRank: document.getElementById('global-rank'),
    globalXP: document.getElementById('global-xp')
};

function updateGlobalStats() {
    if (dom.globalRank) dom.globalRank.textContent = RANK_NAMES[state.gamification.rank] || 'Rank 0';
    if (dom.globalXP) dom.globalXP.textContent = `${state.gamification.totalXP} XP`;
}

// Setup the app
function init() {
    applyTheme(state.theme);
    applyWallpaper(state.wallpaper);
    refreshQuote();
    checkDailyStreak();

    setupTabs();
    setupEventListeners();

    renderTasks();
    displayStats();
    startTaskTimer();

    renderHabits();
    renderTimeLog();
    renderHistory();
    renderProfile();

    renderTimeLog();
    renderHistory();
    renderProfile();

    checkActiveTimer();
    updateGlobalStats();
}

// Theme and Wallpaper
function applyTheme(theme) {
    dom.body.setAttribute('data-theme', theme);
    dom.themeOptions.forEach(btn => {
        if (btn.dataset.theme === theme) btn.style.borderColor = 'white';
        else btn.style.borderColor = 'rgba(255,255,255,0.2)';
    });
}

function applyWallpaper(path) {
    if (path) path = path.replace(/\\/g, '/');

    state.wallpaper = path;
    localStorage.setItem('wallpaper', path);

    if (path) {
        dom.body.style.backgroundImage = `url('${path}')`;
        dom.body.classList.add('has-wallpaper');
    } else {
        dom.body.style.backgroundImage = 'none';
        dom.body.classList.remove('has-wallpaper');
    }

    dom.wallpaperOptions.forEach(btn => {
        if (btn.dataset.wallpaper === path || btn.dataset.wallpaper.replace(/\\/g, '/') === path) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
}

// Quotes Logic
function addQuote() {
    const text = dom.newQuoteInput.value.trim();
    if (!text) return;

    state.userQuotes.push(`"${text}"`);
    localStorage.setItem('userQuotes', JSON.stringify(state.userQuotes));

    dom.newQuoteInput.value = '';
    renderQuoteList();
    alert('Quote added! It will appear in the sequence.');
}

function deleteQuote(index) {
    state.userQuotes.splice(index, 1);
    localStorage.setItem('userQuotes', JSON.stringify(state.userQuotes));
    renderQuoteList();
}

function renderQuoteList() {
    const list = document.getElementById('custom-quote-list');
    if (!list) return;

    list.innerHTML = '';
    state.userQuotes.forEach((quote, index) => {
        const li = document.createElement('li');
        li.className = 'quote-item';
        li.innerHTML = `
            <span>${escapeHtml(quote)}</span>
            <button class="quote-delete-btn" onclick="deleteQuote(${index})">
                <i class="fa-solid fa-times"></i>
            </button>
        `;
        list.appendChild(li);
    });
}

function refreshQuote() {
    if (dom.quoteText) {
        const allQuotes = [...DEFAULT_QUOTES, ...state.userQuotes];
        if (state.quoteIndex >= allQuotes.length) state.quoteIndex = 0;
        const quote = allQuotes[state.quoteIndex];
        dom.quoteText.innerText = quote;
        state.quoteIndex = (state.quoteIndex + 1) % allQuotes.length;
        localStorage.setItem('quoteIndex', state.quoteIndex);
    }
}

// Settings Modal
function openSettings() { dom.settingsModal.classList.add('open'); }
function closeSettings() { dom.settingsModal.classList.remove('open'); }

// Navigation Tabs
function setupTabs() {
    dom.tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            dom.tabs.forEach(t => t.classList.remove('active'));
            dom.views.forEach(v => v.style.display = 'none');

            tab.classList.add('active');
            const viewId = `view-${tab.dataset.tab}`;
            const view = document.getElementById(viewId);
            if (view) {
                view.style.display = 'block';
                if (tab.dataset.tab === 'history') renderHistory();
                if (tab.dataset.tab === 'timelog') renderTimeLog();
                if (tab.dataset.tab === 'completed') renderCompletedTasks();
                if (tab.dataset.tab === 'profile') renderProfile();
            }
        });
    });
}

// Event Listeners
function setupEventListeners() {
    if (dom.settingsBtn) dom.settingsBtn.addEventListener('click', openSettings);
    if (dom.closeSettings) dom.closeSettings.addEventListener('click', closeSettings);

    dom.themeOptions.forEach(btn => {
        btn.addEventListener('click', () => {
            state.theme = btn.dataset.theme;
            localStorage.setItem('theme', state.theme);
            applyTheme(state.theme);
        });
    });

    dom.wallpaperOptions.forEach(btn => {
        btn.addEventListener('click', () => {
            applyWallpaper(btn.dataset.wallpaper);
        });
    });

    if (dom.applyCustomWallpaper) {
        dom.applyCustomWallpaper.addEventListener('click', () => {
            const path = dom.customWallpaperInput.value.trim();
            if (path) applyWallpaper(path);
        });
    }

    if (dom.addQuoteBtn) dom.addQuoteBtn.addEventListener('click', addQuote);

    // Data Management
    if (dom.exportDataBtn) dom.exportDataBtn.addEventListener('click', exportData);
    if (dom.importDataBtn) dom.importDataBtn.addEventListener('click', () => dom.importFileInput.click());
    if (dom.importFileInput) dom.importFileInput.addEventListener('change', importData);

    // App Logic
    if (dom.addBtn) dom.addBtn.addEventListener('click', addTask);
    if (dom.addHabitBtn) dom.addHabitBtn.addEventListener('click', addHabit);
    if (dom.addLogBtn) dom.addLogBtn.addEventListener('click', addTimeLog);

    // History Navigation
    if (dom.viewHistoryBtn) {
        dom.viewHistoryBtn.addEventListener('click', () => {
            dom.views.forEach(v => v.style.display = 'none');
            const historyView = document.getElementById('view-history');
            if (historyView) historyView.style.display = 'block';
            renderHistory();
        });
    }

    if (dom.backToTimeLogBtn) {
        dom.backToTimeLogBtn.addEventListener('click', () => {
            dom.views.forEach(v => v.style.display = 'none');
            const timeLogView = document.getElementById('view-timelog');
            if (timeLogView) timeLogView.style.display = 'block';
            renderTimeLog();
        });
    }

    // Completed Tasks Search
    if (dom.completedSearch) {
        dom.completedSearch.addEventListener('input', () => renderCompletedTasks(dom.completedSearch.value));
    }

    // Profile Actions
    if (dom.freezeStreakBtn) dom.freezeStreakBtn.addEventListener('click', freezeStreak);
    if (dom.reducePenaltyBtn) dom.reducePenaltyBtn.addEventListener('click', reduceStreakPenalty);
}

// Save Data
function saveData() {
    localStorage.setItem('tasks', JSON.stringify(state.tasks));
    localStorage.setItem('stats', JSON.stringify(state.stats));
    localStorage.setItem('habits', JSON.stringify(state.habits));
    localStorage.setItem('timeLogs', JSON.stringify(state.timeLogs));
    localStorage.setItem('gamification', JSON.stringify(state.gamification));

    // Sanitize timer state 
    const cleanTimer = { ...state.timer, intervalId: null };
    localStorage.setItem('timerState', JSON.stringify(cleanTimer));
}

// Export and Import
function exportData() {
    const dataStr = JSON.stringify(state, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `keepa_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
}

function validateImport(data) {
    if (!data || typeof data !== 'object') return false;

    // Check required top-level keys
    const requiredKeys = ['tasks', 'stats', 'habits', 'timeLogs', 'gamification'];
    for (const key of requiredKeys) {
        if (!(key in data)) return false;
    }

    // Validate critical structures
    if (!Array.isArray(data.tasks)) return false;
    if (typeof data.stats !== 'object') return false;
    if (typeof data.gamification.totalXP !== 'number') return false;

    return true;
}

function importData(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const imported = JSON.parse(e.target.result);

            // Validate structure
            if (!validateImport(imported)) {
                throw new Error('Invalid or corrupted backup file');
            }

            // Merge/Replace state
            state = { ...state, ...imported };

            // Re-save all to localStorage logic
            saveData();
            localStorage.setItem('userQuotes', JSON.stringify(state.userQuotes));
            localStorage.setItem('theme', state.theme);
            localStorage.setItem('wallpaper', state.wallpaper);

            alert('Data imported successfully! Reloading...');
            location.reload();
        } catch (err) {
            alert('Failed to import: ' + err.message);
        }
    };
    reader.readAsText(file);
    event.target.value = ''; // Reset file input
}


// 1. TASKS LOGIC


function addTask() {
    if (!dom.taskInput || !dom.dateInput) return;
    const desc = dom.taskInput.value.trim();
    const deadline = dom.dateInput.value;
    const tagsRaw = dom.taskTagsInput ? dom.taskTagsInput.value.trim() : '';

    if (!desc || !deadline) return alert('Please fill in task and deadline');

    const tags = tagsRaw ? tagsRaw.split(',').map(t => t.trim().toLowerCase()).filter(t => t) : [];

    state.tasks.push({
        id: Date.now(),
        desc,
        deadline,
        status: 'active',
        tags: tags,
        completedDate: null
    });

    saveData();
    renderTasks();
    dom.taskInput.value = '';
    dom.dateInput.value = '';
    if (dom.taskTagsInput) dom.taskTagsInput.value = '';
}

function renderTasks() {
    if (!dom.taskList) return;
    dom.taskList.innerHTML = '';

    // Only show active tasks
    const activeTasks = state.tasks.filter(t => t.status === 'active');
    const sorted = [...activeTasks].sort((a, b) => new Date(a.deadline) - new Date(b.deadline));

    if (sorted.length === 0) {
        dom.taskList.innerHTML = '<li class="empty-state"><i class="fa-solid fa-list"></i><p class="gradient-text" style="font-weight:600">No active tasks</p></li>';
        return;
    }

    sorted.forEach(task => {
        const li = document.createElement('li');
        li.className = 'task-item active';

        const tagsHtml = task.tags && task.tags.length > 0
            ? `<div class="task-tags">${task.tags.map(t => `<span class="tag">${escapeHtml(t)}</span>`).join('')}</div>`
            : '';

        li.innerHTML = `
            <div class="task-content">
                <div class="task-text">${escapeHtml(task.desc)}</div>
                ${tagsHtml}
                <div class="task-meta">
                    <span id="timer-${task.id}" class="task-timer">...</span>
                    <span><i class="fa-regular fa-calendar"></i> ${new Date(task.deadline).toLocaleString()}</span>
                </div>
            </div>
            <div class="actions">
                <button class="btn-icon btn-complete" onclick="completeTask(${task.id})"><i class="fa-solid fa-check"></i></button>
                <button class="btn-icon btn-delete" onclick="deleteTask(${task.id})"><i class="fa-solid fa-trash"></i></button>
            </div>
        `;
        dom.taskList.appendChild(li);
    });
    updateTimers();
}

function completeTask(id) {
    const task = state.tasks.find(t => t.id === id);
    if (!task) return;

    const now = new Date();
    const deadline = new Date(task.deadline);
    const completedDate = getLocalDate();

    if (now <= deadline) {
        task.status = 'completed';
        state.stats.onTime++;
    } else {
        task.status = 'failed';
        state.stats.missed++;
    }

    task.completedDate = completedDate;
    // Auto-add date as a tag
    if (!task.tags) task.tags = [];
    if (!task.tags.includes(completedDate)) {
        task.tags.push(completedDate);
    }

    saveData();
    renderTasks();
    displayStats();
}

function deleteTask(id) {
    state.tasks = state.tasks.filter(t => t.id !== id);
    saveData();
    renderTasks();
}

function displayStats() {
    if (dom.statsOnTime) dom.statsOnTime.innerText = state.stats.onTime;
    if (dom.statsMissed) dom.statsMissed.innerText = state.stats.missed;
}

function startTaskTimer() {
    setInterval(() => {
        let changed = false;
        const now = new Date();
        state.tasks.forEach(task => {
            if (task.status === 'active' && now > new Date(task.deadline)) {
                task.status = 'failed';
                task.completedDate = getLocalDate();
                if (!task.tags) task.tags = [];
                if (!task.tags.includes(task.completedDate)) {
                    task.tags.push(task.completedDate);
                }
                state.stats.missed++;
                changed = true;
            }
        });
        if (changed) { saveData(); renderTasks(); displayStats(); }
        updateTimers();
    }, 1000);
}

function updateTimers() {
    state.tasks.forEach(task => {
        if (task.status === 'active') {
            const el = document.getElementById(`timer-${task.id}`);
            if (el) {
                const diff = new Date(task.deadline) - new Date();
                if (diff > 0) {
                    const h = Math.floor(diff / 3600000);
                    const m = Math.floor((diff % 3600000) / 60000);
                    const s = Math.floor((diff % 60000) / 1000);
                    el.innerText = `${h}h ${m}m ${s}s`;
                    el.className = diff < 3600000 ? 'task-timer urgent' : 'task-timer';
                } else {
                    el.innerText = 'Overdue';
                    el.className = 'task-timer expired';
                }
            }
        }
    });
}


// COMPLETED TASKS


function renderCompletedTasks(searchQuery = '') {
    if (!dom.completedTaskList) return;
    dom.completedTaskList.innerHTML = '';

    const completedTasks = state.tasks.filter(t => t.status === 'completed' || t.status === 'failed');

    // Filter 
    let filtered = completedTasks;
    if (searchQuery) {
        const searchTerms = searchQuery.toLowerCase().split(',').map(s => s.trim()).filter(s => s);
        filtered = completedTasks.filter(task => {
            const taskTags = task.tags || [];

            return searchTerms.every(term =>
                taskTags.some(tag => tag.toLowerCase().includes(term)) ||
                task.desc.toLowerCase().includes(term)
            );
        });
    }

    // Sort 
    filtered.sort((a, b) => {

        const dateA = a.completedDate ? new Date(a.completedDate).getTime() : a.id;
        const dateB = b.completedDate ? new Date(b.completedDate).getTime() : b.id;
        return dateB - dateA;
    });

    if (filtered.length === 0) {
        dom.completedTaskList.innerHTML = '<li class="empty-state"><i class="fa-solid fa-check-double"></i><p class="gradient-text" style="font-weight:600">No completed tasks found</p></li>';
        return;
    }

    filtered.forEach(task => {
        const li = document.createElement('li');
        const isOnTime = task.status === 'completed';
        li.className = `task-item ${isOnTime ? 'completed-ontime' : 'completed-late'}`;

        const tagsHtml = task.tags && task.tags.length > 0
            ? `<div class="task-tags">${task.tags.map(t => `<span class="tag">${escapeHtml(t)}</span>`).join('')}</div>`
            : '';

        const indicator = isOnTime
            ? '<span class="completion-indicator success"><i class="fa-solid fa-check"></i> On Time</span>'
            : '<span class="completion-indicator failure"><i class="fa-solid fa-xmark"></i> Missed</span>';

        li.innerHTML = `
            <div class="task-content">
                <div class="task-text">${escapeHtml(task.desc)}</div>
                ${tagsHtml}
                <div class="task-meta">
                    ${indicator}
                    <span><i class="fa-regular fa-calendar"></i> ${task.completedDate || 'N/A'}</span>
                </div>
            </div>
        `;
        dom.completedTaskList.appendChild(li);
    });
}


// 2. HABITS LOGIC


function addHabit() {
    if (!dom.habitName) return;
    const name = dom.habitName.value.trim();
    if (!name) return;

    state.habits.push({
        id: Date.now(),
        name,
        color: dom.habitColor ? dom.habitColor.value : '#6366f1',
        logs: {}
    });

    saveData();
    renderHabits();
    dom.habitName.value = '';
}

function renderHabits() {
    if (!dom.habitsContainer) return;
    dom.habitsContainer.innerHTML = '';
    const today = new Date();
    const dates = [];
    for (let i = HEATMAP_DAYS - 1; i >= 0; i--) {
        const d = new Date();
        d.setDate(today.getDate() - i);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        dates.push(`${year}-${month}-${day}`);
    }

    if (state.habits.length === 0) {
        dom.habitsContainer.innerHTML = '<div class="empty-state" style="padding:2rem;text-align:center;"><i class="fa-solid fa-fire"></i><p class="gradient-text" style="font-weight:600">No habits yet</p></div>';
        return;
    }

    state.habits.forEach(habit => {
        const div = document.createElement('div');
        div.className = 'habit-card';

        const header = document.createElement('div');
        header.className = 'habit-header';
        header.innerHTML = `
            <div class="habit-title">
                <span style="background-color: ${habit.color}"></span> ${escapeHtml(habit.name)}
            </div>
            <button class="btn-icon btn-delete" onclick="deleteHabit(${habit.id})" style="width:30px;height:30px">
                <i class="fa-solid fa-trash" style="font-size:0.8rem"></i>
            </button>
        `;

        const container = document.createElement('div');
        container.className = 'heatmap-container';
        const grid = document.createElement('div');
        grid.className = 'heatmap-grid';

        dates.forEach(date => {
            const intensity = habit.logs[date] || 0;
            const dayCol = document.createElement('div');
            dayCol.className = 'heatmap-day';
            const dObj = new Date(date);
            const labelText = dObj.getDate();

            const cell = document.createElement('div');
            cell.className = 'heatmap-cell';
            cell.title = `${date}: Level ${intensity}`;

            if (intensity > 0) {
                const alpha = 0.2 + (intensity * 0.2);
                cell.style.backgroundColor = habit.color;
                cell.style.opacity = alpha;
                cell.style.boxShadow = `0 0 5px ${habit.color}`;
            }

            cell.onclick = () => toggleHabitIntensity(habit.id, date);
            dayCol.innerHTML = `<span class="day-label">${labelText}</span>`;
            dayCol.appendChild(cell);
            grid.appendChild(dayCol);
        });

        container.appendChild(grid);
        div.appendChild(header);
        div.appendChild(container);
        dom.habitsContainer.appendChild(div);
    });
}

function toggleHabitIntensity(habitId, date) {
    const habit = state.habits.find(h => h.id === habitId);
    if (!habit) return;

    let current = habit.logs[date] || 0;
    current = (current + 1) % 5;

    if (current === 0) delete habit.logs[date];
    else habit.logs[date] = current;

    saveData();
    renderHabits();
}

function deleteHabit(id) {
    if (!confirm('Delete this habit?')) return;
    state.habits = state.habits.filter(h => h.id !== id);
    saveData();
    renderHabits();
}


// 3. TIME LOG LOGIC


let todayChartInstance = null;

function addTimeLog() {
    if (!dom.logActivity || !dom.logDuration) return;
    const activity = dom.logActivity.value.trim();
    const duration = parseFloat(dom.logDuration.value);
    const color = dom.logColor ? dom.logColor.value : '#10b981';

    if (!activity || !duration || duration <= 0) return alert('Invalid input');

    const today = getLocalDate();
    if (!state.timeLogs[today]) state.timeLogs[today] = [];

    state.timeLogs[today].push({
        id: Date.now(),
        activity,
        duration,
        color
    });

    // Update daily minutes 
    const minutes = Math.round(duration * 60);
    if (!state.gamification.dailyMinutes[today]) {
        state.gamification.dailyMinutes[today] = 0;
    }
    state.gamification.dailyMinutes[today] += minutes;

    // Award XP
    awardXP(minutes);

    saveData();
    dom.logActivity.value = '';
    dom.logDuration.value = '';
    renderTimeLog();
}

function renderTimeLog() {
    if (!dom.todayLegend || !dom.todayChartCanvas) return;
    const today = getLocalDate();
    const logs = state.timeLogs[today] || [];

    const labels = logs.map(l => l.activity);
    const data = logs.map(l => l.duration);
    const colors = logs.map(l => l.color);

    if (todayChartInstance) {
        todayChartInstance.destroy();
        todayChartInstance = null;
    }

    if (logs.length === 0) {
        dom.todayLegend.innerHTML = '<p style="color:var(--text-secondary); padding:1rem;">No activities logged today.</p>';
        return;
    }

    const ctx = dom.todayChartCanvas.getContext('2d');
    todayChartInstance = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: colors,
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } }
        }
    });

    dom.todayLegend.innerHTML = logs.map(log => `
        <li class="legend-item">
            <span class="legend-color" style="background-color: ${log.color}"></span>
            ${escapeHtml(log.activity)} (${log.duration}h)
            <button onclick="deleteLog('${today}', ${log.id})" style="background:none;border:none;color:#ef4444;cursor:pointer;margin-left:5px;">×</button>
        </li>
    `).join('');
}

function deleteLog(date, id) {
    if (!state.timeLogs[date]) return;
    state.timeLogs[date] = state.timeLogs[date].filter(l => l.id !== id);
    if (state.timeLogs[date].length === 0) delete state.timeLogs[date];
    saveData();
    renderTimeLog();
}


// 4. HISTORY LOGIC


function renderHistory() {
    if (!dom.historyGrid) return;
    dom.historyGrid.innerHTML = '';
    const dates = Object.keys(state.timeLogs).sort().reverse();

    if (dates.length === 0) {
        dom.historyGrid.innerHTML = '<p style="grid-column:1/-1; text-align:center; color:var(--text-secondary)">No history available.</p>';
        return;
    }

    dates.forEach(date => {
        const logs = state.timeLogs[date];
        const canvasId = `chart-${date}`;

        const card = document.createElement('div');
        card.className = 'history-card';
        card.innerHTML = `
            <div class="history-date">${new Date(date).toDateString()}</div>
            <div style="height:150px; width:100%; position:relative;">
                <canvas id="${canvasId}"></canvas>
            </div>
            <div class="custom-legend" style="gap:0.5rem; margin-top:0.5rem; justify-content:center; font-size:0.8rem">
                ${logs.map(l => `<span style="color:${l.color}">${escapeHtml(l.activity)}</span>`).join(', ')}
            </div>
        `;
        dom.historyGrid.appendChild(card);

        setTimeout(() => {
            const ctx = document.getElementById(canvasId).getContext('2d');
            new Chart(ctx, {
                type: 'pie',
                data: {
                    labels: logs.map(l => l.activity),
                    datasets: [{
                        data: logs.map(l => l.duration),
                        backgroundColor: logs.map(l => l.color),
                        borderWidth: 0
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } }
                }
            });
        }, 0);
    });
}


// 5. GAMIFICATION LOGIC


function calculateMultiplier(streak) {
    if (streak < 3) return 1.0;
    if (streak < 7) return 1.2;
    // After 7 days: 1.4, then +0.2 every 4 days, caps at 3.0
    const extra = Math.floor((streak - 7) / 4) * 0.2;
    return Math.min(3.0, 1.4 + extra);
}

function awardXP(minutes) {
    const multiplier = calculateMultiplier(state.gamification.currentStreak);
    const xp = Math.floor(minutes * multiplier);
    state.gamification.totalXP += xp;

    // Check for daily bonus 
    const today = getLocalDate();
    const todayMinutes = state.gamification.dailyMinutes[today] || 0;

    // Only award bonus once per day 
    if (todayMinutes >= 300 && (todayMinutes - minutes) < 300) {
        state.gamification.totalXP += 100;
    }

    updateRank();
    saveData();
    updateGlobalStats();
}

function checkDailyStreak() {
    const today = getLocalDate();
    const yesterday = getYesterdayDate();

    const lastDate = state.gamification.lastStreakDate;
    const yesterdayMinutes = state.gamification.dailyMinutes[yesterday] || 0;


    if (lastDate === yesterday && yesterdayMinutes >= 300) {
        state.gamification.currentStreak++;
        state.gamification.lastStreakDate = today;
    } else if (lastDate !== today && lastDate !== yesterday) {
        // Streak broken (unless frozen)
        if (state.gamification.streakFreezes > 0) {
            state.gamification.streakFreezes--;
            // Don't increment streak,
        } else {
            state.gamification.currentStreak = 0;
        }
        state.gamification.lastStreakDate = today;
    }

    updateRank();
    saveData();
    updateGlobalStats();
}

function updateRank() {

    const rank = Math.min(15, Math.floor(state.gamification.currentStreak / 4));
    state.gamification.rank = rank;

    // Add badge 
    if (!state.gamification.badges.includes(rank) && rank >= 1) {
        state.gamification.badges.push(rank);
    }
}

function freezeStreak() {
    if (state.gamification.totalXP < 400) {
        return alert('Not enough XP! You need 400 XP.');
    }
    state.gamification.totalXP -= 400;
    state.gamification.streakFreezes++;
    saveData();
    renderProfile();
    alert('Streak freeze purchased! Your streak is protected for one day.');
}

function reduceStreakPenalty() {
    if (state.gamification.totalXP < 200) {
        return alert('Not enough XP! You need 200 XP.');
    }
    if (state.gamification.currentStreak <= 2) {
        return alert('Your streak is already too low to reduce.');
    }
    state.gamification.totalXP -= 200;
    state.gamification.currentStreak = Math.max(0, state.gamification.currentStreak - 2);
    saveData();
    renderProfile();
    alert('Penalty reduced! Your streak went back 2 days instead of resetting.');
}

function renderProfile() {
    if (!dom.currentRank) return;

    const g = state.gamification;
    const multiplier = calculateMultiplier(g.currentStreak);

    dom.currentRank.textContent = RANK_NAMES[g.rank - 1] || 'Rank 1';

    // Calculate days to next rank
    const currentRankDays = (g.rank - 1) * 4; // Days needed for current rank
    const nextRankDays = g.rank * 4; // Days needed for next rank
    const daysToNextRank = nextRankDays - g.currentStreak;

    if (g.rank < 15) {
        dom.streakDisplay.textContent = `Current Streak: ${g.currentStreak} days (${daysToNextRank} days to ${RANK_NAMES[g.rank]})`;
    } else {
        dom.streakDisplay.textContent = `Current Streak: ${g.currentStreak} days (Max Rank!)`;
    }

    dom.currentRank.textContent = RANK_NAMES[g.rank] || 'Rank 0';

    // Progress Bar: Days remaining to next rank
    const daysIntoRank = g.currentStreak % 4;
    const progressPercent = g.rank < 15 ? (daysIntoRank / 4) * 100 : 100;

    dom.xpFill.style.width = `${progressPercent}%`;

    if (g.rank < 15) {
        const nextRankName = RANK_NAMES[g.rank + 1] || `Rank ${g.rank + 1}`;
        dom.xpText.textContent = `${4 - daysIntoRank} days to ${nextRankName}`;
    } else {
        dom.xpText.textContent = `Max Rank Achieved!`;
    }

    updateGlobalStats();

    // Rank image placeholder
    if (dom.rankImage) {
        dom.rankImage.src = `images/ranks/rank_${g.rank}.png`;
        dom.rankImage.onerror = function () {
            this.style.display = 'none';
        };
    }

    // Render badges with streak requirement info
    if (dom.badgesGrid) {
        dom.badgesGrid.innerHTML = '';
        for (let i = 1; i <= 15; i++) {
            const badge = document.createElement('div');
            const earned = g.badges.includes(i);
            const streakRequired = i * 4; // Rank 1 = 4 days
            badge.className = `badge-item ${earned ? '' : 'locked'}`;
            badge.innerHTML = `<span>${i}</span>`;
            if (earned) {
                badge.title = `${RANK_NAMES[i]} - Earned for ${streakRequired}+ day streak!`;
            } else {
                badge.title = `${RANK_NAMES[i]} - Requires ${streakRequired} day streak`;
            }
            dom.badgesGrid.appendChild(badge);
        }
    }
}

// Utilities
function getLocalDate() {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function getYesterdayDate() {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.innerText = text;
    return div.innerHTML;
}


// Pomodoro Timer


// Timer quotes
function getTimerQuote() {
    const allQuotes = [...DEFAULT_QUOTES, ...state.userQuotes];
    state.timer.quoteIndex = (state.timer.quoteIndex + 1) % allQuotes.length;
    return allQuotes[state.timer.quoteIndex];
}

// Update timer quote
function updateTimerQuote() {
    if (dom.timerQuote) {
        dom.timerQuote.style.opacity = '0';
        setTimeout(() => {
            dom.timerQuote.textContent = getTimerQuote();
            dom.timerQuote.style.opacity = '1';
        }, 300);
    }
}

// Audio System
const audioController = {
    ctx: null,

    init() {
        if (!this.ctx) {
            try {
                this.ctx = new (window.AudioContext || window.webkitAudioContext)();
            } catch (e) {
                console.error('Audio API not supported');
            }
        }
    },

    play(type) {
        if (!this.ctx) this.init();
        if (!this.ctx) return;

        // Resume context if suspended (browser requirement)
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }

        try {
            const oscillator = this.ctx.createOscillator();
            const gainNode = this.ctx.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(this.ctx.destination);

            if (type === 'start') {
                oscillator.frequency.value = 523.25; // C5
                oscillator.type = 'sine';
                gainNode.gain.value = 0.3;
                oscillator.start();
                oscillator.stop(this.ctx.currentTime + 0.15);
            } else if (type === 'end') {
                // Play a cheerful completion sound
                oscillator.frequency.value = 659.25; // E5
                oscillator.type = 'sine';
                gainNode.gain.value = 0.3;
                oscillator.start();

                setTimeout(() => {
                    if (!this.ctx) return;
                    const osc2 = this.ctx.createOscillator();
                    const gain2 = this.ctx.createGain();
                    osc2.connect(gain2);
                    gain2.connect(this.ctx.destination);
                    osc2.frequency.value = 783.99; // G5
                    osc2.type = 'sine';
                    gain2.gain.value = 0.3;
                    osc2.start();
                    osc2.stop(this.ctx.currentTime + 0.2);
                }, 150);

                setTimeout(() => {
                    if (!this.ctx) return;
                    const osc3 = this.ctx.createOscillator();
                    const gain3 = this.ctx.createGain();
                    osc3.connect(gain3);
                    gain3.connect(this.ctx.destination);
                    osc3.frequency.value = 1046.50; // C6
                    osc3.type = 'sine';
                    gain3.gain.value = 0.3;
                    osc3.start();
                    osc3.stop(this.ctx.currentTime + 0.3);
                }, 300);

                oscillator.stop(this.ctx.currentTime + 0.15);
            }
        } catch (e) {
            console.error('Error playing sound:', e);
        }
    }
};

function playSound(type) {
    audioController.play(type);
}

function updateTimerDisplay() {
    const mins = Math.floor(state.timer.remainingSeconds / 60);
    const secs = state.timer.remainingSeconds % 60;

    if (dom.timerMinutes) dom.timerMinutes.textContent = mins.toString().padStart(2, '0');
    if (dom.timerSeconds) dom.timerSeconds.textContent = secs.toString().padStart(2, '0');

    // Update progress ring
    const circumference = 2 * Math.PI * 54; // r = 54
    const progress = state.timer.remainingSeconds / state.timer.totalSeconds;
    const offset = circumference * (1 - progress);

    if (dom.timerRingProgress) {
        dom.timerRingProgress.style.strokeDasharray = circumference;
        dom.timerRingProgress.style.strokeDashoffset = offset;
    }
}

function startTimer() {
    if (state.timer.isRunning) return;

    // Fresh start or resume
    if (state.timer.isPaused) {
        // Resume: Calculate new endTime based on remaining seconds
        state.timer.endTime = Date.now() + (state.timer.remainingSeconds * 1000);
        state.timer.isPaused = false;
    } else if (dom.timerDuration && !state.timer.isRunning) {
        // Fresh start
        const mins = parseInt(dom.timerDuration.value);
        state.timer.totalSeconds = mins * 60;
        state.timer.remainingSeconds = mins * 60;
        state.timer.endTime = Date.now() + (state.timer.totalSeconds * 1000);
        state.timer.lastQuoteMinute = mins;
        updateTimerQuote(); // Show first quote
    }

    state.timer.isRunning = true;
    saveData(); // Save state

    playSound('start');

    // Update button visibility
    if (dom.timerStart) dom.timerStart.style.display = 'none';
    if (dom.timerPause) dom.timerPause.style.display = 'flex';
    if (dom.timerDuration) dom.timerDuration.disabled = true;

    startTimerInterval();
}

function startTimerInterval() {
    if (state.timer.intervalId) clearInterval(state.timer.intervalId);

    updateTimerDisplay();

    state.timer.intervalId = setInterval(() => {
        const now = Date.now();
        const remaining = Math.ceil((state.timer.endTime - now) / 1000);
        state.timer.remainingSeconds = Math.max(0, remaining);

        updateTimerDisplay();

        // Cycle quote every minute
        const currentMinute = Math.floor(state.timer.remainingSeconds / 60);
        if (currentMinute !== state.timer.lastQuoteMinute && state.timer.remainingSeconds % 60 === 0) {
            state.timer.lastQuoteMinute = currentMinute;
            updateTimerQuote();
        }

        if (state.timer.remainingSeconds <= 0) {
            completeTimer();
        }
    }, 1000);
}

function pauseTimer() {
    if (!state.timer.isRunning) return;

    state.timer.isRunning = false;
    state.timer.isPaused = true;
    state.timer.endTime = null;

    if (state.timer.intervalId) {
        clearInterval(state.timer.intervalId);
        state.timer.intervalId = null;
    }

    saveData();

    // Update button visibility
    if (dom.timerStart) {
        dom.timerStart.style.display = 'flex';
        dom.timerStart.innerHTML = '<i class="fa-solid fa-play"></i> Resume';
    }
    if (dom.timerPause) dom.timerPause.style.display = 'none';
}

function resetTimer() {
    if (state.timer.intervalId) {
        clearInterval(state.timer.intervalId);
        state.timer.intervalId = null;
    }

    state.timer.isRunning = false;
    state.timer.isPaused = false;
    state.timer.endTime = null;

    // Get duration from select
    if (dom.timerDuration) {
        const mins = parseInt(dom.timerDuration.value);
        state.timer.totalSeconds = mins * 60;
        state.timer.remainingSeconds = mins * 60;
        dom.timerDuration.disabled = false;
    }

    saveData();

    // Update button visibility
    if (dom.timerStart) {
        dom.timerStart.style.display = 'flex';
        dom.timerStart.innerHTML = '<i class="fa-solid fa-play"></i> Start';
    }
    if (dom.timerPause) dom.timerPause.style.display = 'none';

    updateTimerDisplay();
}

function completeTimer() {
    if (state.timer.intervalId) {
        clearInterval(state.timer.intervalId);
        state.timer.intervalId = null;
    }

    state.timer.isRunning = false;
    state.timer.endTime = null;

    playSound('end');

    // Award XP and log time
    const minutesWorked = Math.round(state.timer.totalSeconds / 60);
    const today = getLocalDate();

    // Update daily minutes
    if (!state.gamification.dailyMinutes[today]) {
        state.gamification.dailyMinutes[today] = 0;
    }
    state.gamification.dailyMinutes[today] += minutesWorked;

    // Award XP
    awardXP(minutesWorked);

    // Log to time log
    if (!state.timeLogs[today]) state.timeLogs[today] = [];
    state.timeLogs[today].push({
        id: Date.now(),
        activity: 'Focus Session',
        duration: minutesWorked / 60, // Convert to hours
        color: '#a855f7' // Purple for Pomodoro sessions
    });

    saveData();

    alert(`🎉 Great work! You completed ${minutesWorked} minutes of focused work and earned ${Math.floor(minutesWorked * calculateMultiplier(state.gamification.currentStreak))} XP!`);

    resetTimer();
    renderProfile();
}

// Check for active timer on load
function checkActiveTimer() {
    if (state.timer.isRunning && state.timer.endTime) {
        const now = Date.now();
        const remaining = Math.ceil((state.timer.endTime - now) / 1000);

        if (remaining <= 0) {
            state.timer.remainingSeconds = 0;
            completeTimer();
        } else {
            state.timer.remainingSeconds = remaining;
            startTimerInterval();
            // UI state
            if (dom.timerStart) dom.timerStart.style.display = 'none';
            if (dom.timerPause) dom.timerPause.style.display = 'flex';
            if (dom.timerDuration) dom.timerDuration.disabled = true;
        }
    } else if (state.timer.isPaused) {
        // UI state for paused
        if (dom.timerStart) {
            dom.timerStart.style.display = 'flex';
            dom.timerStart.innerHTML = '<i class="fa-solid fa-play"></i> Resume';
        }
        if (dom.timerPause) dom.timerPause.style.display = 'none';
        updateTimerDisplay();
    }
}

// Timer event listeners setup
function setupTimerListeners() {
    if (dom.timerStart) dom.timerStart.addEventListener('click', startTimer);
    if (dom.timerPause) dom.timerPause.addEventListener('click', pauseTimer);
    if (dom.timerReset) dom.timerReset.addEventListener('click', resetTimer);

    if (dom.timerDuration) {
        dom.timerDuration.addEventListener('change', () => {
            if (!state.timer.isRunning && !state.timer.isPaused) {
                resetTimer();
            }
        });
    }
}

window.addTask = addTask;
window.completeTask = completeTask;
window.deleteTask = deleteTask;
window.addHabit = addHabit;
window.toggleHabitIntensity = toggleHabitIntensity;
window.deleteHabit = deleteHabit;
window.addTimeLog = addTimeLog;
window.deleteLog = deleteLog;
window.deleteQuote = deleteQuote;
window.freezeStreak = freezeStreak;
window.reduceStreakPenalty = reduceStreakPenalty;

init();
setupTimerListeners();
renderQuoteList();
