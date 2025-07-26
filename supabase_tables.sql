-- Supabase Tabloları Oluşturma SQL Komutları

-- 1. Psikologlar Tablosu
CREATE TABLE psychologists (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Danışanlar Tablosu
CREATE TABLE clients (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  email VARCHAR(255) NOT NULL,
  registration_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  psychologist_id INTEGER REFERENCES psychologists(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Randevular Tablosu
CREATE TABLE appointments (
  id SERIAL PRIMARY KEY,
  client_id INTEGER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  psychologist_id INTEGER NOT NULL REFERENCES psychologists(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  hour INTEGER NOT NULL CHECK (hour >= 0 AND hour <= 23),
  minute INTEGER NOT NULL CHECK (minute >= 0 AND minute <= 59),
  duration INTEGER NOT NULL DEFAULT 60,
  desc TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Notlar Tablosu
CREATE TABLE notes (
  id SERIAL PRIMARY KEY,
  client_id INTEGER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  psychologist_id INTEGER NOT NULL REFERENCES psychologists(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Örnek Veriler Ekleme

-- Psikologlar
INSERT INTO psychologists (name) VALUES 
  ('Dr. Elif Yılmaz'),
  ('Uzm. Psk. Can Demir'),
  ('Psk. Zeynep Kaya'),
  ('Dr. Ayşe Güneş'),
  ('Uzm. Psk. Burak Akın'),
  ('Psk. Cemil Yıldız');

-- Danışanlar
INSERT INTO clients (name, phone, email, psychologist_id) VALUES 
  ('Ayşe Yılmaz', '555-1234', 'ayse@example.com', 1),
  ('Mehmet Demir', '555-5678', 'mehmet@example.com', 2),
  ('Zeynep Kaya', '555-9012', 'zeynep@example.com', NULL),
  ('Ali Can', '555-1122', 'ali@example.com', 3),
  ('Elif Su', '555-3344', 'elif@example.com', NULL);

-- Randevular (bugün ve gelecek hafta için)
INSERT INTO appointments (client_id, psychologist_id, date, hour, minute, duration, desc) VALUES 
  (1, 1, CURRENT_DATE, 12, 0, 60, 'Bireysel seans'),
  (2, 2, CURRENT_DATE + INTERVAL '2 days', 14, 30, 90, 'Aile danışmanlığı'),
  (1, 1, CURRENT_DATE + INTERVAL '4 days', 11, 0, 60, 'Çocuk seansı'),
  (4, 3, CURRENT_DATE + INTERVAL '1 day', 16, 0, 60, 'Yeni danışan ilk görüşme'),
  (2, 2, CURRENT_DATE, 10, 0, 60, 'Grup Terapisi'),
  (5, 3, CURRENT_DATE + INTERVAL '4 days', 10, 15, 60, 'Bireysel Danışmanlık');

-- Notlar
INSERT INTO notes (client_id, psychologist_id, date, content) VALUES 
  (1, 1, CURRENT_DATE, 'İlk seans notları: Danışan oldukça gergin, uyum sorunları yaşıyor. Gelecek seans için hedefler belirlendi.'),
  (2, 2, CURRENT_DATE + INTERVAL '2 days', 'Aile danışmanlığı seansı. İletişim problemleri üzerinde duruldu. Çiftin birbirini dinlemesi teşvik edildi.'),
  (1, 1, CURRENT_DATE, 'Ek not: Danışanın ev ödevlerini tamamladığı görüldü. İlerleme kaydediliyor.'),
  (4, 3, CURRENT_DATE + INTERVAL '1 day', 'Yeni danışan Ali Can için ilk not. Oldukça çekingen, güven ilişkisi kurmak önemli.'),
  (2, 2, CURRENT_DATE, 'Grup terapisi notları: Katılımcıların etkileşimi olumlu. Yeni üyeler gruba adapte oluyor.'),
  (5, 3, CURRENT_DATE + INTERVAL '4 days', 'Elif Su ile ilk görüşme notları. Motivasyonu yüksek, hedeflerini netleştirdik.');

-- RLS (Row Level Security) Politikaları (İsteğe bağlı)
-- ALTER TABLE psychologists ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

-- Tüm kullanıcıların tüm verileri görmesine izin ver (geliştirme için)
-- CREATE POLICY "Allow all operations" ON psychologists FOR ALL USING (true);
-- CREATE POLICY "Allow all operations" ON clients FOR ALL USING (true);
-- CREATE POLICY "Allow all operations" ON appointments FOR ALL USING (true);
-- CREATE POLICY "Allow all operations" ON notes FOR ALL USING (true); 