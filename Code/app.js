// Campus Assistant - Main Application Logic

// 用户数据全局变量
let currentUserData = null;
let currentUserNetId = null;

// ============================================
// 数据持久化函数 (支持数据库同步)
// ============================================

// 保存用户数据 (localStorage + 数据库双重保存)
async function saveUserData() {
    if (currentUserNetId && currentUserData) {
        // 1. 保存到 localStorage (本地备份)
        const storageKey = `campus_assistant_${currentUserNetId}`;
        localStorage.setItem(storageKey, JSON.stringify(currentUserData));

        // 2. 尝试保存到数据库 (云端同步)
        try {
            const success = await saveUserDataToDatabase(currentUserNetId, currentUserData);
            if (success) {
                console.log('✅ 数据已同步到云端数据库');
                return true;
            } else {
                console.log('⚠️ 云端同步失败，已保存到本地');
                return false;
            }
        } catch (e) {
            console.log('⚠️ 数据库不可用，已保存到本地');
            return false;
        }
    }
    return false;
}

// 从数据库或 localStorage 加载用户数据
async function loadUserDataFromStorage() {
    // 1. 尝试从数据库加载
    try {
        const cloudData = await getUserData(currentUserNetId);
        if (cloudData) {
            console.log('✅ 从云端数据库加载数据');
            currentUserData.tasks = cloudData.tasks || currentUserData.tasks;
            currentUserData.history = cloudData.history || currentUserData.history;
            currentUserData.mailingList = cloudData.mailingList || currentUserData.mailingList;
            currentUserData.degreeProgress = cloudData.degreeProgress || currentUserData.degreeProgress;
            currentUserData.courses = cloudData.courses || [];

            // 加载 profile（如果有更新）
            if (cloudData.profile) {
                currentUserData.profile = { ...currentUserData.profile, ...cloudData.profile };
            }
            return;
        }
    } catch (e) {
        console.log('⚠️ 云端加载失败，尝试从本地加载');
    }

    // 2. 如果数据库失败，从 localStorage 加载
    const storageKey = `campus_assistant_${currentUserNetId}`;
    const savedData = localStorage.getItem(storageKey);

    if (savedData) {
        try {
            const parsed = JSON.parse(savedData);
            currentUserData.tasks = parsed.tasks || currentUserData.tasks;
            currentUserData.history = parsed.history || currentUserData.history;
            currentUserData.mailingList = parsed.mailingList || currentUserData.mailingList;
            currentUserData.degreeProgress = parsed.degreeProgress || currentUserData.degreeProgress;
            currentUserData.courses = parsed.courses || [];

            // 加载 profile（如果有更新）
            if (parsed.profile) {
                currentUserData.profile = { ...currentUserData.profile, ...parsed.profile };
            }
            console.log('✅ 从本地缓存加载数据');
        } catch (e) {
            console.error('Error loading local data:', e);
        }
    }
}

// ============================================
// 用户认证和初始化
// ============================================

// 检查登录状态并加载用户数据
async function checkAuthAndLoadUser() {
    const userNetId = sessionStorage.getItem('currentUser');
    if (!userNetId) {
        window.location.href = 'index.html';
        return false;
    }

    currentUserNetId = userNetId;

    // 直接从后端 API 加载用户数据
    try {
        const userData = await getUserData(currentUserNetId);

        if (userData && userData.profile) {
            // 成功从服务器加载数据，确保所有字段存在
            currentUserData = {
                profile: userData.profile,
                tasks: userData.tasks || [],
                history: userData.history || [],
                courses: userData.courses || [],
                mailingList: userData.mailingList || {},
                degreeProgress: userData.degreeProgress || {}
            };
            console.log('✅ 从服务器加载用户数据', currentUserData);
        } else {
            // 如果服务器没有数据，尝试从 localStorage 加载
            const storageKey = `campus_assistant_${currentUserNetId}`;
            const savedData = localStorage.getItem(storageKey);

            if (savedData) {
                currentUserData = JSON.parse(savedData);
                console.log('⚠️ 从本地缓存加载数据');
            } else {
                // 如果都没有，显示错误并返回登录页
                alert('User data not found. Please log in again.');
                sessionStorage.clear();
                window.location.href = 'index.html';
                return false;
            }
        }
    } catch (error) {
        console.error('Error loading user data:', error);
        // 如果 API 失败，尝试从 localStorage 加载
        const storageKey = `campus_assistant_${currentUserNetId}`;
        const savedData = localStorage.getItem(storageKey);

        if (savedData) {
            currentUserData = JSON.parse(savedData);
            console.log('⚠️ API 失败，从本地缓存加载数据');
        } else {
            alert('Cannot load user data. Please check your connection and try again.');
            sessionStorage.clear();
            window.location.href = 'index.html';
            return false;
        }
    }

    // 确保 currentUserData 不为 null
    if (!currentUserData) {
        alert('Failed to load user data. Please try again.');
        sessionStorage.clear();
        window.location.href = 'index.html';
        return false;
    }

    // 更新页面上的用户信息
    updateUserInterface();
    return true;
}

