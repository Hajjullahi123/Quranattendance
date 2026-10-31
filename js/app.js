import { AppStorage } from './storage.js';
import { AttendanceManager } from './attendance.js';
import { HifzManager } from './hifz.js';
import { StudentPortalManager } from './student-portal.js';
import { TargetManager } from './targets.js';
import { UserManager } from './users.js';

class NoorApp {
  constructor() {
    this.attendanceMgr = new AttendanceManager();
    this.hifzMgr = new HifzManager();
    this.portalMgr = new StudentPortalManager();
    this.targetMgr = new TargetManager();
    this.userMgr = new UserManager();
  }

  init() {
    this.setupTheme();
    this.setupAuth();
    this.setupTenantSwitcher();
    this.setupHijriDate();
    this.setupNavigation();
    this.setupSearch();
    this.setupBackupRestore();

    // Check auth status
    const authUser = AppStorage.getAuthUser();
    if (authUser) {
      this.handleUserLoggedIn(authUser);
    } else {
      this.showLoginModal();
    }

    // React to auth or tenant changes
    window.addEventListener('noor-auth-changed', (e) => {
      const user = e.detail;
      if (user) {
        this.handleUserLoggedIn(user);
      } else {
        this.showLoginModal();
      }
    });

    window.addEventListener('noor-tenant-changed', () => {
      this.updateTenantBranding();
      this.renderOverviewDashboard();
    });

    window.addEventListener('noor-data-changed', () => {
      this.renderOverviewDashboard();
    });
  }

