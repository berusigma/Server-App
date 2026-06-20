import axios from "axios";

const BASE_URL = "https://api.shngm.io";

function getUuid(input) {
  const match = String(input).match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i);
  return match ? match[0] : null;
}

export default async function handler(req, res) {
  const { url } = req.query;
  const mangaId = getUuid(url);
  
  if (!mangaId) return res.status(400).json({ status: false, message: "Invalid URL or Manga ID" });

  try {
    // 1. Ambil detail manga dulu
    const detail = await axios.get(`${BASE_URL}/v1/manga/detail/${mangaId}`);

    // 2. Looping ambil chapter sampai habis
    let allChapters = [];
    let currentPage = 1;
    let hasMore = true;
    const pageSize = 50; // Set besar supaya request lebih sedikit (max biasanya 50-100)

    while (hasMore) {
      const response = await axios.get(`${BASE_URL}/v1/chapter/${mangaId}/list`, {
        params: { 
          page: currentPage, 
          page_size: pageSize, 
          sort_by: "chapter_number", 
          sort_order: "desc" 
        }
      });

      const data = response.data.data;

      if (data && data.length > 0) {
        allChapters = [...allChapters, ...data];
        currentPage++;
        
        // Kalau data yang balik lebih kecil dari pageSize, berarti ini halaman terakhir
        if (data.length < pageSize) {
          hasMore = false;
        }
      } else {
        hasMore = false;
      }
    }

    // 3. Kirim semua data sekaligus
    res.status(200).json({
      status: true,
      total_chapters: allChapters.length,
      detail: detail.data.data,
      chapters: allChapters
    });

  } catch (err) {
    res.status(500).json({ status: false, error: err.message });
  }
}
