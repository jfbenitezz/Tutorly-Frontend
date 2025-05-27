import { useEffect, useRef, useState } from "react";  // Make sure useRef is included here
import "./transcriptPlayer.css";
const BACKEND_PROXY_URL = "http://localhost:3000";
const TranscriptPlayer = ({ audioId, originalFilenameFromProps, useFallbackForTranscription }) => {
  const audioRef = useRef(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [formattedTranscript, setFormattedTranscript] = useState([]);
  const [audioTitle, setAudioTitle] = useState("Cargando título...");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchTranscription = async () => {
    if (!audioId) return;
    
    console.log("[TranscriptPlayer] Starting transcription fetch for audioId:", audioId);
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${BACKEND_PROXY_URL}/api/audio/${audioId}/transcription`, {
        method: "GET",
        credentials: 'include'
      });

      console.log("[TranscriptPlayer] Response status:", response.status);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("[TranscriptPlayer] Received transcription data:", data);

      // Process the transcription data
      if (data.segments && data.segments.length > 0) {
        let cumulativeTime = 0;
        const lines = data.segments.map(segment => {
          const lineData = {
            time: cumulativeTime,
            text: segment.transcription,
            duration: segment.duration_sec
          };
          cumulativeTime += segment.duration_sec;
          return lineData;
        });
        setFormattedTranscript(lines);
      } else if (data.complete_transcription) {
        setFormattedTranscript([{
          time: 0,
          text: data.complete_transcription,
          duration: audioRef.current?.duration || 0
        }]);
      } else {
        setError("No transcription data available");
      }
    } catch (err) {
      console.error("[TranscriptPlayer] Error fetching transcription:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    console.log("TranscriptPlayer useEffect triggered", { audioId });
    
    if (!audioId) {
      setAudioTitle("Sin audio seleccionado");
      setFormattedTranscript([]);
      setError(null);
      return;
    }

    // Set audio title
    setAudioTitle(originalFilenameFromProps || `Audio ID: ${audioId}`);

    // Fetch transcription
    fetchTranscription();
  }, [audioId, originalFilenameFromProps]);

  useEffect(() => {
    const audioElement = audioRef.current;
    if (!audioElement) return;

    const updateCurrentTime = () => {
      setCurrentTime(audioElement.currentTime);
    };

    audioElement.addEventListener("timeupdate", updateCurrentTime);
    audioElement.addEventListener("loadedmetadata", updateCurrentTime);

    return () => {
      audioElement.removeEventListener("timeupdate", updateCurrentTime);
      audioElement.removeEventListener("loadedmetadata", updateCurrentTime);
    };
  }, []);

  const handleLineClick = (time) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      audioRef.current.play();
    }
  };

  const handleCopyToClipboard = () => {
        const fullText = formattedTranscript.map(line => line.text).join('\n');
        navigator.clipboard.writeText(fullText)
          .then(() => alert("Texto copiado al portapapeles"))
          .catch((err) => alert("Error al copiar el texto: " + err.message));
      };

      const handleExportAsTxt = () => {
        const fullText = formattedTranscript.map(line => line.text).join('\n');
        const blob = new Blob([fullText], { type: "text/plain;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement("a");
        link.href = url;
        link.download = `${audioTitle || "transcription"}.txt`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      };

  if (!audioId && !isLoading) {
    return <div className="transcript-player-container"><p className="tp-message">No hay audio seleccionado para transcribir.</p></div>;
  }

  return (
    <div className="transcript-player-container">
      <h3 className="tp-audio-title">{audioTitle}</h3>
      
      {isLoading && <p className="tp-message">Cargando transcripción...</p>}
      
      {error && <p className="tp-message error">Error: {error}</p>}

      {!isLoading && !error && formattedTranscript.length > 0 && (
        <>
          <div className="tp-transcript-lines">
            {formattedTranscript.map((line, i) => (
              <p
                key={i}
                className="tp-line"
                onClick={() => handleLineClick(line.time)}
              >
                {line.text}
              </p>
            ))}
          </div>

          <div className="tp-export-buttons">
            <button onClick={handleCopyToClipboard}>Copiar texto</button>
            <button onClick={handleExportAsTxt}>Exportar como .txt</button>
          </div>
        </>
      )}


      {!isLoading && !error && formattedTranscript.length === 0 && audioId && (
        <p className="tp-message">No hay transcripción disponible para este audio.</p>
      )}
    </div>
  );
};

export default TranscriptPlayer;

