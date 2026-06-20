import axios from "axios";
const BASE_URL = "https://api.shngm.io";

export default async function handler(req, res) {
  const { page = 1, page_size = 10 } = req.query;
  try {
    const response = await axios.get(`${BASE_URL}/v1/manga/list`, {
      params: { page, page_size, sort_by: "updated_at", sort_order: "desc" }
    });
    res.status(200).json({ status: true, data: response.data.data });
  } catch (err) {
    res.status(500).json({ status: false, error: err.message });
  }
}