  // --- Authentication System ---
  setupAuth() {
    const loginForm = document.getElementById('login-form');
    const logoutBtn = document.getElementById('btn-header-logout');
    const schoolSelect = document.getElementById('login-school-select');

    if (schoolSelect) {
      schoolSelect.innerHTML = AppStorage.getSchools().map(s => 
        `<option value="${s.id}">${s.name} (${s.code})</option>`
      ).join('');
      schoolSelect.value = AppStorage.getCurrentTenantId();
    }

    if (loginForm) {
      loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const username = document.getElementById('login-username').value;
        const password = document.getElementById('login-password').value;
        const schoolId = schoolSelect ? schoolSelect.value : null;

        const res = AppStorage.login(username, password, schoolId);
        const errBanner = document.getElementById('login-error-banner');

        if (res.success) {
          if (errBanner) errBanner.style.display = 'none';
          this.hideLoginModal();
          this.showToast(`Welcome back, ${res.user.name}!`);
        } else {
          if (errBanner) {
            errBanner.textContent = res.message;
            errBanner.style.display = 'block';
          }
        }
      });
    }

    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        if (confirm('Log out from your academy dashboard?')) {
          AppStorage.logout();
          this.showToast('Logged out successfully.');
        }
      });
    }

    const togglePassBtn = document.getElementById('btn-toggle-login-pass');
    const passInput = document.getElementById('login-password');
    if (togglePassBtn && passInput) {
      togglePassBtn.addEventListener('click', () => {
        const isPass = passInput.type === 'password';
        passInput.type = isPass ? 'text' : 'password';
        togglePassBtn.textContent = isPass ? '🔒' : '👁️';
      });
    }
  }

  showLoginModal() {
    const overlay = document.getElementById('login-overlay');
    if (overlay) overlay.style.display = 'flex';
  }

  hideLoginModal() {
    const overlay = document.getElementById('login-overlay');
    if (overlay) overlay.style.display = 'none';
  }

  handleUserLoggedIn(user) {
    this.hideLoginModal();
    this.updateUserBadge(user);
    this.updateTenantBranding();

    // Re-initialize managers with active tenant
    this.attendanceMgr.init();
    this.hifzMgr.init();
    this.portalMgr.init();
    this.targetMgr.init();
    this.userMgr.init();
    this.renderOverviewDashboard();

    // Configure role-tailored view
    this.applyRolePermissions(user);
  }

  applyRolePermissions(user) {
    const role = user.role;
    
    // Hide or show tabs based on role
    const tabOverview = document.querySelector('.nav-tab-btn[data-tab="overview"]');
    const tabAttendance = document.querySelector('.nav-tab-btn[data-tab="attendance"]');
    const tabHifz = document.querySelector('.nav-tab-btn[data-tab="hifz"]');
    const tabTargets = document.querySelector('.nav-tab-btn[data-tab="targets"]');
    const tabStudent = document.querySelector('.nav-tab-btn[data-tab="student-portal"]');
    const tabUsers = document.querySelector('.nav-tab-btn[data-tab="users"]');
    const tabSettings = document.querySelector('.nav-tab-btn[data-tab="settings"]');

    // Default visibility
    if (tabOverview) tabOverview.style.display = 'inline-flex';
    if (tabAttendance) tabAttendance.style.display = 'inline-flex';
    if (tabHifz) tabHifz.style.display = 'inline-flex';
    if (tabTargets) tabTargets.style.display = 'inline-flex';
    if (tabStudent) tabStudent.style.display = 'inline-flex';
    if (tabUsers) tabUsers.style.display = 'none';
    if (tabSettings) tabSettings.style.display = 'none';

    const adminBanner = document.getElementById('admin-overview-banner');
    if (adminBanner) {
      adminBanner.style.display = role === 'admin' ? 'flex' : 'none';
    }

    if (role === 'admin') {
      if (tabUsers) tabUsers.style.display = 'inline-flex';
      if (tabSettings) tabSettings.style.display = 'inline-flex';
      if (tabOverview) tabOverview.click();
    } else if (role === 'teacher') {
      if (tabOverview) tabOverview.click();
    } else if (role === 'student') {
      // Direct student to their individual dashboard
      if (tabOverview) tabOverview.style.display = 'none';
      if (tabAttendance) tabAttendance.style.display = 'none';
      if (tabTargets) tabTargets.style.display = 'none';
      if (tabHifz) tabHifz.style.display = 'none';

      // Set student portal active and lock to this student's ID
      if (user.studentId) {
        this.portalMgr.activeStudentId = user.studentId;
      }
      if (tabStudent) {
        tabStudent.innerHTML = '<span>📖</span> My Quran Dashboard (لوحتي)';
        tabStudent.click();
      }

      // Hide administrative buttons in student portal
      const addStBtn = document.getElementById('btn-open-add-student-modal');
      const editProfBtn = document.getElementById('btn-profile-edit');
      const studentSelect = document.getElementById('portal-student-select');
      if (addStBtn) addStBtn.style.display = 'none';
      if (editProfBtn) editProfBtn.style.display = 'none';
      if (studentSelect) studentSelect.style.display = 'none';
    } else if (role === 'parent') {
      if (tabOverview) tabOverview.style.display = 'none';
      if (tabAttendance) tabAttendance.style.display = 'none';
      if (tabTargets) tabTargets.style.display = 'none';
      if (tabHifz) tabHifz.style.display = 'none';

      if (user.studentId) {
        this.portalMgr.activeStudentId = user.studentId;
      }
      if (tabStudent) {
        tabStudent.innerHTML = "<span>🎓</span> Child's Progress (ملف الابن)";
        tabStudent.click();
      }
    }
  }

  // --- Multi-Tenant Branding ---
  setupTenantSwitcher() {
    const schoolSelect = document.getElementById('header-tenant-selector');
    if (!schoolSelect) return;

    schoolSelect.innerHTML = AppStorage.getSchools().map(s => 
      `<option value="${s.id}">${s.name}</option>`
    ).join('');
    schoolSelect.value = AppStorage.getCurrentTenantId();

    schoolSelect.addEventListener('change', (e) => {
      AppStorage.setCurrentTenantId(e.target.value);
      this.showToast(`Switched active academy to: ${AppStorage.getCurrentSchool().name}`);
    });
  }

  updateTenantBranding() {
    const school = AppStorage.getCurrentSchool();
    if (!school) return;

    const arabicTitle = document.querySelector('.school-arabic-title');
    const englishTitle = document.querySelector('.school-english-title');
    const tenantSelector = document.getElementById('header-tenant-selector');

    if (arabicTitle) arabicTitle.textContent = school.arabicName;
    if (englishTitle) englishTitle.textContent = `${school.name} • ${school.tagline}`;
    if (tenantSelector) tenantSelector.value = school.id;
  }

  setupTheme() {
    const savedTheme = localStorage.getItem('noor-theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);

    const themeToggleBtn = document.getElementById('theme-toggle-btn');
    if (themeToggleBtn) {
      this.updateThemeButtonIcon(themeToggleBtn, savedTheme);
      themeToggleBtn.addEventListener('click', () => {
        const current = document.documentElement.getAttribute('data-theme') || 'dark';
        const next = current === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem('noor-theme', next);
        this.updateThemeButtonIcon(themeToggleBtn, next);
      });
    }
  }

  updateThemeButtonIcon(btn, theme) {
    btn.innerHTML = theme === 'dark' 
      ? '<span class="icon">☀️</span> Light Mode' 
      : '<span class="icon">🌙</span> Dark Mode';
  }

  setupNavigation() {
    const navButtons = document.querySelectorAll('.nav-tab-btn');
    const tabPanes = document.querySelectorAll('.tab-content-pane');

    navButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const targetTab = btn.dataset.tab;
        navButtons.forEach(b => b.classList.remove('active'));
        tabPanes.forEach(p => p.classList.remove('active'));

        btn.classList.add('active');
        const targetPane = document.getElementById(`tab-${targetTab}`);
        if (targetPane) {
          targetPane.classList.add('active');
        }

        if (targetTab === 'attendance') this.attendanceMgr.render();
        if (targetTab === 'hifz') this.hifzMgr.render();
        if (targetTab === 'targets') this.targetMgr.render();
        if (targetTab === 'student-portal') this.portalMgr.render();
        if (targetTab === 'users') this.userMgr.render();
        if (targetTab === 'overview') this.renderOverviewDashboard();
      });
    });

    document.querySelectorAll('[data-jump-tab]').forEach(btn => {
      btn.addEventListener('click', () => {
        const tab = btn.dataset.jumpTab;
        const targetBtn = document.querySelector(`.nav-tab-btn[data-tab="${tab}"]`);
        if (targetBtn) targetBtn.click();
      });
    });
  }

  updateUserBadge(user) {
    const badge = document.getElementById('user-role-badge');
    const userName = document.getElementById('user-display-name');
    if (badge && user) {
      badge.textContent = user.role.toUpperCase();
      badge.className = `role-pill pill-${user.role}`;
    }
    if (userName && user) {
      userName.textContent = user.name;
    }
  }

  setupHijriDate() {
    const hijriEl = document.getElementById('header-hijri-date');
    if (!hijriEl) return;

    const now = new Date();
    const gregOptions = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
    const gregStr = now.toLocaleDateString('en-US', gregOptions);

    try {
      const hijriFormatter = new Intl.DateTimeFormat('en-US-u-ca-islamic-umalqura', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
      const hijriStr = hijriFormatter.format(now);
      hijriEl.innerHTML = `<strong>${hijriStr} AH</strong> • <span>${gregStr}</span>`;
    } catch (e) {
      hijriEl.innerHTML = `<strong>14 Rabi' al-Thani 1448 AH</strong> • <span>${gregStr}</span>`;
    }
  }

  setupSearch() {
    const searchInput = document.getElementById('global-student-search');
    const searchResults = document.getElementById('search-results-dropdown');
    if (!searchInput || !searchResults) return;

    searchInput.addEventListener('input', (e) => {
      const q = e.target.value.toLowerCase().trim();
      if (!q) {
        searchResults.style.display = 'none';
        searchResults.innerHTML = '';
        return;
      }

      const students = AppStorage.getStudents();
      const matches = students.filter(s => 
        s.name.toLowerCase().includes(q) || 
        (s.arabicName && s.arabicName.includes(q)) ||
        s.studentCode.toLowerCase().includes(q)
      );

      if (matches.length === 0) {
        searchResults.style.display = 'block';
        searchResults.innerHTML = '<div class="search-item empty">No students found.</div>';
        return;
      }

      searchResults.style.display = 'block';
      searchResults.innerHTML = matches.map(s => {
        const cls = AppStorage.getClassById(s.classId);
        return `
          <div class="search-item" data-student-id="${s.id}">
            <div class="st-search-info">
              <strong>${s.name}</strong> <span>(${s.arabicName || ''})</span>
              <small>${s.studentCode} • ${cls ? cls.name : ''}</small>
            </div>
            <span class="search-badge">${s.juzCompleted}/30 Juz</span>
          </div>
        `;
      }).join('');

      searchResults.querySelectorAll('.search-item').forEach(item => {
        item.addEventListener('click', () => {
          const id = item.dataset.studentId;
          searchResults.style.display = 'none';
          searchInput.value = '';
          window.dispatchEvent(new CustomEvent('noor-view-student-profile', { detail: { studentId: id } }));
        });
      });
    });

    document.addEventListener('click', (e) => {
      if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
        searchResults.style.display = 'none';
      }
    });
  }

  setupBackupRestore() {
    const exportBtn = document.getElementById('btn-export-backup');
    const importInput = document.getElementById('input-import-backup');
    const resetBtn = document.getElementById('btn-reset-demo-data');

    if (exportBtn) {
      exportBtn.addEventListener('click', () => {
        const json = AppStorage.exportJSON();
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `academy-backup-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
        this.showToast('Database backup exported successfully.');
      });
    }

    if (importInput) {
      importInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (evt) => {
          const res = AppStorage.importJSON(evt.target.result);
          if (res.success) {
            this.showToast(res.message);
            window.location.reload();
          } else {
            alert('Import Error: ' + res.message);
          }
        };
        reader.readAsText(file);
      });
    }

    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        if (confirm('Reset all multi-tenant academy data to default demo state?')) {
          AppStorage.reset();
          this.showToast('Data reset to multi-tenant demo seed.');
          window.location.reload();
        }
      });
    }

    const adminClearDemoBtn = document.getElementById('btn-admin-clear-demo');
    if (adminClearDemoBtn) {
      adminClearDemoBtn.addEventListener('click', () => {
        if (confirm('Clear all demonstration student records, attendance, and Hifz evaluations? Your administrator account and academy settings will be preserved.')) {
          AppStorage.clearDemoData();
          this.showToast('Demo records cleared! Your registry is now clean and empty.');
          window.location.reload();
        }
      });
    }
  }

  renderOverviewDashboard() {
    const students = AppStorage.getStudents();
    const classes = AppStorage.getClasses();
    const today = new Date().toISOString().split('T')[0];
    const todayAtt = AppStorage.getAttendance(today);
    const hifzRecords = AppStorage.getHifzRecords();

    // KPIs
    const totalStudentsEl = document.getElementById('ov-stat-students');
    const totalClassesEl = document.getElementById('ov-stat-classes');
    const todayAttEl = document.getElementById('ov-stat-attendance');
    const hifzCompleteEl = document.getElementById('ov-stat-hifz');

    if (totalStudentsEl) totalStudentsEl.textContent = students.length;
    if (totalClassesEl) totalClassesEl.textContent = classes.length + ' Halaqahs';

    const presentToday = todayAtt.filter(a => a.status === 'present' || a.status === 'late').length;
    const attPercent = students.length > 0 ? Math.round((presentToday / students.length) * 100) : 0;
    if (todayAttEl) todayAttEl.textContent = `${attPercent}% (${presentToday}/${students.length})`;

    const totalAjza = students.reduce((sum, s) => sum + (s.juzCompleted || 0), 0);
    if (hifzCompleteEl) hifzCompleteEl.textContent = `${totalAjza} Ajza Total`;

    // Activity Feed
    const feedContainer = document.getElementById('overview-activity-feed');
    if (feedContainer) {
      const recentHifz = hifzRecords.slice(0, 5);
      if (recentHifz.length === 0) {
        feedContainer.innerHTML = '<p class="text-muted">No recent activities logged in this academy.</p>';
      } else {
        feedContainer.innerHTML = recentHifz.map(r => {
          const st = AppStorage.getStudentById(r.studentId);
          return `
            <div class="activity-feed-item">
              <div class="feed-icon">📖</div>
              <div class="feed-body">
                <div class="feed-title">
                  <strong>${st ? st.name : 'Student'}</strong> completed Sabaq evaluation
                </div>
                <div class="feed-meta">${r.date} • Quality: <span class="badge badge-good">${r.sabaq?.rating}</span></div>
              </div>
            </div>
          `;
        }).join('');
      }
    }

    // Halaqah Summary Cards
    const halaqahContainer = document.getElementById('overview-halaqah-cards');
    if (halaqahContainer) {
      halaqahContainer.innerHTML = classes.map(c => {
        const clsStudents = students.filter(s => s.classId === c.id);
        const clsAtt = todayAtt.filter(a => a.classId === c.id);
        const presentCount = clsAtt.filter(a => a.status === 'present' || a.status === 'late').length;
        const teacher = (AppStorage.load().teachers || []).find(t => t.id == c.teacherId);

        return `
          <div class="halaqah-summary-card">
            <div class="halaqah-card-header">
              <h3>${c.name}</h3>
              <span class="arabic-tag">${c.arabicName}</span>
            </div>
            <div class="halaqah-details">
              <p><strong>Ustadh:</strong> ${teacher ? teacher.name : 'Assigned Ustadh'}</p>
              <p><strong>Hall:</strong> ${c.room}</p>
              <p><strong>Students:</strong> ${clsStudents.length} enrolled</p>
            </div>
            <div class="halaqah-att-bar">
              <div class="att-bar-label">
                <span>Today's Attendance</span>
                <span>${presentCount}/${clsStudents.length} present</span>
              </div>
              <div class="mini-progress-track">
                <div class="mini-progress-fill" style="width: ${clsStudents.length > 0 ? (presentCount / clsStudents.length) * 100 : 0}%;"></div>
              </div>
            </div>
            <button class="btn-halaqah-action" data-class-id="${c.id}">
              Open Halaqah Register →
            </button>
          </div>
        `;
      }).join('');

      halaqahContainer.querySelectorAll('.btn-halaqah-action').forEach(btn => {
        btn.addEventListener('click', () => {
          const classId = btn.dataset.classId;
          const attClassSelect = document.getElementById('att-class-select');
          if (attClassSelect) {
            attClassSelect.value = classId;
            this.attendanceMgr.selectedClassId = classId;
          }
          const attTabBtn = document.querySelector('.nav-tab-btn[data-tab="attendance"]');
          if (attTabBtn) attTabBtn.click();
        });
      });
    }
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

// Bootstrap on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  const app = new NoorApp();
  app.init();
});
