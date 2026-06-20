import axios from "axios";
const BASE_URL = "https://api.shngm.io";

export default async function handler(req, res) {
  // Ambil parameter dari user, default ke 'latest'
  const { type = "latest", page = 1, page_size = 10 } = req.query;

  let params = { page_size };
  let currentPage = parseInt(page);

  // Logika switch case untuk mode rekomendasi
  switch (type) {
    case "popular":
      params.sort_by = "view_count";
      params.sort_order = "desc";
      params.page = currentPage;
      break;
    case "trending":
      params.sort_by = "bookmark_count";
      params.sort_order = "desc";
      params.page = currentPage;
      break;
    case "random":
      // Random page antara 1 sampai 20 (karena 20 cukup luas)
      params.page = Math.floor(Math.random() * 20) + 1;
      break;
    case "latest":
    default:
      params.sort_by = "updated_at";
      params.sort_order = "desc";
      params.page = currentPage;
      break;
  }

  try {
    const response = await axios.get(`${BASE_URL}/v1/manga/list`, { params });
    res.status(200).json({ 
      status: true, 
      type_mode: type,
      page_used: params.page,
      data: response.data.data 
    });
  } catch (err) {
    res.status(500).json({ status: false, error: err.message });
  }
}