// 更新界面上的所有用户信息
function updateUserInterface() {
    const profile = currentUserData.profile;

    // 更新所有头像
    document.querySelectorAll('.logo, .profile-popup-avatar, .profile-avatar, .tracker-avatar').forEach(el => {
        el.textContent = profile.avatar;
    });

    // 更新个人信息
    document.querySelectorAll('[data-user-name]').forEach(el => {
        el.textContent = profile.name;
    });
    document.querySelectorAll('[data-user-email]').forEach(el => {
        el.textContent = profile.email;
    });
    document.querySelectorAll('[data-user-studentid]').forEach(el => {
        el.textContent = profile.studentId;
    });

    // 加载数据
    loadUserTasks();
    loadUserMailingList();
    loadDegreeProgress();
    loadCourses();

    // 更新个人资料页面
    updateProfilePageDisplay();
}

// ============================================
// 任务管理
// ============================================

// 加载用户任务
function loadUserTasks() {
    const tasksContainer = document.getElementById('tasks-container');
    tasksContainer.innerHTML = '';

    // 显示所有未完成的任务
    currentUserData.tasks.forEach((task, index) => {
        if (!task.completed) {
            const taskItem = document.createElement('div');
            taskItem.className = 'task-item';
            taskItem.dataset.taskIndex = index;
            taskItem.innerHTML = `
                <div class="task-checkbox" onclick="completeTask(${index})"></div>
                <div class="task-text">${task.text}</div>
            `;
            tasksContainer.appendChild(taskItem);
        }
    });

    // 加载历史记录
    loadHistoryTasks();
}

// 加载历史任务
function loadHistoryTasks() {
    const historyContainer = document.querySelector('.history-container');
    const existingHistory = historyContainer.querySelectorAll('.task-item, .section-title');
    existingHistory.forEach(el => el.remove());

    // 添加 History 标题
    const titleDiv = document.createElement('div');
    titleDiv.className = 'section-title';
    titleDiv.textContent = 'History';
    historyContainer.appendChild(titleDiv);

    currentUserData.history.forEach((task, index) => {
        const taskItem = document.createElement('div');
        taskItem.className = 'task-item';
        taskItem.innerHTML = `
            <div class="task-checkbox completed" onclick="uncompleteTask(${index})" style="cursor: pointer;"></div>
            <div class="task-text completed">${task.text}</div>
        `;
        historyContainer.appendChild(taskItem);
    });
}

// 切换历史记录显示/隐藏
function toggleHistory() {
    console.log('toggleHistory called');
    const historySection = document.getElementById('history-section');
    const showMoreBtn = document.querySelector('.show-more');

    if (historySection.style.maxHeight === '0px' || !historySection.style.maxHeight) {
        historySection.style.maxHeight = '1000px';
        if (showMoreBtn) showMoreBtn.textContent = '----- Select to Hide-----';
        console.log('History expanded');
    } else {
        historySection.style.maxHeight = '0px';
        if (showMoreBtn) showMoreBtn.textContent = '----- Select to Show More-----';
        console.log('History collapsed');
    }
}

// 完成任务(移动到历史记录)
function completeTask(index) {
    console.log('completeTask called with index:', index);
    const task = currentUserData.tasks[index];
    console.log('Task to complete:', task);

    // 标记为完成
    task.completed = true;

    // 移动到历史记录
    currentUserData.history.unshift(task);

    // 从任务列表中移除
    currentUserData.tasks.splice(index, 1);

    // 保存数据
    saveUserData();

    // 重新加载任务列表
    loadUserTasks();
    console.log('Task completed and moved to history');
}

