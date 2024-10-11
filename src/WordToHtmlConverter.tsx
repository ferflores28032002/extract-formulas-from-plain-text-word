import React, { useState } from "react";
import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";
import { saveAs } from "file-saver";

// Componente para subir archivo
const FileUploader: React.FC<{ onFileUpload: (file: File) => void }> = ({
  onFileUpload,
}) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileUpload(file);
    }
  };

  return (
    <div className="mb-6">
      <input
        type="file"
        onChange={handleFileChange}
        accept=".docx"
        className="px-4 py-2 border border-gray-300 rounded-lg shadow-sm cursor-pointer"
      />
    </div>
  );
};

// Componente para mostrar el contenido extraído
const ExtractedContent: React.FC<{ content: string }> = ({ content }) => (
  <div className="mt-6 p-4 bg-white border border-gray-300 rounded-lg shadow-lg max-h-[45rem] w-[90%] overflow-y-auto">
    <h2 className="text-xl font-semibold mb-2">Contenido Extraído:</h2>
    <pre className="whitespace-pre-wrap text-gray-700">
      {content || "Sube un archivo Word para extraer el contenido."}
    </pre>
  </div>
);

// Componente principal
const WordExtractor: React.FC = () => {
  const [fileContent, setFileContent] = useState<string>("");
  const [docContentObject, setDocContentObject] = useState<{
    doc_content: string;
  }>({ doc_content: "" });

  const handleFileUpload = async (file: File) => {
    const reader = new FileReader();
    reader.onload = async (event) => {
      const arrayBuffer = event.target?.result as ArrayBuffer;
      const zip = new PizZip(arrayBuffer);

      let doc;
      try {
        doc = new Docxtemplater(zip);
        const text = doc.getFullText();
        setFileContent(text);
        setDocContentObject({ doc_content: text });
      } catch (error) {
        console.error("Error al cargar el documento", error);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleCopyToClipboard = () => {
    const textToCopy = JSON.stringify(docContentObject, null, 2); // Convierte el objeto a texto para copiar
    navigator.clipboard
      .writeText(textToCopy)
      .then(() => {
        alert("Contenido copiado al portapapeles");
      })
      .catch((err) => {
        console.error("Error al copiar el contenido: ", err);
      });
  };

  const handleDownloadText = () => {
    const blob = new Blob([fileContent], { type: "text/plain;charset=utf-8" });
    saveAs(blob, "contenido-extraido.txt");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        Extractor de Texto de Word
      </h1>

      <FileUploader onFileUpload={handleFileUpload} />

      <div className="mt-4 flex space-x-4">
        <button
          onClick={handleDownloadText}
          className="px-6 py-2 bg-green-600 text-white rounded-lg shadow-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-600"
        >
          Descargar como Texto
        </button>

        <button
          onClick={handleCopyToClipboard}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
        >
          Copiar Contenido
        </button>
      </div>

      <ExtractedContent content={fileContent} />
    </div>
  );
};

export default WordExtractor;
