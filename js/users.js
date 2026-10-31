import { AppStorage } from './storage.js';

export class UserManager {
  constructor() {
    this.filterRole = 'all';
  }

  init() {
    this.bindEvents();
    this.render();
  }

  bindEvents() {
    const openAddUserBtn = document.getElementById('btn-open-add-user-modal');
    const modalCloseBtn = document.getElementById('user-modal-close');
    const modalCancelBtn = document.getElementById('user-modal-cancel');
    const userForm = document.getElementById('user-manage-form');
    const roleFilter = document.getElementById('users-role-filter');
    const roleSelect = document.getElementById('modal-user-role');

    if (openAddUserBtn) {
      openAddUserBtn.addEventListener('click', () => {
        this.openUserModal();
      });
    }

    if (modalCloseBtn) {
      modalCloseBtn.addEventListener('click', () => {
        this.closeUserModal();
      });
    }

    if (modalCancelBtn) {
      modalCancelBtn.addEventListener('click', () => {
        this.closeUserModal();
      });
    }

    if (roleSelect) {
      roleSelect.addEventListener('change', (e) => {
        const val = e.target.value;
        const halaqahGroup = document.getElementById('modal-user-halaqah-group');
        const studentLinkGroup = document.getElementById('modal-user-student-group');
        if (halaqahGroup) halaqahGroup.style.display = val === 'teacher' ? 'block' : 'none';
        if (studentLinkGroup) studentLinkGroup.style.display = (val === 'student' || val === 'parent') ? 'block' : 'none';
      });
    }

    if (userForm) {
      userForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleSaveUser();
      });
    }

    if (roleFilter) {
      roleFilter.addEventListener('change', (e) => {
        this.filterRole = e.target.value;
        this.render();
      });
    }

    window.addEventListener('noor-data-changed', () => {
      this.render();
    });
  }

  openUserModal(userToEdit = null) {
    const dialog = document.getElementById('user-manage-dialog');
    if (!dialog) return;

    const titleEl = document.getElementById('user-dialog-title');
    const idInput = document.getElementById('modal-user-id');
    const nameInput = document.getElementById('modal-user-name');
    const usernameInput = document.getElementById('modal-user-username');
    const passwordInput = document.getElementById('modal-user-password');
    const roleSelect = document.getElementById('modal-user-role');
    const emailInput = document.getElementById('modal-user-email');
    const halaqahSelect = document.getElementById('modal-user-halaqah');
    const studentSelect = document.getElementById('modal-user-student-link');

    // Populate halaqah dropdown
    if (halaqahSelect) {
      halaqahSelect.innerHTML = `<option value="">-- None (General) --</option>` + 
        AppStorage.getClasses().map(c => `<option value="${c.id}">${c.name}</option>`).join('');
    }

    // Populate student dropdown
    if (studentSelect) {
      studentSelect.innerHTML = `<option value="">-- Select Student Profile --</option>` + 
        AppStorage.getStudents().map(s => `<option value="${s.id}">${s.name} (${s.studentCode})</option>`).join('');
    }

    if (userToEdit) {
      if (titleEl) titleEl.textContent = 'Edit System User Account';
      if (idInput) idInput.value = userToEdit.id;
      if (nameInput) nameInput.value = userToEdit.name;
      if (usernameInput) {
        usernameInput.value = userToEdit.username;
        usernameInput.disabled = true; // Don't change existing username
      }
      if (passwordInput) passwordInput.value = userToEdit.password || '';
      if (roleSelect) {
        roleSelect.value = userToEdit.role;
        roleSelect.dispatchEvent(new Event('change'));
      }
      if (emailInput) emailInput.value = userToEdit.email || '';
      if (halaqahSelect) halaqahSelect.value = userToEdit.halaqahId || '';
      if (studentSelect) studentSelect.value = userToEdit.studentId || '';
    } else {
      if (titleEl) titleEl.textContent = 'Add New System User (إضافة مستخدم جديد)';
      if (idInput) idInput.value = '';
      if (nameInput) nameInput.value = '';
      if (usernameInput) {
        usernameInput.value = '';
        usernameInput.disabled = false;
      }
      if (passwordInput) passwordInput.value = '';
      if (roleSelect) {
        roleSelect.value = 'teacher';
        roleSelect.dispatchEvent(new Event('change'));
      }
      if (emailInput) emailInput.value = '';
      if (halaqahSelect) halaqahSelect.value = '';
      if (studentSelect) studentSelect.value = '';
    }

    dialog.showModal();
  }

  closeUserModal() {
    const dialog = document.getElementById('user-manage-dialog');
    if (dialog) dialog.close();
  }

  handleSaveUser() {
    const id = document.getElementById('modal-user-id').value;
    const name = document.getElementById('modal-user-name').value.trim();
    const username = document.getElementById('modal-user-username').value.trim();
    const password = document.getElementById('modal-user-password').value.trim();
    const role = document.getElementById('modal-user-role').value;
    const email = document.getElementById('modal-user-email').value.trim();
    const halaqahId = document.getElementById('modal-user-halaqah').value || null;
    const studentId = document.getElementById('modal-user-student-link').value || null;

    if (!name || !username || !password) {
      alert('Name, username, and password are required.');
      return;
    }

    const payload = {
      id: id || undefined,
      name,
      username,
      password,
      role,
      email,
      halaqahId,
      studentId
    };

    try {
      AppStorage.saveUser(payload);
      this.closeUserModal();
      this.render();

      const toast = document.getElementById('app-toast');
      if (toast) {
        toast.textContent = `User ${username} saved successfully!`;
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 3000);
      }
    } catch (err) {
      alert(err.message);
    }
  }

  render() {
    const container = document.getElementById('users-table-body');
    if (!container) return;

    let users = AppStorage.getUsers();

    if (this.filterRole !== 'all') {
      users = users.filter(u => u.role === this.filterRole);
    }

    if (users.length === 0) {
      container.innerHTML = `
        <tr>
          <td colspan="6" class="empty-state-cell">
            <div class="empty-state"><p>No user accounts found matching criteria.</p></div>
          </td>
        </tr>
      `;
      return;
    }

    container.innerHTML = users.map((u, idx) => {
      const cls = u.halaqahId ? AppStorage.getClassById(u.halaqahId) : null;
      const linkedStudent = u.studentId ? AppStorage.getStudentById(u.studentId) : null;

      let association = '-';
      if (u.role === 'teacher') {
        association = cls ? `Form Master: ${cls.name}` : 'General Instructor';
      } else if (u.role === 'student') {
        association = linkedStudent ? `Student: ${linkedStudent.studentCode}` : 'Profile Linked';
      } else if (u.role === 'parent') {
        association = linkedStudent ? `Parent of: ${linkedStudent.name}` : 'Parent Account';
      } else if (u.role === 'admin') {
        association = 'Full System Oversight';
      }

      return `
        <tr>
          <td>${idx + 1}</td>
          <td>
            <strong>${u.name}</strong>
            <div class="text-muted small">${u.email || u.username + '@school.edu'}</div>
          </td>
          <td>
            <code>${u.username}</code>
          </td>
          <td>
            <span class="role-pill pill-${u.role}">${u.role.toUpperCase()}</span>
          </td>
          <td>${association}</td>
          <td>
            <div style="display: flex; gap: 6px;">
              <button class="btn-icon-subtle btn-edit-user" data-user-id="${u.id}" title="Edit User">
                ✏️
              </button>
              <button class="btn-icon-subtle btn-del-user" style="color: var(--status-absent);" data-user-id="${u.id}" title="Delete User">
                🗑️
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');

    container.querySelectorAll('.btn-edit-user').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.userId;
        const user = AppStorage.getUsers().find(u => u.id === id);
        if (user) this.openUserModal(user);
      });
    });

    container.querySelectorAll('.btn-del-user').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.userId;
        const current = AppStorage.getAuthUser();
        if (current && current.id === id) {
          alert('You cannot delete your own active administrator account!');
          return;
        }
        if (confirm('Are you sure you want to delete this user account?')) {
          AppStorage.deleteUser(id);
          this.render();
        }
      });
    });
  }
}