// 取消完成任务(从历史记录移回任务列表)
function uncompleteTask(index) {
    console.log('uncompleteTask called with index:', index);
    const task = currentUserData.history[index];
    console.log('Task to uncomplete:', task);

    // 标记为未完成
    task.completed = false;

    // 移回到任务列表
    currentUserData.tasks.push(task);

    // 从历史记录中移除
    currentUserData.history.splice(index, 1);

    // 保存数据
    saveUserData();

    // 重新加载任务列表
    loadUserTasks();
    console.log('Task uncompleted and moved back to tasks');
}

// 添加新任务
function addTask() {
    const taskDate = document.getElementById('taskDate').value;
    const taskName = document.getElementById('taskName').value;

    if (!taskName) {
        alert('Please enter a task name');
        return;
    }

    const taskText = taskDate ? `${formatDate(taskDate)} ${taskName}` : taskName;

    const newTask = {
        text: taskText,
        completed: false,
        date: taskDate || ''
    };

    currentUserData.tasks.push(newTask);
    saveUserData();
    loadUserTasks();
    closeModal();
}

// 格式化日期为英文
function formatDate(dateString) {
    const date = new Date(dateString);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = months[date.getMonth()];
    const day = date.getDate();
    return `${month} ${day}`;
}

// ============================================
// 邮件列表管理
// ============================================

// 加载用户邮件列表
function loadUserMailingList() {
    // 加载教授列表
    const professorsContainer = document.querySelector('.mailing-category .category-items');
    if (professorsContainer && currentUserData.mailingList) {
        professorsContainer.innerHTML = '';
        currentUserData.mailingList.professors.forEach(prof => {
            const item = document.createElement('div');
            item.className = 'category-item';
            item.innerHTML = `
                ${prof.course}&nbsp;&nbsp;&nbsp;&nbsp;${prof.name}&nbsp;&nbsp;&nbsp;&nbsp;<a href="mailto:${prof.email}" class="email-link">${prof.email}</a>
            `;
            professorsContainer.appendChild(item);
        });
    }

    // 加载其他分类
    loadMailingCategory('ta', currentUserData.mailingList.ta || []);
    loadMailingCategory('classmates', currentUserData.mailingList.classmates || []);
    loadMailingCategory('friends', currentUserData.mailingList.friends || []);
    loadMailingCategory('club', currentUserData.mailingList.club || []);
    loadMailingCategory('research', currentUserData.mailingList.research || []);
}

// 加载特定分类的联系人
function loadMailingCategory(category, contacts) {
    const categoryElement = document.querySelector(`[data-category="${category}"]`);
    if (!categoryElement) return;

    const itemsContainer = categoryElement.nextElementSibling;
    itemsContainer.innerHTML = '';

    contacts.forEach(contact => {
        const item = document.createElement('div');
        item.className = 'category-item';
        item.innerHTML = `
            ${contact.name}&nbsp;&nbsp;&nbsp;&nbsp;<a href="mailto:${contact.email}" class="email-link">${contact.email}</a>
        `;
        itemsContainer.appendChild(item);
    });
}

// 切换分类展开/收起
function toggleCategory(categoryName) {
    const header = document.querySelector(`[data-category="${categoryName}"]`);
    if (!header) return;

    const itemsContainer = header.nextElementSibling;
    const chevron = header.querySelector('.category-chevron');

    if (itemsContainer.style.maxHeight === '0px' || !itemsContainer.style.maxHeight) {
        itemsContainer.style.maxHeight = '500px';
        if (chevron) chevron.classList.add('open');
    } else {
        itemsContainer.style.maxHeight = '0px';
        if (chevron) chevron.classList.remove('open');
    }
}

// 添加联系人
function addContact() {
    const category = document.getElementById('contactCategory').value;
    const name = document.getElementById('contactName').value;
    const email = document.getElementById('contactEmail').value;
    const course = document.getElementById('contactCourse')?.value;

    if (!name || !email) {
        alert('Please fill in all required fields');
        return;
    }

    const newContact = { name, email };
    if (course) newContact.course = course;

    // 初始化分类(如果不存在)
    if (!currentUserData.mailingList[category]) {
        currentUserData.mailingList[category] = [];
    }

    currentUserData.mailingList[category].push(newContact);
    saveUserData();
    loadUserMailingList();
    closeAddContactModal();
}

// ============================================
// 学位进度追踪
// ============================================

