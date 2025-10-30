// 用户数据库 - 包含3个用户的完整信息
const USERS_DATABASE = {
    'fox123': {
        password: 'rochester2025',
        profile: {
            name: 'Fox',
            fullName: 'Fox Anderson',
            email: 'fox123@u.rochester.edu',
            netId: 'fox123',
            studentId: '12345678',
            avatar: '🦊',
            degree: 'B.S. Computer Science',
            year: 'Junior'
        },
        tasks: [
            { text: 'do the laundry', completed: false, date: '' },
            { text: 'Oct 2 CSC212: A4', completed: false, date: 'Oct 2' }
        ],
        history: [
            { text: 'Sep 25 CSC212: A3', date: 'Sep 25' },
            { text: 'Sep 11 CSC212: A2', date: 'Sep 11' }
        ],
        courses: [
            { code: 'CSC 254-01', name: 'Programming Language', time: '10 AM', days: ['Mon', 'Wed'], room: 'Wegmans Room 1400' },
            { code: 'CSC 245-01', name: 'Deep Learning', time: '10 AM', days: ['Tue', 'Thu'], room: 'Morey Room 321' },
            { code: 'CSC 212-1', name: 'Intro to HCI', time: '11 AM', days: ['Tue', 'Thu'], room: 'Hutchison Hall Room 473' },
            { code: 'EESC 213W-0', name: 'Environmental Science', time: '1 PM', days: ['Mon', 'Wed'], room: 'Meliora Room 221' },
            { code: 'JPNS 229', name: 'Japanese Literature', time: '2 PM', days: ['Fri'], room: 'Lechar Room' },
            { code: 'CSC 254-12', name: 'PL Lab', time: '3 PM', days: ['Wed'], room: 'Lattimore Room 431' }
        ],
        mailingList: {
            professors: [
                { course: 'CSC254', name: 'Michael Scott', email: 'mscott@acm.org' },
                { course: 'CSC212', name: 'Yukang Yan', email: 'yukang.yan@rochester.edu' },
                { course: 'CSC245', name: 'Chenliang Xu', email: 'chenliang.xu@rochester.edu' }
            ]
        },
        degreeProgress: {
            preMajor: { completed: 4, total: 4, done: true },
            core: { completed: 5, total: 6, done: false },
            math: { completed: 2, total: 2, done: true },
            advanced: { completed: 1, total: 4, done: false },
            writing: { completed: 1, total: 2, done: false }
        }
    },

    'bear456': {
        password: 'yellowjacket',
        profile: {
            name: 'Bear',
            fullName: 'Bear Thompson',
            email: 'bear456@u.rochester.edu',
            netId: 'bear456',
            studentId: '87654321',
            avatar: '🐻',
            degree: 'B.A. Mathematics',
            year: 'Senior'
        },
        tasks: [
            { text: 'Oct 5 MATH301: Final Project', completed: false, date: 'Oct 5' },
            { text: 'Study for midterm', completed: false, date: '' },
            { text: 'Meet with advisor', completed: false, date: 'Oct 3' }
        ],
        history: [
            { text: 'Sep 30 MATH250: Homework 5', date: 'Sep 30' },
            { text: 'Sep 20 STAT200: Quiz 2', date: 'Sep 20' }
        ],
        courses: [
            { code: 'MATH 301', name: 'Abstract Algebra', time: '9 AM', days: ['Mon', 'Wed', 'Fri'], room: 'Hylan 1106A' },
            { code: 'MATH 250', name: 'Real Analysis', time: '11 AM', days: ['Tue', 'Thu'], room: 'Hylan 1101' },
            { code: 'STAT 200', name: 'Probability Theory', time: '2 PM', days: ['Mon', 'Wed'], room: 'Hylan 1104' },
            { code: 'MATH 400', name: 'Senior Thesis', time: '3 PM', days: ['Fri'], room: 'Hylan Faculty Office' }
        ],
        mailingList: {
            professors: [
                { course: 'MATH301', name: 'Dr. Sarah Johnson', email: 'sjohnson@rochester.edu' },
                { course: 'MATH250', name: 'Dr. Robert Chen', email: 'rchen@math.rochester.edu' },
                { course: 'STAT200', name: 'Dr. Emily White', email: 'ewhite@rochester.edu' }
            ]
        },
        degreeProgress: {
            preMajor: { completed: 6, total: 6, done: true },
            core: { completed: 8, total: 8, done: true },
            math: { completed: 3, total: 3, done: true },
            advanced: { completed: 4, total: 4, done: true },
            writing: { completed: 2, total: 2, done: true }
        }
    },

    'cat789': {
        password: 'meowmeow123',
        profile: {
            name: 'Cat',
            fullName: 'Catherine Lee',
            email: 'cat789@u.rochester.edu',
            netId: 'cat789',
            studentId: '11223344',
            avatar: '🐱',
            degree: 'B.S. Biology',
            year: 'Sophomore'
        },
        tasks: [
            { text: 'Oct 1 BIO202: Lab Report', completed: false, date: 'Oct 1' },
            { text: 'Read Chapter 5-7', completed: false, date: '' },
            { text: 'Group meeting', completed: false, date: 'Oct 4' }
        ],
        history: [
            { text: 'Sep 28 BIO201: Exam 1', date: 'Sep 28' },
            { text: 'Sep 15 CHEM132: Lab Quiz', date: 'Sep 15' }
        ],
        courses: [
            { code: 'BIO 202', name: 'Cell Biology', time: '10 AM', days: ['Mon', 'Wed', 'Fri'], room: 'Hutchison 301' },
            { code: 'BIO 202L', name: 'Cell Bio Lab', time: '2 PM', days: ['Tue'], room: 'Hutchison Lab 201' },
            { code: 'CHEM 132', name: 'Organic Chemistry', time: '9 AM', days: ['Tue', 'Thu'], room: 'Hutchison 141' },
            { code: 'BCMB 220', name: 'Biochemistry', time: '1 PM', days: ['Mon', 'Wed'], room: 'Hutchison 475' },
            { code: 'BIO 250', name: 'Genetics', time: '11 AM', days: ['Tue', 'Thu'], room: 'Hutchison 402' }
        ],
        mailingList: {
            professors: [
                { course: 'BIO202', name: 'Dr. Maria Garcia', email: 'mgarcia@bio.rochester.edu' },
                { course: 'CHEM132', name: 'Dr. James Park', email: 'jpark@chem.rochester.edu' },
                { course: 'BCMB220', name: 'Dr. Lisa Wong', email: 'lwong@rochester.edu' }
            ]
        },
        degreeProgress: {
            preMajor: { completed: 4, total: 5, done: false },
            core: { completed: 3, total: 6, done: false },
            math: { completed: 2, total: 2, done: true },
            advanced: { completed: 0, total: 4, done: false },
            writing: { completed: 1, total: 2, done: false }
        }
    }
};

// 导出数据库
if (typeof module !== 'undefined' && module.exports) {
    module.exports = USERS_DATABASE;
}
