/**
 * UR Life API Helper
 * 提供与后端数据库交互的功能
 */

const API_BASE_URL = 'http://localhost:8000/api';

/**
 * 用户登录验证
 * @param {string} netId - 用户 Net ID
 * @param {string} password - 密码
 * @returns {Promise<Object>} 登录结果
 */
async function loginUser(netId, password) {
    try {
        const response = await fetch(`${API_BASE_URL}/login?netId=${netId}&password=${password}`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Login error:', error);
        return { success: false, error: 'Network error' };
    }
}

/**
 * 获取用户数据
 * @param {string} netId - 用户 Net ID
 * @returns {Promise<Object>} 用户数据
 */
async function getUserData(netId) {
    try {
        const response = await fetch(`${API_BASE_URL}/user?netId=${netId}`);
        if (response.ok) {
            return await response.json();
        } else {
            console.error('Failed to fetch user data');
            return null;
        }
    } catch (error) {
        console.error('Get user data error:', error);
        return null;
    }
}

/**
 * 保存用户数据到数据库
 * @param {string} netId - 用户 Net ID
 * @param {Object} userData - 用户数据对象
 * @returns {Promise<boolean>} 保存是否成功
 */
async function saveUserDataToDatabase(netId, userData) {
    try {
        const response = await fetch(`${API_BASE_URL}/user/save`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                netId: netId,
                data: {
                    tasks: userData.tasks || [],
                    history: userData.history || [],
                    mailingList: userData.mailingList || {},
                    degreeProgress: userData.degreeProgress || {},
                    profile: userData.profile || {},
                    courses: userData.courses || []
                }
            })
        });

        const result = await response.json();
        return result.success === true;
    } catch (error) {
        console.error('Save user data error:', error);
        return false;
    }
}

/**
 * 自动保存用户数据（替换原来的 saveUserData）
 * 会同时保存到 localStorage（离线备份）和数据库（云端同步）
 */
async function saveUserDataWithSync() {
    if (currentUserNetId && currentUserData) {
        // 1. 保存到 localStorage（离线备份）
        const storageKey = `campus_assistant_${currentUserNetId}`;
        localStorage.setItem(storageKey, JSON.stringify(currentUserData));

        // 2. 保存到数据库（云端同步）
        const success = await saveUserDataToDatabase(currentUserNetId, currentUserData);

        if (success) {
            console.log('✅ 数据已同步到云端数据库');
        } else {
            console.log('⚠️ 云端同步失败，已保存到本地');
        }
    }
}

/**
 * 加载用户数据（优先从数据库，失败则用 localStorage）
 */
async function loadUserDataWithSync() {
    // 1. 尝试从数据库加载
    const cloudData = await getUserData(currentUserNetId);

    if (cloudData) {
        console.log('✅ 从云端数据库加载数据');
        currentUserData.tasks = cloudData.tasks || currentUserData.tasks;
        currentUserData.history = cloudData.history || currentUserData.history;
        currentUserData.mailingList = cloudData.mailingList || currentUserData.mailingList;
        currentUserData.degreeProgress = cloudData.degreeProgress || currentUserData.degreeProgress;
        return;
    }

    // 2. 如果数据库失败，从 localStorage 加载
    console.log('⚠️ 云端加载失败，从本地缓存加载');
    const storageKey = `campus_assistant_${currentUserNetId}`;
    const savedData = localStorage.getItem(storageKey);

    if (savedData) {
        try {
            const parsed = JSON.parse(savedData);
            currentUserData.tasks = parsed.tasks || currentUserData.tasks;
            currentUserData.history = parsed.history || currentUserData.history;
            currentUserData.mailingList = parsed.mailingList || currentUserData.mailingList;
            currentUserData.degreeProgress = parsed.degreeProgress || currentUserData.degreeProgress;
        } catch (e) {
            console.error('Error loading local data:', e);
        }
    }
}