// 加载学位进度
function loadDegreeProgress() {
    // 确保 degreeProgress 对象存在
    if (!currentUserData.degreeProgress) {
        currentUserData.degreeProgress = {};
    }

    const progress = currentUserData.degreeProgress;
    const checkboxStates = progress.checkboxStates || {};

    // 加载课程复选框状态（优先从数据库，否则从 localStorage）
    document.querySelectorAll('.requirement-item input[type="checkbox"]').forEach(checkbox => {
        const courseId = checkbox.id;

        // 优先从数据库加载
        if (checkboxStates.hasOwnProperty(courseId)) {
            checkbox.checked = checkboxStates[courseId];
            console.log(`从数据库加载 ${courseId}: ${checkbox.checked}`);
        } else {
            // 否则从 localStorage 加载
            const savedState = localStorage.getItem(`${currentUserNetId}_${courseId}`);
            if (savedState === 'true') {
                checkbox.checked = true;
                console.log(`从本地加载 ${courseId}: true`);
            }
        }
    });

    // 重新计算每个类别的进度
    ['premajor', 'core', 'math', 'advanced', 'writing'].forEach(category => {
        const categoryCheckboxes = document.querySelectorAll(`[data-category-type="${category}"] input[type="checkbox"]`);
        let completed = 0;
        let total = categoryCheckboxes.length;

        categoryCheckboxes.forEach(cb => {
            if (cb.checked) completed++;
        });

        const progressKey = getCategoryKey(category);

        // 更新进度数据
        if (total > 0) {
            progress[progressKey] = {
                completed: completed,
                total: total,
                done: (completed === total)
            };
        }

        console.log(`${category} 进度: ${completed}/${total}`);

        // 更新显示
        updateProgressSummary(category, progress[progressKey]);
    });
}

// 更新进度摘要
function updateProgressSummary(category, progress) {
    const summaryElement = document.querySelector(`[data-progress="${category}"]`);
    if (!summaryElement) return;

    // 如果 progress 不存在，初始化为 0/0
    if (!progress) {
        summaryElement.textContent = '0/0';
        return;
    }

    // 如果完成度达到 100%，显示 ✓
    if (progress.done || (progress.completed === progress.total && progress.total > 0)) {
        summaryElement.innerHTML = '<span class="complete">✓</span>';
    } else {
        summaryElement.textContent = `${progress.completed}/${progress.total}`;
    }
}

// 课程复选框变化时更新进度
function updateCourseProgress(checkbox, category) {
    console.log('updateCourseProgress called:', checkbox.id, category, checkbox.checked);

    // 保存复选框状态到 localStorage（本地备份）
    localStorage.setItem(`${currentUserNetId}_${checkbox.id}`, checkbox.checked);

    // 确保 degreeProgress 对象和 checkboxStates 存在
    if (!currentUserData.degreeProgress) {
        currentUserData.degreeProgress = {};
    }
    if (!currentUserData.degreeProgress.checkboxStates) {
        currentUserData.degreeProgress.checkboxStates = {};
    }

    // 保存复选框状态到数据对象（用于数据库同步）
    currentUserData.degreeProgress.checkboxStates[checkbox.id] = checkbox.checked;

    // 重新计算该类别的进度
    const categoryCheckboxes = document.querySelectorAll(`[data-category-type="${category}"] input[type="checkbox"]`);
    let completed = 0;
    let total = categoryCheckboxes.length;

    categoryCheckboxes.forEach(cb => {
        if (cb.checked) completed++;
    });

    console.log(`Category ${category}: ${completed}/${total}`);

    // 更新数据
    const progressKey = getCategoryKey(category);

    // 初始化或更新该类别的进度
    currentUserData.degreeProgress[progressKey] = {
        completed: completed,
        total: total,
        done: (completed === total && total > 0)
    };

    console.log(`Updated ${progressKey}:`, currentUserData.degreeProgress[progressKey]);

    // 保存并更新显示
    saveUserData();

    // 立即更新摘要显示
    updateProgressSummary(category, currentUserData.degreeProgress[progressKey]);

    console.log('Progress updated and saved');
}

// 获取分类键名
function getCategoryKey(category) {
    const keyMap = {
        'premajor': 'preMajor',
        'core': 'core',
        'math': 'math',
        'advanced': 'advanced',
        'writing': 'writing'
    };
    return keyMap[category] || category;
}

// ============================================
// UI 交互函数
// ============================================

// Toggle profile popup
function toggleProfilePopup() {
    const popup = document.getElementById('profilePopup');
    popup.classList.toggle('show');
}

