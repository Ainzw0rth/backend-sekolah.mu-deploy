--
-- PostgreSQL database dump
--

-- Dumped from database version 15.4
-- Dumped by pg_dump version 15.4

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: evaluasi; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.evaluasi (
    id_kegiatan integer NOT NULL,
    id_murid integer NOT NULL,
    penilaian character varying(3),
    catatan text,
    fk_id_karya integer
);


ALTER TABLE public.evaluasi OWNER TO postgres;

--
-- Name: guru; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.guru (
    id_guru integer NOT NULL,
    nama_guru character varying(255) NOT NULL,
    email character varying(50) NOT NULL,
    password character varying(100) NOT NULL,
    path_foto_profil character varying(255)
);


ALTER TABLE public.guru OWNER TO postgres;

--
-- Name: karya; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.karya (
    id_karya integer NOT NULL,
    nama_karya character varying(255) NOT NULL,
    fk_id_murid integer,
    tipe_file character varying(5) NOT NULL,
    file_path character varying(255)
);


ALTER TABLE public.karya OWNER TO postgres;

--
-- Name: kegiatan; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.kegiatan (
    id_kegiatan integer NOT NULL,
    nama_kegiatan character varying(255) NOT NULL,
    nomor_urut integer,
    deskripsi text,
    id_program integer,
    tanggal date,
    waktu timestamp without time zone,
    lokasi character varying(255)
);


ALTER TABLE public.kegiatan OWNER TO postgres;

--
-- Name: kegiatan_program; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.kegiatan_program (
    id_kegiatan integer NOT NULL,
    id_program integer NOT NULL
);


ALTER TABLE public.kegiatan_program OWNER TO postgres;

--
-- Name: kelas; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.kelas (
    id_kelas integer NOT NULL,
    nama_kelas character varying(255) NOT NULL,
    jenjang character varying(100),
    fk_id_guru integer
);


ALTER TABLE public.kelas OWNER TO postgres;

--
-- Name: kompetensi; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.kompetensi (
    id_kompetensi integer NOT NULL,
    judul_kompetensi character varying(255) NOT NULL,
    logo_path character varying(255)
);


ALTER TABLE public.kompetensi OWNER TO postgres;

--
-- Name: konten; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.konten (
    id_konten integer NOT NULL,
    nama_konten character varying(255) NOT NULL,
    tipe_konten character varying(50) NOT NULL,
    nama_file character varying(255),
    tipe_file character varying(50),
    file_path character varying(255),
    id_kegiatan integer
);


ALTER TABLE public.konten OWNER TO postgres;

--
-- Name: murid; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.murid (
    id_murid integer NOT NULL,
    nama_murid character varying(100) NOT NULL,
    jenis_kelamin character(1) NOT NULL,
    tanggal_lahir date,
    nisn character(10) NOT NULL,
    path_foto_profil character varying(255),
    fk_id_kelas integer
);


ALTER TABLE public.murid OWNER TO postgres;

--
-- Name: program; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.program (
    id_program integer NOT NULL,
    nama_program character varying(255) NOT NULL,
    tujuan_pembelajaran text,
    periode_belajar character varying(255),
    tahun_akademik character varying(50)
);


ALTER TABLE public.program OWNER TO postgres;

--
-- Name: program_kompetensi; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.program_kompetensi (
    id_program integer NOT NULL,
    id_kompetensi integer NOT NULL
);


ALTER TABLE public.program_kompetensi OWNER TO postgres;

--
-- Name: topik; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.topik (
    id_topik integer NOT NULL,
    nama_topik character varying(255) NOT NULL,
    fk_id_kegiatan integer
);


ALTER TABLE public.topik OWNER TO postgres;

--
-- Data for Name: evaluasi; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.evaluasi (id_kegiatan, id_murid, penilaian, catatan, fk_id_karya) FROM stdin;
\.


--
-- Data for Name: guru; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.guru (id_guru, nama_guru, email, password, path_foto_profil) FROM stdin;
\.


--
-- Data for Name: karya; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.karya (id_karya, nama_karya, fk_id_murid, tipe_file, file_path) FROM stdin;
\.


--
-- Data for Name: kegiatan; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.kegiatan (id_kegiatan, nama_kegiatan, nomor_urut, deskripsi, id_program, tanggal, waktu, lokasi) FROM stdin;
\.


--
-- Data for Name: kegiatan_program; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.kegiatan_program (id_kegiatan, id_program) FROM stdin;
\.


--
-- Data for Name: kelas; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.kelas (id_kelas, nama_kelas, jenjang, fk_id_guru) FROM stdin;
\.


--
-- Data for Name: kompetensi; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.kompetensi (id_kompetensi, judul_kompetensi, logo_path) FROM stdin;
\.


--
-- Data for Name: konten; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.konten (id_konten, nama_konten, tipe_konten, nama_file, tipe_file, file_path, id_kegiatan) FROM stdin;
\.


--
-- Data for Name: murid; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.murid (id_murid, nama_murid, jenis_kelamin, tanggal_lahir, nisn, path_foto_profil, fk_id_kelas) FROM stdin;
\.


--
-- Data for Name: program; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.program (id_program, nama_program, tujuan_pembelajaran, periode_belajar, tahun_akademik) FROM stdin;
\.


