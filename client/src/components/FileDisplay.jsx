import React from "react";

const FileDisplay = React.memo(({ files }) => {
  return (
    <div className="flex flex-wrap gap-4 mt-2">
      {files.map((file, index) => {
        
        const fileExtension = file.split('.').pop().toLowerCase();

        if (['jpg', 'jpeg', 'png', 'gif'].includes(fileExtension)) {
          // Display image
          return (
            <div key={file} className="w-32">
              <img
                src={file}
                alt={`file-${index}`}
                className="w-full h-full object-cover rounded-lg"
              />
            </div>
          );
        } else if (['pdf'].includes(fileExtension)) {
          // Display PDF
          return (
            <div key={file} className="w-32">
              <a
                href={file}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500"
              >
                Open PDF
              </a>
            </div>
          );
        } else {
          // Handle other file types
          return (
            <div key={file} className="w-32">
              <a
                href={file}
                download={`file-${index}`}
                className="text-blue-500"
              >
                Download File
              </a>
            </div>
          );
        }
      })}
    </div>
  );
});

export default FileDisplay;