// Show page
function showPage(pageName) {
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    document.getElementById('page-' + pageName).classList.add('active');
    document.getElementById('profilePopup').classList.remove('show');
}

// Sign out
function signOut() {
    sessionStorage.clear();
    window.location.href = 'index.html';
}

// Toggle submenu
function toggleSubmenu(menuId) {
    const submenu = document.getElementById(`submenu-${menuId}`);
    const chevron = document.getElementById(`chevron-${menuId}`);
    submenu.classList.toggle('open');
    chevron.classList.toggle('open');
}

// Open/Close modals
function openModal() {
    document.getElementById('taskModal').classList.add('show');
}

function closeModal() {
    document.getElementById('taskModal').classList.remove('show');
    document.getElementById('taskDate').value = '';
    document.getElementById('taskName').value = '';
}

function openAddContactModal() {
    document.getElementById('addContactModal').classList.add('show');
}

function closeAddContactModal() {
    document.getElementById('addContactModal').classList.remove('show');
    document.getElementById('contactName').value = '';
    document.getElementById('contactEmail').value = '';
    if (document.getElementById('contactCourse')) {
        document.getElementById('contactCourse').value = '';
    }
}

// ============================================
// 事件监听器
// ============================================

// 页面加载时初始化
window.addEventListener('DOMContentLoaded', async function() {
    console.log('DOMContentLoaded - app.js v5 loaded (Database Edition)');
    if (await checkAuthAndLoadUser()) {
        console.log('User authenticated and loaded');
        // 设置事件监听器
        setupEventListeners();
    }
});

function setupEventListeners() {
    // 点击外部关闭弹窗
    document.addEventListener('click', function(e) {
        const popup = document.getElementById('profilePopup');
        const logo = document.querySelector('.logo');
        if (popup && !popup.contains(e.target) && !logo.contains(e.target)) {
            popup.classList.remove('show');
        }
    });

    // 任务模态框外部点击
    const taskModal = document.getElementById('taskModal');
    if (taskModal) {
        taskModal.addEventListener('click', function(e) {
            if (e.target === this) closeModal();
        });
    }

    // 添加联系人模态框外部点击
    const contactModal = document.getElementById('addContactModal');
    if (contactModal) {
        contactModal.addEventListener('click', function(e) {
            if (e.target === this) closeAddContactModal();
        });
    }

    // Enter 键提交
    const taskNameInput = document.getElementById('taskName');
    if (taskNameInput) {
        taskNameInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') addTask();
        });
    }
}

// ============================================
// 个人资料编辑功能
// ============================================

let selectedAvatar = null;

// 打开编辑资料弹窗
function openEditProfileModal() {
    const modal = document.getElementById('editProfileModal');
    if (!modal) return;

    // 检查 currentUserData 是否存在
    if (!currentUserData || !currentUserData.profile) {
        alert('User data not loaded. Please refresh the page.');
        return;
    }

    // 填充当前信息
    const profile = currentUserData.profile;
    document.getElementById('editProfileName').value = profile.name || '';
    document.getElementById('editProfileEmail').value = profile.email || '';

    // 清空密码字段
    document.getElementById('editCurrentPassword').value = '';
    document.getElementById('editNewPassword').value = '';
    document.getElementById('editConfirmPassword').value = '';

    // 选中当前头像
    selectedAvatar = profile.avatar;
    document.querySelectorAll('.avatar-option').forEach(btn => {
        btn.classList.remove('selected');
        if (btn.dataset.avatar === selectedAvatar) {
            btn.classList.add('selected');
        }
    });

    modal.style.display = 'flex';
}

