import { Question, Quiz } from '../types/quiz';

export const INITIAL_TOEFL_QUESTIONS: Question[] = [
  // ==========================================
  // SECTION 1: LISTENING - DOUBLE NEGATIVE EXPRESSIONS (5 Questions)
  // ==========================================
  {
    id: 'q-list-1',
    category: 'listening',
    categoryLabel: 'Listening Comprehension',
    subtype: 'Double Negative Expressions',
    promptText: 'What does the woman mean?',
    options: [
      'She is disappointed with her test score.',
      'She studied very hard for the test.',
      'She did not prepare for the examination at all.',
      'She does not care about how she performed.'
    ],
    correctAnswerIndex: 1, // B
    explanationId: 'Dalam percakapan ini terdapat ekspresi double negative: "can\'t say that I didn\'t study hard". Dua elemen negatif (can\'t say + didn\'t) saling meniadakan dan menghasilkan arti positif tegas: perempuan tersebut memang belajar sangat keras ("She studied hard").',
    explanationEn: 'The woman uses a double negative: "can\'t say that I didn\'t study hard". In standard English grammar, two negative ideas cancel each other out to create an affirmative meaning, indicating that she worked very hard for the test.',
    audioUrl: null, // Initial status: Audio belum diunggah
    audioTranscript: '(Man): "Paula, you don\'t look very unhappy with your test score."\n(Woman): "Well, I can\'t say that I didn\'t study hard!"\n(Narrator): "What does the woman mean?"'
  },
  {
    id: 'q-list-2',
    category: 'listening',
    categoryLabel: 'Listening Comprehension',
    subtype: 'Double Negative Expressions',
    promptText: 'What does the woman say about Steve?',
    options: [
      'Steve quit before reaching the finish line.',
      'Steve decided not to run in the marathon.',
      'Steve was able to complete the race.',
      'Steve was unable to finish because of fatigue.'
    ],
    correctAnswerIndex: 2, // C
    explanationId: 'Frasa "wasn\'t unable" memadukan kata penyangkal \'wasn\'t\' dengan awalan negatif \'un-\'. Kombinasi double negative ini bermakna positif, yaitu Steve berhasil atau mampu menyelesaikan perlombaan ("was able to complete the race").',
    explanationEn: 'The phrase "wasn\'t unable" pairs a negative auxiliary with a negative prefix \'un-\'. This double negative forms an affirmative statement, confirming Steve was able to finish the race.',
    audioUrl: null, // Initial status: Audio belum diunggah
    audioTranscript: '(Man): "Did Steve manage to finish the marathon on Saturday?"\n(Woman): "He wasn\'t unable to complete the race, but he was completely exhausted."\n(Narrator): "What does the woman say about Steve?"'
  },
  {
    id: 'q-list-3',
    category: 'listening',
    categoryLabel: 'Listening Comprehension',
    subtype: 'Double Negative Expressions',
    promptText: 'What does the woman mean?',
    options: [
      'Everybody on the board was pleased with the suggestions.',
      'No one agreed to look over Professor Miller\'s proposal.',
      'The committee rejected Professor Miller\'s recommendations.',
      'Several board members expressed deep dissatisfaction.'
    ],
    correctAnswerIndex: 0, // A
    explanationId: '"No one ... was discontented" menggabungkan kata ganti negatif "no one" dengan kata berawalan negatif "discontented". Artinya tidak ada seorang pun yang tidak puas, alias semua anggota dewan merasa puas ("everyone was satisfied / pleased").',
    explanationEn: 'The double negative expression "No one ... was discontented" (negative pronoun "no one" + negative prefix "dis-") means that everyone was satisfied with the professor\'s suggestions.',
    audioUrl: null, // Initial status: Audio belum diunggah
    audioTranscript: '(Man): "How did the committee respond to Professor Miller\'s proposal?"\n(Woman): "No one on the board was discontented with his suggestions."\n(Narrator): "What does the woman mean?"'
  },
  {
    id: 'q-list-4',
    category: 'listening',
    categoryLabel: 'Listening Comprehension',
    subtype: 'Double Negative Expressions',
    promptText: 'What does the woman imply about Mark?',
    options: [
      'It is doubtful that Mark remembered the laboratory report.',
      'Mark probably submitted the report before noon.',
      'Mark definitely missed the deadline for the report.',
      'Mark was asked to turn in his work tomorrow.'
    ],
    correctAnswerIndex: 1, // B
    explanationId: 'Frasa "It isn\'t unlikely" memiliki makna setara dengan "It is likely" (kemungkinan besar / probable). Pembicara meyakini bahwa Mark kemungkinan besar sudah mengumpulkan laporannya tepat waktu sebelum siang.',
    explanationEn: 'The double negative phrase "isn\'t unlikely" yields an affirmative meaning equivalent to "is likely" or "probable." The woman implies Mark probably turned in the report before noon.',
    audioUrl: null, // Initial status: Audio belum diunggah
    audioTranscript: '(Man): "Are you sure Mark didn\'t forget to submit the laboratory report?"\n(Woman): "It isn\'t unlikely that he turned it in before noon."\n(Narrator): "What does the woman imply about Mark?"'
  },
  {
    id: 'q-list-5',
    category: 'listening',
    categoryLabel: 'Listening Comprehension',
    subtype: 'Double Negative Expressions',
    promptText: 'What does the woman mean regarding the audience?',
    options: [
      'Nobody noticed any awkwardness during the lecture.',
      'Everyone in the room sensed the tension.',
      'The listeners were completely relaxed throughout.',
      'Only the speaker was aware of the atmosphere.'
    ],
    correctAnswerIndex: 1, // B
    explanationId: 'Kalimat "nobody didn\'t feel the tension" mengandung dua bentuk negatif ("nobody" dan "didn\'t"). Dalam aturan TOEFL, ini bermakna afirmatif: setiap orang di ruangan merasakan ketegangan tersebut ("everybody felt the tension").',
    explanationEn: 'The statement "nobody didn\'t feel the tension" pairs two explicit negatives ("nobody" + "didn\'t"), producing the affirmative sense that everyone in the room felt the tension.',
    audioUrl: null, // Initial status: Audio belum diunggah
    audioTranscript: '(Man): "The keynote speaker didn\'t seem very enthusiastic about the questions."\n(Woman): "She wasn\'t unprepared, but nobody didn\'t feel the tension in the room."\n(Narrator): "What does the woman mean regarding the audience?"'
  },

  // ==========================================
  // SECTION 2: STRUCTURE & WRITTEN EXPRESSION - INVERSION WITH PLACE EXPRESSIONS (5 Questions)
  // ==========================================
  {
    id: 'q-struct-1',
    category: 'structure',
    categoryLabel: 'Structure & Written Expression',
    subtype: 'Inversion with Place Expressions',
    promptText: 'On the crest of the mountain __________ a solitary observation tower built during the late nineteenth century.',
    options: [
      'where stands',
      'stands',
      'does it stand',
      'standing there'
    ],
    correctAnswerIndex: 1, // B
    explanationId: 'Aturan Inversi Tempat: Jika preposisi tempat ("On the crest of the mountain") diletakkan di depan kalimat dan esensial bagi ide kalimat, subjek dan kata kerja diinversi langsung: [Place Expression] + [Verb] + [Subject]. Subjeknya adalah "a solitary observation tower", sehingga kata kerja yang benar langsung mendahului subjek adalah "stands".',
    explanationEn: 'Locative Inversion: When an essential prepositional phrase of place begins a sentence, the subject and main verb invert: Place Expression + Verb + Subject. The singular subject is "a solitary observation tower", requiring the verb "stands".'
  },
  {
    id: 'q-struct-2',
    category: 'structure',
    categoryLabel: 'Structure & Written Expression',
    subtype: 'Inversion with Place Expressions',
    promptText: 'In the center of the historic town square __________ an ancient bronze statue dedicated to the founding patriots.',
    options: [
      'located',
      'where was',
      'was erected',
      'it stood'
    ],
    correctAnswerIndex: 2, // C
    explanationId: '"In the center of the historic town square" adalah ekspresi lokasi di awal kalimat. Diperlukan verb pasif "was erected" sebelum subjek "an ancient bronze statue". Tidak boleh menambahkan kata ganti baru seperti "it" atau kata hubung subordinat "where".',
    explanationEn: 'Inversion occurs after locative prepositional phrases. The passive verb "was erected" is required to precede the subject "an ancient bronze statue" without redundant pronouns or relative clauses.'
  },
  {
    id: 'q-struct-3',
    category: 'structure',
    categoryLabel: 'Structure & Written Expression',
    subtype: 'Inversion with Place Expressions',
    promptText: 'Behind the heavy velvet curtains __________ several antique brass instruments used in early orchestral performances.',
    options: [
      'were hidden',
      'which they were',
      'hidden there',
      'did hide'
    ],
    correctAnswerIndex: 0, // A
    explanationId: 'Keterangan tempat "Behind the heavy velvet curtains" mengawali kalimat. Karena subjeknya berbentuk jamak ("several antique brass instruments"), verb pasif jamak yang tepat sebelum subjek adalah "were hidden".',
    explanationEn: 'The locative prepositional phrase "Behind the heavy velvet curtains" triggers full inversion. Because the subject "several antique brass instruments" is plural, the plural passive verb "were hidden" must invert before the subject.'
  },
  {
    id: 'q-struct-4',
    category: 'structure',
    categoryLabel: 'Structure & Written Expression',
    subtype: 'Inversion with Place Expressions',
    promptText: 'Around the secluded volcanic crater __________ a dense canopy of tropical rainforest species.',
    options: [
      'is spreading',
      'spreads',
      'where it spreads',
      'it is spreading'
    ],
    correctAnswerIndex: 1, // B
    explanationId: '"Around the secluded volcanic crater" adalah frasa tempat. Pola inversi menempatkan kata kerja simple present "spreads" langsung di depan subjek tunggal "a dense canopy". Pilihan dengan "it" salah karena membuat double subject.',
    explanationEn: 'Fronted place phrase "Around the secluded volcanic crater" inverts verb and subject. The intransitive verb "spreads" properly precedes the singular subject "a dense canopy".'
  },
  {
    id: 'q-struct-5',
    category: 'structure',
    categoryLabel: 'Structure & Written Expression',
    subtype: 'Inversion with Place Expressions',
    promptText: 'Directly opposite the grand neoclassical library __________ the modern research laboratory completed last semester.',
    options: [
      'lies',
      'where lies',
      'it lies there',
      'is situated where'
    ],
    correctAnswerIndex: 0, // A
    explanationId: '"Directly opposite the grand neoclassical library" adalah keterangan letak/arah. Kata kerja intransitif "lies" langsung mendahului subjek "the modern research laboratory".',
    explanationEn: 'Directional and locative prepositional phrases like "Directly opposite..." cause subject-verb inversion. The intransitive verb "lies" precedes the subject "the modern research laboratory".'
  },

  // ==========================================
  // SECTION 3: READING COMPREHENSION - UNSTATED DETAILS (NOT MENTIONED / EXCEPT) (5 Questions)
  // ==========================================
  {
    id: 'q-read-1',
    category: 'reading',
    categoryLabel: 'Reading Comprehension',
    subtype: 'Unstated Detail (EXCEPT)',
    stimulusText: 'Yellowstone National Park sits atop one of the largest active volcanic systems in North America, known as the Yellowstone Caldera. This supervolcano is fueled by a subterranean mantle plume that brings intense heat near the Earth\'s surface. Geothermal activity in the park manifests in four primary hydrothermal features: geysers, hot springs, mudpots, and fumaroles. Geysers erupt periodically when underground water is superheated beneath high pressure until it abruptly flashes into steam. Hot springs, by contrast, allow circulating thermal waters to discharge continuously without building catastrophic steam pressure. Mudpots form in acidic environments where sulfur gas dissolves surrounding volcanic rock into bubbling clay, while fumaroles, or steam vents, emit volcanic gases directly into the atmosphere because all liquid water evaporates before reaching the surface. The dynamic hydrothermal ecosystem also hosts specialized thermophilic microorganisms known as archaea and cyanobacteria, which thrive at temperatures exceeding 70 degrees Celsius and give the thermal pools their characteristic vivid bands of rainbow color.',
    promptText: 'According to the passage, all of the following are mentioned as primary hydrothermal features in Yellowstone EXCEPT:',
    options: [
      'mudpots',
      'basalt lava caves',
      'fumaroles',
      'geysers'
    ],
    correctAnswerIndex: 1, // B
    explanationId: 'Tipe Soal Unstated Detail (EXCEPT): Teks secara eksplisit menyebutkan 4 fitur hidrotermal primer, yaitu: "geysers, hot springs, mudpots, and fumaroles". Pilihan "basalt lava caves" sama sekali TIDAK disebutkan dalam paragraf.',
    explanationEn: 'Unstated Detail (EXCEPT) question: The passage clearly lists the four primary hydrothermal features: geysers, hot springs, mudpots, and fumaroles. "Basalt lava caves" is not mentioned in the text.'
  },
  {
    id: 'q-read-2',
    category: 'reading',
    categoryLabel: 'Reading Comprehension',
    subtype: 'Unstated Detail (NOT Stated)',
    stimulusText: 'Yellowstone National Park sits atop one of the largest active volcanic systems in North America, known as the Yellowstone Caldera. This supervolcano is fueled by a subterranean mantle plume that brings intense heat near the Earth\'s surface. Geothermal activity in the park manifests in four primary hydrothermal features: geysers, hot springs, mudpots, and fumaroles. Geysers erupt periodically when underground water is superheated beneath high pressure until it abruptly flashes into steam. Hot springs, by contrast, allow circulating thermal waters to discharge continuously without building catastrophic steam pressure. Mudpots form in acidic environments where sulfur gas dissolves surrounding volcanic rock into bubbling clay, while fumaroles, or steam vents, emit volcanic gases directly into the atmosphere because all liquid water evaporates before reaching the surface. The dynamic hydrothermal ecosystem also hosts specialized thermophilic microorganisms known as archaea and cyanobacteria, which thrive at temperatures exceeding 70 degrees Celsius and give the thermal pools their characteristic vivid bands of rainbow color.',
    promptText: 'Which of the following characteristics of hot springs is NOT stated in the passage?',
    options: [
      'They discharge thermal waters on a continuous basis.',
      'They allow water to circulate without building catastrophic pressure.',
      'They undergo violent eruptions every ninety minutes.',
      'They represent one of four main hydrothermal features.'
    ],
    correctAnswerIndex: 2, // C
    explanationId: 'Tipe Soal Unstated Detail (NOT Stated): Paragraf menyatakan bahwa hot springs mengalirkan air hangat terus-menerus tanpa letusan tekanan katastropik ("discharge continuously without building catastrophic steam pressure"). Pernyataan "undergo violent eruptions every ninety minutes" adalah karakteristik geyser tertentu, BUKAN hot springs, dan tidak pernah dinyatakan tentang hot springs dalam teks.',
    explanationEn: 'Unstated Detail (NOT Stated): The passage explains that hot springs discharge continuously without catastrophic pressure. Violent periodic eruptions characterize pressurized geysers, not hot springs, making option C unstated.'
  },
  {
    id: 'q-read-3',
    category: 'reading',
    categoryLabel: 'Reading Comprehension',
    subtype: 'Unstated Detail (NOT Stated)',
    stimulusText: 'Yellowstone National Park sits atop one of the largest active volcanic systems in North America, known as the Yellowstone Caldera. This supervolcano is fueled by a subterranean mantle plume that brings intense heat near the Earth\'s surface. Geothermal activity in the park manifests in four primary hydrothermal features: geysers, hot springs, mudpots, and fumaroles. Geysers erupt periodically when underground water is superheated beneath high pressure until it abruptly flashes into steam. Hot springs, by contrast, allow circulating thermal waters to discharge continuously without building catastrophic steam pressure. Mudpots form in acidic environments where sulfur gas dissolves surrounding volcanic rock into bubbling clay, while fumaroles, or steam vents, emit volcanic gases directly into the atmosphere because all liquid water evaporates before reaching the surface. The dynamic hydrothermal ecosystem also hosts specialized thermophilic microorganisms known as archaea and cyanobacteria, which thrive at temperatures exceeding 70 degrees Celsius and give the thermal pools their characteristic vivid bands of rainbow color.',
    promptText: 'According to the passage, which of the following is NOT a condition involved in the formation of mudpots?',
    options: [
      'Acidic geological conditions',
      'Dissolution of volcanic rock into clay',
      'The presence of sulfur gas',
      'Total absence of all subterranean heat'
    ],
    correctAnswerIndex: 3, // D
    explanationId: 'Tipe Soal Unstated Detail: Paragraf menyatakan bahwa mudpots terbentuk dalam lingkungan asam ("acidic environments"), di mana gas belerang ("sulfur gas") melarutkan batuan vulkanik menjadi lempung bergolak ("dissolves surrounding volcanic rock into bubbling clay"). Pilihan "Total absence of all subterranean heat" bertentangan langsung dengan konteks vulkanik aktif dan TIDAK pernah disebutkan.',
    explanationEn: 'Unstated Detail question: Mudpot formation explicitly involves acidic environments, sulfur gas, and dissolved rock. "Total absence of all subterranean heat" contradicts the text and is completely unstated.'
  },
  {
    id: 'q-read-4',
    category: 'reading',
    categoryLabel: 'Reading Comprehension',
    subtype: 'Unstated Detail (NOT Mentioned)',
    stimulusText: 'Yellowstone National Park sits atop one of the largest active volcanic systems in North America, known as the Yellowstone Caldera. This supervolcano is fueled by a subterranean mantle plume that brings intense heat near the Earth\'s surface. Geothermal activity in the park manifests in four primary hydrothermal features: geysers, hot springs, mudpots, and fumaroles. Geysers erupt periodically when underground water is superheated beneath high pressure until it abruptly flashes into steam. Hot springs, by contrast, allow circulating thermal waters to discharge continuously without building catastrophic steam pressure. Mudpots form in acidic environments where sulfur gas dissolves surrounding volcanic rock into bubbling clay, while fumaroles, or steam vents, emit volcanic gases directly into the atmosphere because all liquid water evaporates before reaching the surface. The dynamic hydrothermal ecosystem also hosts specialized thermophilic microorganisms known as archaea and cyanobacteria, which thrive at temperatures exceeding 70 degrees Celsius and give the thermal pools their characteristic vivid bands of rainbow color.',
    promptText: 'It is NOT mentioned in the passage that fumaroles:',
    options: [
      'are also known as steam vents',
      'produce liquid mineral streams that flow into alpine lakes',
      'emit volcanic gases directly into the atmosphere',
      'experience complete water evaporation before reaching the surface'
    ],
    correctAnswerIndex: 1, // B
    explanationId: 'Tipe Soal Unstated Detail: Paragraf menyatakan fumarol disebut steam vents, melepaskan gas vulkanik ke atmosfer, dan seluruh air cairnya menguap sebelum mencapai permukaan. Pernyataan bahwa fumarol "menghasilkan aliran mineral cair ke danau" TIDAK pernah disebutkan dalam bacaan.',
    explanationEn: 'Unstated Detail: The passage notes that all liquid water in fumaroles evaporates before reaching the surface, directly releasing steam and gases. It does NOT state that fumaroles generate liquid streams into lakes.'
  },
  {
    id: 'q-read-5',
    category: 'reading',
    categoryLabel: 'Reading Comprehension',
    subtype: 'Unstated Detail (EXCEPT)',
    stimulusText: 'Yellowstone National Park sits atop one of the largest active volcanic systems in North America, known as the Yellowstone Caldera. This supervolcano is fueled by a subterranean mantle plume that brings intense heat near the Earth\'s surface. Geothermal activity in the park manifests in four primary hydrothermal features: geysers, hot springs, mudpots, and fumaroles. Geysers erupt periodically when underground water is superheated beneath high pressure until it abruptly flashes into steam. Hot springs, by contrast, allow circulating thermal waters to discharge continuously without building catastrophic steam pressure. Mudpots form in acidic environments where sulfur gas dissolves surrounding volcanic rock into bubbling clay, while fumaroles, or steam vents, emit volcanic gases directly into the atmosphere because all liquid water evaporates before reaching the surface. The dynamic hydrothermal ecosystem also hosts specialized thermophilic microorganisms known as archaea and cyanobacteria, which thrive at temperatures exceeding 70 degrees Celsius and give the thermal pools their characteristic vivid bands of rainbow color.',
    promptText: 'The author mentions all of the following regarding the thermophilic microorganisms in Yellowstone EXCEPT that they:',
    options: [
      'include archaea and cyanobacteria',
      'thrive in thermal environments above 70 degrees Celsius',
      'migrate southward to warmer marine waters during winter months',
      'give thermal pools their characteristic rainbow colors'
    ],
    correctAnswerIndex: 2, // C
    explanationId: 'Tipe Soal Unstated Detail (EXCEPT): Paragraf menyebutkan mikroorganisme termofilik mencakup archaea dan sianobakteri, hidup di atas suhu 70°C, dan memberi warna pelangi pada kolam termal. Pernyataan bahwa mikroba ini "bermigrasi ke selatan pada musim dingin" adalah tidak masuk akal dan sama sekali TIDAK disebutkan dalam teks.',
    explanationEn: 'Unstated Detail (EXCEPT): The text mentions that these thermophiles are archaea and cyanobacteria, thrive at temperatures >70°C, and impart rainbow bands to pools. Migrating southward in winter is completely unstated and factually inapplicable.'
  }
];

export const INITIAL_QUIZ: Quiz = {
  id: 'quiz-toefl-mastery-01',
  title: 'TOEFL ITP Mini Battle: Diagnostic Set 1',
  description: '15 Soal resmi TOEFL: Listening (Double Negatives), Structure (Inversion Place), & Reading (Unstated Details). Waktu 30 detik per soal dengan server-authoritative timer.',
  timePerQuestionSeconds: 30,
  status: 'draft', // Draft initially because Listening questions lack audio!
  questions: INITIAL_TOEFL_QUESTIONS,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};
