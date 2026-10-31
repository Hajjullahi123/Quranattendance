import { AppStorage } from './storage.js';
import { SURAHS, JUZ_NAMES, PERFORMANCE_RATINGS, getSurahById, calculateAverageRating } from './quran-data.js';

export class StudentPortalManager {
  constructor() {
    this.activeStudentId = 's101'; // Default
  }

  init() {
    this.bindEvents();
    this.render();
  }

  bindEvents() {
    const studentSelector = document.getElementById('portal-student-select');
    const printReportBtn = document.getElementById('btn-print-student-report');
    const openAddStudentBtn = document.getElementById('btn-open-add-student-modal');
    const addStudentModal = document.getElementById('add-student-dialog');
    const addStudentCloseBtn = document.getElementById('add-student-close');
    const addStudentCancelBtn = document.getElementById('add-student-cancel');
    const studentForm = document.getElementById('student-manage-form');

    if (studentSelector) {
      studentSelector.addEventListener('change', (e) => {
        this.activeStudentId = e.target.value;
        this.render();
      });
    }

    if (printReportBtn) {
      printReportBtn.addEventListener('click', () => {
        window.print();
      });
    }

    if (openAddStudentBtn) {
      openAddStudentBtn.addEventListener('click', () => {
        this.openStudentModal();
      });
    }

    if (addStudentCloseBtn) {
      addStudentCloseBtn.addEventListener('click', () => {
        this.closeStudentModal();
      });
    }

    if (addStudentCancelBtn) {
      addStudentCancelBtn.addEventListener('click', () => {
        this.closeStudentModal();
      });
    }

    if (studentForm) {
      studentForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleSaveStudent();
      });
    }

    // Listen for custom event from leaderboard card click
    window.addEventListener('noor-view-student-profile', (e) => {
      if (e.detail && e.detail.studentId) {
        this.activeStudentId = e.detail.studentId;
        // Switch tab to student portal if available
        const portalTabBtn = document.querySelector('[data-tab="student-portal"]');
        if (portalTabBtn) portalTabBtn.click();
        this.render();
      }
    });

    window.addEventListener('noor-data-changed', () => {
      this.render();
    });
  }

  openStudentModal(studentToEdit = null) {
    const dialog = document.getElementById('add-student-dialog');
    if (!dialog) return;

    const classSelect = document.getElementById('modal-student-class');
    if (classSelect) {
      classSelect.innerHTML = AppStorage.getClasses().map(c => 
        `<option value="${c.id}">${c.name}</option>`
      ).join('');
    }

    const titleEl = document.getElementById('student-dialog-title');
    const idInput = document.getElementById('student-edit-id');
    const nameInput = document.getElementById('student-input-name');
    const arabicInput = document.getElementById('student-input-arabic');
    const guardianInput = document.getElementById('student-input-guardian');
    const phoneInput = document.getElementById('student-input-phone');
    const targetInput = document.getElementById('student-input-target');

    if (studentToEdit) {
      if (titleEl) titleEl.textContent = 'Edit Student Profile';
      if (idInput) idInput.value = studentToEdit.id;
      if (nameInput) nameInput.value = studentToEdit.name;
      if (arabicInput) arabicInput.value = studentToEdit.arabicName || '';
      if (classSelect) classSelect.value = studentToEdit.classId;
      if (guardianInput) guardianInput.value = studentToEdit.guardian || '';
      if (phoneInput) phoneInput.value = studentToEdit.phone || '';
      if (targetInput) targetInput.value = studentToEdit.target || '';
    } else {
      if (titleEl) titleEl.textContent = 'Enroll New Student (تسجيل طالب جديد)';
      if (idInput) idInput.value = '';
      if (nameInput) nameInput.value = '';
      if (arabicInput) arabicInput.value = '';
      if (guardianInput) guardianInput.value = '';
      if (phoneInput) phoneInput.value = '';
      if (targetInput) targetInput.value = '';
    }

    dialog.showModal();
  }

  closeStudentModal() {
    const dialog = document.getElementById('add-student-dialog');
    if (dialog) dialog.close();
  }

  handleSaveStudent() {
    const id = document.getElementById('student-edit-id').value;
    const name = document.getElementById('student-input-name').value.trim();
    const arabicName = document.getElementById('student-input-arabic').value.trim();
    const classId = document.getElementById('modal-student-class').value;
    const guardian = document.getElementById('student-input-guardian').value.trim();
    const phone = document.getElementById('student-input-phone').value.trim();
    const target = document.getElementById('student-input-target').value.trim();

    if (!name) {
      alert('Please enter student name.');
      return;
    }

    const payload = {
      id: id || undefined,
      name,
      arabicName,
      classId,
      guardian,
      phone,
      target
    };

    const saved = AppStorage.saveStudent(payload);
    this.closeStudentModal();
    this.activeStudentId = saved.id;
    this.render();
  }

  render() {
    this.renderStudentDropdown();
    const student = AppStorage.getStudentById(this.activeStudentId);
    if (!student) {
      const first = AppStorage.getStudents()[0];
      if (first) {
        this.activeStudentId = first.id;
        this.render();
      }
      return;
    }

    this.renderStudentHeader(student);
    this.renderMetrics(student);
    this.renderStudentTargets(student);
    this.renderMushafGrid(student);
    this.renderStudentHistory(student);
  }

  renderStudentTargets(student) {
    const targetEl = document.getElementById('profile-student-target');
    const targets = AppStorage.getTargets(student.id);

    if (targets.length > 0) {
      const active = targets.find(t => t.status === 'in-progress') || targets[0];
      if (targetEl) {
        targetEl.innerHTML = `${active.title} ${active.deadline ? `<span class="small text-muted">(Due: ${active.deadline})</span>` : ''}`;
      }
    } else {
      if (targetEl) targetEl.textContent = student.target || 'Consistent daily recitation';
    }
  }

  renderStudentDropdown() {
    const select = document.getElementById('portal-student-select');
    if (!select) return;

    const students = AppStorage.getStudents();
    select.innerHTML = students.map(s => 
      `<option value="${s.id}" ${s.id === this.activeStudentId ? 'selected' : ''}>${s.name} (${s.studentCode})</option>`
    ).join('');
  }

  renderStudentHeader(student) {
    const nameEl = document.getElementById('profile-student-name');
    const arabicEl = document.getElementById('profile-student-arabic');
    const codeEl = document.getElementById('profile-student-code');
    const classEl = document.getElementById('profile-student-class');
    const teacherEl = document.getElementById('profile-student-teacher');
    const guardianEl = document.getElementById('profile-student-guardian');
    const phoneEl = document.getElementById('profile-student-phone');
    const editBtn = document.getElementById('btn-profile-edit');

    const cls = AppStorage.getClassById(student.classId);
    const teacher = cls ? (AppStorage.load().teachers || []).find(t => t.id == cls.teacherId) : null;

    if (nameEl) nameEl.textContent = student.name;
    if (arabicEl) arabicEl.textContent = student.arabicName || '';
    if (codeEl) codeEl.textContent = student.studentCode;
    if (classEl) classEl.textContent = cls ? cls.name : 'Unassigned';
    if (teacherEl) teacherEl.textContent = teacher ? teacher.name : 'Assigned Ustadh';
    if (guardianEl) guardianEl.textContent = student.guardian || 'Guardian';
    if (phoneEl) phoneEl.textContent = student.phone || 'N/A';

    if (editBtn) {
      editBtn.onclick = () => this.openStudentModal(student);
    }
  }

  renderMetrics(student) {
    const stAtt = AppStorage.getAttendance().filter(a => a.studentId === student.id);
    const present = stAtt.filter(a => a.status === 'present' || a.status === 'late').length;
    const attRate = stAtt.length > 0 ? Math.round((present / stAtt.length) * 100) : 100;

    const juzCount = (student.completedAjzaList || []).length;
    const hifzPct = Math.round((juzCount / 30) * 100);

    const records = AppStorage.getHifzRecords(student.id);
    const avgPerf = calculateAverageRating(records.map(r => r.sabaq));

    const attRateEl = document.getElementById('metric-att-rate');
    const attCountEl = document.getElementById('metric-att-count');
    const hifzPctEl = document.getElementById('metric-hifz-pct');
    const hifzCountEl = document.getElementById('metric-hifz-count');
    const ratingBadgeEl = document.getElementById('metric-rating-badge');
    const evalsCountEl = document.getElementById('metric-evals-count');

    if (attRateEl) attRateEl.textContent = attRate + '%';
    if (attCountEl) attCountEl.textContent = `${present} of ${stAtt.length} sessions attended`;
    if (hifzPctEl) hifzPctEl.textContent = hifzPct + '%';
    if (hifzCountEl) hifzCountEl.textContent = `${juzCount} / 30 Ajza Complete`;
    if (evalsCountEl) evalsCountEl.textContent = `${records.length} teacher assessments logged`;

    if (ratingBadgeEl) {
      ratingBadgeEl.className = `badge ${avgPerf.badgeClass}`;
      ratingBadgeEl.textContent = avgPerf.label;
    }
  }

  renderMushafGrid(student) {
    const grid = document.getElementById('mushaf-30-juz-grid');
    if (!grid) return;

    const completedAjza = student.completedAjzaList || [];
    const currentUser = AppStorage.getAuthUser();
    const canEdit = currentUser && (currentUser.role === 'admin' || currentUser.role === 'teacher');

    grid.innerHTML = JUZ_NAMES.map(j => {
      const isDone = completedAjza.includes(j.juz);
      const isCurrent = !isDone && (student.juzCompleted + 1 === j.juz);

      const statusClass = isDone ? 'juz-done' : (isCurrent ? 'juz-current' : 'juz-pending');
      const statusLabel = isDone ? 'Memorized (مكتمل)' : (isCurrent ? 'In Progress (جاري)' : 'Pending (متبقي)');

      return `
        <div 
          class="mushaf-juz-card ${statusClass}" 
          data-juz="${j.juz}" 
          role="button" 
          tabindex="0"
          title="${canEdit ? 'Click to toggle completion for Juz ' + j.juz : 'Juz ' + j.juz + ': ' + j.name}"
        >
          <div class="juz-card-top">
            <span class="juz-num">Juz ${j.juz}</span>
            <span class="juz-check">${isDone ? '★' : (isCurrent ? '⏳' : '○')}</span>
          </div>
          <div class="juz-name-arabic">${j.name}</div>
          <div class="juz-status-pill">${statusLabel}</div>
        </div>
      `;
    }).join('');

    // Toggle completion on click (Ustadh & Admin can toggle, Student sees notification)
    grid.querySelectorAll('.mushaf-juz-card').forEach(card => {
      card.addEventListener('click', () => {
        const juzNum = Number(card.dataset.juz);
        if (!canEdit) {
          alert(`Juz ${juzNum}: Memorization and Khatm status is officially updated and certified by your Ustadh.`);
          return;
        }
        AppStorage.toggleJuzCompletion(student.id, juzNum);
      });
      // Keyboard accessible
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          const juzNum = Number(card.dataset.juz);
          if (!canEdit) {
            alert(`Juz ${juzNum}: Memorization and Khatm status is officially updated and certified by your Ustadh.`);
            return;
          }
          AppStorage.toggleJuzCompletion(student.id, juzNum);
        }
      });
    });
  }

  renderStudentHistory(student) {
    const timeline = document.getElementById('student-eval-timeline');
    if (!timeline) return;

    const records = AppStorage.getHifzRecords(student.id);

    if (records.length === 0) {
      timeline.innerHTML = '<div class="empty-state"><p>No evaluation logs recorded yet for this student.</p></div>';
      return;
    }

    timeline.innerHTML = records.map(rec => {
      const sabaqSurah = getSurahById(rec.sabaq?.surahId);
      const sabqiSurah = getSurahById(rec.sabqi?.surahId);
      const sabaqRating = PERFORMANCE_RATINGS.find(p => p.value === rec.sabaq?.rating) || { label: 'Good', badgeClass: 'badge-good' };

      return `
        <div class="timeline-item">
          <div class="timeline-date">${rec.date}</div>
          <div class="timeline-card">
            <div class="timeline-card-header">
              <span class="badge ${sabaqRating.badgeClass}">${sabaqRating.label}</span>
              <span class="text-muted small">Evaluated by Ustadh</span>
            </div>
            
            <div class="eval-grid">
              <div class="eval-column sabaq-col">
                <span class="eval-title">📖 Sabaq (New Lesson)</span>
                <strong>${sabaqSurah ? sabaqSurah.name : 'Surah'}</strong>
                <p>Ayahs: ${rec.sabaq?.ayahStart || 1} to ${rec.sabaq?.ayahEnd || 1}</p>
                ${rec.sabaq?.notes ? `<blockquote class="eval-notes">${rec.sabaq.notes}</blockquote>` : ''}
              </div>

              <div class="eval-column sabqi-col">
                <span class="eval-title">🔄 Sabqi (Recent Revision)</span>
                <strong>${sabqiSurah ? sabqiSurah.name : 'Surah'}</strong>
                <p>Ayahs: ${rec.sabqi?.ayahStart || 1} to ${rec.sabqi?.ayahEnd || 1}</p>
                ${rec.sabqi?.notes ? `<blockquote class="eval-notes">${rec.sabqi.notes}</blockquote>` : ''}
              </div>

              <div class="eval-column manzil-col">
                <span class="eval-title">🏛 Manzil (Cumulative Cycle)</span>
                <strong>Juz ${rec.manzil?.juz || 1}</strong>
                <p>Rating: ${rec.manzil?.rating || 'good'}</p>
                ${rec.manzil?.notes ? `<blockquote class="eval-notes">${rec.manzil.notes}</blockquote>` : ''}
              </div>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }
}
