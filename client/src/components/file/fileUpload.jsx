import React, { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import FileTable from './existingFiles';
import { ErrorMessageViewer } from '../errors/errorMessage';
import { AppHeader } from '../common/header';
import './fileUpload.css';

const FileUpload = () => {

  const [files, setFiles] = useState([]);
  const [filesUploaded, setFilesUploaded] = useState([]);
  const [fileError, setFileError] = useState(null);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    if(fileError) {
      setTimeout(() => {
        setFileError(null);
      }, 10000);
    }
  }, [fileError]);

  const onDrop = useCallback((acceptedFiles) => {
    setFiles(acceptedFiles);
  }, []);

  useEffect(() => {
    async function getExistingFiles() {
      const searchParams = new URLSearchParams(window.location.search);
  
      const userId = searchParams.get('userId');
      try {
        const fileList = await axios.get('http://localhost:4000/file/getDocs?userID='+userId);
        if(fileList.data && fileList.data.data) {
          setFilesUploaded(fileList.data.data);
          setUserId(userId);
        }
        return;
      } catch (err) {
        setFilesUploaded([{
          filename:'TEST1',
          size: '20',
          uniqueWordsCount: '10',
        },
        {
          filename:'TEST1',
          size: '20',
          uniqueWordsCount: '10',
        }]);
        setFileError('Unable to fetch existing documents');
        return;
      }
    }
    getExistingFiles();
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  const handleUpload = async (e) => {
    e.preventDefault();
    const formData = new FormData();

    files.forEach((file)=> {
      formData.append('pdfFiles', file);
    })
    formData.append('userID', userId);
    try {
      const postResponse = await axios.post('http://localhost:4000/file/upload', formData);
      if(!postResponse.data.isSuccess) {
        throw new Error("Failed. Error -> "+ postResponse.data.error)
      }
      const addedFiles = postResponse.data.fileInfo.map((fileAdded)=> {
        return fileAdded.filename;
      });
      setFilesUploaded(addedFiles);
      return;
    } catch(err){
      console.log(err);
      setFileError('Unable to upload documents');
      return;
    }
  };

  return (
    <div className="App relative">
      <div className='heading'>
        <AppHeader />
      </div>
      <div {...getRootProps()} className='drop-zone' style={{ border: '2px dashed #ccc', padding: '20px', textAlign: 'center', cursor: 'pointer' }}>
        <input {...getInputProps()} />
        {isDragActive ? (
          <p>Drop the files here ...</p>
        ) : (
          <p>Drag 'n' drop some files here, or click to select files</p>
        )}
      </div>
      {files.length > 0 && (
        <div>
          <h2>Selected Files:</h2>
          <ul>
            {files.map((file, index) => (
              <li key={index}>{file.name}</li>
            ))}
          </ul>
          <button onClick={handleUpload}>Upload</button>
        </div>
      )}
      <FileTable fileList={filesUploaded} />
      <ErrorMessageViewer errorMessage={fileError} />
    </div>
  );
}
  
  export default FileUpload;