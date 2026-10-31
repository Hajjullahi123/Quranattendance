import { INITIAL_DATA } from './initial-data.js';

const STORAGE_KEY = 'NOOR_AL_QURAN_DATA_V2';
const AUTH_USER_KEY = 'NOOR_AUTH_USER_V2';
const TENANT_KEY = 'NOOR_ACTIVE_TENANT_V2';

export class AppStorage {
  static load() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.students && parsed.schools && parsed.users) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to parse stored data, re-initializing multi-tenant seed data', e);
    }
    const fresh = JSON.parse(JSON.stringify(INITIAL_DATA));
    this.save(fresh);
    return fresh;
  }

  static save(data) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      window.dispatchEvent(new CustomEvent('noor-data-changed', { detail: data }));
    } catch (e) {
      console.error('LocalStorage save error:', e);
    }
  }

  static reset() {
    const fresh = JSON.parse(JSON.stringify(INITIAL_DATA));
    this.save(fresh);
    this.logout();
    return fresh;
  }

  static clearDemoData() {
    const data = this.load();
    const tenantId = this.getCurrentTenantId();
    // Keep only the active admin user and the school definition
    data.students = (data.students || []).filter(s => s.schoolId !== tenantId);
    data.attendance = (data.attendance || []).filter(a => a.schoolId !== tenantId);
    data.hifzRecords = (data.hifzRecords || []).filter(h => h.schoolId !== tenantId);
    data.targets = (data.targets || []).filter(t => t.schoolId !== tenantId);
    // Keep only admin users for this tenant
    data.users = (data.users || []).filter(u => u.schoolId !== tenantId || u.role === 'admin');
    data.teachers = (data.teachers || []).filter(t => t.schoolId !== tenantId);
    this.save(data);
    return data;
  }

  static exportJSON() {
    const data = this.load();
    return JSON.stringify(data, null, 2);
  }

  static importJSON(jsonStr) {
    try {
      const parsed = JSON.parse(jsonStr);
      if (!parsed.students || !parsed.schools || !parsed.users) {
        throw new Error('Invalid data schema: Missing required multi-tenant entities.');
      }
      this.save(parsed);
      return { success: true, message: 'Academy database imported successfully!' };
    } catch (e) {
      return { success: false, message: e.message || 'Invalid JSON file.' };
    }
  }

  // --- Multi-Tenant Methods ---
  static getSchools() {
    return this.load().schools || [];
  }

  static getCurrentTenantId() {
    const stored = localStorage.getItem(TENANT_KEY);
    if (stored) return stored;
    const defaultId = (this.getSchools()[0] || {}).id || 'school-1';
    this.setCurrentTenantId(defaultId);
    return defaultId;
  }

  static setCurrentTenantId(tenantId) {
    localStorage.setItem(TENANT_KEY, tenantId);
    window.dispatchEvent(new CustomEvent('noor-tenant-changed', { detail: tenantId }));
  }

  static getCurrentSchool() {
    const tenantId = this.getCurrentTenantId();
    return this.getSchools().find(s => s.id === tenantId) || this.getSchools()[0];
  }

  // --- Authentication & Session Methods ---
  static getAuthUser() {
    try {
      const user = localStorage.getItem(AUTH_USER_KEY);
      if (user) return JSON.parse(user);
    } catch (e) {}
    return null; // Not logged in
  }

  static setAuthUser(user) {
    if (user) {
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
      this.setCurrentTenantId(user.schoolId);
    } else {
      localStorage.removeItem(AUTH_USER_KEY);
    }
    window.dispatchEvent(new CustomEvent('noor-auth-changed', { detail: user }));
  }

  static login(username, password, schoolId = null) {
    const data = this.load();
    const users = data.users || [];
    const targetSchool = schoolId || this.getCurrentTenantId();

    const user = users.find(u => 
      u.username.toLowerCase() === username.toLowerCase().trim() && 
      u.password === password &&
      (!schoolId || u.schoolId === targetSchool)
    );

    if (user) {
      this.setAuthUser(user);
      return { success: true, user };
    }
    return { success: false, message: 'Invalid username or password for the selected academy.' };
  }

  static logout() {
    this.setAuthUser(null);
  }

  // Backward compatibility helper
  static getCurrentUser() {
    return this.getAuthUser();
  }

  // --- User Management (Admin Only) ---
  static getUsers() {
    const tenantId = this.getCurrentTenantId();
    const all = this.load().users || [];
    return all.filter(u => u.schoolId === tenantId);
  }

  static saveUser(userData) {
    const data = this.load();
    data.users = data.users || [];
    const tenantId = userData.schoolId || this.getCurrentTenantId();
    userData.schoolId = tenantId;

    if (!userData.id) {
      userData.id = 'u-' + Date.now();
      // Check username uniqueness
      const exists = data.users.some(u => u.schoolId === tenantId && u.username.toLowerCase() === userData.username.toLowerCase());
      if (exists) {
        throw new Error(`Username "${userData.username}" is already taken in this academy.`);
      }
      data.users.push(userData);

      // If user is a teacher, also register in teachers array
      if (userData.role === 'teacher') {
        data.teachers = data.teachers || [];
        const tId = Date.now();
        userData.teacherId = tId;
        data.teachers.push({
          id: tId,
          schoolId: tenantId,
          name: userData.name,
          role: 'teacher',
          email: userData.email || `${userData.username}@academy.edu`,
          title: userData.title || 'Hifz Instructor',
          halaqahId: userData.halaqahId || null
        });
      }
    } else {
      const idx = data.users.findIndex(u => u.id === userData.id);
      if (idx !== -1) {
        data.users[idx] = { ...data.users[idx], ...userData };
      }
    }
    this.save(data);
    return userData;
  }

  static deleteUser(userId) {
    const data = this.load();
    data.users = (data.users || []).filter(u => u.id !== userId);
    this.save(data);
  }

  // --- Student Methods (Tenant Isolated) ---
  static getStudents() {
    const tenantId = this.getCurrentTenantId();
    const all = this.load().students || [];
    return all.filter(s => s.schoolId === tenantId);
  }

  static getStudentById(id) {
    return this.getStudents().find(s => s.id === id) || null;
  }

  static saveStudent(studentData) {
    const data = this.load();
    const tenantId = this.getCurrentTenantId();
    studentData.schoolId = tenantId;

    if (!studentData.id) {
      studentData.id = 's' + Date.now();
      const count = (data.students || []).filter(s => s.schoolId === tenantId).length;
      studentData.studentCode = (this.getCurrentSchool().code || 'NQA') + '-' + new Date().getFullYear() + '-' + String(count + 1).padStart(3, '0');
      studentData.completedAjzaList = studentData.completedAjzaList || [];
      studentData.juzCompleted = studentData.completedAjzaList.length;
      data.students.push(studentData);

      // Auto-create student login account if username provided
      if (studentData.username) {
        data.users = data.users || [];
        data.users.push({
          id: 'u-stud-' + studentData.id,
          schoolId: tenantId,
          username: studentData.username,
          password: studentData.password || '123',
          name: studentData.name,
          arabicName: studentData.arabicName || '',
          role: 'student',
          studentId: studentData.id,
          email: studentData.email || ''
        });
      }
    } else {
      const idx = data.students.findIndex(s => s.id === studentData.id);
      if (idx !== -1) {
        data.students[idx] = { ...data.students[idx], ...studentData };
        if (data.students[idx].completedAjzaList) {
          data.students[idx].juzCompleted = data.students[idx].completedAjzaList.length;
        }
      }
    }
    this.save(data);
    return studentData;
  }

  static deleteStudent(studentId) {
    const data = this.load();
    data.students = data.students.filter(s => s.id !== studentId);
    data.attendance = data.attendance.filter(a => a.studentId !== studentId);
    data.hifzRecords = data.hifzRecords.filter(h => h.studentId !== studentId);
    data.targets = (data.targets || []).filter(t => t.studentId !== studentId);
    data.users = (data.users || []).filter(u => u.studentId !== studentId);
    this.save(data);
  }

  // --- Target Setting Methods (Teacher & Admin) ---
  static getTargets(studentId = null) {
    const tenantId = this.getCurrentTenantId();
    let targets = (this.load().targets || []).filter(t => t.schoolId === tenantId);
    if (studentId) {
      targets = targets.filter(t => t.studentId === studentId);
    }
    return targets.sort((a, b) => new Date(b.assignedDate || 0) - new Date(a.assignedDate || 0));
  }

  static saveTarget(targetData) {
    const data = this.load();
    data.targets = data.targets || [];
    targetData.schoolId = this.getCurrentTenantId();

    if (!targetData.id) {
      targetData.id = 't-' + Date.now();
      targetData.assignedDate = new Date().toISOString().split('T')[0];
      targetData.status = targetData.status || 'in-progress';
      data.targets.unshift(targetData);
    } else {
      const idx = data.targets.findIndex(t => t.id === targetData.id);
      if (idx !== -1) {
        data.targets[idx] = { ...data.targets[idx], ...targetData };
      }
    }

    // Also update student's primary target preview
    const st = data.students.find(s => s.id === targetData.studentId);
    if (st && targetData.title) {
      st.target = targetData.title;
    }

    this.save(data);
    return targetData;
  }

  static toggleTargetStatus(targetId) {
    const data = this.load();
    const target = (data.targets || []).find(t => t.id === targetId);
    if (target) {
      target.status = target.status === 'completed' ? 'in-progress' : 'completed';
      this.save(data);
    }
    return target;
  }

  static deleteTarget(targetId) {
    const data = this.load();
    data.targets = (data.targets || []).filter(t => t.id !== targetId);
    this.save(data);
  }

  // --- Attendance Methods (Tenant Isolated) ---
  static getAttendance(date = null, classId = null) {
    const tenantId = this.getCurrentTenantId();
    const data = this.load();
    let records = (data.attendance || []).filter(a => a.schoolId === tenantId);
    if (date) {
      records = records.filter(r => r.date === date);
    }
    if (classId && classId !== 'all') {
      records = records.filter(r => r.classId === classId);
    }
    return records;
  }

  static markAttendance(date, studentId, classId, status, note = "") {
    const data = this.load();
    const tenantId = this.getCurrentTenantId();
    data.attendance = data.attendance || [];
    const existingIdx = data.attendance.findIndex(a => a.schoolId === tenantId && a.date === date && a.studentId === studentId);
    if (existingIdx !== -1) {
      data.attendance[existingIdx].status = status;
      data.attendance[existingIdx].note = note;
      data.attendance[existingIdx].classId = classId;
    } else {
      data.attendance.push({ schoolId: tenantId, date, studentId, classId, status, note });
    }
    this.save(data);
  }

  static batchMarkAttendance(date, classId, status) {
    const data = this.load();
    const tenantId = this.getCurrentTenantId();
    const students = classId === 'all' 
      ? (data.students || []).filter(s => s.schoolId === tenantId)
      : (data.students || []).filter(s => s.schoolId === tenantId && s.classId === classId);
    
    data.attendance = data.attendance || [];
    students.forEach(student => {
      const existingIdx = data.attendance.findIndex(a => a.schoolId === tenantId && a.date === date && a.studentId === student.id);
      if (existingIdx !== -1) {
        data.attendance[existingIdx].status = status;
      } else {
        data.attendance.push({
          schoolId: tenantId,
          date,
          studentId: student.id,
          classId: student.classId,
          status,
          note: ""
        });
      }
    });
    this.save(data);
  }

  // --- Hifz Methods (Tenant Isolated) ---
  static getHifzRecords(studentId = null, date = null) {
    const tenantId = this.getCurrentTenantId();
    const data = this.load();
    let records = (data.hifzRecords || []).filter(h => h.schoolId === tenantId);
    if (studentId) {
      records = records.filter(r => r.studentId === studentId);
    }
    if (date) {
      records = records.filter(r => r.date === date);
    }
    return records.sort((a, b) => new Date(b.date) - new Date(a.date));
  }

  static addHifzRecord(record) {
    const data = this.load();
    const tenantId = this.getCurrentTenantId();
    data.hifzRecords = data.hifzRecords || [];
    record.id = 'h-rec-' + Date.now();
    record.schoolId = tenantId;
    data.hifzRecords.unshift(record);

    if (record.sabaq && record.sabaq.surahId) {
      const st = (data.students || []).find(s => s.schoolId === tenantId && s.id === record.studentId);
      if (st) {
        st.currentSurahId = Number(record.sabaq.surahId);
        st.currentAyah = Number(record.sabaq.ayahEnd) || 1;
      }
    }

    this.save(data);
    return record;
  }

  static toggleJuzCompletion(studentId, juzNumber) {
    const data = this.load();
    const tenantId = this.getCurrentTenantId();
    const student = (data.students || []).find(s => s.schoolId === tenantId && s.id === studentId);
    if (!student) return;

    student.completedAjzaList = student.completedAjzaList || [];
    const juzNum = Number(juzNumber);
    const idx = student.completedAjzaList.indexOf(juzNum);
    if (idx !== -1) {
      student.completedAjzaList.splice(idx, 1);
    } else {
      student.completedAjzaList.push(juzNum);
    }
    student.completedAjzaList.sort((a, b) => a - b);
    student.juzCompleted = student.completedAjzaList.length;

    this.save(data);
    return student;
  }

  // --- Class Methods (Tenant Isolated) ---
  static getClasses() {
    const tenantId = this.getCurrentTenantId();
    return (this.load().classes || []).filter(c => c.schoolId === tenantId);
  }

  static getClassById(id) {
    return this.getClasses().find(c => c.id === id) || null;
  }
}
