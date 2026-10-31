import { AppStorage } from './storage.js';

export class AttendanceManager {
  constructor() {
    this.selectedDate = new Date().toISOString().split('T')[0];
    this.selectedClassId = 'c1'; // Default to first Halaqah
  }

  init() {
    this.bindEvents();
    this.render();
  }

  bindEvents() {
    const dateInput = document.getElementById('att-date-picker');
    const classSelect = document.getElementById('att-class-select');
    const markAllPresentBtn = document.getElementById('att-btn-mark-all-present');
    const printAttBtn = document.getElementById('att-btn-print');

    if (dateInput) {
      dateInput.value = this.selectedDate;
      dateInput.addEventListener('change', (e) => {
        this.selectedDate = e.target.value;
        this.render();
      });
    }

    if (classSelect) {
      classSelect.addEventListener('change', (e) => {
        this.selectedClassId = e.target.value;
        this.render();
      });
    }

    if (markAllPresentBtn) {
      markAllPresentBtn.addEventListener('click', () => {
        this.handleMarkAllPresent();
      });
    }

    if (printAttBtn) {
      printAttBtn.addEventListener('click', () => {
        window.print();
      });
    }

    // Listen for storage changes
    window.addEventListener('noor-data-changed', () => {
      this.render();
    });

    window.addEventListener('noor-user-changed', () => {
      this.render();
    });
  }

  handleMarkAllPresent() {
    const currentUser = AppStorage.getCurrentUser();
    if (!this.canMarkAttendance(currentUser, this.selectedClassId)) {
      alert(`Permission Notice: Only the Form Master (${this.getFormMasterName(this.selectedClassId)}) or an Admin can mark attendance for this Halaqah.`);
      return;
    }
    AppStorage.batchMarkAttendance(this.selectedDate, this.selectedClassId, 'present');
    this.showToast('All students marked Present for ' + this.selectedDate);
  }

  canMarkAttendance(user, classId) {
    if (!user) return false;
    if (user.role === 'admin' || user.role === 'principal') return true;
    if (user.role === 'teacher') {
      // Loose comparison as established in teacher_permissions.md
      const targetClass = AppStorage.getClassById(classId);
      if (!targetClass) return true;
      return targetClass.teacherId == user.id || 
             targetClass.teacherId == user.teacherId || 
             user.assignedClassId == classId || 
             user.halaqahId == classId;
    }
    return false;
  }

  getFormMasterName(classId) {
    const cls = AppStorage.getClassById(classId);
    if (!cls) return 'Assigned Ustadh';
    const teacher = (AppStorage.load().teachers || []).find(t => t.id == cls.teacherId);
    return teacher ? teacher.name : 'Assigned Ustadh';
  }

  render() {
    const classes = AppStorage.getClasses();
    if (classes.length > 0 && !classes.some(c => c.id === this.selectedClassId)) {
      this.selectedClassId = classes[0].id;
    }
    this.renderClassDropdown();
    this.renderPermissionBanner();
    this.renderStats();
    this.renderStudentsList();
  }

  renderClassDropdown() {
    const classSelect = document.getElementById('att-class-select');
    if (!classSelect) return;

    const classes = AppStorage.getClasses();
    const currentUser = AppStorage.getCurrentUser();

    // Maintain current selection if valid
    const currentVal = this.selectedClassId;

    classSelect.innerHTML = classes.map(c => {
      const isMyClass = currentUser && (currentUser.assignedClassId == c.id || currentUser.id == c.teacherId || currentUser.halaqahId == c.id);
      const tag = isMyClass ? ' ★ (My Halaqah)' : '';
      return `<option value="${c.id}" ${c.id === currentVal ? 'selected' : ''}>${c.name}${tag}</option>`;
    }).join('');
  }

