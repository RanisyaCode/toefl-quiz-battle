-- ====================================================================
-- TOEFL QUIZ BATTLE - SEED DATA
-- 15 Authentic TOEFL Diagnostic Questions:
-- 5 Listening (Double Negative Expressions) [Audio pending upload]
-- 5 Structure (Inversion with Place Expressions)
-- 5 Reading (Unstated Details: NOT mentioned / EXCEPT)
-- ====================================================================

-- 1. Insert Initial Quiz
INSERT INTO public.quizzes (id, title, description, time_per_question_seconds, status)
VALUES (
  'a0000000-0000-0000-0000-000000000001',
  'TOEFL ITP Mini Battle: Diagnostic Set 1',
  '15 Soal resmi TOEFL: Listening (Double Negatives), Structure (Inversion Place), & Reading (Unstated Details). Waktu 30 detik per soal dengan server-authoritative timer.',
  30,
  'draft' -- draft initially because Listening questions require audio upload
) ON CONFLICT (id) DO NOTHING;

-- 2. Insert 15 Questions
INSERT INTO public.questions (
  id, quiz_id, category, category_label, subtype, stimulus_text, prompt_text,
  options, correct_answer_index, explanation_id, explanation_en,
  audio_url, audio_transcript, order_index
)
VALUES
  -- 1. Listening
  (
    'b0000000-0000-0000-0000-000000000001',
    'a0000000-0000-0000-0000-000000000001',
    'listening',
    'Listening Comprehension',
    'Double Negative Expressions',
    NULL,
    'What does the woman mean?',
    '["She is disappointed with her test score.", "She studied very hard for the test.", "She did not prepare for the examination at all.", "She does not care about how she performed."]'::jsonb,
    1,
    'Dalam percakapan ini terdapat ekspresi double negative: "can''t say that I didn''t study hard". Dua elemen negatif (can''t say + didn''t) saling meniadakan dan menghasilkan arti positif tegas: perempuan tersebut memang belajar sangat keras ("She studied hard").',
    'The woman uses a double negative: "can''t say that I didn''t study hard". In standard English grammar, two negative ideas cancel each other out to create an affirmative meaning, indicating that she worked very hard for the test.',
    NULL,
    '(Man): "Paula, you don''t look very unhappy with your test score."\n(Woman): "Well, I can''t say that I didn''t study hard!"\n(Narrator): "What does the woman mean?"',
    1
  ),
  -- 2. Listening
  (
    'b0000000-0000-0000-0000-000000000002',
    'a0000000-0000-0000-0000-000000000001',
    'listening',
    'Listening Comprehension',
    'Double Negative Expressions',
    NULL,
    'What does the woman say about Steve?',
    '["Steve quit before reaching the finish line.", "Steve decided not to run in the marathon.", "Steve was able to complete the race.", "Steve was unable to finish because of fatigue."]'::jsonb,
    2,
    'Frasa "wasn''t unable" memadukan kata penyangkal ''wasn''t'' dengan awalan negatif ''un-''. Kombinasi double negative ini bermakna positif, yaitu Steve berhasil atau mampu menyelesaikan perlombaan ("was able to complete the race").',
    'The phrase "wasn''t unable" pairs a negative auxiliary with a negative prefix ''un-''. This double negative forms an affirmative statement, confirming Steve was able to finish the race.',
    NULL,
    '(Man): "Did Steve manage to finish the marathon on Saturday?"\n(Woman): "He wasn''t unable to complete the race, but he was completely exhausted."\n(Narrator): "What does the woman say about Steve?"',
    2
  ),
  -- 3. Listening
  (
    'b0000000-0000-0000-0000-000000000003',
    'a0000000-0000-0000-0000-000000000001',
    'listening',
    'Listening Comprehension',
    'Double Negative Expressions',
    NULL,
    'What does the woman mean?',
    '["Everybody on the board was pleased with the suggestions.", "No one agreed to look over Professor Miller''s proposal.", "The committee rejected Professor Miller''s recommendations.", "Several board members expressed deep dissatisfaction."]'::jsonb,
    0,
    '"No one ... was discontented" menggabungkan kata ganti negatif "no one" dengan kata berawalan negatif "discontented". Artinya tidak ada seorang pun yang tidak puas, alias semua anggota dewan merasa puas ("everyone was satisfied / pleased").',
    'The double negative expression "No one ... was discontented" (negative pronoun "no one" + negative prefix "dis-") means that everyone was satisfied with the professor''s suggestions.',
    NULL,
    '(Man): "How did the committee respond to Professor Miller''s proposal?"\n(Woman): "No one on the board was discontented with his suggestions."\n(Narrator): "What does the woman mean?"',
    3
  ),
  -- 4. Listening
  (
    'b0000000-0000-0000-0000-000000000004',
    'a0000000-0000-0000-0000-000000000001',
    'listening',
    'Listening Comprehension',
    'Double Negative Expressions',
    NULL,
    'What does the woman imply about Mark?',
    '["It is doubtful that Mark remembered the laboratory report.", "Mark probably submitted the report before noon.", "Mark definitely missed the deadline for the report.", "Mark was asked to turn in his work tomorrow."]'::jsonb,
    1,
    'Frasa "It isn''t unlikely" memiliki makna setara dengan "It is likely" (kemungkinan besar / probable). Pembicara meyakini bahwa Mark kemungkinan besar sudah mengumpulkan laporannya tepat waktu sebelum siang.',
    'The double negative phrase "isn''t unlikely" yields an affirmative meaning equivalent to "is likely" or "probable." The woman implies Mark probably turned in the report before noon.',
    NULL,
    '(Man): "Are you sure Mark didn''t forget to submit the laboratory report?"\n(Woman): "It isn''t unlikely that he turned it in before noon."\n(Narrator): "What does the woman imply about Mark?"',
    4
  ),
  -- 5. Listening
  (
    'b0000000-0000-0000-0000-000000000005',
    'a0000000-0000-0000-0000-000000000001',
    'listening',
    'Listening Comprehension',
    'Double Negative Expressions',
    NULL,
    'What does the woman mean regarding the audience?',
    '["Nobody noticed any awkwardness during the lecture.", "Everyone in the room sensed the tension.", "The listeners were completely relaxed throughout.", "Only the speaker was aware of the atmosphere."]'::jsonb,
    1,
    'Kalimat "nobody didn''t feel the tension" mengandung dua bentuk negatif ("nobody" dan "didn''t"). Dalam aturan TOEFL, ini bermakna afirmatif: setiap orang di ruangan merasakan ketegangan tersebut ("everybody felt the tension").',
    'The statement "nobody didn''t feel the tension" pairs two explicit negatives ("nobody" + "didn''t"), producing the affirmative sense that everyone in the room felt the tension.',
    NULL,
    '(Man): "The keynote speaker didn''t seem very enthusiastic about the questions."\n(Woman): "She wasn''t unprepared, but nobody didn''t feel the tension in the room."\n(Narrator): "What does the woman mean regarding the audience?"',
    5
  ),

  -- 6. Structure
  (
    'b0000000-0000-0000-0000-000000000006',
    'a0000000-0000-0000-0000-000000000001',
    'structure',
    'Structure & Written Expression',
    'Inversion with Place Expressions',
    NULL,
    'On the crest of the mountain __________ a solitary observation tower built during the late nineteenth century.',
    '["where stands", "stands", "does it stand", "standing there"]'::jsonb,
    1,
    'Aturan Inversi Tempat: Jika preposisi tempat ("On the crest of the mountain") diletakkan di depan kalimat dan esensial bagi ide kalimat, subjek dan kata kerja diinversi langsung: [Place Expression] + [Verb] + [Subject]. Subjeknya adalah "a solitary observation tower", sehingga kata kerja yang benar langsung mendahului subjek adalah "stands".',
    'Locative Inversion: When an essential prepositional phrase of place begins a sentence, the subject and main verb invert: Place Expression + Verb + Subject. The singular subject is "a solitary observation tower", requiring the verb "stands".',
    NULL,
    NULL,
    6
  ),
  -- 7. Structure
  (
    'b0000000-0000-0000-0000-000000000007',
    'a0000000-0000-0000-0000-000000000001',
    'structure',
    'Structure & Written Expression',
    'Inversion with Place Expressions',
    NULL,
    'In the center of the historic town square __________ an ancient bronze statue dedicated to the founding patriots.',
    '["located", "where was", "was erected", "it stood"]'::jsonb,
    2,
    '"In the center of the historic town square" adalah ekspresi lokasi di awal kalimat. Diperlukan verb pasif "was erected" sebelum subjek "an ancient bronze statue". Tidak boleh menambahkan kata ganti baru seperti "it" atau kata hubung subordinat "where".',
    'Inversion occurs after locative prepositional phrases. The passive verb "was erected" is required to precede the subject "an ancient bronze statue" without redundant pronouns or relative clauses.',
    NULL,
    NULL,
    7
  ),
  -- 8. Structure
  (
    'b0000000-0000-0000-0000-000000000008',
    'a0000000-0000-0000-0000-000000000001',
    'structure',
    'Structure & Written Expression',
    'Inversion with Place Expressions',
    NULL,
    'Behind the heavy velvet curtains __________ several antique brass instruments used in early orchestral performances.',
    '["were hidden", "which they were", "hidden there", "did hide"]'::jsonb,
    0,
    'Keterangan tempat "Behind the heavy velvet curtains" mengawali kalimat. Karena subjeknya berbentuk jamak ("several antique brass instruments"), verb pasif jamak yang tepat sebelum subjek adalah "were hidden".',
    'The locative prepositional phrase "Behind the heavy velvet curtains" triggers full inversion. Because the subject "several antique brass instruments" is plural, the plural passive verb "were hidden" must invert before the subject.',
    NULL,
    NULL,
    8
  ),
  -- 9. Structure
  (
    'b0000000-0000-0000-0000-000000000009',
    'a0000000-0000-0000-0000-000000000001',
    'structure',
    'Structure & Written Expression',
    'Inversion with Place Expressions',
    NULL,
    'Around the secluded volcanic crater __________ a dense canopy of tropical rainforest species.',
    '["is spreading", "spreads", "where it spreads", "it is spreading"]'::jsonb,
    1,
    '"Around the secluded volcanic crater" adalah frasa tempat. Pola inversi menempatkan kata kerja simple present "spreads" langsung di depan subjek tunggal "a dense canopy". Pilihan dengan "it" salah karena membuat double subject.',
    'Fronted place phrase "Around the secluded volcanic crater" inverts verb and subject. The intransitive verb "spreads" properly precedes the singular subject "a dense canopy".',
    NULL,
    NULL,
    9
  ),
  -- 10. Structure
  (
    'b0000000-0000-0000-0000-000000000010',
    'a0000000-0000-0000-0000-000000000001',
    'structure',
    'Structure & Written Expression',
    'Inversion with Place Expressions',
    NULL,
    'Directly opposite the grand neoclassical library __________ the modern research laboratory completed last semester.',
    '["lies", "where lies", "it lies there", "is situated where"]'::jsonb,
    0,
    '"Directly opposite the grand neoclassical library" adalah keterangan letak/arah. Kata kerja intransitif "lies" langsung mendahului subjek "the modern research laboratory".',
    'Directional and locative prepositional phrases like "Directly opposite..." cause subject-verb inversion. The intransitive verb "lies" precedes the subject "the modern research laboratory".',
    NULL,
    NULL,
    10
  ),

  -- 11. Reading
  (
    'b0000000-0000-0000-0000-000000000011',
    'a0000000-0000-0000-0000-000000000001',
    'reading',
    'Reading Comprehension',
    'Unstated Detail (EXCEPT)',
    'Yellowstone National Park sits atop one of the largest active volcanic systems in North America, known as the Yellowstone Caldera. This supervolcano is fueled by a subterranean mantle plume that brings intense heat near the Earth''s surface. Geothermal activity in the park manifests in four primary hydrothermal features: geysers, hot springs, mudpots, and fumaroles. Geysers erupt periodically when underground water is superheated beneath high pressure until it abruptly flashes into steam. Hot springs, by contrast, allow circulating thermal waters to discharge continuously without building catastrophic steam pressure. Mudpots form in acidic environments where sulfur gas dissolves surrounding volcanic rock into bubbling clay, while fumaroles, or steam vents, emit volcanic gases directly into the atmosphere because all liquid water evaporates before reaching the surface. The dynamic hydrothermal ecosystem also hosts specialized thermophilic microorganisms known as archaea and cyanobacteria, which thrive at temperatures exceeding 70 degrees Celsius and give the thermal pools their characteristic vivid bands of rainbow color.',
    'According to the passage, all of the following are mentioned as primary hydrothermal features in Yellowstone EXCEPT:',
    '["mudpots", "basalt lava caves", "fumaroles", "geysers"]'::jsonb,
    1,
    'Tipe Soal Unstated Detail (EXCEPT): Teks secara eksplisit menyebutkan 4 fitur hidrotermal primer, yaitu: "geysers, hot springs, mudpots, and fumaroles". Pilihan "basalt lava caves" sama sekali TIDAK disebutkan dalam paragraf.',
    'Unstated Detail (EXCEPT) question: The passage clearly lists the four primary hydrothermal features: geysers, hot springs, mudpots, and fumaroles. "Basalt lava caves" is not mentioned in the text.',
    NULL,
    NULL,
    11
  ),
  -- 12. Reading
  (
    'b0000000-0000-0000-0000-000000000012',
    'a0000000-0000-0000-0000-000000000001',
    'reading',
    'Reading Comprehension',
    'Unstated Detail (NOT Stated)',
    'Yellowstone National Park sits atop one of the largest active volcanic systems in North America, known as the Yellowstone Caldera. This supervolcano is fueled by a subterranean mantle plume that brings intense heat near the Earth''s surface. Geothermal activity in the park manifests in four primary hydrothermal features: geysers, hot springs, mudpots, and fumaroles. Geysers erupt periodically when underground water is superheated beneath high pressure until it abruptly flashes into steam. Hot springs, by contrast, allow circulating thermal waters to discharge continuously without building catastrophic steam pressure. Mudpots form in acidic environments where sulfur gas dissolves surrounding volcanic rock into bubbling clay, while fumaroles, or steam vents, emit volcanic gases directly into the atmosphere because all liquid water evaporates before reaching the surface. The dynamic hydrothermal ecosystem also hosts specialized thermophilic microorganisms known as archaea and cyanobacteria, which thrive at temperatures exceeding 70 degrees Celsius and give the thermal pools their characteristic vivid bands of rainbow color.',
    'Which of the following characteristics of hot springs is NOT stated in the passage?',
    '["They discharge thermal waters on a continuous basis.", "They allow water to circulate without building catastrophic pressure.", "They undergo violent eruptions every ninety minutes.", "They represent one of four main hydrothermal features."]'::jsonb,
    2,
    'Tipe Soal Unstated Detail (NOT Stated): Paragraf menyatakan bahwa hot springs mengalirkan air hangat terus-menerus tanpa letusan tekanan katastropik ("discharge continuously without building catastrophic steam pressure"). Pernyataan "undergo violent eruptions every ninety minutes" adalah karakteristik geyser tertentu, BUKAN hot springs, dan tidak pernah dinyatakan tentang hot springs dalam teks.',
    'Unstated Detail (NOT Stated): The passage explains that hot springs discharge continuously without catastrophic pressure. Violent periodic eruptions characterize pressurized geysers, not hot springs, making option C unstated.',
    NULL,
    NULL,
    12
  ),
  -- 13. Reading
  (
    'b0000000-0000-0000-0000-000000000013',
    'a0000000-0000-0000-0000-000000000001',
    'reading',
    'Reading Comprehension',
    'Unstated Detail (NOT Stated)',
    'Yellowstone National Park sits atop one of the largest active volcanic systems in North America, known as the Yellowstone Caldera. This supervolcano is fueled by a subterranean mantle plume that brings intense heat near the Earth''s surface. Geothermal activity in the park manifests in four primary hydrothermal features: geysers, hot springs, mudpots, and fumaroles. Geysers erupt periodically when underground water is superheated beneath high pressure until it abruptly flashes into steam. Hot springs, by contrast, allow circulating thermal waters to discharge continuously without building catastrophic steam pressure. Mudpots form in acidic environments where sulfur gas dissolves surrounding volcanic rock into bubbling clay, while fumaroles, or steam vents, emit volcanic gases directly into the atmosphere because all liquid water evaporates before reaching the surface. The dynamic hydrothermal ecosystem also hosts specialized thermophilic microorganisms known as archaea and cyanobacteria, which thrive at temperatures exceeding 70 degrees Celsius and give the thermal pools their characteristic vivid bands of rainbow color.',
    'According to the passage, which of the following is NOT a condition involved in the formation of mudpots?',
    '["Acidic geological conditions", "Dissolution of volcanic rock into clay", "The presence of sulfur gas", "Total absence of all subterranean heat"]'::jsonb,
    3,
    'Tipe Soal Unstated Detail: Paragraf menyatakan bahwa mudpots terbentuk dalam lingkungan asam ("acidic environments"), di mana gas belerang ("sulfur gas") melarutkan batuan vulkanik menjadi lempung bergolak ("dissolves surrounding volcanic rock into bubbling clay"). Pilihan "Total absence of all subterranean heat" bertentangan langsung dengan konteks vulkanik aktif dan TIDAK pernah disebutkan.',
    'Unstated Detail question: Mudpot formation explicitly involves acidic environments, sulfur gas, and dissolved rock. "Total absence of all subterranean heat" contradicts the text and is completely unstated.',
    NULL,
    NULL,
    13
  ),
  -- 14. Reading
  (
    'b0000000-0000-0000-0000-000000000014',
    'a0000000-0000-0000-0000-000000000001',
    'reading',
    'Reading Comprehension',
    'Unstated Detail (NOT Mentioned)',
    'Yellowstone National Park sits atop one of the largest active volcanic systems in North America, known as the Yellowstone Caldera. This supervolcano is fueled by a subterranean mantle plume that brings intense heat near the Earth''s surface. Geothermal activity in the park manifests in four primary hydrothermal features: geysers, hot springs, mudpots, and fumaroles. Geysers erupt periodically when underground water is superheated beneath high pressure until it abruptly flashes into steam. Hot springs, by contrast, allow circulating thermal waters to discharge continuously without building catastrophic steam pressure. Mudpots form in acidic environments where sulfur gas dissolves surrounding volcanic rock into bubbling clay, while fumaroles, or steam vents, emit volcanic gases directly into the atmosphere because all liquid water evaporates before reaching the surface. The dynamic hydrothermal ecosystem also hosts specialized thermophilic microorganisms known as archaea and cyanobacteria, which thrive at temperatures exceeding 70 degrees Celsius and give the thermal pools their characteristic vivid bands of rainbow color.',
    'It is NOT mentioned in the passage that fumaroles:',
    '["are also known as steam vents", "produce liquid mineral streams that flow into alpine lakes", "emit volcanic gases directly into the atmosphere", "experience complete water evaporation before reaching the surface"]'::jsonb,
    1,
    'Tipe Soal Unstated Detail: Paragraf menyatakan fumarol disebut steam vents, melepaskan gas vulkanik ke atmosfer, dan seluruh air cairnya menguap sebelum mencapai permukaan. Pernyataan bahwa fumarol "menghasilkan aliran mineral cair ke danau" TIDAK pernah disebutkan dalam bacaan.',
    'Unstated Detail: The passage notes that all liquid water in fumaroles evaporates before reaching the surface, directly releasing steam and gases. It does NOT state that fumaroles generate liquid streams into lakes.',
    NULL,
    NULL,
    14
  ),
  -- 15. Reading
  (
    'b0000000-0000-0000-0000-000000000015',
    'a0000000-0000-0000-0000-000000000001',
    'reading',
    'Reading Comprehension',
    'Unstated Detail (EXCEPT)',
    'Yellowstone National Park sits atop one of the largest active volcanic systems in North America, known as the Yellowstone Caldera. This supervolcano is fueled by a subterranean mantle plume that brings intense heat near the Earth''s surface. Geothermal activity in the park manifests in four primary hydrothermal features: geysers, hot springs, mudpots, and fumaroles. Geysers erupt periodically when underground water is superheated beneath high pressure until it abruptly flashes into steam. Hot springs, by contrast, allow circulating thermal waters to discharge continuously without building catastrophic steam pressure. Mudpots form in acidic environments where sulfur gas dissolves surrounding volcanic rock into bubbling clay, while fumaroles, or steam vents, emit volcanic gases directly into the atmosphere because all liquid water evaporates before reaching the surface. The dynamic hydrothermal ecosystem also hosts specialized thermophilic microorganisms known as archaea and cyanobacteria, which thrive at temperatures exceeding 70 degrees Celsius and give the thermal pools their characteristic vivid bands of rainbow color.',
    'The author mentions all of the following regarding the thermophilic microorganisms in Yellowstone EXCEPT that they:',
    '["include archaea and cyanobacteria", "thrive in thermal environments above 70 degrees Celsius", "migrate southward to warmer marine waters during winter months", "give thermal pools their characteristic rainbow colors"]'::jsonb,
    2,
    'Tipe Soal Unstated Detail (EXCEPT): Paragraf menyebutkan mikroorganisme termofilik mencakup archaea dan sianobakteri, hidup di atas suhu 70°C, dan memberi warna pelangi pada kolam termal. Pernyataan bahwa mikroba ini "bermigrasi ke selatan pada musim dingin" adalah tidak masuk akal dan sama sekali TIDAK disebutkan dalam teks.',
    'Unstated Detail (EXCEPT): The text mentions that these thermophiles are archaea and cyanobacteria, thrive at temperatures >70°C, and impart rainbow bands to pools. Migrating southward in winter is completely unstated and factually inapplicable.',
    NULL,
    NULL,
    15
  )
ON CONFLICT (id) DO NOTHING;
