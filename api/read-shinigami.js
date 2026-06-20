import axios from "axios";

const BASE_URL = "https://api.shngm.io";

function getUuid(input) {
  const match = String(input).match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i);
  return match ? match[0] : null;
}

export default async function handler(req, res) {
  const { url } = req.query;
  const chapterId = getUuid(url);
  if (!chapterId) return res.status(400).json({ status: false, message: "Invalid Chapter URL" });

  try {
    const response = await axios.get(`${BASE_URL}/v1/chapter/detail/${chapterId}`);
    res.status(200).json({ status: true, data: response.data.data });
  } catch (err) {
    res.status(500).json({ status: false, error: err.message });
  }
}