  renderPermissionBanner() {
    const banner = document.getElementById('att-permission-alert');
    if (!banner) return;

    const currentUser = AppStorage.getCurrentUser();
    const canMark = this.canMarkAttendance(currentUser, this.selectedClassId);
    const formMaster = this.getFormMasterName(this.selectedClassId);

    if (canMark) {
      banner.style.display = 'none';
      banner.innerHTML = '';
    } else {
      banner.style.display = 'flex';
      banner.className = 'alert-banner alert-warning';
      banner.innerHTML = `
        <div class="alert-icon">⚠️</div>
        <div class="alert-content">
          <strong>View-Only Mode:</strong> You are viewing attendance for <em>${AppStorage.getClassById(this.selectedClassId)?.name}</em>.
          Attendance marking is restricted to the Form Master (<strong>${formMaster}</strong>) or Administrator.
        </div>
      `;
    }
  }

  renderStats() {
    const students = AppStorage.getStudents().filter(s => s.classId === this.selectedClassId);
    const records = AppStorage.getAttendance(this.selectedDate, this.selectedClassId);

    const total = students.length;
    let present = 0;
    let absent = 0;
    let late = 0;
    let excused = 0;

    students.forEach(st => {
      const rec = records.find(r => r.studentId === st.id);
      const status = rec ? rec.status : 'unmarked';
      if (status === 'present') present++;
      else if (status === 'absent') absent++;
      else if (status === 'late') late++;
      else if (status === 'excused') excused++;
    });

    const rate = total > 0 ? Math.round(((present + late) / total) * 100) : 0;

    const totalEl = document.getElementById('att-stat-total');
    const presentEl = document.getElementById('att-stat-present');
    const absentEl = document.getElementById('att-stat-absent');
    const lateEl = document.getElementById('att-stat-late');
    const excusedEl = document.getElementById('att-stat-excused');
    const rateEl = document.getElementById('att-stat-rate');

    if (totalEl) totalEl.textContent = total;
    if (presentEl) presentEl.textContent = present;
    if (absentEl) absentEl.textContent = absent;
    if (lateEl) lateEl.textContent = late;
    if (excusedEl) excusedEl.textContent = excused;
    if (rateEl) rateEl.textContent = rate + '%';
  }

