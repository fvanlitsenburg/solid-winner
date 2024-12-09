let folders = [];

    // Function to create a new folder
    async function createFolder() {
      const folderName = document.getElementById('new-folder-name').value.trim();
    
      if (folderName) {
        try {
          const response = await fetch('http://localhost:3000/folders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: folderName })
          });
    
          if (!response.ok) throw new Error('Failed to create folder');
    
          const newFolder = await response.json();
          folders.push(newFolder);
    
          document.getElementById('new-folder-name').value = '';
          updateFolderDropdown();
          alert(`Folder "${newFolder.name}" created successfully!`);
        } catch (error) {
          console.error('Error creating folder:', error);
          alert('Failed to create folder. Please try again.');
        }
      } else {
        alert('Please enter a folder name.');
      }
    }
    
    // Function to update the folder dropdown
    function updateFolderDropdown() {
      const folderSelect = document.getElementById('folder-select-upload');
      folderSelect.innerHTML = '<option value="">-- Select a Folder --</option>';
    
      folders.forEach(folder => {
        const option = document.createElement('option');
        option.value = folder.id;
        option.textContent = folder.name;
        folderSelect.appendChild(option);
      });
    }
    
    // Function to upload a file
    async function uploadFile() {
      const folderId = document.getElementById('folder-select-upload').value;
      const fileInput = document.getElementById('file-input');
      const file = fileInput.files[0];
    
      if (folderId && file) {
        try {
          const formData = new FormData();
          formData.append('file', file);
          formData.append('folderId', folderId);
    
          const response = await fetch('http://localhost:3000/files', {
            method: 'POST',
            body: formData
          });
    
          if (!response.ok) throw new Error('Failed to upload file');
    
          const uploadedFile = await response.json();
          fileInput.value = '';
          alert(`File "${uploadedFile.name}" uploaded successfully!`);
    
          sendToOCR(uploadedFile);
          fetchFilesForFolder(folderId);
        } catch (error) {
          console.error('Error uploading file:', error);
          alert('Failed to upload file. Please try again.');
        }
      } else {
        alert('Please select a folder and a file.');
      }
    }
    
    // Function to send file to OCR API
    async function sendToOCR(file) {
      try {
        const response = await fetch('http://localhost:3000/ocr', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fileId: file.id, fileName: file.name })
        });
    
        if (!response.ok) throw new Error('Failed to process file with OCR');
        const ocrResult = await response.json();
        console.log('OCR Result:', ocrResult);
        alert(`OCR processing completed for file: ${file.name}`);
      } catch (error) {
        console.error('Error sending file to OCR:', error);
      }
    }
    
    // Function to fetch files for a specific folder
    async function fetchFilesForFolder(folderId) {
      try {
        const response = await fetch(`http://localhost:3000/folders/${folderId}/files`);
        if (!response.ok) throw new Error('Failed to fetch files');
    
        const files = await response.json();
        const fileList = document.getElementById('file-list');
        fileList.innerHTML = '';
    
        files.forEach(file => {
          const listItem = document.createElement('li');
          listItem.textContent = file.name;
          fileList.appendChild(listItem);
        });
      } catch (error) {
        console.error('Error fetching files:', error);
      }
    }
    
    // Fetch folders on page load
    async function fetchFolders() {
      try {
        const response = await fetch('http://localhost:3000/folders');
        if (!response.ok) throw new Error('Failed to fetch folders');
    
        folders = await response.json();
        updateFolderDropdown();
      } catch (error) {
        console.error('Error fetching folders:', error);
      }
    }
    
    // Initialize folder data on page load
    fetchFolders();