// 关闭编辑资料弹窗
function closeEditProfileModal() {
    const modal = document.getElementById('editProfileModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// 选择头像
function selectAvatar(avatar) {
    selectedAvatar = avatar;
    document.querySelectorAll('.avatar-option').forEach(btn => {
        btn.classList.remove('selected');
        if (btn.dataset.avatar === avatar) {
            btn.classList.add('selected');
        }
    });
}

// 保存资料修改
async function saveProfileChanges() {
    const newName = document.getElementById('editProfileName').value.trim();
    const newEmail = document.getElementById('editProfileEmail').value.trim();
    const currentPassword = document.getElementById('editCurrentPassword').value;
    const newPassword = document.getElementById('editNewPassword').value;
    const confirmPassword = document.getElementById('editConfirmPassword').value;

    // 验证必填字段
    if (!newName) {
        alert('Please enter your name');
        return;
    }

    if (!newEmail) {
        alert('Please enter your email');
        return;
    }

    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
        alert('Please enter a valid email address');
        return;
    }

    // 如果要修改密码，验证密码字段
    if (currentPassword || newPassword || confirmPassword) {
        // 验证新密码
        if (!newPassword) {
            alert('Please enter new password');
            return;
        }

        if (newPassword.length < 6) {
            alert('New password must be at least 6 characters');
            return;
        }

        if (newPassword !== confirmPassword) {
            alert('New passwords do not match');
            return;
        }

        if (!currentPassword) {
            alert('Please enter your current password to change password');
            return;
        }

        // 通过后端 API 更新密码
        try {
            const response = await fetch('http://localhost:8000/api/user/password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    netId: currentUserNetId,
                    currentPassword: currentPassword,
                    newPassword: newPassword
                })
            });

            const result = await response.json();
            if (!result.success) {
                alert('Failed to update password: ' + (result.error || 'Unknown error'));
                return;
            }

            alert('Password updated successfully!');
        } catch (error) {
            console.error('Password update error:', error);
            alert('Failed to update password. Please try again.');
            return;
        }
    }

    // 更新个人资料
    currentUserData.profile.name = newName;
    currentUserData.profile.fullName = newName; // 同时更新 fullName
    currentUserData.profile.email = newEmail;
    if (selectedAvatar) {
        currentUserData.profile.avatar = selectedAvatar;
    }

    // 保存到数据库
    const saved = await saveUserData();

    if (!saved) {
        alert('Failed to save profile. Please try again.');
        return;
    }

    // 更新界面显示
    updateUserInterface();

    // 关闭弹窗
    closeEditProfileModal();

    alert('Profile updated successfully!');
}

// 更新个人资料页面显示
function updateProfilePageDisplay() {
    const profile = currentUserData.profile;

    // 更新 profile page 中的信息
    const profileNameEl = document.querySelector('[data-profile-name]');
    const profileEmailEl = document.querySelector('[data-profile-email]');
    const profileNetIdEl = document.querySelector('[data-profile-netid]');
    const profileStudentIdEl = document.querySelector('[data-profile-studentid]');
    const profileAvatarEl = document.querySelector('[data-user-avatar]');

    if (profileNameEl) profileNameEl.textContent = profile.name;
    if (profileEmailEl) profileEmailEl.textContent = profile.email;
    if (profileNetIdEl) profileNetIdEl.textContent = currentUserNetId;
    if (profileStudentIdEl) profileStudentIdEl.textContent = profile.studentId;
    if (profileAvatarEl) profileAvatarEl.textContent = profile.avatar;
}

// ============================================
// 课程日历功能
// ============================================

// 生成日历
function renderCourseCalendar() {
    const calendar = document.getElementById('courseCalendar');
    if (!calendar) return;

    // 确保 courses 存在
    if (!currentUserData.courses) {
        currentUserData.courses = [];
    }

    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const times = [9, 10, 11, 12, 13, 14, 15, 16, 17];

    let html = '<div style="display: grid; grid-template-columns: 80px repeat(7, 1fr);">';

    // Header row
    html += '<div></div>';
    days.forEach(day => {
        html += `<div class="calendar-header">${day}</div>`;
    });
    html += '</div>';

    // Time rows
    times.forEach(time => {
        html += '<div class="calendar-time-slot">';
        html += `<div class="time-label">${time <= 12 ? time : time - 12} ${time < 12 ? 'AM' : 'PM'}</div>`;

        // Cells for each day
        for (let day = 0; day < 7; day++) {
            const timeMinutes = time * 60; // 当前行的时间（分钟）

            // 找出在这个时间段内开始的课程
            const coursesStartingHere = currentUserData.courses.filter(c => {
                const startMinutes = parseTimeToMinutes(c.startTime);
                const endMinutes = parseTimeToMinutes(c.endTime);
                const startHour = Math.floor(startMinutes / 60);

                // 课程在这一天，且开始时间在这个小时
                return c.day === day && startHour === time;
            });

            html += `<div class="calendar-cell" onclick="showCourseOptions(${day}, ${time})" style="cursor: pointer; position: relative; height: 60px;">`;

            coursesStartingHere.forEach(course => {
                const startMinutes = parseTimeToMinutes(course.startTime);
                const endMinutes = parseTimeToMinutes(course.endTime);
                const durationMinutes = endMinutes - startMinutes;

                // 计算课程在单元格内的偏移和高度
                const startHour = Math.floor(startMinutes / 60);
                const minuteOffset = startMinutes - (startHour * 60); // 分钟偏移（0-55）
                const topOffset = (minuteOffset / 60) * 60; // 转换为像素（60px/小时）
                const heightPx = (durationMinutes / 60) * 60; // 高度（像素）

                const endTimeStr = course.endTime || minutesToTimeString(startMinutes + 60);

                html += `<div class="class-event"
                    style="height: ${heightPx}px; position: absolute; top: ${topOffset}px; left: 2px; right: 2px; z-index: 10; background-color: #E8ECFF; padding: 8px; border-radius: 5px; overflow: hidden;"
                    onclick="event.stopPropagation(); editCourse('${course.id}')">
                    <strong>${course.name}</strong><br>
                    <small>${course.location}</small><br>
                    <small>${formatTime(course.startTime)} - ${formatTime(endTimeStr)}</small>
                    <span style="cursor: pointer; position: absolute; top: 5px; right: 5px; font-weight: bold; color: #999;"
                        onclick="event.stopPropagation(); deleteCourse('${course.id}')">×</span>
                </div>`;
            });

            html += '</div>';
        }

        html += '</div>';
    });

    calendar.innerHTML = html;
}

