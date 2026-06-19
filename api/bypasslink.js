‎//> Note :  Bypass ini mendukung berbagai layanan ad-link, social unlock, paster, dan URL shortener seperti Linkvertise.com, Admaven/Lootlabs.gg/Lootlinks.com, Paster.so, Paster.gg, Work.ink all domains, Cuty.io, Cety.io, Boost.ink, Lockr.so, Mendationforc.info, Rekonise.com, Link-Unlock.com, Linkunlocker.com, Mboost.me, Bst.gg, Booo.st, Social-unlock.com, Socialwolvez.com, Sub2get.com, Sub2unlock.com, Sub2unlock.net, Sub4unlock.io, Subfinal.com, Unlocknow.net, Ytsubme.com, Justpaste.it, Paste-drop.com, Pastebin.com, Pastecanyon.com, Pastehill.com, Pastemode.com, Rentry.org, Bit.ly, Cl.gy, Goo.gl, Is.Gd, Rebrand.ly, Rkns.link, Shorter.me, T.co, T.ly, Tiny.cc, Tinylink.onl, Tinyurl.com, dan V.gd. *Api key ga permanen jadi kalian bisa ambil ulang di frontend kalo misal udh expired.*

const API = "https://trw.lat/api/bypass";
// Disarankan pindahkan API_KEY ke Vercel Environment Variables untuk keamanan
const API_KEY = "TRW_FREE-GAY-15a92945-9b04-4c75-8337-f2a6007281e9";

function parseResult(result) {
  if (typeof result !== "string") return result;
  const tupleMatch = result.match(/^\(['"](.+?)['"],\s*(True|False)\)$/);
  if (tupleMatch) return tupleMatch[1];
  const quoteMatch = result.match(/^["'](.+?)["']$/);
  if (quoteMatch) return quoteMatch[1];
  return result;
}

async function bypass(url) {
  const apiUrl = new URL(API);
  apiUrl.searchParams.set("apikey", API_KEY);
  apiUrl.searchParams.set("url", url);

  const response = await fetch(apiUrl, {
    method: "GET",
    headers: {
      "accept": "*/*",
      "origin": "https://bypassunlock.com",
      "referer": "https://bypassunlock.com/",
      "user-agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Mobile Safari/537.36"
    }
  });

  const text = await response.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    throw { code: response.status, message: text || response.statusText };
  }

  if (!response.ok || !data.success || !data.result) {
    throw {
      code: response.status,
      message: data.message || data.error || "Bypass failed",
      raw: data
    };
  }

  return {
    Status: true,
    Code: response.status,
    Input: url,
    Result_url: parseResult(data.result)
  };
}

export default async function handler(req, res) {
  // Setup CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: "Method not allowed" });

  const { url } = req.query;

  if (!url) {
    return res.status(400).json({
      Status: false,
      Error: "Parameter 'url' is required."
    });
  }

  try {
    const result = await bypass(url);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(error.code || 500).json({
      Status: false,
      Code: error.code || 500,
      Input: url,
      Result_url: null,
      Error: error.message || String(error),
      Raw: error.raw || null
    });
  }
}
