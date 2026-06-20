import axios from "axios";

const BASE_URL = "https://api.shngm.io";

// Fungsi helper untuk mengambil ID dari URL
// Sesuaikan regex ini jika format URL berubah
const getMangaId = (url) => {
  const parts = url.split('/');
  return parts[parts.length - 1]; 
};

export default async function handler(req, res) {
  // Ambil url dari query parameter, dan page (default 1)
  const { url, page = 1 } = req.query;
  const page_size = 24;

  if (!url) {
    return res.status(400).json({ status: false, message: "Parameter 'url' wajib diisi." });
  }

  const mangaId = getMangaId(url);

  try {
    // Jalankan dua request bersamaan agar loading lebih cepat
    const [detailResponse, chapterResponse] = await Promise.all([
      axios.get(`${BASE_URL}/v1/manga/detail/${mangaId}`),
      axios.get(`${BASE_URL}/v1/chapter/${mangaId}/list`, {
        params: { 
          page: page, 
          page_size: page_size, 
          sort_by: "chapter_number", 
          sort_order: "desc" 
        }
      })
    ]);

    const chapters = chapterResponse.data.data || [];
    
    // Logika Pagination:
    // Jika jumlah chapter kurang dari page_size, berarti ini halaman terakhir
    const isLastPage = chapters.length < page_size;

    return res.status(200).json({
      status: true,
      meta: {
        current_page: parseInt(page),
        page_size: page_size,
        is_last_page: isLastPage,
        count: chapters.length
      },
      detail: detailResponse.data.data,
      chapters: chapters
    });

  } catch (error) {
    console.error("Error fetching detail:", error.message);
    return res.status(500).json({ 
      status: false, 
      message: "Gagal mengambil data dari server.",
      error: error.message 
    });
  }
}