// 格式化时间显示（支持分钟）
function formatTime(timeValue) {
    // 支持两种格式：
    // 1. 数字：小时数（兼容旧数据）
    // 2. 对象：{hour: 11, minute: 5}
    // 3. 字符串："11:05"

    let hour, minute;

    if (typeof timeValue === 'number') {
        // 旧格式：纯小时数
        hour = timeValue;
        minute = 0;
    } else if (typeof timeValue === 'object' && timeValue !== null) {
        // 新格式：对象
        hour = timeValue.hour;
        minute = timeValue.minute || 0;
    } else if (typeof timeValue === 'string') {
        // 字符串格式 "11:05"
        const parts = timeValue.split(':');
        hour = parseInt(parts[0]);
        minute = parseInt(parts[1] || 0);
    } else {
        return '';
    }

    const minuteStr = minute.toString().padStart(2, '0');

    if (hour < 12) {
        return `${hour}:${minuteStr} AM`;
    } else if (hour === 12) {
        return `12:${minuteStr} PM`;
    } else {
        return `${hour - 12}:${minuteStr} PM`;
    }
}

// 生成时间选项（5分钟间隔，从9:00 AM到6:00 PM）
function generateTimeOptions() {
    const options = [];
    for (let hour = 9; hour <= 18; hour++) {
        for (let minute = 0; minute < 60; minute += 5) {
            const timeValue = `${hour}:${minute.toString().padStart(2, '0')}`;
            const displayText = formatTime({hour, minute});
            options.push({value: timeValue, text: displayText});
        }
    }
    return options;
}

// 填充时间下拉框
function populateTimeSelects() {
    const startTimeSelect = document.getElementById('courseStartTime');
    const endTimeSelect = document.getElementById('courseEndTime');

    if (!startTimeSelect || !endTimeSelect) return;

    const options = generateTimeOptions();

    // 清空现有选项
    startTimeSelect.innerHTML = '';
    endTimeSelect.innerHTML = '';

    // 添加选项
    options.forEach(opt => {
        const option1 = document.createElement('option');
        option1.value = opt.value;
        option1.textContent = opt.text;
        startTimeSelect.appendChild(option1);

        const option2 = document.createElement('option');
        option2.value = opt.value;
        option2.textContent = opt.text;
        endTimeSelect.appendChild(option2);
    });

    // 设置默认值
    startTimeSelect.value = '10:00';
    endTimeSelect.value = '11:00';
}

// 解析时间字符串为分钟数（从午夜开始）
function parseTimeToMinutes(timeValue) {
    if (typeof timeValue === 'number') {
        // 旧格式：纯小时数
        return timeValue * 60;
    } else if (typeof timeValue === 'string') {
        // 新格式："11:05"
        const parts = timeValue.split(':');
        const hour = parseInt(parts[0]);
        const minute = parseInt(parts[1] || 0);
        return hour * 60 + minute;
    } else if (typeof timeValue === 'object' && timeValue !== null) {
        // 对象格式
        return timeValue.hour * 60 + (timeValue.minute || 0);
    }
    return 0;
}

