import { TIMEOUT_SECONDS } from "./config.js";

const timeout = function (timeout_seconds) {
  return new Promise(function (_, reject) {
    setTimeout(function () {
      reject(new Error(`Request took too long! Timeout after ${timeout_seconds} second`));
    }, timeout_seconds * 1000);
  });
};

export const AJAX = async function (url, uploadData = undefined) {
  try {
    const fetchPromise = uploadData
      ? fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(uploadData) })
      : fetch(url);

    const res = await Promise.race([fetchPromise, timeout(TIMEOUT_SECONDS)]);
    const data = await res.json();
    if (!res.ok) throw new Error(`${data.message} (${res.status})`);
    return data;
  } catch (error) {
    throw error;
  }
};

/*
export const getJSON = async function (url) {
  try {
    const res = await Promise.race([fetch(url), timeout(TIMEOUT_SECONDS)]);
    const data = await res.json();
    if (!res.ok) throw new Error(`${data.message} (${res.status})`);
    return data;
  } catch (error) {
    throw error;
  }
};
export const sendJSON = async function (url, uploadData) {
  try {
    const fetchPromise = fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(uploadData) });
    const res = await Promise.race([fetchPromise, timeout(TIMEOUT_SECONDS)]);
    const data = await res.json();
    if (!res.ok) throw new Error(`${data.message} (${res.status})`);
    return data;
  } catch (error) {
    throw error;
  }
};
*/
