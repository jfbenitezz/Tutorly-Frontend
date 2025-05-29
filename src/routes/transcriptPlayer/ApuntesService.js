import axios from "axios";

const BACKEND_BASE_URL = "http://localhost:3000";

/**
 * Extracts filename from Content-Disposition header or uses a default.
 * @param {Object} headers - The response headers.
 * @param {string} defaultFilename - The default filename.
 * @returns {string}
 */
const getFilenameFromResponse = (headers, defaultFilename) => {
  const contentDisposition = headers['content-disposition'];
  let filename = defaultFilename;

  if (contentDisposition) {
    const filenameMatch = contentDisposition.match(/filename="?([^"]+)"?/i);
    if (filenameMatch && filenameMatch.length > 1) {
      filename = filenameMatch[1];
    }
  }
  return filename;
};

/**
 * Handles the file download from a blob response.
 * @param {Object} response - The axios response object.
 * @param {string} defaultFilename - The default filename if not provided by Content-Disposition.
 */
const handleFileDownload = (response, defaultFilename) => {
  const contentDisposition = response.headers['content-disposition'];
  let filename = defaultFilename;

  if (contentDisposition) {
    const filenameMatch = contentDisposition.match(/filename="?([^"]+)"?/i);
    if (filenameMatch && filenameMatch.length > 1) {
      filename = filenameMatch[1];
    }
  }

  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  link.parentNode.removeChild(link);
  window.URL.revokeObjectURL(url);
  return filename;
};

/**
 * Generates a schema by sending a file to the backend.
 * @param {File} file - The file to process.
 * @returns {Promise<{success: boolean, filename: string, message?: string}>}
 */
export const generarEsquema = async (file) => {
  if (!file) {
    throw new Error("No file provided for schema generation.");
  }

  const formData = new FormData();
  formData.append("file", file, file.name);

  try {
    const response = await axios.post(`${BACKEND_BASE_URL}/api/generar_esquema`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      withCredentials: true,
      responseType: 'blob', // Crucial for handling file streams as downloads
    });
    // Instead of downloading, return the blob and filename for further processing
    const originalNameWithoutExtension = file.name.includes('.') ? file.name.substring(0, file.name.lastIndexOf('.')) : file.name;
    const defaultSchemaFilename = `${originalNameWithoutExtension}_esquema.txt`;
    const schemaFilename = getFilenameFromResponse(response.headers, defaultSchemaFilename);
    
    return { success: true, blob: response.data, filename: schemaFilename };
  } catch (error) {
    console.error("Error generating schema:", error.response ? await error.response.data.text() : error.message);
    // Ensure the error structure is consistent or rethrow
    const errorData = error.response ? await error.response.data.text().catch(() => error.response.data) : {};
    const errorMessage = typeof errorData === 'string' ? errorData : (errorData.error || error.message);
    throw new Error(`Error generating schema: ${errorMessage}`);
  }
};

/**
 * Generates notes by sending a transcription file and a schema file to the backend.
 * @param {File} transcripcionFile - The transcription file.
 * @param {File} esquemaFile - The schema file.
 * @returns {Promise<{success: boolean, filename: string, message?: string}>}
 */
export const generarApuntes = async (transcripcionFile, esquemaFile) => {
  if (!transcripcionFile || !esquemaFile) {
    throw new Error("Both transcription and schema files are required for generating notes.");
  }

  const formData = new FormData();
  formData.append("transcripcion_file", transcripcionFile, transcripcionFile.name);
  formData.append("esquema_file", esquemaFile, esquemaFile.name);

  try {
    const response = await axios.post(`${BACKEND_BASE_URL}/api/generar_apuntes`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      withCredentials: true,
      responseType: 'blob',
    });
    const downloadedFilename = handleFileDownload(response, "apuntes.md");
    return { success: true, filename: downloadedFilename };
  } catch (error) {
    console.error("Error generating notes:", error.response ? await error.response.data.text() : error.message);
    const errorDetails = error.response ? await error.response.data.text() : error.message;
    throw new Error(`Error generating notes: ${errorDetails}`);
  }
};

/**
 * Generates notes using Gemini by sending a schema file and a transcription file to the backend.
 * @param {File} esquemaFile - The schema file.
 * @param {File} transcripcionFile - The transcription file.
 * @returns {Promise<{success: boolean, filename: string, message?: string}>}
 */
export const generarApuntesGemini = async (esquemaFile, transcripcionFile) => {
  if (!esquemaFile || !transcripcionFile) {
    throw new Error("Both schema and transcription files are required for generating Gemini notes.");
  }

  const formData = new FormData();
  formData.append("esquema_file", esquemaFile, esquemaFile.name);
  formData.append("transcripcion_file", transcripcionFile, transcripcionFile.name);

  try {
    const response = await axios.post(`${BACKEND_BASE_URL}/api/generar_apuntes_gemini`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      withCredentials: true,
      responseType: 'blob',
    });
    const downloadedFilename = handleFileDownload(response, "apuntes_gemini.md");
    return { success: true, filename: downloadedFilename };
  } catch (error) {
    console.error("Error generating Gemini notes:", error.response ? await error.response.data.text() : error.message);
    const errorDetails = error.response ? await error.response.data.text() : error.message;
    throw new Error(`Error generating Gemini notes: ${errorDetails}`);
  }
};