import axios from "axios";

const BASE_URL = "https://api.shngm.io";
const WEB_URL = "https://g.shinigami.asia";

function getUuid(input) {
  const match = String(input).match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i);
  return match ? match[0] : null;
}

export default async function handler(req, res) {
  const { url, page = 1, page_size = 24 } = req.query;
  const mangaId = getUuid(url);
  if (!mangaId) return res.status(400).json({ status: false, message: "Invalid URL or Manga ID" });

  try {
    const [detail, chapters] = await Promise.all([
      axios.get(`${BASE_URL}/v1/manga/detail/${mangaId}`),
      axios.get(`${BASE_URL}/v1/chapter/${mangaId}/list`, { params: { page, page_size, sort_by: "chapter_number", sort_order: "desc" } })
    ]);

    res.status(200).json({
      status: true,
      detail: detail.data.data,
      chapters: chapters.data.data
    });
  } catch (err) {
    res.status(500).json({ status: false, error: err.message });
  }
}
