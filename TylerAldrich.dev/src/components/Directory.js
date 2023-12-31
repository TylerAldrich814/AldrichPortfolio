import React, { useState, useEffect } from "react";
import { useCodeBlock } from "../providers/CodeBlockInteractions.js";
import { useProjectStructure } from "../providers/projectStructureProvider.js";
import FileIcon from "./fileIcon.js";
import { AutoOpenProvider, useAutoOpen } from "../providers/DirAutoOpen.js";

// Takes our Portfolio metadata file, and creates files paths based on the
// generated Map structure of directory names and files arrays
const DirectoryViewer = ({ children }) => {
  const {
    dirExpanded,
    setDirExpanded,
    dirHover,
  } = useCodeBlock();

  const {
    absoluteFilePath,
    projectStructure,
    projectId,
  } = useProjectStructure();

  useEffect(() => {
    const delayedExpansion = setTimeout(() => {
      setDirExpanded(true);
    }, 750);

    return () => {
      clearTimeout(delayedExpansion);
    };
  }, [])

  useEffect(() => {
    if( absoluteFilePath !== null && dirExpanded ){
      setDirExpanded(false);
    }
  }, [absoluteFilePath])

  return (
    <AutoOpenProvider>
      <div className="directory-viewer" >
      <div
        className={dirHover ? "directory dirhover" : "directory"}
        style={{
          transition: "all 0.2s linear",
          width:
            dirHover && !dirExpanded ? "15px" :
            !dirHover && dirExpanded ? "250px" :
            dirHover && dirExpanded ? "285px" : "0px",
          opacity:
            dirHover && !dirExpanded ? "80%" :
            !dirHover && dirExpanded ? "100%" :
            dirHover && dirExpanded ? "80%" : "0%",

          position: "absolute",
        }}
      >
        <Directory name={projectId} content={projectStructure}  />
      </div>
      {children}
      </div>
    </AutoOpenProvider>
  )
};

const Directory = ({ name, content, currentPath = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const {
    shouldAutoOpen,
    setShouldAutoOpen,
  } = useAutoOpen();

  useEffect(() => {
    if( shouldAutoOpen ){
      const timerId = setTimeout(() => {
        setIsOpen(true);
      }, 750);  // Open after a 750ms delay

      return () => clearTimeout(timerId);
    }
  }, [shouldAutoOpen]);

  useEffect(() => {
    if (isOpen && content.hasOwnProperty('files')) {
      setShouldAutoOpen(false);
    }
  }, [isOpen, content]);

  const toggleOpen = () => {
    setIsOpen(!isOpen);
  };

  const renderContent = (content, currentPath) => {
    return Object.keys(content).map((key, index) => {
      let newPath = currentPath;
      if (key === "files") {
        return content[key].map((file, fileIndex) => (
          <File
            key={fileIndex}
            name={file}
            path={`${newPath}/${file}`}
          />
        ));
      } else {
        newPath = currentPath ? `${currentPath}/${key}` : key;
        return (
          <div
            key={index}
            className="directory-listing"
          >
            <Directory name={key} content={content[key]} currentPath={newPath} />
          </div>
        );
      }
    });
  };

  return (
    <div className="directory-listing">
      <div >
         <span className="directory-btn" onClick={toggleOpen}>
           {isOpen ? '[-]' : '[+]'}
         </span>
         <span className="directory-name" onClick={toggleOpen}>
           {name}
         </span>
      </div>
      {isOpen && renderContent(content, currentPath)}
    </div>
  );
};

const File = ({ name, path }) => {
  const { absoluteFilePath, setAbsoluteFilePath } = useProjectStructure();

  return (
    <div className="fileName-container">
      <FileIcon fileName={path} />
      <div
        className="fileName"
        style={{
          color: absoluteFilePath == path ? "#E5D18Ba9" : "#white",
        }}
        onClick={() => setAbsoluteFilePath(path)}
      >{name}</div>
    </div>
  )
}


export default DirectoryViewer;
