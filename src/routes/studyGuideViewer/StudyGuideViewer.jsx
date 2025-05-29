import { useEffect, useState } from "react";
import Markdown from "react-markdown";
import "./studyGuideViewer.css";
const backendUrl = import.meta.env.VITE_BACKEND || 'http://localhost:3000';

const StudyGuideViewer = () => {
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileContent, setFileContent] = useState("");

  useEffect(() => {
    fetch(`${backendUrl}/api/files/`)
      .then((res) => res.json())
      .then((data) => {
        const markdownFiles = data.filenames.filter((f) => f.endsWith(".md"));
        setFiles(markdownFiles);
      });
  }, []);

  const loadMarkdown = (filename) => {
    fetch(`${backendUrl}/api/files/${filename}`)
      .then((res) => res.text())
      .then((content) => {
        setSelectedFile(filename);
        setFileContent(content);
      });
  };

  

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(fileContent);
      alert("Contenido copiado al portapapeles");
    } catch (err) {
      alert("Error al copiar");
    }
  };

  const downloadFile = () => {
    if (!selectedFile) return;
    
    fetch(`${backendUrl}/api/files/${selectedFile}`)
      .then(res => res.blob())
      .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = selectedFile;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      })
      .catch(err => console.error('Download failed:', err));
  };

  return (
    <div className="guideViewer">
      <h3>Visor de Guías en Markdown</h3>

      <section>
        <h4>Archivos disponibles (.md):</h4>
        <select onChange={(e) => loadMarkdown(e.target.value)} defaultValue="">
          <option value="" disabled>
            Selecciona un archivo
          </option>
          {files.map((file) => (
            <option key={file} value={file}>
              {file}
            </option>
          ))}
        </select>
      </section>

      {selectedFile && (
        <section style={{ marginTop: "2rem" }}>
          <h4>Vista Markdown: {selectedFile}</h4>
          <div className="markdown-box">
            <Markdown>{fileContent}</Markdown>
          </div>
          <button onClick={copyToClipboard}>Copiar al portapapeles</button>
          <button onClick={downloadFile}>Descargar archivo</button>
        </section>
      )}
    </div>
  );
};

export default StudyGuideViewer;
