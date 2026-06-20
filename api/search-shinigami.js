import axios from "axios";

const BASE_URL = "https://api.shngm.io";
const WEB_URL = "https://g.shinigami.asia";

export default async function handler(req, res) {
  const { q, page = 1, page_size = 5 } = req.query;
  if (!q) return res.status(400).json({ status: false, message: "Query 'q' is required" });

  try {
    const response = await axios.get(`${BASE_URL}/v1/manga/list`, {
      params: { page, page_size, q },
      headers: { "Referer": `${WEB_URL}/`, "User-Agent": "Mozilla/5.0" }
    });

    const data = response.data;
    res.status(200).json({
      status: data.retcode === 0,
      result: (data.data || []).map(item => ({
        Title: item.title,
        Manga_id: item.manga_id,
        Url: `${WEB_URL}/series/${item.manga_id}`,
        Cover: item.cover_image_url,
        Latest_chapter: item.latest_chapter_number
      }))
    });
  } catch (err) {
    res.status(500).json({ status: false, error: err.message });
  }
}
