import { AppStorage } from './storage.js';
import { SURAHS, JUZ_NAMES, getSurahById } from './quran-data.js';

export class TargetManager {
  constructor() {
    this.filterStatus = 'all';
  }

  init() {
    this.bindEvents();
    this.render();
  }

  bindEvents() {
    const openModalBtn = document.getElementById('btn-open-target-modal');
    const modalCloseBtn = document.getElementById('target-modal-close');
    const modalCancelBtn = document.getElementById('target-modal-cancel');
    const targetForm = document.getElementById('target-entry-form');
    const statusFilter = document.getElementById('targets-filter-status');
    const targetTypeSelect = document.getElementById('modal-target-type');

    if (openModalBtn) {
      openModalBtn.addEventListener('click', () => {
        this.openTargetModal();
      });
    }

    if (modalCloseBtn) {
      modalCloseBtn.addEventListener('click', () => {
        this.closeTargetModal();
      });
    }

    if (modalCancelBtn) {
      modalCancelBtn.addEventListener('click', () => {
        this.closeTargetModal();
      });
    }

    if (targetTypeSelect) {
      targetTypeSelect.addEventListener('change', (e) => {
        const isJuz = e.target.value === 'juz';
        const juzGroup = document.getElementById('modal-target-juz-group');
        const surahGroup = document.getElementById('modal-target-surah-group');
        if (juzGroup) juzGroup.style.display = isJuz ? 'block' : 'none';
        if (surahGroup) surahGroup.style.display = isJuz ? 'none' : 'block';
      });
    }

    if (targetForm) {
      targetForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleSaveTarget();
      });
    }

    if (statusFilter) {
      statusFilter.addEventListener('change', (e) => {
        this.filterStatus = e.target.value;
        this.render();
      });
    }

    window.addEventListener('noor-data-changed', () => {
      this.render();
    });
  }

  openTargetModal(presetStudentId = null) {
    const dialog = document.getElementById('target-entry-dialog');
    if (!dialog) return;

    const studentSelect = document.getElementById('modal-target-student');
    const surahSelect = document.getElementById('modal-target-surah');
    const juzSelect = document.getElementById('modal-target-juz');
    const deadlineInput = document.getElementById('modal-target-deadline');

    if (studentSelect) {
      const students = AppStorage.getStudents();
      studentSelect.innerHTML = students.map(s => {
        const cls = AppStorage.getClassById(s.classId);
        return `<option value="${s.id}">${s.name} (${cls ? cls.name.split(' ')[1] : ''})</option>`;
      }).join('');
      if (presetStudentId) studentSelect.value = presetStudentId;
    }

    if (surahSelect) {
      surahSelect.innerHTML = SURAHS.map(s => 
        `<option value="${s.id}">${s.id}. ${s.name} - ${s.arabic} (${s.ayahs} Ayahs)</option>`
      ).join('');
    }

    if (juzSelect) {
      juzSelect.innerHTML = JUZ_NAMES.map(j => 
        `<option value="${j.juz}">Juz ${j.juz} (${j.name})</option>`
      ).join('');
    }

    if (deadlineInput) {
      // Default to 2 weeks from now
      const d = new Date();
      d.setDate(d.getDate() + 14);
      deadlineInput.value = d.toISOString().split('T')[0];
    }

    dialog.showModal();
  }

  closeTargetModal() {
    const dialog = document.getElementById('target-entry-dialog');
    if (dialog) dialog.close();
  }

  handleSaveTarget() {
    const studentId = document.getElementById('modal-target-student').value;
    const title = document.getElementById('modal-target-title').value.trim();
    const targetType = document.getElementById('modal-target-type').value;
    const targetSurahId = targetType === 'surah' ? Number(document.getElementById('modal-target-surah').value) : null;
    const targetJuz = targetType === 'juz' ? Number(document.getElementById('modal-target-juz').value) : null;
    const deadline = document.getElementById('modal-target-deadline').value;
    const notes = document.getElementById('modal-target-notes').value.trim();
    const currentUser = AppStorage.getAuthUser();

    if (!title) {
      alert('Please enter a target title.');
      return;
    }

    const payload = {
      studentId,
      teacherId: currentUser ? currentUser.id : 101,
      title,
      targetType,
      targetSurahId,
      targetJuz,
      deadline,
      notes,
      status: 'in-progress'
    };

    AppStorage.saveTarget(payload);
    this.closeTargetModal();
    this.render();

    const toast = document.getElementById('app-toast');
    if (toast) {
      toast.textContent = 'Memorization target assigned successfully!';
      toast.classList.add('show');
      setTimeout(() => toast.classList.remove('show'), 3000);
    }
  }

  render() {
    const container = document.getElementById('targets-list-container');
    if (!container) return;

    const currentUser = AppStorage.getAuthUser();
    let targets = AppStorage.getTargets();

    if (this.filterStatus !== 'all') {
      targets = targets.filter(t => t.status === this.filterStatus);
    }

    if (targets.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <p>No memorization targets match the current filter.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = targets.map(t => {
      const student = AppStorage.getStudentById(t.studentId);
      const isDone = t.status === 'completed';
      const deadlinePassed = t.deadline && new Date(t.deadline) < new Date() && !isDone;

      return `
        <div class="target-card ${isDone ? 'target-done' : ''}">
          <div class="target-card-top">
            <div class="target-card-title-wrap">
              <span class="target-status-badge ${isDone ? 'badge-completed' : (deadlinePassed ? 'badge-overdue' : 'badge-active')}">
                ${isDone ? '✓ Completed' : (deadlinePassed ? '⚠️ Overdue' : '⏳ In Progress')}
              </span>
              <h4 class="target-title-text">${t.title}</h4>
              <span class="target-student-meta">Assigned to: <strong>${student ? student.name : 'Unknown Student'}</strong></span>
            </div>
            <div class="target-actions">
              <button class="btn-icon-subtle btn-toggle-target" data-target-id="${t.id}">
                ${isDone ? 'Mark In-Progress' : '✓ Mark Complete'}
              </button>
              ${currentUser && (currentUser.role === 'admin' || currentUser.role === 'teacher') ? `
                <button class="btn-icon-subtle btn-delete-target" style="color: var(--status-absent);" data-target-id="${t.id}" title="Delete target">
                  🗑️
                </button>
              ` : ''}
            </div>
          </div>

          <div class="target-card-body">
            ${t.notes ? `<p class="target-notes-text">"${t.notes}"</p>` : ''}
            <div class="target-dates-row">
              <span>📅 Assigned: ${t.assignedDate || 'Recent'}</span>
              <span class="${deadlinePassed ? 'text-danger fw-bold' : ''}">🎯 Deadline: ${t.deadline || 'No deadline'}</span>
            </div>
          </div>
        </div>
      `;
    }).join('');

    // Attach click events
    container.querySelectorAll('.btn-toggle-target').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.targetId;
        AppStorage.toggleTargetStatus(id);
        this.render();
      });
    });

    container.querySelectorAll('.btn-delete-target').forEach(btn => {
      btn.addEventListener('click', () => {
        if (confirm('Delete this memorization target?')) {
          const id = btn.dataset.targetId;
          AppStorage.deleteTarget(id);
          this.render();
        }
      });
    });
  }
}
