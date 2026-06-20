import axios from "axios";
const BASE_URL = "https://api.shngm.io";

export default async function handler(req, res) {
  try {
    const response = await axios.get(`${BASE_URL}/v1/manga/genres`);
    res.status(200).json({ status: true, data: response.data.data });
  } catch (err) {
    res.status(500).json({ status: false, error: err.message });
  }
}
