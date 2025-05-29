import axios from "axios";

const BACKEND_PROXY_URL = "http://localhost:3000";

export const uploadAudio = async (file) => {
  try {
    const formData = new FormData();
    formData.append("file", file);
    const response = await axios.post(`${BACKEND_PROXY_URL}/api/audio/upload`, formData, {
      headers: { "Content-Type": "multipart/form-data", },
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error("Error al subir el audio:", error.response ? error.response.data : error.message);
    throw error;
  }
};

export const getAudioStatus = async (audioId) => {
  try {
    const response = await axios.get(`${BACKEND_PROXY_URL}/api/audio/status/${audioId}`, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error("Error al obtener el estado del audio:", error.response ? error.response.data : error.message);
    throw error;
  }
};

export const processAudio = async (audioId, options = {}) => {
  try {
    const response = await axios.post(`${BACKEND_PROXY_URL}/api/audio/process/${audioId}`, options, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error("Error al procesar el audio:", error.response ? error.response.data : error.message);
    throw error;
  }
};

export const transcribeAudio = async (audioId, options = {}) => {
  let url = `${BACKEND_PROXY_URL}/api/audio/transcribe/${audioId}`;
  const queryParams = new URLSearchParams();
  if (options.use_fallback !== undefined) {
    queryParams.append('use_fallback', options.use_fallback);
  }
  const queryString = queryParams.toString();
  if (queryString) {
    url += `?${queryString}`;
  }
  try {
    const response = await axios.post(url, {}, { withCredentials: true, });
    return response.data;
  } catch (error) {
    console.error("Error al transcribir el audio (frontend):", error.response ? error.response.data : error.message);
    throw error;
  }
};

export const cleanupAudio = async (audioId) => {
  try {
    const response = await axios.delete(`${BACKEND_PROXY_URL}/api/audio/cleanup/${audioId}`, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error("Error al limpiar el audio:", error.response ? error.response.data : error.message);
    throw error;
  }
};

export const uploadPdfToVectorDB = async (file) => {
  try {
    const formData = new FormData();
    formData.append("pdfFile", file); // "pdfFile" debe coincidir con upload.single("pdfFile") en el backend
    const response = await axios.post(`${BACKEND_PROXY_URL}/api/vector-db/upload-pdf`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error("Error al subir el PDF al vector DB:", error.response ? error.response.data : error.message);
    throw error;
  }
};