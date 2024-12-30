document.addEventListener('DOMContentLoaded', () => {
    let studyTime = document.getElementById('study-time');
    let breakTime = document.getElementById('break-time');
    let timerDisplay = document.getElementById('timer-display');
    let startButton = document.getElementById('start-timer');
    let startSound = document.getElementById('start-sound'); // Variabel untuk suara mulai (study time start)
    let stopSound = document.getElementById('stop-sound'); // Variabel untuk suara stop (break time begins)
    let interval;
    let isPaused = false; // Variabel untuk status jeda
    let isBreakTime = false; // Variabel untuk status istirahat
    let totalTime; // Variabel untuk total waktu

    // Memuat data dari localStorage
    if(localStorage.getItem('studyTime')) {
        studyTime.value = localStorage.getItem('studyTime');
    }
    if(localStorage.getItem('breakTime')) {
        breakTime.value = localStorage.getItem('breakTime');
    }
    if(localStorage.getItem('timer')) {
        totalTime = parseInt(localStorage.getItem('timer'));
        updateTimerDisplay(totalTime);
    }

    // Menambahkan ikon ke tombol
    startButton.innerHTML = '<i class="fas fa-play icon"></i>Start';

    function showNotification(message, sound) {
        const notification = document.getElementById('notification');
        notification.textContent = message;
        notification.classList.add('show');
        sound.play(); // Memutar suara notifikasi
        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000); // Menyembunyikan notifikasi setelah 3 detik
    }

    function updateTimerDisplay(totalTime) {
        let minutes = Math.floor(totalTime / 60);
        let seconds = totalTime % 60;
        timerDisplay.textContent = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    }

    function startTimer() {
        clearInterval(interval);
        totalTime = totalTime || (isBreakTime ? parseInt(breakTime.value) : parseInt(studyTime.value)) * 60;
        if (!isBreakTime) {
            showNotification("Learning time starts!", startSound); // Notifikasi dan suara saat waktu belajar dimulai
        } else {
            showNotification("Break time begins!", stopSound); // Notifikasi dan suara saat waktu istirahat dimulai
        }

        interval = setInterval(() => {
            if (totalTime <= 0) {
                clearInterval(interval);
                if (isBreakTime) {
                    timerDisplay.textContent = '00:00'; // Reset timer display
                    startButton.innerHTML = '<i class="fas fa-play icon"></i>Start'; // Ubah tombol kembali ke Start
                    isPaused = false; // Reset status jeda
                } else {
                    isBreakTime = true;
                    totalTime = parseInt(breakTime.value) * 60;
                    startTimer(); // Mulai timer istirahat
                }
                return;
            }
            updateTimerDisplay(totalTime);
            totalTime--;
            // Menyimpan waktu sisa ke localStorage
            localStorage.setItem('timer', totalTime);
        }, 1000);
        startButton.innerHTML = '<i class="fas fa-pause icon"></i>Pause'; // Ubah tombol saat mulai
    }

    startButton.addEventListener('click', () => {
        if (isPaused) {
            startTimer();
            isPaused = false;
            startButton.innerHTML = '<i class="fas fa-pause icon"></i>Pause'; // Ubah tombol saat dilanjutkan
        } else {
            if (interval) {
                clearInterval(interval);
                isPaused = true;
                startButton.innerHTML = '<i class="fas fa-play icon"></i>Start'; // Ubah tombol saat dijeda
                // Jangan memutar suara stop dan jangan tampilkan notifikasi
            } else {
                startTimer();
                startButton.innerHTML = '<i class="fas fa-pause icon"></i>Pause'; // Ubah tombol saat mulai
            }
        }
    });

    let newTaskInput = document.getElementById('new-task');
    let addTaskButton = document.getElementById('add-task');
    let tasksList = document.getElementById('tasks');

    // Menambahkan ikon ke tombol tambah tugas
    addTaskButton.innerHTML = '<i class="fas fa-plus icon"></i>Add';

    addTaskButton.addEventListener('click', () => {
        let taskText = newTaskInput.value.trim();
        if (taskText !== '') {
            let taskItem = document.createElement('li');

            let checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.className = 'checkbox';
            checkbox.addEventListener('change', () => {
                taskItem.classList.toggle('completed');
                saveTasks(); // Menyimpan tugas saat status berubah
            });
            taskItem.appendChild(checkbox);

            let taskSpan = document.createElement('span');
            taskSpan.textContent = taskText;
            taskItem.appendChild(taskSpan);

            let completeButton = document.createElement('button');
            completeButton.innerHTML = 'done';
            completeButton.className = 'complete-btn';
            completeButton.addEventListener('click', () => {
                taskSpan.classList.toggle('completed');
                saveTasks(); // Menyimpan tugas saat status berubah
            });
            taskItem.appendChild(completeButton);

            let deleteButton = document.createElement('button');
            deleteButton.innerHTML = '<i class="fas fa-trash-alt icon"></i>Delete';
            deleteButton.className = 'delete-btn';
            deleteButton.addEventListener('click', () => {
                tasksList.removeChild(taskItem);
                saveTasks(); // Menyimpan tugas setelah dihapus
            });
            taskItem.appendChild(deleteButton);

            tasksList.appendChild(taskItem);
            newTaskInput.value = '';
            saveTasks(); // Menyimpan tugas setelah ditambahkan
        }
    });

    // Menyimpan tugas ke localStorage
    function saveTasks() {
        const tasks = [];
        const taskItems = tasksList.querySelectorAll('li');
        taskItems.forEach(item => {
            tasks.push({
                text: item.querySelector('span').textContent,
                completed: item.classList.contains('completed')
            });
        });
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    // Memuat tugas dari localStorage
    function loadTasks() {
        const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        tasks.forEach(task => {
            let taskItem = document.createElement('li');

            let checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.className = 'checkbox';
            checkbox.checked = task.completed;
            taskItem.classList.toggle('completed', task.completed);
            taskItem.appendChild(checkbox);

            let taskSpan = document.createElement('span');
            taskSpan.textContent = task.text;
            taskItem.appendChild(taskSpan);

            let completeButton = document.createElement('button');
            completeButton.innerHTML = 'done';
            completeButton.className = 'complete-btn';
            completeButton.addEventListener('click', () => {
                taskSpan.classList.toggle('completed');
                saveTasks();
            });
            taskItem.appendChild(completeButton);

            let deleteButton = document.createElement('button');
            deleteButton.innerHTML = '<i class="fas fa-trash-alt icon"></i>Delete';
            deleteButton.className = 'delete-btn';
            deleteButton.addEventListener('click', () => {
                tasksList.removeChild(taskItem);
                saveTasks();
            });
            taskItem.appendChild(deleteButton);

            tasksList.appendChild(taskItem);
        });
    }

    // Memuat tugas saat halaman dimuat
    loadTasks();
});
