// TranscriptManager.jsx
import { useEffect, useState } from "react";
import TranscriptPlayer from "./TranscriptPlayer";
const backendUrl = import.meta.env.VITE_BACKEND || 'http://localhost:3000';

const TranscriptManager = () => {
  const [audioList, setAudioList] = useState([]);
  const [selectedAudio, setSelectedAudio] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAudioList = async () => {
      try {
        const response = await fetch(`${backendUrl}/api/audio/list`, {
          credentials: 'include'
        });
        const data = await response.json();
        setAudioList(data);
        if (data.length > 0) setSelectedAudio(data[data.length - 1]); // Latest audio
      } catch (err) {
        console.error("Failed to load audio list:", err);
        setError("No se pudo cargar la lista de audios.");
      }
    };
    fetchAudioList();
  }, []);

  return (
    <div>
      <h2>Selecciona un audio:</h2>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {audioList.length > 0 && (
        <select
          className="audio-list"
          onChange={(e) => {
            const selectedId = e.target.value;
            const audio = audioList.find((a) => a.audioId === selectedId);
            setSelectedAudio(audio);
          }}
          value={selectedAudio?.audioId || ""}
        >
          <option value="" disabled>Select a transcribed audio</option>
          {audioList.map((audio) => (
            <option key={audio.audioId} value={audio.audioId}>
              {audio.originalName || audio.filename}
            </option>
          ))}
        </select>

      )}

      {selectedAudio && (
        <TranscriptPlayer
          audioId={selectedAudio.audioId}  
          processedAudioPath={selectedAudio.processed_audio_path}  
          originalFilenameFromProps={selectedAudio.originalName}
        />
      )}
    </div>
  );
};

export default TranscriptManager;
