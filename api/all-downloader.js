‎/**
‎‎❉ *Note* : Supported platforms: Tiktok, Douyin, Capcut, Threads, Instagram, Facebook, Espn, Pinterest, imdb, imgur, ifunny, Izlesene, Reddit, Youtube, Twitter, Vimeo, Snapchat, Bilibili, Dailymotion, Sharechat, Likee, Linkedin, Tumblr, Hipi, Telegram, Getstickerpack, Bitchute, Febspot, 9GAG, ok.ru, Rumble, Streamable, Ted, SohuTv, Xvideos, Xnxx, Xiaohongshu, Ixigua, Weibo, Miaopai, Meipai, Xiaoying, National Video, Yingke, Sina, Vk-vkvideo, Soundcloud, Mixcloud, Spotify, Zingmp3, Bandcamp.
*/ 
import axios from "axios";

const BASE = "https://downr.org";
const ANALYTICS = `${BASE}/.netlify/functions/analytics`;
const DOWNLOAD = `${BASE}/.netlify/functions/download`;
const NYT = `${BASE}/.netlify/functions/nyt`;

const UA = "Mozilla/5.0 (Linux; Android 15; SM-F958 Build/AP3A.240905.015) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.6723.86 Mobile Safari/537.36";

// --- Helper Functions ---
function parseCookie(setCookie = []) {
  return setCookie.map(v => v.split(";")[0]).join("; ");
}

function parseData(data) {
  if (typeof data !== "string") return data;
  const text = data.trim();
  try { return JSON.parse(text); } catch { return text; }
}

function isOk(status, data) {
  const isObject = data && typeof data === "object";
  if (status < 200 || status >= 300) return false;
  if (data === null || data === undefined || data === "" || data === "error" || data === "failed" || data === "user_retry_required") return false;
  if (isObject && (data.error === true || data.status === false || data.success === false)) return false;
  return true;
}

function getError(data, status) {
  if (typeof data === "string") return data || `HTTP ${status}`;
  if (data && typeof data === "object") return data.message || data.error || data.status || data.reason || `HTTP ${status}`;
  return `HTTP ${status}`;
}

async function getCookie() {
  const res = await axios.get(ANALYTICS, {
    timeout: 30000,
    validateStatus: () => true,
    responseType: "text",
    transformResponse: [v => v],
    headers: { accept: "*/*", referer: `${BASE}/`, "user-agent": UA }
  });
  return parseCookie(res.headers["set-cookie"] || []);
}

async function postEndpoint(endpoint, url, cookie = "") {
  const res = await axios.post(endpoint, { url }, {
    timeout: 120000,
    validateStatus: () => true,
    responseType: "text",
    transformResponse: [v => v],
    headers: {
      accept: "*/*",
      "accept-encoding": "gzip, deflate, br",
      "content-type": "application/json",
      cookie,
      origin: BASE,
      referer: `${BASE}/`,
      "user-agent": UA
    }
  });
  return { endpoint, status: res.status, data: parseData(res.data) };
}

async function tryDownload(url) {
  let cookie = await getCookie();
  let result = await postEndpoint(DOWNLOAD, url, cookie);
  if (isOk(result.status, result.data)) return result;

  cookie = await getCookie();
  result = await postEndpoint(DOWNLOAD, url, cookie);
  if (isOk(result.status, result.data)) return result;

  result = await postEndpoint(NYT, url, cookie);
  return result;
}

async function downr(url) {
  try {
    if (!url || !/^https?:\/\//i.test(url)) throw new Error("Invalid url.");
    const result = await tryDownload(url);
    const ok = isOk(result.status, result.data);
    return {
      Status: ok,
      Code: result.status,
      Input: url,
      Endpoint: result.endpoint,
      Result: ok ? result.data : null,
      Error: ok ? null : getError(result.data, result.status)
    };
  } catch (err) {
    return { Status: false, Code: err.response?.status || 500, Input: url || null, Endpoint: null, Result: null, Error: err.message };
  }
}

// --- Vercel Handler ---
export default async function handler(req, res) {
  // CORS configuration
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { url } = req.query;

  if (!url) {
    return res.status(400).json({ status: false, message: "URL is required" });
  }

  const result = await downr(url);
  return res.status(result.Code || 200).json(result);
}