--
-- Data for Name: program_kompetensi; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.program_kompetensi (id_program, id_kompetensi) FROM stdin;
\.


--
-- Data for Name: topik; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.topik (id_topik, nama_topik, fk_id_kegiatan) FROM stdin;
\.


--
-- Name: evaluasi evaluasi_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.evaluasi
    ADD CONSTRAINT evaluasi_pkey PRIMARY KEY (id_kegiatan, id_murid);


--
-- Name: guru guru_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.guru
    ADD CONSTRAINT guru_pkey PRIMARY KEY (id_guru);


--
-- Name: karya karya_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.karya
    ADD CONSTRAINT karya_pkey PRIMARY KEY (id_karya);


--
-- Name: kegiatan kegiatan_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.kegiatan
    ADD CONSTRAINT kegiatan_pkey PRIMARY KEY (id_kegiatan);


--
-- Name: kegiatan_program kegiatan_program_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.kegiatan_program
    ADD CONSTRAINT kegiatan_program_pkey PRIMARY KEY (id_kegiatan, id_program);


--
-- Name: kelas kelas_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.kelas
    ADD CONSTRAINT kelas_pkey PRIMARY KEY (id_kelas);


--
-- Name: kompetensi kompetensi_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.kompetensi
    ADD CONSTRAINT kompetensi_pkey PRIMARY KEY (id_kompetensi);


--
-- Name: konten konten_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.konten
    ADD CONSTRAINT konten_pkey PRIMARY KEY (id_konten);


--
-- Name: murid murid_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.murid
    ADD CONSTRAINT murid_pkey PRIMARY KEY (id_murid);


--
-- Name: program_kompetensi program_kompetensi_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.program_kompetensi
    ADD CONSTRAINT program_kompetensi_pkey PRIMARY KEY (id_program, id_kompetensi);


--
-- Name: program program_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.program
    ADD CONSTRAINT program_pkey PRIMARY KEY (id_program);


--
-- Name: topik topik_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.topik
    ADD CONSTRAINT topik_pkey PRIMARY KEY (id_topik);


--
-- Name: evaluasi evaluasi_fk_id_karya_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.evaluasi
    ADD CONSTRAINT evaluasi_fk_id_karya_fkey FOREIGN KEY (fk_id_karya) REFERENCES public.karya(id_karya);


--
-- Name: evaluasi evaluasi_id_kegiatan_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.evaluasi
    ADD CONSTRAINT evaluasi_id_kegiatan_fkey FOREIGN KEY (id_kegiatan) REFERENCES public.kegiatan(id_kegiatan);


--
-- Name: evaluasi evaluasi_id_murid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.evaluasi
    ADD CONSTRAINT evaluasi_id_murid_fkey FOREIGN KEY (id_murid) REFERENCES public.murid(id_murid);


--
-- Name: karya karya_fk_id_murid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.karya
    ADD CONSTRAINT karya_fk_id_murid_fkey FOREIGN KEY (fk_id_murid) REFERENCES public.murid(id_murid);


--
-- Name: kegiatan kegiatan_id_program_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.kegiatan
    ADD CONSTRAINT kegiatan_id_program_fkey FOREIGN KEY (id_program) REFERENCES public.program(id_program);


--
-- Name: kegiatan_program kegiatan_program_id_kegiatan_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.kegiatan_program
    ADD CONSTRAINT kegiatan_program_id_kegiatan_fkey FOREIGN KEY (id_kegiatan) REFERENCES public.kegiatan(id_kegiatan);


--
-- Name: kegiatan_program kegiatan_program_id_program_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.kegiatan_program
    ADD CONSTRAINT kegiatan_program_id_program_fkey FOREIGN KEY (id_program) REFERENCES public.program(id_program);


--
-- Name: kelas kelas_fk_id_guru_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.kelas
    ADD CONSTRAINT kelas_fk_id_guru_fkey FOREIGN KEY (fk_id_guru) REFERENCES public.guru(id_guru);


--
-- Name: konten konten_id_kegiatan_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.konten
    ADD CONSTRAINT konten_id_kegiatan_fkey FOREIGN KEY (id_kegiatan) REFERENCES public.kegiatan(id_kegiatan);


--
-- Name: murid murid_fk_id_kelas_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.murid
    ADD CONSTRAINT murid_fk_id_kelas_fkey FOREIGN KEY (fk_id_kelas) REFERENCES public.kelas(id_kelas);


--
-- Name: program_kompetensi program_kompetensi_id_kompetensi_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.program_kompetensi
    ADD CONSTRAINT program_kompetensi_id_kompetensi_fkey FOREIGN KEY (id_kompetensi) REFERENCES public.kompetensi(id_kompetensi);


--
-- Name: program_kompetensi program_kompetensi_id_program_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.program_kompetensi
    ADD CONSTRAINT program_kompetensi_id_program_fkey FOREIGN KEY (id_program) REFERENCES public.program(id_program);


--
-- Name: topik topik_fk_id_kegiatan_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.topik
    ADD CONSTRAINT topik_fk_id_kegiatan_fkey FOREIGN KEY (fk_id_kegiatan) REFERENCES public.kegiatan(id_kegiatan);


--
-- PostgreSQL database dump complete
--

