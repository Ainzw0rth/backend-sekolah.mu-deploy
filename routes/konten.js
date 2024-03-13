var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.json({
    data: [
      {
        nama_konten: 'Mengenal jerapah',
        tipe_konten: 'Pelajaran',
        nama_file: 'jerapah.pdf',
        tipe_file: 'pdf',
        file_path: 'downloads/jerapah.pdf',
        id_kegiatan: '1'
      }
    ],
    meta: {
      page: 1
    }
  });
});

module.exports = router;