  renderStudentsList() {
    const container = document.getElementById('att-students-table-body');
    if (!container) return;

    const students = AppStorage.getStudents().filter(s => s.classId === this.selectedClassId);
    const records = AppStorage.getAttendance(this.selectedDate, this.selectedClassId);
    const currentUser = AppStorage.getCurrentUser();
    const canMark = this.canMarkAttendance(currentUser, this.selectedClassId);

    if (students.length === 0) {
      container.innerHTML = `
        <tr>
          <td colspan="5" class="empty-state-cell">
            <div class="empty-state">
              <span class="empty-icon">📖</span>
              <p>No students enrolled in this Halaqah yet.</p>
            </div>
          </td>
        </tr>
      `;
      return;
    }

    // Calculate 30-day overall attendance rate for each student
    const allAttendance = AppStorage.load().attendance || [];

    container.innerHTML = students.map((st, idx) => {
      const rec = records.find(r => r.studentId === st.id);
      const currentStatus = rec ? rec.status : 'unmarked';
      const note = rec ? (rec.note || '') : '';

      // Historical rate for this student
      const stRecords = allAttendance.filter(a => a.studentId === st.id);
      const stPresent = stRecords.filter(a => a.status === 'present' || a.status === 'late').length;
      const stRate = stRecords.length > 0 ? Math.round((stPresent / stRecords.length) * 100) : 100;

      const disabledAttr = canMark ? '' : 'disabled title="Attendance marking restricted to Form Master"';

      return `
        <tr class="attendance-row ${currentStatus}">
          <td class="col-num">${idx + 1}</td>
          <td class="col-student">
            <div class="student-info-cell">
              <div class="student-avatar" style="background: ${this.getAvatarGradient(st.name)}">
                ${this.getInitials(st.name)}
              </div>
              <div class="student-details">
                <span class="student-name">${st.name}</span>
                <span class="student-arabic-name">${st.arabicName || ''}</span>
                <span class="student-meta">${st.studentCode} • Juz ${st.juzCompleted}/30</span>
              </div>
            </div>
          </td>
          <td class="col-history">
            <div class="rate-badge ${stRate >= 85 ? 'rate-high' : stRate >= 70 ? 'rate-mid' : 'rate-low'}">
              <span>${stRate}% Rate</span>
              <small>${stRecords.length} sessions logged</small>
            </div>
          </td>
          <td class="col-actions">
            <div class="status-btn-group" role="group" aria-label="Attendance Status for ${st.name}">
              <button 
                type="button" 
                class="status-btn btn-present ${currentStatus === 'present' ? 'active' : ''}" 
                data-student-id="${st.id}" 
                data-status="present"
                ${disabledAttr}
              >
                <span class="btn-indicator">✓</span> Present (حاضر)
              </button>
              <button 
                type="button" 
                class="status-btn btn-late ${currentStatus === 'late' ? 'active' : ''}" 
                data-student-id="${st.id}" 
                data-status="late"
                ${disabledAttr}
              >
                <span class="btn-indicator">⏱</span> Late (متأخر)
              </button>
              <button 
                type="button" 
                class="status-btn btn-excused ${currentStatus === 'excused' ? 'active' : ''}" 
                data-student-id="${st.id}" 
                data-status="excused"
                ${disabledAttr}
              >
                <span class="btn-indicator">✉</span> Excused (معذور)
              </button>
              <button 
                type="button" 
                class="status-btn btn-absent ${currentStatus === 'absent' ? 'active' : ''}" 
                data-student-id="${st.id}" 
                data-status="absent"
                ${disabledAttr}
              >
                <span class="btn-indicator">✗</span> Absent (غائب)
              </button>
            </div>
          </td>
          <td class="col-note">
            <input 
              type="text" 
              class="att-note-input" 
              placeholder="Add remark..." 
              value="${this.escapeHtml(note)}" 
              data-student-id="${st.id}"
              ${disabledAttr}
            />
          </td>
        </tr>
      `;
    }).join('');

    // Attach click handlers to status buttons
    container.querySelectorAll('.status-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const studentId = btn.dataset.studentId;
        const status = btn.dataset.status;
        const noteInput = container.querySelector(`input.att-note-input[data-student-id="${studentId}"]`);
        const noteVal = noteInput ? noteInput.value : '';
        AppStorage.markAttendance(this.selectedDate, studentId, this.selectedClassId, status, noteVal);
        this.renderStats();
        // Update row styling without full re-render
        const row = btn.closest('tr');
        row.className = `attendance-row ${status}`;
        row.querySelectorAll('.status-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      });
    });

    // Attach debounce/blur handler to note inputs
    container.querySelectorAll('.att-note-input').forEach(input => {
      input.addEventListener('change', () => {
        const studentId = input.dataset.studentId;
        const rec = AppStorage.getAttendance(this.selectedDate, this.selectedClassId).find(r => r.studentId === studentId);
        const currentStatus = rec ? rec.status : 'present';
        AppStorage.markAttendance(this.selectedDate, studentId, this.selectedClassId, currentStatus, input.value.trim());
      });
    });
  }

  getInitials(name) {
    if (!name) return 'S';
    return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
  }

  getAvatarGradient(name) {
    const gradients = [
      'linear-gradient(135deg, #065f46, #047857)',
      'linear-gradient(135deg, #1e3a8a, #3b82f6)',
      'linear-gradient(135deg, #78350f, #d97706)',
      'linear-gradient(135deg, #4c1d95, #7c3aed)',
      'linear-gradient(135deg, #0f766e, #14b8a6)'
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash += name.charCodeAt(i);
    return gradients[hash % gradients.length];
  }

  escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  showToast(message) {
    const toast = document.getElementById('app-toast');
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 3200);
  }
}
