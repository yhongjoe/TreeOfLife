-- ============================================================================
-- Tree of Light — 33-day mission schedule seed (Aug 18 - Sep 19, 2026)
-- Run after schema.sql. Safe to re-run (upserts on the `day` primary key) —
-- this is the single source of truth mirrored in src/lib/schedule.ts.
-- ============================================================================

insert into public.missions (day, mission_date, speaker, talk_title) values
  (1,  '2026-08-18', 'Dallin H. Oaks',            'Introduction / Alive in Christ'),
  (2,  '2026-08-19', 'D. Todd Christofferson',    'Solemn Assembly & The Character of Christ'),
  (3,  '2026-08-20', 'Patrick Kearon',             'About His Business'),
  (4,  '2026-08-21', 'Kristin M. Yee',             'Ministering—“That Ye Love One Another; as I Have Loved You”'),
  (5,  '2026-08-22', 'Clark G. Gilbert',           'Come Home'),
  (6,  '2026-08-23', 'David A. Bednar',            'All Who Have Endured Valiantly'),
  (7,  '2026-08-24', 'Michael John U. Teh',        'Follow the Prophet; He Knows the Way'),
  (8,  '2026-08-25', 'Jorge T. Becerra',           'Tithing—Putting God First'),
  (9,  '2026-08-26', 'Henry B. Eyring',            'Prayers for Peace'),
  (10, '2026-08-27', 'Gary E. Stevenson',          'Lost Luggage, Redeemed Souls'),
  (11, '2026-08-28', 'Eduardo F. Ortega',          'Christ—Author and Finisher of Our Faith'),
  (12, '2026-08-29', 'Wan-Liang Wu',               '“I Will Give Away All My Sins to Know Thee”'),
  (13, '2026-08-30', 'David J. Wunderli',          'Jesus Christ Is Not Our Burden; He Is Our Relief'),
  (14, '2026-08-31', 'Gérald Caussé',              'Love All; Love Each'),
  (15, '2026-09-01', 'Brian J. Holmes',            'Jesus Christ Is the Way'),
  (16, '2026-09-02', 'Clement M. Matswagothata',   'He Knows You by Name'),
  (17, '2026-09-03', 'Dieter F. Uchtdorf',         'Encounter at the Empty Tomb'),
  (18, '2026-09-04', 'Emily Belle Freeman',        'Best Days and Worst Days'),
  (19, '2026-09-05', 'Pedro X. Larreal',           'I Feel My Savior''s Love'),
  (20, '2026-09-06', 'Edward B. Rowe',             'Choose Jesus Christ as Your Guide'),
  (21, '2026-09-07', 'Ronald A. Rasband',          'He Is Risen'),
  (22, '2026-09-08', 'Dale G. Renlund',            'Because of Jesus Christ'),
  (23, '2026-09-09', 'Thierry K. Mutombo',         'The Joy of a Covenant Relationship with God'),
  (24, '2026-09-10', 'Alan R. Walker',             'A Peculiar Treasure'),
  (25, '2026-09-11', 'Chi Hong (Sam) Wong',        'Remember “Remember, Remember”'),
  (26, '2026-09-12', 'Aaron T. Hall',              'I Glory in My Jesus'),
  (27, '2026-09-13', 'Susan H. Porter',            'Here Am I, Send Me'),
  (28, '2026-09-14', 'Neil L. Andersen',           'Eternal Marriage is an Eternal Journey'),
  (29, '2026-09-15', 'Quentin L. Cook',            'Keys, Covenants and Easter'),
  (30, '2026-09-16', 'Gerrit W. Gong',             'Abide With Me; ''Tis Eastertide'),
  (31, '2026-09-17', 'Ulisses Soares',             'Jesus Christ—the True Vine'),
  (32, '2026-09-18', 'Taniela B. Wakolo',          'Come unto Christ—Together'),
  (33, '2026-09-19', 'Dallin H. Oaks',             'Closing Remarks')
on conflict (day) do update set
  mission_date = excluded.mission_date,
  speaker = excluded.speaker,
  talk_title = excluded.talk_title;
