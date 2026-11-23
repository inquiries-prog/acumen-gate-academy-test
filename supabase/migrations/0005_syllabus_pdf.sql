-- ===========================================================================
-- 0005 - Official syllabus PDF link per course
--
-- Adds courses.syllabus_pdf_url (the "Download official syllabus" button on
-- course pages and /courses) and fills it for the six GATE courses with the
-- GATE 2027 PDFs published by IIT Madras. Editable in admin -> Course pages,
-- e.g. when the next year's PDFs are released. Safe to run more than once;
-- only fills links that are still blank.
-- ===========================================================================

alter table courses add column if not exists syllabus_pdf_url text not null default '';

update courses set syllabus_pdf_url = 'https://gate2027.iitm.ac.in/static/doc/GATE2027_Syllabus/ME_GATE2027_Syllabus.pdf'
  where slug = 'gate-mechanical' and syllabus_pdf_url = '';
update courses set syllabus_pdf_url = 'https://gate2027.iitm.ac.in/static/doc/GATE2027_Syllabus/CE_GATE2027_Syllabus.pdf'
  where slug = 'gate-civil' and syllabus_pdf_url = '';
update courses set syllabus_pdf_url = 'https://gate2027.iitm.ac.in/static/doc/GATE2027_Syllabus/CS_GATE2027_Syllabus.pdf'
  where slug = 'gate-computer-science' and syllabus_pdf_url = '';
update courses set syllabus_pdf_url = 'https://gate2027.iitm.ac.in/static/doc/GATE2027_Syllabus/EE_GATE2027_Syllabus.pdf'
  where slug = 'gate-electrical' and syllabus_pdf_url = '';
update courses set syllabus_pdf_url = 'https://gate2027.iitm.ac.in/static/doc/GATE2027_Syllabus/EC_GATE2027_Syllabus.pdf'
  where slug = 'gate-electronics' and syllabus_pdf_url = '';
update courses set syllabus_pdf_url = 'https://gate2027.iitm.ac.in/static/doc/GATE2027_Syllabus/CH_GATE2027_Syllabus.pdf'
  where slug = 'gate-chemical' and syllabus_pdf_url = '';
