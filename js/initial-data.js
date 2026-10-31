// Multi-tenant initial seed data with users, credentials, targets, and tenant isolation
export const INITIAL_DATA = {
  // Multi-tenant Schools
  schools: [
    {
      id: "school-1",
      name: "Noor Al-Quran Tahfeez Academy",
      arabicName: "معهد نور القرآن الكريم للتحفيظ والعلوم الشرعية",
      tagline: "Cultivating Hearts with the Light of the Holy Quran",
      code: "NQA",
      session: "2026/2027",
      term: "First Term"
    },
    {
      id: "school-2",
      name: "Darul Quran International School",
      arabicName: "دار القرآن الكريم الدولية لتحفيظ القرآن",
      tagline: "Striving for Excellence in Quranic Preservation",
      code: "DQA",
      session: "2026/2027",
      term: "First Term"
    }
  ],

  // System Users with role-based dashboard access
  users: [
    // School 1 Users
    {
      id: "u-admin-1",
      schoolId: "school-1",
      username: "admin",
      password: "123",
      name: "Sheikh Dr. Ahmad Al-Mansoor",
      arabicName: "الشيخ د. أحمد المنصور",
      role: "admin",
      title: "Academy Principal & Chief Administrator",
      email: "principal@nooralquran.edu",
      phone: "+234 803 000 1122"
    },
    {
      id: "u-teach-101",
      schoolId: "school-1",
      username: "ustadh.abdullah",
      password: "123",
      name: "Ustadh Abdullah Al-Madani",
      arabicName: "الأستاذ عبد الله المدني",
      role: "teacher",
      title: "Senior Tahfeez Master (Form Master - Abu Bakr)",
      email: "abdullah@nooralquran.edu",
      teacherId: 101,
      halaqahId: "c1",
      phone: "+234 803 111 2233"
    },
    {
      id: "u-teach-102",
      schoolId: "school-1",
      username: "ustadh.ibrahim",
      password: "123",
      name: "Ustadh Ibrahim Zakariya",
      arabicName: "الأستاذ إبراهيم زكريا",
      role: "teacher",
      title: "Hifz Instructor (Form Master - Umar)",
      email: "ibrahim@nooralquran.edu",
      teacherId: 102,
      halaqahId: "c2",
      phone: "+234 803 222 3344"
    },
    {
      id: "u-stud-101",
      schoolId: "school-1",
      username: "student.zayd",
      password: "123",
      name: "Zayd Muhammad Al-Hassan",
      arabicName: "زيد محمد الحسن",
      role: "student",
      studentId: "s101",
      email: "zayd@student.nooralquran.edu"
    },
    {
      id: "u-stud-102",
      schoolId: "school-1",
      username: "student.fatimah",
      password: "123",
      name: "Fatimah Zahra Idris",
      arabicName: "فاطمة الزهراء إدريس",
      role: "student",
      studentId: "s102",
      email: "fatimah@student.nooralquran.edu"
    },
    {
      id: "u-parent-501",
      schoolId: "school-1",
      username: "parent.idris",
      password: "123",
      name: "Dr. Idris Abdullahi",
      arabicName: "د. إدريس عبد الله",
      role: "parent",
      studentId: "s102",
      title: "Guardian of Fatimah Zahra",
      email: "idris@parent.edu",
      phone: "+234 802 333 4455"
    },

    // School 2 Users (Multi-tenant demonstration)
    {
      id: "u-admin-2",
      schoolId: "school-2",
      username: "darul.admin",
      password: "123",
      name: "Sheikh Abubakar Kano",
      arabicName: "الشيخ أبو بكر كانو",
      role: "admin",
      title: "Director of Darul Quran",
      email: "director@darulquran.edu"
    },
    {
      id: "u-teach-201",
      schoolId: "school-2",
      username: "darul.teacher",
      password: "123",
      name: "Ustadh Usman Al-Hafiz",
      arabicName: "الأستاذ عثمان الحافظ",
      role: "teacher",
      title: "Form Master - Halaqah Al-Iman",
      email: "usman@darulquran.edu",
      teacherId: 201,
      halaqahId: "c201"
    },
    {
      id: "u-stud-201",
      schoolId: "school-2",
      username: "darul.student",
      password: "123",
      name: "Yahya Mahmud",
      arabicName: "يحيى محمود",
      role: "student",
      studentId: "s501",
      email: "yahya@student.darulquran.edu"
    }
  ],

  teachers: [
    { id: 101, schoolId: "school-1", name: "Ustadh Abdullah Al-Madani", role: "teacher", email: "abdullah@nooralquran.edu", title: "Senior Tahfeez Master (Sheikh)", halaqahId: "c1" },
    { id: 102, schoolId: "school-1", name: "Ustadh Ibrahim Zakariya", role: "teacher", email: "ibrahim@nooralquran.edu", title: "Hifz Instructor", halaqahId: "c2" },
    { id: 103, schoolId: "school-1", name: "Ustadh Bilal Umar", role: "teacher", email: "bilal@nooralquran.edu", title: "Tajweed & Qira'at Specialist", halaqahId: "c3" },
    { id: 104, schoolId: "school-1", name: "Ustadh Ahmad Sulaiman", role: "teacher", email: "ahmad@nooralquran.edu", title: "Beginner Hifz Instructor", halaqahId: "c4" },
    { id: 201, schoolId: "school-2", name: "Ustadh Usman Al-Hafiz", role: "teacher", email: "usman@darulquran.edu", title: "Hifz Master", halaqahId: "c201" }
  ],

  classes: [
    { id: "c1", schoolId: "school-1", name: "Halaqah Abu Bakr (Advanced Hifz)", arabicName: "حلقة أبي بكر الصديق - الخاتمين والمتقدمين", teacherId: 101, level: "Advanced (Juz 20-30)", room: "Hall Al-Rawdah" },
    { id: "c2", schoolId: "school-1", name: "Halaqah Umar Ibn Al-Khattab (Intermediate)", arabicName: "حلقة عمر بن الخطاب - المرحلة المتوسطة", teacherId: 102, level: "Intermediate (Juz 10-19)", room: "Hall Al-Furqan" },
    { id: "c3", schoolId: "school-1", name: "Halaqah Uthman Ibn Affan (Foundational)", arabicName: "حلقة عثمان بن عفان - المرحلة التأسيسية", teacherId: 103, level: "Foundational (Juz 1-9)", room: "Hall Al-Huda" },
    { id: "c4", schoolId: "school-1", name: "Halaqah Ali Ibn Abi Talib (Junior & Tajweed)", arabicName: "حلقة علي بن أبي طالب - الصغار والتجويد", teacherId: 104, level: "Junior (Juz 30 & Amma)", room: "Hall Al-Noor" },
    { id: "c201", schoolId: "school-2", name: "Halaqah Al-Iman", arabicName: "حلقة الإيمان لتحفيظ القرآن", teacherId: 201, level: "All Levels", room: "Darul Quran Hall 1" }
  ],

  students: [
    // School 1 Students
    {
      id: "s101",
      schoolId: "school-1",
      name: "Zayd Muhammad Al-Hassan",
      arabicName: "زيد محمد الحسن",
      studentCode: "NQA-2026-001",
      classId: "c1",
      guardian: "Muhammad Al-Hassan",
      phone: "+234 803 111 2233",
      juzCompleted: 26,
      completedAjzaList: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26],
      currentSurahId: 46,
      currentAyah: 15,
      target: "Complete Juz 27 before end of month",
      admissionDate: "2024-09-10",
      status: "Active"
    },
    {
      id: "s102",
      schoolId: "school-1",
      name: "Fatimah Zahra Idris",
      arabicName: "فاطمة الزهراء إدريس",
      studentCode: "NQA-2026-002",
      classId: "c1",
      guardian: "Dr. Idris Abdullahi",
      phone: "+234 802 333 4455",
      juzCompleted: 28,
      completedAjzaList: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28],
      currentSurahId: 67,
      currentAyah: 20,
      target: "Final revision of Tabarak and Amma for Khatm",
      admissionDate: "2023-01-15",
      status: "Active"
    },
    {
      id: "s103",
      schoolId: "school-1",
      name: "Umar Farooq Danjuma",
      arabicName: "عمر فاروق دانجوما",
      studentCode: "NQA-2026-003",
      classId: "c1",
      guardian: "Engr. Farooq Danjuma",
      phone: "+234 809 777 8899",
      juzCompleted: 22,
      completedAjzaList: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22],
      currentSurahId: 36,
      currentAyah: 45,
      target: "Strengthen Manzil for Juz 15-20",
      admissionDate: "2024-02-01",
      status: "Active"
    },
    {
      id: "s104",
      schoolId: "school-1",
      name: "Aisha Bello Salisu",
      arabicName: "عائشة بيلو سالسو",
      studentCode: "NQA-2026-004",
      classId: "c1",
      guardian: "Bello Salisu",
      phone: "+234 805 222 6677",
      juzCompleted: 24,
      completedAjzaList: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24],
      currentSurahId: 39,
      currentAyah: 32,
      target: "Daily 2-page Sabaq in Juz 25",
      admissionDate: "2023-09-05",
      status: "Active"
    },
    {
      id: "s201",
      schoolId: "school-1",
      name: "Tariq Abdulrahim",
      arabicName: "طارق عبد الرحيم",
      studentCode: "NQA-2026-005",
      classId: "c2",
      guardian: "Abdulrahim Kabir",
      phone: "+234 803 555 1122",
      juzCompleted: 14,
      completedAjzaList: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14],
      currentSurahId: 17,
      currentAyah: 50,
      target: "Memorize Surah Al-Kahf with Tajweed rules",
      admissionDate: "2024-08-20",
      status: "Active"
    },
    {
      id: "s202",
      schoolId: "school-1",
      name: "Maryam Sani Gwadabe",
      arabicName: "مريم ساني جوادابي",
      studentCode: "NQA-2026-006",
      classId: "c2",
      guardian: "Alhaji Sani Gwadabe",
      phone: "+234 814 666 3322",
      juzCompleted: 16,
      completedAjzaList: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16],
      currentSurahId: 20,
      currentAyah: 80,
      target: "Complete Surah Al-Anbiya",
      admissionDate: "2024-01-10",
      status: "Active"
    },
    {
      id: "s203",
      schoolId: "school-1",
      name: "Hamza Mustapha",
      arabicName: "حمزة مصطفى",
      studentCode: "NQA-2026-007",
      classId: "c2",
      guardian: "Mustapha Aliyu",
      phone: "+234 808 999 1234",
      juzCompleted: 11,
      completedAjzaList: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
      currentSurahId: 12,
      currentAyah: 65,
      target: "Memorize Yusuf 65 to end of Surah",
      admissionDate: "2025-01-08",
      status: "Active"
    },
    {
      id: "s204",
      schoolId: "school-1",
      name: "Ruqayyah Jibril",
      arabicName: "رقية جبريل",
      studentCode: "NQA-2026-008",
      classId: "c2",
      guardian: "Ustadh Jibril Adam",
      phone: "+234 807 444 8811",
      juzCompleted: 12,
      completedAjzaList: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
      currentSurahId: 14,
      currentAyah: 20,
      target: "Improve fluency in Sabaqi",
      admissionDate: "2024-10-12",
      status: "Active"
    },
    {
      id: "s301",
      schoolId: "school-1",
      name: "Bilal Nasir Bello",
      arabicName: "بلال ناصر بيلو",
      studentCode: "NQA-2026-009",
      classId: "c3",
      guardian: "Nasir Bello",
      phone: "+234 812 345 6789",
      juzCompleted: 5,
      completedAjzaList: [1, 2, 3, 4, 5],
      currentSurahId: 5,
      currentAyah: 35,
      target: "Master rules of Madd in Al-Ma'idah",
      admissionDate: "2025-05-15",
      status: "Active"
    },
    {
      id: "s401",
      schoolId: "school-1",
      name: "Ibrahim Ahmad Garko",
      arabicName: "إبراهيم أحمد جاركو",
      studentCode: "NQA-2026-012",
      classId: "c4",
      guardian: "Ahmad Garko",
      phone: "+234 802 888 7766",
      juzCompleted: 1,
      completedAjzaList: [30],
      currentSurahId: 67,
      currentAyah: 10,
      target: "Memorize Surah Al-Mulk 1-15",
      admissionDate: "2025-09-01",
      status: "Active"
    },

    // School 2 Students (Darul Quran)
    {
      id: "s501",
      schoolId: "school-2",
      name: "Yahya Mahmud",
      arabicName: "يحيى محمود",
      studentCode: "DQA-2026-001",
      classId: "c201",
      guardian: "Mahmud Umar",
      phone: "+234 803 999 8877",
      juzCompleted: 10,
      completedAjzaList: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
      currentSurahId: 10,
      currentAyah: 25,
      target: "Complete Surah Yunus",
      admissionDate: "2025-01-10",
      status: "Active"
    }
  ],

  // Structured Targets set by teachers for students
  targets: [
    {
      id: "t-1",
      schoolId: "school-1",
      studentId: "s101",
      teacherId: 101,
      title: "Complete Juz 27 (Al-Ahqaf to Adh-Dhariyat)",
      targetType: "juz",
      targetJuz: 27,
      deadline: "2026-11-15",
      status: "in-progress",
      assignedDate: "2026-10-20",
      notes: "Pay special attention to Mutashabihat in Surah Muhammad and Al-Fath."
    },
    {
      id: "t-2",
      schoolId: "school-1",
      studentId: "s102",
      teacherId: 101,
      title: "Final Revision of Tabarak (Juz 29) for Khatm Preparation",
      targetType: "juz",
      targetJuz: 29,
      deadline: "2026-11-01",
      status: "in-progress",
      assignedDate: "2026-10-18",
      notes: "Targeting complete memorization perfection before Khatm ceremony."
    },
    {
      id: "t-3",
      schoolId: "school-1",
      studentId: "s201",
      teacherId: 102,
      title: "Memorize Surah Al-Kahf (1-110) with Tajweed",
      targetType: "surah",
      targetSurahId: 18,
      deadline: "2026-11-10",
      status: "in-progress",
      assignedDate: "2026-10-22",
      notes: "Daily 15 Ayahs memorization with evening review."
    },
    {
      id: "t-4",
      schoolId: "school-1",
      studentId: "s401",
      teacherId: 104,
      title: "Memorize Surah Al-Mulk (Ayah 1-30)",
      targetType: "surah",
      targetSurahId: 67,
      deadline: "2026-11-05",
      status: "completed",
      assignedDate: "2026-10-10",
      notes: "Masha'Allah passed with Distinction!"
    }
  ],

  attendance: [
    { date: "2026-10-24", schoolId: "school-1", studentId: "s101", classId: "c1", status: "present", note: "" },
    { date: "2026-10-24", schoolId: "school-1", studentId: "s102", classId: "c1", status: "present", note: "" },
    { date: "2026-10-24", schoolId: "school-1", studentId: "s103", classId: "c1", status: "late", note: "Traffic delays" },
    { date: "2026-10-24", schoolId: "school-1", studentId: "s104", classId: "c1", status: "present", note: "" },
    { date: "2026-10-24", schoolId: "school-1", studentId: "s201", classId: "c2", status: "present", note: "" },
    { date: "2026-10-24", schoolId: "school-1", studentId: "s202", classId: "c2", status: "present", note: "" },
    { date: "2026-10-24", schoolId: "school-1", studentId: "s203", classId: "c2", status: "excused", note: "Medical appointment" },
    { date: "2026-10-24", schoolId: "school-1", studentId: "s204", classId: "c2", status: "present", note: "" },
    { date: "2026-10-24", schoolId: "school-1", studentId: "s301", classId: "c3", status: "present", note: "" },
    { date: "2026-10-24", schoolId: "school-1", studentId: "s401", classId: "c4", status: "present", note: "" },

    { date: "2026-10-25", schoolId: "school-1", studentId: "s101", classId: "c1", status: "present", note: "Early arrival at Fajr Halaqah" },
    { date: "2026-10-25", schoolId: "school-1", studentId: "s102", classId: "c1", status: "present", note: "Active participation" },
    { date: "2026-10-25", schoolId: "school-1", studentId: "s103", classId: "c1", status: "present", note: "" },
    { date: "2026-10-25", schoolId: "school-1", studentId: "s104", classId: "c1", status: "present", note: "" },
    { date: "2026-10-25", schoolId: "school-1", studentId: "s201", classId: "c2", status: "present", note: "" },
    { date: "2026-10-25", schoolId: "school-1", studentId: "s202", classId: "c2", status: "present", note: "" },
    { date: "2026-10-25", schoolId: "school-1", studentId: "s203", classId: "c2", status: "present", note: "" },
    { date: "2026-10-25", schoolId: "school-1", studentId: "s204", classId: "c2", status: "late", note: "15 mins late" },
    { date: "2026-10-25", schoolId: "school-1", studentId: "s301", classId: "c3", status: "present", note: "" },
    { date: "2026-10-25", schoolId: "school-1", studentId: "s401", classId: "c4", status: "present", note: "" },

    // School 2 Attendance
    { date: "2026-10-25", schoolId: "school-2", studentId: "s501", classId: "c201", status: "present", note: "On time" }
  ],

  hifzRecords: [
    {
      id: "h-rec-1",
      schoolId: "school-1",
      date: "2026-10-25",
      studentId: "s101",
      teacherId: 101,
      sabaq: {
        surahId: 46,
        ayahStart: 1,
        ayahEnd: 15,
        rating: "excellent",
        notes: "Masha'Allah fluent makharij and flawless tajweed."
      },
      sabqi: {
        surahId: 45,
        ayahStart: 20,
        ayahEnd: 37,
        rating: "excellent",
        notes: "Solid retention of recent lessons."
      },
      manzil: {
        juz: 12,
        surahId: 11,
        rating: "good",
        notes: "Minor hesitation on Mutashabihat in Hud, revised on spot."
      }
    },
    {
      id: "h-rec-2",
      schoolId: "school-1",
      date: "2026-10-25",
      studentId: "s102",
      teacherId: 101,
      sabaq: {
        surahId: 67,
        ayahStart: 1,
        ayahEnd: 20,
        rating: "excellent",
        notes: "Beautiful tartil and melodious recitation."
      },
      sabqi: {
        surahId: 66,
        ayahStart: 1,
        ayahEnd: 12,
        rating: "excellent",
        notes: "Completely firm."
      },
      manzil: {
        juz: 25,
        surahId: 42,
        rating: "excellent",
        notes: "Excellent command over entire Juz 25."
      }
    },
    {
      id: "h-rec-3",
      schoolId: "school-1",
      date: "2026-10-25",
      studentId: "s201",
      teacherId: 102,
      sabaq: {
        surahId: 17,
        ayahStart: 35,
        ayahEnd: 55,
        rating: "good",
        notes: "Good effort, focus on Ghunnah of Noon Mushaddadah."
      },
      sabqi: {
        surahId: 16,
        ayahStart: 100,
        ayahEnd: 128,
        rating: "good",
        notes: "Passed smoothly."
      },
      manzil: {
        juz: 5,
        surahId: 4,
        rating: "fair",
        notes: "Needs extra repetition on Juz 5 stops."
      }
    },
    {
      id: "h-rec-4",
      schoolId: "school-1",
      date: "2026-10-25",
      studentId: "s401",
      teacherId: 104,
      sabaq: {
        surahId: 67,
        ayahStart: 1,
        ayahEnd: 10,
        rating: "excellent",
        notes: "Fast memorizer, enthusiastic."
      },
      sabqi: {
        surahId: 78,
        ayahStart: 1,
        ayahEnd: 40,
        rating: "good",
        notes: "Solid."
      },
      manzil: {
        juz: 30,
        surahId: 88,
        rating: "excellent",
        notes: "Very clean recitation."
      }
    },

    // School 2 Hifz Record
    {
      id: "h-rec-201",
      schoolId: "school-2",
      date: "2026-10-25",
      studentId: "s501",
      teacherId: 201,
      sabaq: {
        surahId: 10,
        ayahStart: 15,
        ayahEnd: 25,
        rating: "good",
        notes: "Clean recitation, good pace."
      },
      sabqi: {
        surahId: 9,
        ayahStart: 120,
        ayahEnd: 129,
        rating: "good",
        notes: "Firm retention."
      },
      manzil: {
        juz: 4,
        rating: "good",
        notes: "Revised quarter Juz."
      }
    }
  ]
};
