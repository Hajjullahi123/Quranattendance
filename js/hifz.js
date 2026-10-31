import { AppStorage } from './storage.js';
import { SURAHS, JUZ_NAMES, PERFORMANCE_RATINGS, getSurahById, calculateAverageRating } from './quran-data.js';

export class HifzManager {
  constructor() {
    this.selectedClassId = 'c1';
    this.selectedStudentId = 'all';
    this.filterRating = 'all';
  }

  init() {
    this.bindEvents();
    this.render();
  }

  bindEvents() {
    const classFilter = document.getElementById('hifz-class-filter');
    const studentFilter = document.getElementById('hifz-student-filter');
    const ratingFilter = document.getElementById('hifz-rating-filter');
    const openLogBtn = document.getElementById('btn-open-hifz-modal');
    const modalCloseBtn = document.getElementById('hifz-modal-close');
    const modalCancelBtn = document.getElementById('hifz-modal-cancel');
    const hifzForm = document.getElementById('hifz-entry-form');

    // Surah select changes in modal to adjust max ayah inputs
    const sabaqSurahSelect = document.getElementById('modal-sabaq-surah');
    if (sabaqSurahSelect) {
      sabaqSurahSelect.addEventListener('change', (e) => {
        this.updateAyahLimits(e.target.value);
      });
    }

    if (classFilter) {
      classFilter.addEventListener('change', (e) => {
        this.selectedClassId = e.target.value;
        this.updateStudentFilterDropdown();
        this.render();
      });
    }

    if (studentFilter) {
      studentFilter.addEventListener('change', (e) => {
        this.selectedStudentId = e.target.value;
        this.render();
      });
    }

    if (ratingFilter) {
      ratingFilter.addEventListener('change', (e) => {
        this.filterRating = e.target.value;
        this.render();
      });
    }

    if (openLogBtn) {
      openLogBtn.addEventListener('click', () => {
        this.openHifzModal();
      });
    }

    if (modalCloseBtn) {
      modalCloseBtn.addEventListener('click', () => {
        this.closeHifzModal();
      });
    }

    if (modalCancelBtn) {
      modalCancelBtn.addEventListener('click', () => {
        this.closeHifzModal();
      });
    }

    if (hifzForm) {
      hifzForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleHifzFormSubmit();
      });
    }

    window.addEventListener('noor-data-changed', () => {
      this.render();
    });
  }

  updateAyahLimits(surahId) {
    const surah = getSurahById(surahId);
    const startInput = document.getElementById('modal-sabaq-ayah-start');
    const endInput = document.getElementById('modal-sabaq-ayah-end');
    const maxHint = document.getElementById('modal-sabaq-max-ayah');

    if (surah && startInput && endInput) {
      startInput.max = surah.ayahs;
      endInput.max = surah.ayahs;
      if (maxHint) maxHint.textContent = `(Surah has ${surah.ayahs} Ayahs)`;
    }
  }

  openHifzModal(presetStudentId = null) {
    const dialog = document.getElementById('hifz-entry-dialog');
    if (!dialog) return;

    this.populateModalDropdowns();

    const dateInput = document.getElementById('modal-hifz-date');
    if (dateInput) {
      dateInput.value = new Date().toISOString().split('T')[0];
    }

    if (presetStudentId) {
      const studentSelect = document.getElementById('modal-student-select');
      if (studentSelect) studentSelect.value = presetStudentId;
    }

    dialog.showModal();
  }

  closeHifzModal() {
    const dialog = document.getElementById('hifz-entry-dialog');
    if (dialog) dialog.close();
  }

  populateModalDropdowns() {
    const studentSelect = document.getElementById('modal-student-select');
    const sabaqSurahSelect = document.getElementById('modal-sabaq-surah');
    const sabqiSurahSelect = document.getElementById('modal-sabqi-surah');
    const manzilJuzSelect = document.getElementById('modal-manzil-juz');

    if (studentSelect) {
      const students = AppStorage.getStudents();
      studentSelect.innerHTML = students.map(s => {
        const cls = AppStorage.getClassById(s.classId);
        return `<option value="${s.id}">${s.name} (${s.studentCode} • ${cls ? cls.name.split(' ')[1] : ''})</option>`;
      }).join('');
    }

    const surahOptions = SURAHS.map(s => 
      `<option value="${s.id}">${s.id}. ${s.name} - ${s.arabic} (${s.ayahs} Ayahs)</option>`
    ).join('');

    if (sabaqSurahSelect) {
      sabaqSurahSelect.innerHTML = surahOptions;
      sabaqSurahSelect.value = "1";
      this.updateAyahLimits(1);
    }

    if (sabqiSurahSelect) {
      sabqiSurahSelect.innerHTML = surahOptions;
      sabqiSurahSelect.value = "1";
    }

    if (manzilJuzSelect) {
      manzilJuzSelect.innerHTML = JUZ_NAMES.map(j => 
        `<option value="${j.juz}">Juz ${j.juz} (${j.name})</option>`
      ).join('');
    }
  }

  handleHifzFormSubmit() {
    const studentId = document.getElementById('modal-student-select').value;
    const date = document.getElementById('modal-hifz-date').value;
    const currentUser = AppStorage.getCurrentUser();

    // Sabaq
    const sabaqSurahId = Number(document.getElementById('modal-sabaq-surah').value);
    const sabaqStart = Number(document.getElementById('modal-sabaq-ayah-start').value) || 1;
    const sabaqEnd = Number(document.getElementById('modal-sabaq-ayah-end').value) || sabaqStart;
    const sabaqRating = document.getElementById('modal-sabaq-rating').value;
    const sabaqNotes = document.getElementById('modal-sabaq-notes').value.trim();

    // Sabqi
    const sabqiSurahId = Number(document.getElementById('modal-sabqi-surah').value);
    const sabqiStart = Number(document.getElementById('modal-sabqi-ayah-start').value) || 1;
    const sabqiEnd = Number(document.getElementById('modal-sabqi-ayah-end').value) || sabqiStart;
    const sabqiRating = document.getElementById('modal-sabqi-rating').value;
    const sabqiNotes = document.getElementById('modal-sabqi-notes').value.trim();

    // Manzil
    const manzilJuz = Number(document.getElementById('modal-manzil-juz').value);
    const manzilRating = document.getElementById('modal-manzil-rating').value;
    const manzilNotes = document.getElementById('modal-manzil-notes').value.trim();

    const record = {
      date,
      studentId,
      teacherId: currentUser ? currentUser.id : 101,
      sabaq: {
        surahId: sabaqSurahId,
        ayahStart: sabaqStart,
        ayahEnd: sabaqEnd,
        rating: sabaqRating,
        notes: sabaqNotes
      },
      sabqi: {
        surahId: sabqiSurahId,
        ayahStart: sabqiStart,
        ayahEnd: sabqiEnd,
        rating: sabqiRating,
        notes: sabqiNotes
      },
      manzil: {
        juz: manzilJuz,
        rating: manzilRating,
        notes: manzilNotes
      }
    };

    AppStorage.addHifzRecord(record);
    this.closeHifzModal();
    this.showToast("Alhamdulillah! Hifz evaluation saved for " + date);
  }

  render() {
    this.renderClassFilterDropdown();
    this.renderHifzKPIs();
    this.renderLeaderboardCards();
    this.renderRecordsTable();
  }

  renderClassFilterDropdown() {
    const classFilter = document.getElementById('hifz-class-filter');
    if (!classFilter) return;

    const classes = AppStorage.getClasses();
    const currentVal = this.selectedClassId;

    classFilter.innerHTML = '<option value="all">All Halaqahs</option>' + 
      classes.map(c => `<option value="${c.id}" ${c.id === currentVal ? 'selected' : ''}>${c.name}</option>`).join('');
  }

  updateStudentFilterDropdown() {
    const studentSelect = document.getElementById('hifz-student-filter');
    if (!studentSelect) return;

    let students = AppStorage.getStudents();
    if (this.selectedClassId !== 'all') {
      students = students.filter(s => s.classId === this.selectedClassId);
    }

    studentSelect.innerHTML = `<option value="all">All Students (${students.length})</option>` + 
      students.map(s => `<option value="${s.id}">${s.name}</option>`).join('');
  }

  renderHifzKPIs() {
    const students = AppStorage.getStudents();
    const records = AppStorage.getHifzRecords();

    // Total memorized Ajza across school
    const totalAjza = students.reduce((sum, s) => sum + (s.juzCompleted || 0), 0);
    const avgAjza = students.length > 0 ? (totalAjza / students.length).toFixed(1) : 0;
    
    // Students with >= 25 Juz
    const huffazCandidates = students.filter(s => (s.juzCompleted || 0) >= 25).length;

    // Evaluations this week
    const recentEvals = records.length;

    const ajzaEl = document.getElementById('hifz-stat-ajza');
    const avgEl = document.getElementById('hifz-stat-avg');
    const huffazEl = document.getElementById('hifz-stat-huffaz');
    const evalsEl = document.getElementById('hifz-stat-evals');

    if (ajzaEl) ajzaEl.textContent = totalAjza + ' Ajza';
    if (avgEl) avgEl.textContent = avgAjza + ' / Student';
    if (huffazEl) huffazEl.textContent = huffazCandidates + ' Students';
    if (evalsEl) evalsEl.textContent = recentEvals + ' Logged';
  }

  renderLeaderboardCards() {
    const container = document.getElementById('hifz-student-cards-container');
    if (!container) return;

    let students = AppStorage.getStudents();
    if (this.selectedClassId !== 'all') {
      students = students.filter(s => s.classId === this.selectedClassId);
    }

    // Sort by most Juz completed descending
    students.sort((a, b) => (b.juzCompleted || 0) - (a.juzCompleted || 0));

    if (students.length === 0) {
      container.innerHTML = '<div class="empty-state"><p>No students found in this category.</p></div>';
      return;
    }

    container.innerHTML = students.map((st, rank) => {
      const cls = AppStorage.getClassById(st.classId);
      const studentRecords = AppStorage.getHifzRecords(st.id);
      const avgPerf = calculateAverageRating(studentRecords.map(r => r.sabaq));
      const percentage = Math.round(((st.juzCompleted || 0) / 30) * 100);
      const currentSurah = getSurahById(st.currentSurahId);

      return `
        <div class="hifz-card" data-student-id="${st.id}">
          <div class="hifz-card-header">
            <div class="rank-tag ${rank < 3 ? 'rank-top' : ''}">#${rank + 1}</div>
            <div class="student-header-text">
              <h4 class="st-card-name">${st.name}</h4>
              <span class="st-card-arabic">${st.arabicName || ''}</span>
              <span class="st-card-halaqah">${cls ? cls.name.split('(')[0] : ''}</span>
            </div>
            <button class="btn-icon-subtle btn-quick-log" title="Log Evaluation for ${st.name}" data-student-id="${st.id}">
              ➕ Log
            </button>
          </div>

          <div class="hifz-progress-bar-wrap">
            <div class="hifz-progress-labels">
              <span class="juz-count"><strong>${st.juzCompleted || 0}</strong> of 30 Juz Memorized</span>
              <span class="percentage">${percentage}%</span>
            </div>
            <div class="progress-track">
              <div class="progress-fill" style="width: ${percentage}%;"></div>
            </div>
          </div>

          <div class="hifz-card-meta">
            <div class="meta-item">
              <span class="meta-label">Current Surah</span>
              <span class="meta-value">
                ${currentSurah ? currentSurah.name : 'Al-Fatihah'} 
                ${st.currentAyah ? `(Ayah ${st.currentAyah})` : ''}
              </span>
            </div>
            <div class="meta-item">
              <span class="meta-label">Quality Rating</span>
              <span class="badge ${avgPerf.badgeClass}">${avgPerf.label}</span>
            </div>
          </div>

          <div class="hifz-card-target">
            <span class="target-icon">🎯</span>
            <span class="target-text">${st.target || 'Daily consistent recitation'}</span>
          </div>

          <div class="hifz-card-footer">
            <button class="btn-view-profile" data-student-id="${st.id}">
              View Comprehensive Mushaf & History →
            </button>
          </div>
        </div>
      `;
    }).join('');

    // Attach click events for quick log and profile
    container.querySelectorAll('.btn-quick-log').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.openHifzModal(btn.dataset.studentId);
      });
    });

    container.querySelectorAll('.btn-view-profile').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const studentId = btn.dataset.studentId;
        window.dispatchEvent(new CustomEvent('noor-view-student-profile', { detail: { studentId } }));
      });
    });
  }

  renderRecordsTable() {
    const tableBody = document.getElementById('hifz-records-table-body');
    if (!tableBody) return;

    let records = AppStorage.getHifzRecords();

    if (this.selectedClassId !== 'all') {
      const classStudents = AppStorage.getStudents().filter(s => s.classId === this.selectedClassId).map(s => s.id);
      records = records.filter(r => classStudents.includes(r.studentId));
    }

    if (this.selectedStudentId !== 'all') {
      records = records.filter(r => r.studentId === this.selectedStudentId);
    }

    if (this.filterRating !== 'all') {
      records = records.filter(r => r.sabaq && r.sabaq.rating === this.filterRating);
    }

    if (records.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="6" class="empty-state-cell">
            <div class="empty-state">
              <p>No Hifz records match the current filters.</p>
            </div>
          </td>
        </tr>
      `;
      return;
    }

    tableBody.innerHTML = records.map((rec, idx) => {
      const student = AppStorage.getStudentById(rec.studentId);
      const sabaqSurah = getSurahById(rec.sabaq?.surahId);
      const sabqiSurah = getSurahById(rec.sabqi?.surahId);
      const sabaqRating = PERFORMANCE_RATINGS.find(p => p.value === rec.sabaq?.rating) || { label: 'Good', badgeClass: 'badge-good' };

      return `
        <tr class="hifz-record-row">
          <td>${rec.date}</td>
          <td>
            <strong>${student ? student.name : 'Unknown Student'}</strong>
            <div class="text-muted small">${student ? student.studentCode : ''}</div>
          </td>
          <td>
            <div class="record-section sabaq-badge">
              <strong>${sabaqSurah ? sabaqSurah.name : 'Surah'}</strong>
              <span>Ayah ${rec.sabaq?.ayahStart || 1} - ${rec.sabaq?.ayahEnd || 1}</span>
            </div>
            ${rec.sabaq?.notes ? `<div class="record-notes">"${rec.sabaq.notes}"</div>` : ''}
          </td>
          <td>
            <div class="record-section sabqi-badge">
              <strong>${sabqiSurah ? sabqiSurah.name : 'Surah'}</strong>
              <span>Ayah ${rec.sabqi?.ayahStart || 1} - ${rec.sabqi?.ayahEnd || 1}</span>
            </div>
            ${rec.sabqi?.notes ? `<div class="record-notes">"${rec.sabqi.notes}"</div>` : ''}
          </td>
          <td>
            <div class="record-section manzil-badge">
              <strong>Juz ${rec.manzil?.juz || 1}</strong>
            </div>
            ${rec.manzil?.notes ? `<div class="record-notes">"${rec.manzil.notes}"</div>` : ''}
          </td>
          <td>
            <span class="badge ${sabaqRating.badgeClass}">${sabaqRating.label}</span>
          </td>
        </tr>
      `;
    }).join('');
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