// 将分钟数转换为时间字符串
function minutesToTimeString(minutes) {
    const hour = Math.floor(minutes / 60);
    const minute = minutes % 60;
    return `${hour}:${minute.toString().padStart(2, '0')}`;
}

// 打开添加课程弹窗
function openAddCourseModal() {
    const modal = document.getElementById('addCourseModal');
    if (modal) {
        // 填充时间选项
        populateTimeSelects();

        // 清空表单
        document.getElementById('courseName').value = '';
        document.getElementById('courseLocation').value = '';
        document.getElementById('courseDay').value = '1';
        document.getElementById('courseStartTime').value = '10:00';
        document.getElementById('courseEndTime').value = '11:00';
        modal.style.display = 'flex';
    }
}

// 关闭添加课程弹窗
function closeAddCourseModal() {
    const modal = document.getElementById('addCourseModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// 保存课程
async function saveCourse() {
    const name = document.getElementById('courseName').value.trim();
    const location = document.getElementById('courseLocation').value.trim();
    const day = parseInt(document.getElementById('courseDay').value);
    const startTimeStr = document.getElementById('courseStartTime').value;
    const endTimeStr = document.getElementById('courseEndTime').value;

    if (!name) {
        alert('Please enter course name');
        return;
    }

    if (!location) {
        alert('Please enter location');
        return;
    }

    // 解析时间为分钟数
    const startMinutes = parseTimeToMinutes(startTimeStr);
    const endMinutes = parseTimeToMinutes(endTimeStr);

    // 验证结束时间必须大于开始时间
    if (endMinutes <= startMinutes) {
        alert('End time must be after start time');
        return;
    }

    // 创建新课程（使用字符串格式存储时间）
    const newCourse = {
        id: Date.now().toString(),
        name: name,
        location: location,
        day: day,
        startTime: startTimeStr,
        endTime: endTimeStr,
        duration: endMinutes - startMinutes
    };

    // 添加到课程列表
    if (!currentUserData.courses) {
        currentUserData.courses = [];
    }
    currentUserData.courses.push(newCourse);

    // 保存到数据库
    await saveUserData();

    // 重新渲染日历
    renderCourseCalendar();

    // 关闭弹窗
    closeAddCourseModal();

    console.log('Course added:', newCourse);
}

// 显示课程选项（点击空白格子）
function showCourseOptions(day, time) {
    openAddCourseModal();
    document.getElementById('courseDay').value = day;
    document.getElementById('courseStartTime').value = `${time}:00`;
    document.getElementById('courseEndTime').value = `${time + 1}:00`;
}

// 编辑课程
function editCourse(courseId) {
    const course = currentUserData.courses.find(c => c.id === courseId);
    if (!course) return;

    // 打开弹窗并填充时间选项
    openAddCourseModal();

    // 填充表单
    document.getElementById('courseName').value = course.name;
    document.getElementById('courseLocation').value = course.location;
    document.getElementById('courseDay').value = course.day;

    // 处理时间格式（兼容旧数据）
    let startTimeValue = course.startTime;
    let endTimeValue = course.endTime;

    if (typeof startTimeValue === 'number') {
        startTimeValue = `${startTimeValue}:00`;
    }
    if (typeof endTimeValue === 'number') {
        endTimeValue = `${endTimeValue}:00`;
    } else if (!endTimeValue && typeof course.startTime === 'number') {
        endTimeValue = `${course.startTime + 1}:00`;
    }

    document.getElementById('courseStartTime').value = startTimeValue;
    document.getElementById('courseEndTime').value = endTimeValue;

    // 删除旧课程
    currentUserData.courses = currentUserData.courses.filter(c => c.id !== courseId);
}

// 删除课程
async function deleteCourse(courseId) {
    if (!confirm('Are you sure you want to delete this course?')) {
        return;
    }

    // 删除课程
    currentUserData.courses = currentUserData.courses.filter(c => c.id !== courseId);

    // 保存到数据库
    await saveUserData();

    // 重新渲染日历
    renderCourseCalendar();

    console.log('Course deleted:', courseId);
}

// 加载课程数据
function loadCourses() {
    // 课程数据会在 loadUserDataFromStorage() 中自动加载
    renderCourseCalendar();
}
