'use strict';

const { mahasiswa, dosen, kategori, prodi, fakultas, finalprojects, researchs, berkas, users } = require('../databases/models');
const fs = require('fs');
const path = require('path');
const { nanoid } = require('nanoid');
const { Op } = require('sequelize');
const Validator = require('fastest-validator');
const v = new Validator();
const { faker } = require('@faker-js/faker');
const bcrypt = require('bcrypt');
const saltRounds = 10;


// Controller function to create a category
async function createCategory(req, res, next) {
  try {
    // Generate a unique kategori_id using nanoid
    const kategori_id = nanoid(20);

    // Data to be validated and inserted
    const data = {
      kategori_id, // Use the generated ID
      nama_kategori: req.body.nama_kategori,
    };

    // Validation schema
    const schema = {
      kategori_id: { type: 'string', min: 1, max: 20, optional: false },
      nama_kategori: { type: 'string', min: 1, max: 100, optional: false },
    };

    // Validate the data
    const validationResult = v.validate(data, schema);
    if (validationResult !== true) {
      return res.status(400).json({
        message: 'Validation Failed',
        data: validationResult
      });
    }

    // Create the category
    const newCategory = await kategori.create(data);

    // Respond with success
    res.status(201).json({
      message: 'Category Created Successfully',
      data: newCategory
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: 'Create Category Failed',
      data: err
    });
  }
}
async function getAllCategories(req, res, next) {
    try {
      // Retrieve all categories from the database
      const categories = await kategori.findAll();
  
      // Respond with the retrieved categories
      res.status(200).json({
        message: 'Categories Retrieved Successfully',
        data: categories
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({
        message: 'Retrieve Categories Failed',
        data: err
      });
    }
  }

async function generateAccounts(req, res, next) {
    try {
      // Generate User for Fakultas
      const fakultasUsername = faker.internet.userName();
      const hashedFakultasPassword = await bcrypt.hash(fakultasUsername, saltRounds);
      const fakultasUser = await users.create({
        user_id: nanoid(20),
        username: fakultasUsername,
        email: faker.internet.email(),
        password: hashedFakultasPassword,
        role: 'fakultas',
        isActive: true
      });
  
      // Create Fakultas
      const Fakultas = await fakultas.create({
        fakultas_id: nanoid(20),
        nama_fakultas: faker.company.name(),
        user_id: fakultasUser.user_id
      });
  
      // Generate User for Prodi
      const prodiUsername = faker.internet.userName();
      const hashedProdiPassword = await bcrypt.hash(prodiUsername, saltRounds);
      const prodiUser = await users.create({
        user_id: nanoid(20),
        username: prodiUsername,
        email: faker.internet.email(),
        password: hashedProdiPassword,
        role: 'prodi',
        isActive: true
      });
  
      // Create Prodi
      const Prodi = await prodi.create({
        prodi_id: nanoid(20),
        nama_prodi: faker.commerce.department(),
        user_id: prodiUser.user_id,
        fakultas_id: Fakultas.fakultas_id // Use the correct Fakultas ID
      });
  
      // Generate User for Mahasiswa
      const mahasiswaUsername = faker.internet.userName();
      const hashedMahasiswaPassword = await bcrypt.hash(mahasiswaUsername, saltRounds);
      const mahasiswaUser = await users.create({
        user_id: nanoid(20),
        username: mahasiswaUsername,
        email: faker.internet.email(),
        password: hashedMahasiswaPassword,
        role: 'mahasiswa',
        isActive: true
      });
  
      // Create Mahasiswa
      const Mahasiswa = await mahasiswa.create({
        mahasiswa_id: nanoid(20),
        nama_mahasiswa: faker.person.fullName(), // Use the correct method
        nik: faker.random.alphaNumeric(16),
        nim: faker.random.alphaNumeric(10),
        alamat: faker.address.streetAddress(),
        tempat_lahir: faker.address.city(),
        tanggal_lahir: faker.date.past(20, new Date(2000, 0, 1)),
        jenis_kelamin: faker.helpers.arrayElement(['Laki-laki', 'Perempuan']),
        url_foto: faker.image.avatar(),
        nomor_hp: faker.phone.number(),
        user_id: mahasiswaUser.user_id,
        prodi_id: Prodi.prodi_id,
        fakultas_id: Fakultas.fakultas_id // Use the correct Fakultas ID
      });
  
      res.status(201).json({
        message: 'Accounts Generated Successfully',
        data: {
          fakultas: Fakultas,
          prodi: Prodi,
          mahasiswa: Mahasiswa
        }
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({
        message: 'Account Generation Failed',
        data: err
      });
    }
}

const fakultasProdiMap = {
  '3iAjdNWSLbPBHLGGDzEf': ['IexjqR2P2NZ__amD2Pb-', 'NOSmFjDlSfkYVCTAIMmk', 'vOXUglfY7bJJPiVqmvAy'],
  'aUIT3bkXdvECY1nZJi0N': ['et15eddRKGPjSW1NgJ93', '25WJkrJOjVSUmBggNQ3T', 'FPNnUsbJvqfduj2UBBnS', '09vRI4Wjs4TXOFYNnHee']
};

function getRandomElement(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function generateDosenAccounts(req, res, next) {
  try {
    // Pilih fakultas_id dan prodi_id secara acak
    const fakultas_id = getRandomElement(Object.keys(fakultasProdiMap));
    const prodi_id = getRandomElement(fakultasProdiMap[fakultas_id]);

    // Generate User for Dosen
    const dosenUsername = faker.internet.userName();
    const hashedDosenPassword = await bcrypt.hash(dosenUsername, saltRounds);
    const dosenUser = await users.create({
      user_id: nanoid(20),
      username: dosenUsername,
      email: faker.internet.email(),
      password: hashedDosenPassword,
      role: 'dosen',
      isActive: true
    });

    // Create Dosen
    const Dosen = await dosen.create({
      dosen_id: nanoid(20),
      nama_dosen: faker.person.fullName(), // Use the correct method
      nik: faker.random.alphaNumeric(16),
      nidn: faker.random.alphaNumeric(10),
      alamat: faker.address.streetAddress(),
      tempat_lahir: faker.address.city(),
      tanggal_lahir: faker.date.past(40, new Date(1980, 0, 1)),
      jenis_kelamin: faker.helpers.arrayElement(['Laki-laki', 'Perempuan']),
      url_foto: faker.image.avatar(),
      nomor_hp: faker.phone.number(),
      user_id: dosenUser.user_id,
      prodi_id: prodi_id, // Use the random Prodi ID
      fakultas_id: fakultas_id // Use the random Fakultas ID
    });

    res.status(201).json({
      message: 'Dosen Account Generated Successfully',
      data: Dosen
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: 'Dosen Account Generation Failed',
      data: err
    });
  }
}

async function generateMahasiswaAccounts(req, res, next) {
  try {
    // Pilih fakultas_id dan prodi_id secara acak
    const fakultas_id = getRandomElement(Object.keys(fakultasProdiMap));
    const prodi_id = getRandomElement(fakultasProdiMap[fakultas_id]);

    // Generate User for Mahasiswa
    const mahasiswaUsername = faker.internet.userName();
    const hashedMahasiswaPassword = await bcrypt.hash(mahasiswaUsername, saltRounds);
    const mahasiswaUser = await users.create({
      user_id: nanoid(20),
      username: mahasiswaUsername,
      email: faker.internet.email(),
      password: hashedMahasiswaPassword,
      role: 'mahasiswa',
      isActive: true
    });

    // Create Mahasiswa
    const Mahasiswa = await mahasiswa.create({
      mahasiswa_id: nanoid(20),
      nama_mahasiswa: faker.person.fullName(), // Use the correct method
      nik: faker.random.alphaNumeric(16),
      nim: faker.random.alphaNumeric(10),
      alamat: faker.address.streetAddress(),
      tempat_lahir: faker.address.city(),
      tanggal_lahir: faker.date.past(20, new Date(2000, 0, 1)),
      jenis_kelamin: faker.helpers.arrayElement(['Laki-laki', 'Perempuan']),
      url_foto: faker.image.avatar(),
      nomor_hp: faker.phone.number(),
      user_id: mahasiswaUser.user_id,
      prodi_id: prodi_id, // Use the random Prodi ID
      fakultas_id: fakultas_id // Use the random Fakultas ID
    });

    res.status(201).json({
      message: 'Mahasiswa Account Generated Successfully',
      data: Mahasiswa
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: 'Mahasiswa Account Generation Failed',
      data: err
    });
  }
}




function getRandomElement(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function generateFinalProjects(req, res, next) {
  try {
    const { addTemplates, sentence , lorem, } = await import('txtgen');

    const keywords = [
      'Kecerdasan Buatan', 'Pembelajaran Mesin', 'Algoritma Genetika', 'Jaringan Saraf Tiruan', 
      'Data Besar', 'Analisis Data', 'Pengolahan Citra', 'Pemrosesan Bahasa Alami', 
      'Robotika', 'Sistem Terdistribusi', 'Komputasi Awan', 'Keamanan Siber', 'Kriptografi', 
      'Blockchain', 'Internet of Things', 'Sensor Cerdas', 'Sistem Informasi', 'Basis Data', 
      'Manajemen Proyek', 'Pengembangan Perangkat Lunak', 'Sistem Operasi', 'Arsitektur Jaringan', 
      'Teknologi Web', 'User Experience', 'User Interface', 'Aplikasi Mobile', 'Pengembangan Game', 
      'Augmented Reality', 'Virtual Reality', 'Teknologi Informasi', 'Infrastruktur TI', 
      'Cloud Computing', 'Big Data Analytics', 'Business Intelligence', 'Sistem Manajemen Basis Data', 
      'Data Warehouse', 'Data Mining', 'Text Mining', 'Visualisasi Data', 'Statistik', 
      'Metodologi Penelitian', 'Eksperimen', 'Studi Kasus', 'Teknik Sampling', 'Analisis Kualitatif', 
      'Analisis Kuantitatif', 'Evaluasi', 'Penilaian Kinerja', 'Pengujian', 'Validasi', 
      'Verifikasi', 'Hipotesis', 'Model Statistik', 'Pengendalian Mutu', 'Proses Bisnis', 
      'Sistem Pendukung Keputusan', 'Kecerdasan Bisnis', 'Pengelolaan Risiko', 'Etika TI', 
      'Kepatuhan', 'Audit TI', 'Pengujian Perangkat Lunak', 'Usability Testing', 
      'Pengembangan Web Responsif', 'Sistem Terintegrasi', 'Otomasi', 'Analisis Risiko', 
      'Sistem Keamanan', 'Pengelolaan Data', 'Arsitektur Basis Data', 'Sistem Informasi Geografis', 
      'E-commerce', 'Mobile Commerce', 'Sistem Pembayaran Digital', 'Manajemen Rantai Pasokan', 
      'Logistik', 'Operasi Bisnis', 'Manajemen Sumber Daya Manusia', 'Pelatihan', 
      'Pengembangan Karir', 'Motivasi Karyawan', 'Kepemimpinan', 'Manajemen Kinerja', 
      'Organisasi', 'Struktur Organisasi', 'Kebijakan Perusahaan', 'Manajemen Keuangan', 
      'Perencanaan Strategis', 'Analisis SWOT', 'Manajemen Proses', 'Pengukuran Kinerja', 
      'Kepuasan Pelanggan', 'Layanan Pelanggan', 'Pengalaman Pelanggan', 'Loyalty Program', 
      'Pemasaran Digital', 'Strategi Pemasaran', 'Penelitian Pasar', 'Segmentasi Pasar', 
      'Positioning Produk', 'Branding', 'Public Relations', 'Komunikasi Pemasaran', 
      'Media Sosial', 'Iklan', 'Promosi Penjualan', 'Penjualan', 'Distribusi', 'Riset Konsumen', 
      'Tren Pasar', 'Analisis Kompetitif', 'Manajemen Produk', 'Inovasi', 'Pengembangan Produk', 
      'Siklus Hidup Produk', 'Penetapan Harga', 'Taktik Penjualan', 'Jaringan Distribusi', 
      'Teknologi Pemasaran', 'Strategi Pertumbuhan', 'Analisis Kelayakan', 'Rencana Bisnis', 
      'Studi Kelayakan', 'Prototipe', 'Pengujian Pasar', 'Evaluasi Dampak', 'Penerapan Teknologi', 
      'Sistem Otomatisasi', 'Sistem Kontrol', 'Pengendalian Proses', 'Pemantauan', 
      'Diagnostik', 'Prediksi', 'Simulasi', 'Model Peramalan', 'Keputusan Bisnis', 
      'Pengambilan Keputusan', 'Teknik Negosiasi', 'Manajemen Konflik', 'Perubahan Organisasi', 
      'Manajemen Proyek TI', 'Pengelolaan Proyek', 'Metode Agile', 'Scrum', 'Kanban', 
      'Manajemen Anggaran', 'Penjadwalan Proyek', 'Pengendalian Proyek', 'Estimasi Proyek', 
      'Analisis Proyek', 'Kualitas Proyek', 'Manajemen Waktu', 'Efisiensi Proyek', 
      'Manajemen Sumber Daya', 'Pengelolaan Portofolio', 'Penelitian dan Pengembangan', 
      'Inovasi Teknologi', 'Penelitian Terapan', 'Studi Literatur', 'Analisis Data Kualitatif', 
      'Analisis Data Kuantitatif', 'Kajian Teoritis', 'Metode Penelitian', 'Teknik Penelitian', 
      'Pendekatan Penelitian', 'Proses Penelitian', 'Validitas Penelitian', 'Reliabilitas Penelitian', 
      'Pengumpulan Data', 'Pengolahan Data', 'Analisis Statistik', 'Teknik Analisis', 
      'Model Penelitian', 'Framework Penelitian', 'Metode Eksperimen', 'Penelitian Lapangan', 
      'Penelitian Laboratorium', 'Studi Eksploratif', 'Studi Deskriptif', 'Studi Kausal', 
      'Analisis Korelasi', 'Analisis Regresi', 'Analisis Varians', 'Analisis Faktorial', 
      'Pengujian Hipotesis', 'Uji Statistik', 'Teknik Sampling', 'Model Matematis', 
      'Simulasi Komputer', 'Teknik Visualisasi', 'Algoritma', 'Metode Numerik', 
      'Analisis Algoritma', 'Komputasi Paralel', 'Komputasi Distribusi', 'Teknologi Cerdas', 
      'Otomatisasi Industri', 'Teknologi Sensor', 'Perangkat Keras', 'Perangkat Lunak', 
      'Teknologi Telekomunikasi', 'Jaringan Komputer', 'Infrastruktur Jaringan', 
      'Pengembangan Jaringan', 'Arsitektur Jaringan', 'Sistem Telekomunikasi', 'Teknologi 5G', 
      'Komunikasi Data', 'Protokol Jaringan', 'Keamanan Jaringan', 'Manajemen Jaringan', 
      'Perangkat Jaringan', 'Teknologi Mobilitas', 'Sistem Navigasi', 
      'Sistem Informasi Manufaktur', 'Pengolahan Sinyal', 'Teknologi Sensor Cerdas', 
      'Sistem Embedded', 'Sistem Real-Time', 'Teknologi Digital', 'Teknologi Analog', 
      'Sistem Kontrol Otomatis', 'Teknologi Mechatronics', 'Teknik Mekatronika', 
      'Sistem Kontrol Industri', 'Teknologi Penginderaan Jauh', 'Sistem Pengukuran', 
      'Sistem Pengendalian', 'Teknologi Produksi', 'Manufaktur Pintar', 'Sistem Kualitas', 
      'Pengendalian Kualitas', 'Analisis Proses', 'Manajemen Rantai Nilai', 'Integrasi Sistem', 
      'Optimasi Proses', 'Efisiensi Energi', 'Sistem Energi Terbarukan', 'Teknologi Hijau', 
      'Manajemen Energi', 'Teknologi Lingkungan', 'Pengelolaan Sumber Daya Alam', 
      'Konservasi Energi', 'Pengelolaan Limbah', 'Analisis Lingkungan', 'Teknologi Biologi', 
      'Bioinformatika', 'Bioteknologi', 'Genetika', 'Rekayasa Genetik', 'Biologi Molekuler', 
      'Biologi Sel', 'Mikrobiologi', 'Imunologi', 'Farmasi', 'Ilmu Kesehatan', 
      'Epidemiologi', 'Penelitian Kesehatan', 'Manajemen Kesehatan', 'Teknologi Kesehatan', 
      'Sistem Kesehatan', 'Analisis Kesehatan', 'Kesehatan Masyarakat', 'Teknologi Medis', 
      'E-health', 'Telemedicine', 'Pengembangan Obat', 'Penelitian Klinis', 'Uji Klinis', 
      'Terapi', 'Diagnosis', 'Pengobatan', 'Teknologi Biomedis', 'Pengelolaan Klinik', 
      'Manajemen Rumah Sakit', 'Sistem Informasi Kesehatan', 'Riset Medis', 'Inovasi Medis', 
      'Teknologi Analisis', 'Teknologi Imunisasi', 'Pengembangan Produk Kesehatan', 
      'Teknologi Terapeutik', 'Alat Medis', 'Kesehatan Digital', 'Penelitian Sosial', 
      'Ilmu Sosial', 'Psikologi', 'Sosiologi', 'Antropologi', 'Ilmu Politik', 
      'Pendidikan', 'Metodologi Pendidikan', 'Evaluasi Pendidikan', 'Kurikulum', 
      'Pembelajaran', 'Pengajaran', 'Teknologi Pendidikan', 'Manajemen Pendidikan', 
      'Pengembangan Kurikulum', 'Penelitian Pendidikan', 'Psikologi Pendidikan', 
      'Pembelajaran Jarak Jauh', 'Pendidikan Online', 'Pendidikan Berbasis Teknologi', 
      'Inovasi Pendidikan', 'Pendidikan Anak Usia Dini', 'Pendidikan Tinggi', 
      'Pendidikan Formal', 'Pendidikan Nonformal', 'Pendidikan Informal', 'Penilaian Pendidikan', 
      'Kualitas Pendidikan', 'Pembangunan Pendidikan', 'Pendidikan Global', 
      'Kebijakan Pendidikan', 'Reformasi Pendidikan', 'Pendidikan Multikultural', 
      'Pendidikan Inklusif', 'Pendidikan Kewarganegaraan', 'Pendidikan Lingkungan', 
      'Pendidikan Kesehatan', 'Pendidikan Teknik', 'Pendidikan Seni', 'Pendidikan Jasmani', 
      'Pendidikan Bahasa', 'Pendidikan Matematika', 'Pendidikan Ilmu Pengetahuan', 
      'Pendidikan Sains', 'Pendidikan Teknologi', 'Pendidikan Ekonomi', 'Pendidikan Sosial', 
      'Pendidikan Agama', 'Pendidikan Moral', 'Pendidikan Kejuruan', 'Pendidikan Dasar', 
      'Pendidikan Menengah', 'Pendidikan Lanjutan', 'Pendidikan Profesional', 'Pendidikan Korporat', 
      'Penelitian Pengembangan', 'Riset Inovasi', 'Penerapan Ilmu Pengetahuan', 
      'Teknologi Industri', 'Pengembangan Teknologi', 'Riset Teknologi', 'Penelitian Terapan', 
      'Studi Teknik', 'Teknik Industri', 'Teknik Mesin', 'Teknik Elektronika', 
      'Teknik Sipil', 'Teknik Kimia', 'Teknik Arsitektur', 'Teknik Lingkungan', 
      'Teknik Perkapalan', 'Teknik Perminyakan', 'Teknik Biomedis', 'Teknik Otomasi', 
      'Teknik Komputer', 'Teknik Telekomunikasi', 'Teknik Energi', 'Teknik Material', 
      'Teknik Transportasi', 'Teknik Geologi', 'Teknik Geofisika', 'Teknik Geodesi', 
      'Teknik Instrumentasi', 'Teknik Perancangan', 'Teknik Produksi', 'Teknik Kontrol', 
      'Teknik Konstruksi', 'Teknik Pengeboran', 'Teknik Pemrosesan', 'Teknik Laboratorium', 
      'Teknik Pengolahan', 'Teknik Pengemasan', 'Teknik Pengembangan Produk', 
      'Teknik Pengujian', 'Teknik Pengendalian', 'Teknik Perawatan', 'Teknik Perbaikan', 
      'Teknik Perancangan Sistem', 'Teknik Kualitas', 'Teknik Penanganan', 
      'Teknik Pengujian Kualitas', 'Teknik Pengendalian Kualitas', 'Teknik Penyimpanan', 
      'Teknik Logistik', 'Teknik Manufaktur', 'Teknik Sistem', 'Teknik Arsitektur Sistem', 
      'Teknik Jaringan', 'Teknik Basis Data', 'Teknik Sistem Informasi', 'Teknik Aplikasi', 
      'Teknik Pengembangan', 'Teknik Perangkat Lunak', 'Teknik Perangkat Keras', 
      'Teknik Komunikasi', 'Teknik Transportasi', 'Teknik Pengolahan Citra', 
      'Teknik Bioteknologi', 'Teknik Perencanaan', 'Teknik Operasi', 'Teknik Proses', 
      'Teknik Riset', 'Teknik Analisis', 'Teknik Simulasi', 'Teknik Statistik', 
      'Teknik Metodologi', 'Teknik Perencanaan Sistem', 'Teknik Desain', 'Teknik Implementasi', 
      'Teknik Perencanaan Proyek', 'Teknik Pengelolaan Proyek', 'Teknik Konstruksi Bangunan', 
      'Teknik Pengelolaan Energi', 'Teknik Pengendalian Energi', 'Teknik Pengolahan Limbah', 
      'Teknik Konservasi Energi', 'Teknik Pengembangan Teknologi', 'Teknik Penelitian', 
      'Teknik Pengujian Sistem', 'Teknik Pemantauan', 'Teknik Diagnostik', 
      'Teknik Evaluasi', 'Teknik Verifikasi', 'Teknik Validasi', 'Teknik Uji', 
      'Teknik Analisis Sistem', 'Teknik Perbaikan Proses', 'Teknik Otomatisasi Proses', 
      'Teknik Pengembangan Aplikasi', 'Teknik Pengembangan Sistem', 
      'Teknik Pengembangan Produk', 'Teknik Pengembangan Perangkat Lunak', 
      'Teknik Pengembangan Perangkat Keras', 'Teknik Pengembangan Sistem Informasi', 
      'Teknik Pengembangan Teknologi Informasi', 'Teknik Pengembangan Teknologi Komunikasi', 
      'Teknik Pengembangan Teknologi Industri', 'Teknik Pengembangan Teknologi Lingkungan', 
      'Teknik Pengembangan Teknologi Energi', 'Teknik Pengembangan Teknologi Kesehatan', 
      'Teknik Pengembangan Teknologi Medis', 'Teknik Pengembangan Teknologi Biomedis', 
      'Teknik Pengembangan Teknologi Farmasi', 'Teknik Pengembangan Teknologi Nutrisi', 
      'Teknik Pengembangan Teknologi Bioteknologi', 'Teknik Pengembangan Teknologi Pertanian', 
      'Teknik Pengembangan Teknologi Peternakan', 'Teknik Pengembangan Teknologi Perikanan', 
      'Teknik Pengembangan Teknologi Kehutanan', 'Teknik Pengembangan Teknologi Perkebunan', 
      'Teknik Pengembangan Teknologi Pertambangan', 'Teknik Pengembangan Teknologi Geologi', 
      'Teknik Pengembangan Teknologi Geofisika', 'Teknik Pengembangan Teknologi Geodesi', 
      'Teknik Pengembangan Teknologi Geografi', 'Teknik Pengembangan Teknologi Meteorologi', 
      'Teknik Pengembangan Teknologi Oseanografi', 'Teknik Pengembangan Teknologi Astronomi', 
      'Teknik Pengembangan Teknologi Fisika', 'Teknik Pengembangan Teknologi Kimia', 
      'Teknik Pengembangan Teknologi Biologi', 'Teknik Pengembangan Teknologi Matematika', 
      'Teknik Pengembangan Teknologi Statistik', 'Teknik Pengembangan Teknologi Ekonomi', 
      'Teknik Pengembangan Teknologi Sosial', 'Teknik Pengembangan Teknologi Politik', 
      'Teknik Pengembangan Teknologi Hukum', 'Teknik Pengembangan Teknologi Administrasi', 
      'Teknik Pengembangan Teknologi Manajemen', 'Teknik Pengembangan Teknologi Pendidikan', 
      'Teknik Pengembangan Teknologi Psikologi', 'Teknik Pengembangan Teknologi Sosiologi', 
      'Teknik Pengembangan Teknologi Antropologi', 'Teknik Pengembangan Teknologi Ilmu Politik', 
      'Teknik Pengembangan Teknologi Hukum', 'Teknik Pengembangan Teknologi Kebijakan', 
      'Teknik Pengembangan Teknologi Komunikasi', 'Teknik Pengembangan Teknologi Pemasaran', 
      'Teknik Pengembangan Teknologi Penjualan', 'Teknik Pengembangan Teknologi Distribusi', 
      'Teknik Pengembangan Teknologi Produksi'
    ];

    const templates = [
      '{{a_noun}} adalah komponen kunci dalam pengembangan {{noun}}.',
      'Memahami {{a_noun}} meningkatkan efisiensi {{an_adjective}} {{noun}}.',
      'Masa depan {{noun}} bergantung pada kemajuan dalam {{a_noun}}.',
      'Inovasi dalam {{a_noun}} mengubah manajemen {{noun}}.',
      'Bagaimana {{noun}} dapat memanfaatkan {{a_noun}} untuk kinerja yang lebih baik.',
      'Dampak {{a_noun}} pada tren {{noun}}.',
      'Menjelajahi metode baru dalam {{a_noun}} untuk aplikasi {{noun}}.',
      'Tantangan dalam menerapkan {{a_noun}} di bidang {{noun}}.',
      'Peran {{a_noun}} dalam meningkatkan kemampuan {{noun}}.',
      'Prospek masa depan {{a_noun}} di sektor {{noun}}.',
      'Pentingnya {{a_noun}} untuk pengembangan {{noun}}.',
      'Membandingkan pendekatan tradisional dan modern terhadap {{a_noun}} dalam {{noun}}.',
      'Menganalisis efektivitas {{a_noun}} dalam strategi {{noun}}.',
      'Solusi inovatif menggunakan {{a_noun}} untuk optimasi {{noun}}.',
      'Studi kasus tentang {{a_noun}} dan dampaknya pada {{noun}}.',
      '{{noun}} membutuhkan {{a_noun}} untuk meningkatkan kinerja.',
      'Bagaimana {{a_noun}} dapat mempercepat perkembangan {{noun}}.',
      'Kaitan antara {{a_noun}} dan {{noun}} dalam konteks saat ini.',
      'Strategi efektif dalam menggunakan {{a_noun}} untuk {{noun}}.',
      'Keuntungan dari integrasi {{a_noun}} dalam {{noun}}.',
      'Tantangan yang dihadapi dalam penggunaan {{a_noun}} di {{noun}}.',
      'Penerapan {{a_noun}} dalam {{noun}}: Studi dan Observasi.',
      'Tren terbaru dalam {{a_noun}} yang mempengaruhi {{noun}}.',
      'Perkembangan terbaru dalam {{a_noun}} dan dampaknya pada {{noun}}.',
      'Faktor-faktor yang mempengaruhi {{a_noun}} dalam {{noun}}.',
      'Cara {{a_noun}} meningkatkan hasil {{noun}}.',
      'Analisis mendalam tentang {{a_noun}} dalam konteks {{noun}}.',
      'Bagaimana {{noun}} beradaptasi dengan kemajuan {{a_noun}}.',
      'Peran strategis {{a_noun}} dalam pengembangan {{noun}}.',
      'Implikasi penggunaan {{a_noun}} untuk {{noun}} di masa depan.',
      'Evaluasi pendekatan {{a_noun}} dalam {{noun}} yang sedang berkembang.',
      'Studi empiris tentang {{a_noun}} dan {{noun}}.',
      'Penilaian kritis terhadap {{a_noun}} dalam konteks {{noun}}.',
      'Pengaruh {{a_noun}} terhadap efisiensi {{noun}}.',
      'Strategi implementasi {{a_noun}} untuk {{noun}} yang lebih baik.',
      'Manfaat jangka panjang dari {{a_noun}} dalam {{noun}}.',
      'Analisis manfaat dan tantangan {{a_noun}} di {{noun}}.',
      'Bagaimana {{a_noun}} berkontribusi pada inovasi {{noun}}.',
      'Memahami peran {{a_noun}} dalam memajukan {{noun}}.',
      'Perubahan besar yang dibawa oleh {{a_noun}} dalam {{noun}}.',
      'Kaitan antara kemajuan {{a_noun}} dan {{noun}}.',
      'Tren dan perkembangan terbaru dalam {{a_noun}} dan dampaknya pada {{noun}}.',
      'Mengoptimalkan {{a_noun}} untuk hasil maksimal dalam {{noun}}.',
      'Solusi berbasis {{a_noun}} untuk tantangan {{noun}}.',
      'Cara efektif menerapkan {{a_noun}} dalam konteks {{noun}}.',
      'Pentingnya {{a_noun}} untuk masa depan {{noun}}.',
      'Studi tentang pengaruh {{a_noun}} terhadap {{noun}}.',
      'Evaluasi pendekatan {{a_noun}} dalam {{noun}} untuk hasil optimal.',
      'Peran {{a_noun}} dalam transformasi {{noun}}.',
      'Inovasi terbaru dalam {{a_noun}} dan dampaknya pada {{noun}}.',
      'Bagaimana {{a_noun}} dapat meningkatkan kualitas {{noun}}.',
      'Implementasi {{a_noun}} dan pengaruhnya terhadap {{noun}}.',
      'Masa depan {{noun}} dengan perkembangan {{a_noun}}.',
      'Pendekatan baru dalam {{a_noun}} untuk {{noun}}.',
      'Analisis penerapan {{a_noun}} dalam {{noun}}.',
      'Strategi pengembangan {{a_noun}} untuk memperkuat {{noun}}.',
      'Faktor kunci dalam mengoptimalkan {{a_noun}} untuk {{noun}}.',
      'Tren masa depan dalam {{a_noun}} dan implikasinya untuk {{noun}}.',
      'Solusi praktis menggunakan {{a_noun}} dalam {{noun}}.',
      'Pengaruh {{a_noun}} pada performa {{noun}}.',
      'Bagaimana {{a_noun}} mendukung pengembangan {{noun}}.',
      'Menerapkan {{a_noun}} dalam {{noun}} untuk hasil yang lebih baik.',
      'Penerapan inovatif {{a_noun}} dalam {{noun}}.',
      'Evaluasi dampak {{a_noun}} pada {{noun}}.',
      'Menilai efektivitas {{a_noun}} untuk {{noun}}.',
      'Studi kasus penerapan {{a_noun}} dalam {{noun}}.',
      'Bagaimana {{a_noun}} dapat mengubah lanskap {{noun}}.',
      'Analisis tren {{a_noun}} dalam {{noun}}.',
      'Membahas tantangan {{a_noun}} dalam {{noun}}.',
      'Perspektif baru dalam {{a_noun}} untuk {{noun}}.',
      'Peran {{a_noun}} dalam transformasi {{noun}}.'
    ];
    
    

    

    // Get all mahasiswa
    const allMahasiswa = await mahasiswa.findAll();
    if (allMahasiswa.length === 0) {
      return res.status(400).json({ message: 'No mahasiswa found' });
    }

    // Select a random mahasiswa
    const selectedMahasiswa = getRandomElement(allMahasiswa);
    const { mahasiswa_id, fakultas_id, prodi_id } = selectedMahasiswa;

    // Get all dosen
    const allDosen = await dosen.findAll();
    if (allDosen.length === 0) {
      return res.status(400).json({ message: 'No dosen found' });
    }

   // Select up to 2 random dosen
   const selectedDosen = [];
   for (let i = 0; i < 2; i++) {
     const randomDosen = getRandomElement(allDosen);
     if (!selectedDosen.includes(randomDosen.dosen_id)) {
       selectedDosen.push(randomDosen.dosen_id);
     }
   }

   // Get all kategori
   const allKategori = await kategori.findAll();
   if (allKategori.length === 0) {
     return res.status(400).json({ message: 'No kategori found' });
   }

   // Select a random kategori
   const selectedKategori = getRandomElement(allKategori);
   const kategori_id = selectedKategori.kategori_id;

    // Buat entri berkas dengan URL statis
    const berkasEntries = await Promise.all([1, 2, 3].map(async () => {
      const berkas_id = nanoid(20);
      const url_berkas = 'https://digilibs.sgp1.digitaloceanspaces.com/sample.pdf';
      await berkas.create({
        berkas_id,
        url_berkas,
        project_id: null, // Akan diperbarui nanti
        research_id: null,
      });
      return berkas_id;
    }));

    addTemplates(templates);


     // Generate abstract using txtgen
     let abstract = '';
     let abstract_eng = '';
     let title = '';
     let title_eng = '';
     
     // Generate title
     while (title.split(' ').length < 10) {
       title += ' ' + getRandomElement(templates).replace(/{{a_noun}}/g, getRandomElement(keywords)).replace(/{{noun}}/g, getRandomElement(keywords)).replace(/{{an_adjective}}/g, faker.word.adjective());
     }
     while (title_eng.split(' ').length < 10) {
       title_eng += ' ' + getRandomElement(templates).replace(/{{a_noun}}/g, getRandomElement(keywords)).replace(/{{noun}}/g, getRandomElement(keywords)).replace(/{{an_adjective}}/g, faker.word.adjective());
     }
     
     // Generate abstract
     while (abstract.split(' ').length < 500) {
       abstract += ' ' + getRandomElement(templates).replace(/{{a_noun}}/g, getRandomElement(keywords)).replace(/{{noun}}/g, getRandomElement(keywords)).replace(/{{an_adjective}}/g, faker.word.adjective());
     }
     while (abstract_eng.split(' ').length < 500) {
       abstract_eng += ' ' + getRandomElement(templates).replace(/{{a_noun}}/g, getRandomElement(keywords)).replace(/{{noun}}/g, getRandomElement(keywords)).replace(/{{an_adjective}}/g, faker.word.adjective());
     }
 

    // Create finalproject entry
    const finalProject = await finalprojects.create({
      project_id: nanoid(20),
      title: title.trim(),
      title_eng: title_eng.trim(),
      abstract: abstract.trim(),
      abstract_eng: abstract_eng.trim(),
      catatan: faker.lorem.sentence(),
      status: 'Pending',
      total_views: 0,
      url_finalprojects: 'https://digilibs.sgp1.digitaloceanspaces.com/sample.pdf',
      user_id: selectedMahasiswa.user_id,
      mahasiswa_id,
      fakultas_id,
      prodi_id,
      submissionDate: new Date(),
      approvalDate: null,
    });

    // Update berkas entries with project_id
    await berkas.update({ project_id: finalProject.project_id }, {
      where: {
        berkas_id: {
          [Op.in]: berkasEntries
        }
      }
    });

        // Update berkas entries with project_id
        await berkas.update({ project_id: finalProject.project_id }, {
          where: {
            berkas_id: {
              [Op.in]: berkasEntries
            }
          }
        });
    
        // Create dosenfinalprojects entries
         // Create dosenfinalprojects entries
    await Promise.all(selectedDosen.map(async (dosen_id) => {
      await finalProject.addKontributor(dosen_id);
    }));

    // Membuat entri kategorifinalprojects
    await finalProject.addKategori(kategori_id);

    res.status(201).json({
      message: 'Final Project Generated Successfully',
      data: finalProject
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: 'Final Project Generation Failed',
      data: err
    });
  }
}


async function generateResearch(req, res, next) {
  try {
    const { addTemplates, sentence, lorem } = await import('txtgen');

    const keywords = [
      'Kecerdasan Buatan', 'Pembelajaran Mesin', 'Algoritma Genetika', 'Jaringan Saraf Tiruan', 
      'Data Besar', 'Analisis Data', 'Pengolahan Citra', 'Pemrosesan Bahasa Alami', 
      'Robotika', 'Sistem Terdistribusi', 'Komputasi Awan', 'Keamanan Siber', 'Kriptografi', 
      'Blockchain', 'Internet of Things', 'Sensor Cerdas', 'Sistem Informasi', 'Basis Data', 
      'Manajemen Proyek', 'Pengembangan Perangkat Lunak', 'Sistem Operasi', 'Arsitektur Jaringan', 
      'Teknologi Web', 'User Experience', 'User Interface', 'Aplikasi Mobile', 'Pengembangan Game', 
      'Augmented Reality', 'Virtual Reality', 'Teknologi Informasi', 'Infrastruktur TI', 
      'Cloud Computing', 'Big Data Analytics', 'Business Intelligence', 'Sistem Manajemen Basis Data', 
      'Data Warehouse', 'Data Mining', 'Text Mining', 'Visualisasi Data', 'Statistik', 
      'Metodologi Penelitian', 'Eksperimen', 'Studi Kasus', 'Teknik Sampling', 'Analisis Kualitatif', 
      'Analisis Kuantitatif', 'Evaluasi', 'Penilaian Kinerja', 'Pengujian', 'Validasi', 
      'Verifikasi', 'Hipotesis', 'Model Statistik', 'Pengendalian Mutu', 'Proses Bisnis', 
      'Sistem Pendukung Keputusan', 'Kecerdasan Bisnis', 'Pengelolaan Risiko', 'Etika TI', 
      'Kepatuhan', 'Audit TI', 'Pengujian Perangkat Lunak', 'Usability Testing', 
      'Pengembangan Web Responsif', 'Sistem Terintegrasi', 'Otomasi', 'Analisis Risiko', 
      'Sistem Keamanan', 'Pengelolaan Data', 'Arsitektur Basis Data', 'Sistem Informasi Geografis', 
      'E-commerce', 'Mobile Commerce', 'Sistem Pembayaran Digital', 'Manajemen Rantai Pasokan', 
      'Logistik', 'Operasi Bisnis', 'Manajemen Sumber Daya Manusia', 'Pelatihan', 
      'Pengembangan Karir', 'Motivasi Karyawan', 'Kepemimpinan', 'Manajemen Kinerja', 
      'Organisasi', 'Struktur Organisasi', 'Kebijakan Perusahaan', 'Manajemen Keuangan', 
      'Perencanaan Strategis', 'Analisis SWOT', 'Manajemen Proses', 'Pengukuran Kinerja', 
      'Kepuasan Pelanggan', 'Layanan Pelanggan', 'Pengalaman Pelanggan', 'Loyalty Program', 
      'Pemasaran Digital', 'Strategi Pemasaran', 'Penelitian Pasar', 'Segmentasi Pasar', 
      'Positioning Produk', 'Branding', 'Public Relations', 'Komunikasi Pemasaran', 
      'Media Sosial', 'Iklan', 'Promosi Penjualan', 'Penjualan', 'Distribusi', 'Riset Konsumen', 
      'Tren Pasar', 'Analisis Kompetitif', 'Manajemen Produk', 'Inovasi', 'Pengembangan Produk', 
      'Siklus Hidup Produk', 'Penetapan Harga', 'Taktik Penjualan', 'Jaringan Distribusi', 
      'Teknologi Pemasaran', 'Strategi Pertumbuhan', 'Analisis Kelayakan', 'Rencana Bisnis', 
      'Studi Kelayakan', 'Prototipe', 'Pengujian Pasar', 'Evaluasi Dampak', 'Penerapan Teknologi', 
      'Sistem Otomatisasi', 'Sistem Kontrol', 'Pengendalian Proses', 'Pemantauan', 
      'Diagnostik', 'Prediksi', 'Simulasi', 'Model Peramalan', 'Keputusan Bisnis', 
      'Pengambilan Keputusan', 'Teknik Negosiasi', 'Manajemen Konflik', 'Perubahan Organisasi', 
      'Manajemen Proyek TI', 'Pengelolaan Proyek', 'Metode Agile', 'Scrum', 'Kanban', 
      'Manajemen Anggaran', 'Penjadwalan Proyek', 'Pengendalian Proyek', 'Estimasi Proyek', 
      'Analisis Proyek', 'Kualitas Proyek', 'Manajemen Waktu', 'Efisiensi Proyek', 
      'Manajemen Sumber Daya', 'Pengelolaan Portofolio', 'Penelitian dan Pengembangan', 
      'Inovasi Teknologi', 'Penelitian Terapan', 'Studi Literatur', 'Analisis Data Kualitatif', 
      'Analisis Data Kuantitatif', 'Kajian Teoritis', 'Metode Penelitian', 'Teknik Penelitian', 
      'Pendekatan Penelitian', 'Proses Penelitian', 'Validitas Penelitian', 'Reliabilitas Penelitian', 
      'Pengumpulan Data', 'Pengolahan Data', 'Analisis Statistik', 'Teknik Analisis', 
      'Model Penelitian', 'Framework Penelitian', 'Metode Eksperimen', 'Penelitian Lapangan', 
      'Penelitian Laboratorium', 'Studi Eksploratif', 'Studi Deskriptif', 'Studi Kausal', 
      'Analisis Korelasi', 'Analisis Regresi', 'Analisis Varians', 'Analisis Faktorial', 
      'Pengujian Hipotesis', 'Uji Statistik', 'Teknik Sampling', 'Model Matematis', 
      'Simulasi Komputer', 'Teknik Visualisasi', 'Algoritma', 'Metode Numerik', 
      'Analisis Algoritma', 'Komputasi Paralel', 'Komputasi Distribusi', 'Teknologi Cerdas', 
      'Otomatisasi Industri', 'Teknologi Sensor', 'Perangkat Keras', 'Perangkat Lunak', 
      'Teknologi Telekomunikasi', 'Jaringan Komputer', 'Infrastruktur Jaringan', 
      'Pengembangan Jaringan', 'Arsitektur Jaringan', 'Sistem Telekomunikasi', 'Teknologi 5G', 
      'Komunikasi Data', 'Protokol Jaringan', 'Keamanan Jaringan', 'Manajemen Jaringan', 
      'Perangkat Jaringan', 'Teknologi Mobilitas', 'Sistem Navigasi', 
      'Sistem Informasi Manufaktur', 'Pengolahan Sinyal', 'Teknologi Sensor Cerdas', 
      'Sistem Embedded', 'Sistem Real-Time', 'Teknologi Digital', 'Teknologi Analog', 
      'Sistem Kontrol Otomatis', 'Teknologi Mechatronics', 'Teknik Mekatronika', 
      'Sistem Kontrol Industri', 'Teknologi Penginderaan Jauh', 'Sistem Pengukuran', 
      'Sistem Pengendalian', 'Teknologi Produksi', 'Manufaktur Pintar', 'Sistem Kualitas', 
      'Pengendalian Kualitas', 'Analisis Proses', 'Manajemen Rantai Nilai', 'Integrasi Sistem', 
      'Optimasi Proses', 'Efisiensi Energi', 'Sistem Energi Terbarukan', 'Teknologi Hijau', 
      'Manajemen Energi', 'Teknologi Lingkungan', 'Pengelolaan Sumber Daya Alam', 
      'Konservasi Energi', 'Pengelolaan Limbah', 'Analisis Lingkungan', 'Teknologi Biologi', 
      'Bioinformatika', 'Bioteknologi', 'Genetika', 'Rekayasa Genetik', 'Biologi Molekuler', 
      'Biologi Sel', 'Mikrobiologi', 'Imunologi', 'Farmasi', 'Ilmu Kesehatan', 
      'Epidemiologi', 'Penelitian Kesehatan', 'Manajemen Kesehatan', 'Teknologi Kesehatan', 
      'Sistem Kesehatan', 'Analisis Kesehatan', 'Kesehatan Masyarakat', 'Teknologi Medis', 
      'E-health', 'Telemedicine', 'Pengembangan Obat', 'Penelitian Klinis', 'Uji Klinis', 
      'Terapi', 'Diagnosis', 'Pengobatan', 'Teknologi Biomedis', 'Pengelolaan Klinik', 
      'Manajemen Rumah Sakit', 'Sistem Informasi Kesehatan', 'Riset Medis', 'Inovasi Medis', 
      'Teknologi Analisis', 'Teknologi Imunisasi', 'Pengembangan Produk Kesehatan', 
      'Teknologi Terapeutik', 'Alat Medis', 'Kesehatan Digital', 'Penelitian Sosial', 
      'Ilmu Sosial', 'Psikologi', 'Sosiologi', 'Antropologi', 'Ilmu Politik', 
      'Pendidikan', 'Metodologi Pendidikan', 'Evaluasi Pendidikan', 'Kurikulum', 
      'Pembelajaran', 'Pengajaran', 'Teknologi Pendidikan', 'Manajemen Pendidikan', 
      'Pengembangan Kurikulum', 'Penelitian Pendidikan', 'Psikologi Pendidikan', 
      'Pembelajaran Jarak Jauh', 'Pendidikan Online', 'Pendidikan Berbasis Teknologi', 
      'Inovasi Pendidikan', 'Pendidikan Anak Usia Dini', 'Pendidikan Tinggi', 
      'Pendidikan Formal', 'Pendidikan Nonformal', 'Pendidikan Informal', 'Penilaian Pendidikan', 
      'Kualitas Pendidikan', 'Pembangunan Pendidikan', 'Pendidikan Global', 
      'Kebijakan Pendidikan', 'Reformasi Pendidikan', 'Pendidikan Multikultural', 
      'Pendidikan Inklusif', 'Pendidikan Kewarganegaraan', 'Pendidikan Lingkungan', 
      'Pendidikan Kesehatan', 'Pendidikan Teknik', 'Pendidikan Seni', 'Pendidikan Jasmani', 
      'Pendidikan Bahasa', 'Pendidikan Matematika', 'Pendidikan Ilmu Pengetahuan', 
      'Pendidikan Sains', 'Pendidikan Teknologi', 'Pendidikan Ekonomi', 'Pendidikan Sosial', 
      'Pendidikan Agama', 'Pendidikan Moral', 'Pendidikan Kejuruan', 'Pendidikan Dasar', 
      'Pendidikan Menengah', 'Pendidikan Lanjutan', 'Pendidikan Profesional', 'Pendidikan Korporat', 
      'Penelitian Pengembangan', 'Riset Inovasi', 'Penerapan Ilmu Pengetahuan', 
      'Teknologi Industri', 'Pengembangan Teknologi', 'Riset Teknologi', 'Penelitian Terapan', 
      'Studi Teknik', 'Teknik Industri', 'Teknik Mesin', 'Teknik Elektronika', 
      'Teknik Sipil', 'Teknik Kimia', 'Teknik Arsitektur', 'Teknik Lingkungan', 
      'Teknik Perkapalan', 'Teknik Perminyakan', 'Teknik Biomedis', 'Teknik Otomasi', 
      'Teknik Komputer', 'Teknik Telekomunikasi', 'Teknik Energi', 'Teknik Material', 
      'Teknik Transportasi', 'Teknik Geologi', 'Teknik Geofisika', 'Teknik Geodesi', 
      'Teknik Instrumentasi', 'Teknik Perancangan', 'Teknik Produksi', 'Teknik Kontrol', 
      'Teknik Konstruksi', 'Teknik Pengeboran', 'Teknik Pemrosesan', 'Teknik Laboratorium', 
      'Teknik Pengolahan', 'Teknik Pengemasan', 'Teknik Pengembangan Produk', 
      'Teknik Pengujian', 'Teknik Pengendalian', 'Teknik Perawatan', 'Teknik Perbaikan', 
      'Teknik Perancangan Sistem', 'Teknik Kualitas', 'Teknik Penanganan', 
      'Teknik Pengujian Kualitas', 'Teknik Pengendalian Kualitas', 'Teknik Penyimpanan', 
      'Teknik Logistik', 'Teknik Manufaktur', 'Teknik Sistem', 'Teknik Arsitektur Sistem', 
      'Teknik Jaringan', 'Teknik Basis Data', 'Teknik Sistem Informasi', 'Teknik Aplikasi', 
      'Teknik Pengembangan', 'Teknik Perangkat Lunak', 'Teknik Perangkat Keras', 
      'Teknik Komunikasi', 'Teknik Transportasi', 'Teknik Pengolahan Citra', 
      'Teknik Bioteknologi', 'Teknik Perencanaan', 'Teknik Operasi', 'Teknik Proses', 
      'Teknik Riset', 'Teknik Analisis', 'Teknik Simulasi', 'Teknik Statistik', 
      'Teknik Metodologi', 'Teknik Perencanaan Sistem', 'Teknik Desain', 'Teknik Implementasi', 
      'Teknik Perencanaan Proyek', 'Teknik Pengelolaan Proyek', 'Teknik Konstruksi Bangunan', 
      'Teknik Pengelolaan Energi', 'Teknik Pengendalian Energi', 'Teknik Pengolahan Limbah', 
      'Teknik Konservasi Energi', 'Teknik Pengembangan Teknologi', 'Teknik Penelitian', 
      'Teknik Pengujian Sistem', 'Teknik Pemantauan', 'Teknik Diagnostik', 
      'Teknik Evaluasi', 'Teknik Verifikasi', 'Teknik Validasi', 'Teknik Uji', 
      'Teknik Analisis Sistem', 'Teknik Perbaikan Proses', 'Teknik Otomatisasi Proses', 
      'Teknik Pengembangan Aplikasi', 'Teknik Pengembangan Sistem', 
      'Teknik Pengembangan Produk', 'Teknik Pengembangan Perangkat Lunak', 
      'Teknik Pengembangan Perangkat Keras', 'Teknik Pengembangan Sistem Informasi', 
      'Teknik Pengembangan Teknologi Informasi', 'Teknik Pengembangan Teknologi Komunikasi', 
      'Teknik Pengembangan Teknologi Industri', 'Teknik Pengembangan Teknologi Lingkungan', 
      'Teknik Pengembangan Teknologi Energi', 'Teknik Pengembangan Teknologi Kesehatan', 
      'Teknik Pengembangan Teknologi Medis', 'Teknik Pengembangan Teknologi Biomedis', 
      'Teknik Pengembangan Teknologi Farmasi', 'Teknik Pengembangan Teknologi Nutrisi', 
      'Teknik Pengembangan Teknologi Bioteknologi', 'Teknik Pengembangan Teknologi Pertanian', 
      'Teknik Pengembangan Teknologi Peternakan', 'Teknik Pengembangan Teknologi Perikanan', 
      'Teknik Pengembangan Teknologi Kehutanan', 'Teknik Pengembangan Teknologi Perkebunan', 
      'Teknik Pengembangan Teknologi Pertambangan', 'Teknik Pengembangan Teknologi Geologi', 
      'Teknik Pengembangan Teknologi Geofisika', 'Teknik Pengembangan Teknologi Geodesi', 
      'Teknik Pengembangan Teknologi Geografi', 'Teknik Pengembangan Teknologi Meteorologi', 
      'Teknik Pengembangan Teknologi Oseanografi', 'Teknik Pengembangan Teknologi Astronomi', 
      'Teknik Pengembangan Teknologi Fisika', 'Teknik Pengembangan Teknologi Kimia', 
      'Teknik Pengembangan Teknologi Biologi', 'Teknik Pengembangan Teknologi Matematika', 
      'Teknik Pengembangan Teknologi Statistik', 'Teknik Pengembangan Teknologi Ekonomi', 
      'Teknik Pengembangan Teknologi Sosial', 'Teknik Pengembangan Teknologi Politik', 
      'Teknik Pengembangan Teknologi Hukum', 'Teknik Pengembangan Teknologi Administrasi', 
      'Teknik Pengembangan Teknologi Manajemen', 'Teknik Pengembangan Teknologi Pendidikan', 
      'Teknik Pengembangan Teknologi Psikologi', 'Teknik Pengembangan Teknologi Sosiologi', 
      'Teknik Pengembangan Teknologi Antropologi', 'Teknik Pengembangan Teknologi Ilmu Politik', 
      'Teknik Pengembangan Teknologi Hukum', 'Teknik Pengembangan Teknologi Kebijakan', 
      'Teknik Pengembangan Teknologi Komunikasi', 'Teknik Pengembangan Teknologi Pemasaran', 
      'Teknik Pengembangan Teknologi Penjualan', 'Teknik Pengembangan Teknologi Distribusi', 
      'Teknik Pengembangan Teknologi Produksi'
    ];

    const templates = [
      '{{a_noun}} adalah komponen kunci dalam pengembangan {{noun}}.',
      'Memahami {{a_noun}} meningkatkan efisiensi {{an_adjective}} {{noun}}.',
      'Masa depan {{noun}} bergantung pada kemajuan dalam {{a_noun}}.',
      'Inovasi dalam {{a_noun}} mengubah manajemen {{noun}}.',
      'Bagaimana {{noun}} dapat memanfaatkan {{a_noun}} untuk kinerja yang lebih baik.',
      'Dampak {{a_noun}} pada tren {{noun}}.',
      'Menjelajahi metode baru dalam {{a_noun}} untuk aplikasi {{noun}}.',
      'Tantangan dalam menerapkan {{a_noun}} di bidang {{noun}}.',
      'Peran {{a_noun}} dalam meningkatkan kemampuan {{noun}}.',
      'Prospek masa depan {{a_noun}} di sektor {{noun}}.',
      'Pentingnya {{a_noun}} untuk pengembangan {{noun}}.',
      'Membandingkan pendekatan tradisional dan modern terhadap {{a_noun}} dalam {{noun}}.',
      'Menganalisis efektivitas {{a_noun}} dalam strategi {{noun}}.',
      'Solusi inovatif menggunakan {{a_noun}} untuk optimasi {{noun}}.',
      'Studi kasus tentang {{a_noun}} dan dampaknya pada {{noun}}.',
      '{{noun}} membutuhkan {{a_noun}} untuk meningkatkan kinerja.',
      'Bagaimana {{a_noun}} dapat mempercepat perkembangan {{noun}}.',
      'Kaitan antara {{a_noun}} dan {{noun}} dalam konteks saat ini.',
      'Strategi efektif dalam menggunakan {{a_noun}} untuk {{noun}}.',
      'Keuntungan dari integrasi {{a_noun}} dalam {{noun}}.',
      'Tantangan yang dihadapi dalam penggunaan {{a_noun}} di {{noun}}.',
      'Penerapan {{a_noun}} dalam {{noun}}: Studi dan Observasi.',
      'Tren terbaru dalam {{a_noun}} yang mempengaruhi {{noun}}.',
      'Perkembangan terbaru dalam {{a_noun}} dan dampaknya pada {{noun}}.',
      'Faktor-faktor yang mempengaruhi {{a_noun}} dalam {{noun}}.',
      'Cara {{a_noun}} meningkatkan hasil {{noun}}.',
      'Analisis mendalam tentang {{a_noun}} dalam konteks {{noun}}.',
      'Bagaimana {{noun}} beradaptasi dengan kemajuan {{a_noun}}.',
      'Peran strategis {{a_noun}} dalam pengembangan {{noun}}.',
      'Implikasi penggunaan {{a_noun}} untuk {{noun}} di masa depan.',
      'Evaluasi pendekatan {{a_noun}} dalam {{noun}} yang sedang berkembang.',
      'Studi empiris tentang {{a_noun}} dan {{noun}}.',
      'Penilaian kritis terhadap {{a_noun}} dalam konteks {{noun}}.',
      'Pengaruh {{a_noun}} terhadap efisiensi {{noun}}.',
      'Strategi implementasi {{a_noun}} untuk {{noun}} yang lebih baik.',
      'Manfaat jangka panjang dari {{a_noun}} dalam {{noun}}.',
      'Analisis manfaat dan tantangan {{a_noun}} di {{noun}}.',
      'Bagaimana {{a_noun}} berkontribusi pada inovasi {{noun}}.',
      'Memahami peran {{a_noun}} dalam memajukan {{noun}}.',
      'Perubahan besar yang dibawa oleh {{a_noun}} dalam {{noun}}.',
      'Kaitan antara kemajuan {{a_noun}} dan {{noun}}.',
      'Tren dan perkembangan terbaru dalam {{a_noun}} dan dampaknya pada {{noun}}.',
      'Mengoptimalkan {{a_noun}} untuk hasil maksimal dalam {{noun}}.',
      'Solusi berbasis {{a_noun}} untuk tantangan {{noun}}.',
      'Cara efektif menerapkan {{a_noun}} dalam konteks {{noun}}.',
      'Pentingnya {{a_noun}} untuk masa depan {{noun}}.',
      'Studi tentang pengaruh {{a_noun}} terhadap {{noun}}.',
      'Evaluasi pendekatan {{a_noun}} dalam {{noun}} untuk hasil optimal.',
      'Peran {{a_noun}} dalam transformasi {{noun}}.',
      'Inovasi terbaru dalam {{a_noun}} dan dampaknya pada {{noun}}.',
      'Bagaimana {{a_noun}} dapat meningkatkan kualitas {{noun}}.',
      'Implementasi {{a_noun}} dan pengaruhnya terhadap {{noun}}.',
      'Masa depan {{noun}} dengan perkembangan {{a_noun}}.',
      'Pendekatan baru dalam {{a_noun}} untuk {{noun}}.',
      'Analisis penerapan {{a_noun}} dalam {{noun}}.',
      'Strategi pengembangan {{a_noun}} untuk memperkuat {{noun}}.',
      'Faktor kunci dalam mengoptimalkan {{a_noun}} untuk {{noun}}.',
      'Tren masa depan dalam {{a_noun}} dan implikasinya untuk {{noun}}.',
      'Solusi praktis menggunakan {{a_noun}} dalam {{noun}}.',
      'Pengaruh {{a_noun}} pada performa {{noun}}.',
      'Bagaimana {{a_noun}} mendukung pengembangan {{noun}}.',
      'Menerapkan {{a_noun}} dalam {{noun}} untuk hasil yang lebih baik.',
      'Penerapan inovatif {{a_noun}} dalam {{noun}}.',
      'Evaluasi dampak {{a_noun}} pada {{noun}}.',
      'Menilai efektivitas {{a_noun}} untuk {{noun}}.',
      'Studi kasus penerapan {{a_noun}} dalam {{noun}}.',
      'Bagaimana {{a_noun}} dapat mengubah lanskap {{noun}}.',
      'Analisis tren {{a_noun}} dalam {{noun}}.',
      'Membahas tantangan {{a_noun}} dalam {{noun}}.',
      'Perspektif baru dalam {{a_noun}} untuk {{noun}}.',
      'Peran {{a_noun}} dalam transformasi {{noun}}.'
    ];

    // Get all dosen
    const allDosen = await dosen.findAll();
    if (allDosen.length === 0) {
      return res.status(400).json({ message: 'No dosen found' });
    }

    // Select a random dosen
    const selectedDosen = getRandomElement(allDosen);
    const { dosen_id, fakultas_id, prodi_id } = selectedDosen;

    // Buat entri berkas dengan URL statis
    const berkasEntries = await Promise.all([1, 2, 3].map(async () => {
      const berkas_id = nanoid(20);
      const url_berkas = 'https://digilibs.sgp1.digitaloceanspaces.com/sample.pdf';
      await berkas.create({
        berkas_id,
        url_berkas,
        project_id: null,
        research_id: null, // Akan diperbarui nanti
      });
      return berkas_id;
    }));

    addTemplates(templates);

    // Generate abstract using txtgen
    let abstract = '';
    let abstract_eng = '';
    let title = '';
    let title_eng = '';

    // Generate title
    while (title.split(' ').length < 10) {
      title += ' ' + getRandomElement(templates).replace(/{{a_noun}}/g, getRandomElement(keywords)).replace(/{{noun}}/g, getRandomElement(keywords)).replace(/{{an_adjective}}/g, faker.word.adjective());
    }
    while (title_eng.split(' ').length < 10) {
      title_eng += ' ' + getRandomElement(templates).replace(/{{a_noun}}/g, getRandomElement(keywords)).replace(/{{noun}}/g, getRandomElement(keywords)).replace(/{{an_adjective}}/g, faker.word.adjective());
    }

    // Generate abstract
    while (abstract.split(' ').length < 500) {
      abstract += ' ' + getRandomElement(templates).replace(/{{a_noun}}/g, getRandomElement(keywords)).replace(/{{noun}}/g, getRandomElement(keywords)).replace(/{{an_adjective}}/g, faker.word.adjective());
    }
    while (abstract_eng.split(' ').length < 500) {
      abstract_eng += ' ' + getRandomElement(templates).replace(/{{a_noun}}/g, getRandomElement(keywords)).replace(/{{noun}}/g, getRandomElement(keywords)).replace(/{{an_adjective}}/g, faker.word.adjective());
    }

    // Create research entry
    const research = await researchs.create({
      research_id: nanoid(20),
      title: title.trim(),
      title_eng: title_eng.trim(),
      abstract: abstract.trim(),
      abstract_eng: abstract_eng.trim(),
      catatan: faker.lorem.sentence(),
      status: 'Pending',
      total_views: 0,
      url_research: 'https://digilibs.sgp1.digitaloceanspaces.com/sample.pdf',
      user_id: selectedDosen.user_id,
      dosen_id,
      fakultas_id,
      prodi_id,
      submissionDate: new Date(),
      approvalDate: null,
    });

    // Update berkas entries with research_id
    await berkas.update({ research_id: research.research_id }, {
      where: {
        berkas_id: {
          [Op.in]: berkasEntries
        }
      }
    });

    res.status(201).json({
      message: 'Research Generated Successfully',
      data: research
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: 'Research Generation Failed',
      data: err
    });
  }
}

module.exports = {
  createCategory,
  getAllCategories,
  generateAccounts,
  generateDosenAccounts,
  generateMahasiswaAccounts,
  generateFinalProjects,
  generateResearch
};