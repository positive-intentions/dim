import React from "react";
import { define, html, css, useState, useEffect, useStyle, useScope, unsafeCSS } from "../core/dim.ts";

// File Manager Demo Component
const FileManagerDemo = (props, { useState, useEffect, useStyle, useFS, useMemo, html, css, unsafeCSS }) => {
  const { opfs = false } = props;
  
  // Initialize useFS hook
  const fs = useFS({ opfs });
  
  // Local component state
  const [files, setFiles] = useState([]);
  const [currentPath, setCurrentPath] = useState('');
  const [newFileName, setNewFileName] = useState('');
  const [newFileContent, setNewFileContent] = useState('Hello World!');
  const [selectedFile, setSelectedFile] = useState('');
  const [fileContent, setFileContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState('');

  // Static component styles
  useStyle(css`
    .file-manager {
      max-width: 800px;
      margin: 20px auto;
      padding: 20px;
      border: 1px solid #ddd;
      border-radius: 8px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }

    .fs-mode {
      padding: 8px 16px;
      border-radius: 4px;
      font-weight: bold;
      text-align: center;
      margin-bottom: 20px;
    }

    .status {
      padding: 10px;
      margin: 10px 0;
      border-radius: 4px;
      font-weight: 500;
    }

    .status.success {
      background: #e8f5e8;
      color: #2e7d32;
      border: 1px solid #4caf50;
    }

    .status.error {
      background: #ffebee;
      color: #c62828;
      border: 1px solid #f44336;
    }

    .status.info {
      background: #e3f2fd;
      color: #1976d2;
      border: 1px solid #2196f3;
    }

    .controls {
      display: grid;
      gap: 20px;
      margin-bottom: 20px;
    }

    .control-group {
      padding: 15px;
      border: 1px solid #e0e0e0;
      border-radius: 6px;
      background: #fafafa;
    }

    .control-group h4 {
      margin: 0 0 10px 0;
      color: #333;
    }

    .button-group {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
      margin-bottom: 10px;
    }

    button {
      padding: 8px 16px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-weight: 500;
      transition: background-color 0.2s;
    }

    button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .btn-primary {
      background: #2196f3;
      color: white;
    }

    .btn-primary:hover:not(:disabled) {
      background: #1976d2;
    }

    .btn-success {
      background: #4caf50;
      color: white;
    }

    .btn-success:hover:not(:disabled) {
      background: #388e3c;
    }

    .btn-danger {
      background: #f44336;
      color: white;
    }

    .btn-danger:hover:not(:disabled) {
      background: #d32f2f;
    }

    .btn-secondary {
      background: #757575;
      color: white;
    }

    .btn-secondary:hover:not(:disabled) {
      background: #616161;
    }

    input, textarea {
      width: 100%;
      padding: 8px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-family: inherit;
      margin: 5px 0;
    }

    textarea {
      min-height: 100px;
      resize: vertical;
      font-family: 'Courier New', monospace;
    }

    .file-list {
      margin: 20px 0;
    }

    .file-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 10px;
      border: 1px solid #e0e0e0;
      border-radius: 4px;
      margin-bottom: 5px;
      background: white;
    }

    .file-item:hover {
      background: #f5f5f5;
    }

    .file-info {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .file-icon {
      font-size: 18px;
    }

    .file-name {
      font-weight: 500;
      cursor: pointer;
    }

    .file-actions {
      display: flex;
      gap: 5px;
    }

    .file-actions button {
      padding: 4px 8px;
      font-size: 12px;
    }

    .path-display {
      background: #f5f5f5;
      padding: 10px;
      border-radius: 4px;
      font-family: 'Courier New', monospace;
      margin-bottom: 10px;
    }

    .loading {
      text-align: center;
      padding: 20px;
      color: #666;
    }

    .mode-switcher {
      display: flex;
      gap: 10px;
      margin-bottom: 15px;
    }

    .feature-info {
      background: #f8f9fa;
      padding: 15px;
      border-radius: 6px;
      margin-bottom: 20px;
      border-left: 4px solid #2196f3;
    }

    .feature-info h4 {
      margin: 0 0 10px 0;
      color: #1976d2;
    }

    .feature-info ul {
      margin: 0;
      padding-left: 20px;
    }

    .feature-info li {
      margin-bottom: 5px;
    }
  `);

  // Load files when directory changes - inline the function to avoid dependency issues
  useEffect(() => {
    
    const loadFiles = async () => {
      if (!fs.isReady || isLoading) return; // Don't load if already loading
      
      try {
        setIsLoading(true);
        const entries = await fs.listDirectory(currentPath);
        setFiles(entries);
        setStatus(`Ready - Using ${fs.fsMode === 'opfs' ? 'Origin Private File System' : 'File System Access API'}`);
      } catch (err) {
        console.log('File list loading failed, this is expected initially:', err.message);
        setFiles([]); // Set empty array instead of keeping old files
        // Don't update status to error state here to avoid infinite loops
      } finally {
        setIsLoading(false);
      }
    };

    // Add a small delay to prevent rapid fire calls
    const timeoutId = setTimeout(() => {
      loadFiles();
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [fs.isReady, currentPath]); // Only depend on essential values, not isLoading

  // Standalone loadFiles function for manual calls
  const loadFiles = async () => {
    if (!fs.isReady) {
      setStatus('File system not ready. Please select a directory or wait for initialization.');
      return;
    }
    
    try {
      setIsLoading(true);
      const entries = await fs.listDirectory(currentPath);
      setFiles(entries);
      setStatus(`Directory loaded successfully - ${entries.length} items found`);
    } catch (err) {
      setFiles([]);
      setStatus(`Failed to load files: ${err.message}${fs.fsMode === 'fsa' && !fs.hasPermission ? ' (Try selecting a directory first)' : ''}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Update status when fs state changes
  useEffect(() => {
    if (fs.error) {
      setStatus(`Error: ${fs.error.message}`);
    } else if (!fs.isReady) {
      setStatus('File system not ready. Please select a directory or wait for OPFS initialization.');
    } else {
      setStatus(`Ready - Using ${fs.fsMode === 'opfs' ? 'Origin Private File System' : 'File System Access API'}`);
    }
  }, [fs.error, fs.isReady, fs.fsMode]);

  const handleSelectDirectory = async () => {
    try {
      setIsLoading(true);
      const success = await fs.selectDirectory();
      if (success) {
        setStatus('Directory selected successfully!');
        await loadFiles();
      } else {
        setStatus('Directory selection cancelled');
      }
    } catch (err) {
      setStatus(`Failed to select directory: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateFile = async () => {
    if (!newFileName.trim()) {
      setStatus('Please enter a file name');
      return;
    }

    try {
      setIsLoading(true);
      await fs.writeFile(newFileName, newFileContent, currentPath);
      setStatus(`File "${newFileName}" created successfully!`);
      setNewFileName('');
      await loadFiles();
    } catch (err) {
      setStatus(`Failed to create file: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReadFile = async (fileName) => {
    try {
      setIsLoading(true);
      const content = await fs.readFile(fileName, currentPath);
      setSelectedFile(fileName);
      setFileContent(content);
      setEditContent(typeof content === 'string' ? content : '');
      setIsEditing(false);
      setStatus(`File "${fileName}" loaded successfully!`);
    } catch (err) {
      setStatus(`Failed to read file: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!selectedFile) return;
    
    try {
      setIsLoading(true);
      await fs.writeFile(selectedFile, editContent, currentPath);
      setFileContent(editContent);
      setIsEditing(false);
      setStatus(`File "${selectedFile}" saved successfully!`);
      await loadFiles(); // Refresh file list
    } catch (err) {
      setStatus(`Failed to save file: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditContent(typeof fileContent === 'string' ? fileContent : '');
    setIsEditing(false);
  };

  const handleDownloadFile = async (fileName) => {
    try {
      setIsLoading(true);
      const content = await fs.readFile(fileName, currentPath);
      
      let blob;
      let downloadFileName = fileName;
      
      if (typeof content === 'object' && content.type === 'binary') {
        // Handle binary files
        const binaryData = atob(content.data);
        const bytes = new Uint8Array(binaryData.length);
        for (let i = 0; i < binaryData.length; i++) {
          bytes[i] = binaryData.charCodeAt(i);
        }
        blob = new Blob([bytes], { type: content.mimeType });
      } else {
        // Handle text files
        const textContent = typeof content === 'string' ? content : JSON.stringify(content, null, 2);
        blob = new Blob([textContent], { type: 'text/plain' });
        // Add .txt extension if it's not already there and it's plain text
        if (!fileName.includes('.') && typeof content === 'string') {
          downloadFileName = fileName + '.txt';
        }
      }
      
      // Create download link
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = downloadFileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      setStatus(`File "${fileName}" downloaded successfully!`);
    } catch (err) {
      setStatus(`Failed to download file: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteFile = async (fileName) => {
    if (!confirm(`Are you sure you want to delete "${fileName}"?`)) return;

    try {
      setIsLoading(true);
      await fs.removeFile(fileName, currentPath);
      setStatus(`File "${fileName}" deleted successfully!`);
      await loadFiles();
      if (selectedFile === fileName) {
        setSelectedFile('');
        setFileContent('');
      }
    } catch (err) {
      setStatus(`Failed to delete file: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const navigateToDirectory = async (dirName) => {
    const newPath = currentPath ? `${currentPath}/${dirName}` : dirName;
    setCurrentPath(newPath);
  };

  const navigateUp = () => {
    const pathParts = currentPath.split('/').filter(Boolean);
    pathParts.pop();
    setCurrentPath(pathParts.join('/'));
  };

  const getStatusClass = () => {
    if (fs.error) return 'error';
    if (fs.isReady) return 'success';
    return 'info';
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return html`
    <div class="file-manager">
      <div class="feature-info">
        <h4>🗂️ useFS Hook Demo</h4>
        <ul>
          <li><strong>File System Access API:</strong> Access real directories on your device (requires user permission)</li>
          <li><strong>OPFS Fallback:</strong> Uses Origin Private File System when FSA is unavailable or denied</li>
          <li><strong>Persistent State:</strong> Remembers your preferences using useStore</li>
          <li><strong>Error Handling:</strong> Graceful fallbacks and user-friendly error messages</li>
        </ul>
      </div>

      <div class="fs-mode" style="background: ${fs.fsMode === 'opfs' ? '#e3f2fd' : '#f3e5f5'}; color: ${fs.fsMode === 'opfs' ? '#1976d2' : '#7b1fa2'};">
        ${fs.fsMode === 'opfs' ? '🔒 Origin Private File System (OPFS)' : '📁 File System Access API'}
      </div>

      <div class="status ${getStatusClass()}">
        ${status}
      </div>

      ${!opfs ? html`
        <div class="mode-switcher">
          <button 
            class="btn-secondary"
            @click="${() => fs.switchToOPFS()}"
            ?disabled="${isLoading}"
          >
            Switch to OPFS
          </button>
          <button 
            class="btn-secondary"
            @click="${() => fs.switchToFSA()}"
            ?disabled="${isLoading || !window.showDirectoryPicker}"
          >
            Switch to File System Access
          </button>
        </div>
      ` : ''}

      <div class="controls">
        ${fs.fsMode === 'fsa' ? html`
          <div class="control-group">
            <h4>📁 Directory Selection</h4>
            <div class="button-group">
              <button 
                class="btn-primary"
                @click="${handleSelectDirectory}"
                ?disabled="${isLoading}"
              >
                ${fs.hasPermission ? 'Change Directory' : 'Select Directory'}
              </button>
            </div>
            <div class="path-display">
              Current: ${fs.directoryPath}
            </div>
          </div>
        ` : html`
          <div class="control-group">
            <h4>🔒 Origin Private File System</h4>
            <div class="path-display">
              Location: ${fs.directoryPath}
            </div>
            <p style="margin: 10px 0; color: #666; font-size: 14px;">
              OPFS provides a private storage area for your app. Files are isolated and persist across sessions.
            </p>
          </div>
        `}

        ${fs.isReady ? html`
          <div class="control-group">
            <h4>📄 File Operations</h4>
            <div class="button-group">
              <input 
                type="text" 
                placeholder="Enter file name (e.g., example.txt)"
                .value="${newFileName}"
                @input="${(e) => setNewFileName(e.target.value)}"
              />
              <textarea 
                placeholder="File content..."
                .value="${newFileContent}"
                @input="${(e) => setNewFileContent(e.target.value)}"
              ></textarea>
              <button 
                class="btn-success"
                @click="${handleCreateFile}"
                ?disabled="${isLoading || !newFileName.trim()}"
              >
                Create File
              </button>
            </div>
          </div>
        ` : ''}
      </div>

      ${fs.isReady ? html`
        <div class="file-list">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
            <h4>📋 Directory Contents</h4>
            <button 
              class="btn-primary" 
              @click="${() => loadFiles()}" 
              ?disabled="${isLoading}"
              style="padding: 6px 12px; font-size: 12px;"
            >
              ${isLoading ? '🔄 Loading...' : '🔄 Refresh'}
            </button>
          </div>
          
          ${currentPath ? html`
            <div class="file-item">
              <div class="file-info">
                <span class="file-icon">⬆️</span>
                <span class="file-name" @click="${navigateUp}">..</span>
              </div>
            </div>
          ` : ''}

          ${isLoading ? html`
            <div class="loading">Loading files...</div>
          ` : ''}

          ${files.map(file => html`
            <div class="file-item">
              <div class="file-info">
                <span class="file-icon">${file.kind === 'directory' ? '📁' : '📄'}</span>
                <span 
                  class="file-name" 
                  @click="${file.kind === 'directory' ? () => navigateToDirectory(file.name) : () => handleReadFile(file.name)}"
                >
                  ${file.name}
                </span>
              </div>
              <div class="file-actions">
                ${file.kind === 'file' ? html`
                  <button 
                    class="btn-primary"
                    @click="${() => handleReadFile(file.name)}"
                    ?disabled="${isLoading}"
                  >
                    Read
                  </button>
                  <button 
                    class="btn-secondary"
                    @click="${() => handleDownloadFile(file.name)}"
                    ?disabled="${isLoading}"
                    style="font-size: 12px; padding: 4px 8px;"
                  >
                    💾 Download
                  </button>
                  <button 
                    class="btn-danger"
                    @click="${() => handleDeleteFile(file.name)}"
                    ?disabled="${isLoading}"
                  >
                    Delete
                  </button>
                ` : html`
                  <button 
                    class="btn-primary"
                    @click="${() => navigateToDirectory(file.name)}"
                    ?disabled="${isLoading}"
                  >
                    Open
                  </button>
                `}
              </div>
            </div>
          `)}

          ${!isLoading && files.length === 0 ? html`
            <div class="file-item">
              <div class="file-info">
                <span style="color: #666; font-style: italic;">No files found. Create a file to get started!</span>
              </div>
            </div>
          ` : ''}
        </div>

        ${selectedFile ? html`
          <div class="control-group">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
              <h4>📖 File Content: ${selectedFile}</h4>
              <div class="file-actions-row">
                ${typeof fileContent === 'string' && !isEditing ? html`
                  <button class="btn-edit" @click="${() => setIsEditing(true)}" ?disabled="${isLoading}">
                    ✏️ Edit
                  </button>
                ` : ''}
                <button class="btn-download" @click="${() => handleDownloadFile(selectedFile)}" ?disabled="${isLoading}">
                  💾 Download
                </button>
              </div>
            </div>
            
            ${typeof fileContent === 'object' && fileContent.type === 'binary' ? html`
              <div class="content-preview">
                <p><strong>Binary File:</strong> ${fileContent.mimeType}</p>
                <p><strong>Size:</strong> ${formatFileSize(fileContent.size)}</p>
                <p><em>${fileContent.preview}</em></p>
                ${fileContent.mimeType.startsWith('image/') ? html`
                  <div style="margin-top: 10px;">
                    <img 
                      src="data:${fileContent.mimeType};base64,${fileContent.data}" 
                      style="max-width: 300px; max-height: 200px; border-radius: 4px;"
                      alt="Uploaded image"
                    />
                  </div>
                ` : ''}
              </div>
            ` : isEditing ? html`
              <div>
                <textarea 
                  class="edit-textarea"
                  .value="${editContent}"
                  @input="${(e) => setEditContent(e.target.value)}"
                  placeholder="Edit file content..."
                ></textarea>
                <div class="edit-actions">
                  <button class="btn-cancel" @click="${handleCancelEdit}" ?disabled="${isLoading}">
                    Cancel
                  </button>
                  <button class="btn-save" @click="${handleSaveEdit}" ?disabled="${isLoading}">
                    💾 Save Changes
                  </button>
                </div>
              </div>
            ` : html`
              <textarea 
                readonly
                .value="${fileContent}"
                style="min-height: 150px; width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; font-family: 'Courier New', monospace;"
              ></textarea>
            `}
          </div>
        ` : ''}
      ` : ''}
    </div>
  `;
};

// Simple useFS example
const SimpleUSeFSExample = (props, { useFS, useState, useStyle, html, css }) => {
  const fs = useFS();
  const [result, setResult] = useState('');

  useStyle(css`
    .simple-example {
      max-width: 600px;
      margin: 20px auto;
      padding: 20px;
      border: 1px solid #ddd;
      border-radius: 8px;
    }

    .example-button {
      background: #2196f3;
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 4px;
      cursor: pointer;
      margin: 5px;
    }

    .example-button:hover {
      background: #1976d2;
    }

    .result {
      background: #f5f5f5;
      padding: 15px;
      border-radius: 4px;
      margin-top: 15px;
      white-space: pre-wrap;
      font-family: monospace;
    }
  `);

  const runExample = async () => {
    try {
      setResult('Running example...\n');

      // Check if we have permission
      const hasPermission = await fs.requestPermission();
      setResult(prev => prev + `Permission status: ${hasPermission}\n`);

      if (!hasPermission && fs.fsMode === 'fsa') {
        // Try to select directory
        const selected = await fs.selectDirectory();
        if (!selected) {
          setResult(prev => prev + 'No directory selected\n');
          return;
        }
      }

      setResult(prev => prev + `Directory: ${fs.directoryPath}\n`);

      // Write a file
      await fs.writeFile('example.txt', 'Hello from useFS!');
      setResult(prev => prev + 'Created example.txt\n');

      // Read the file back
      const content = await fs.readFile('example.txt');
      setResult(prev => prev + `File content: "${content}"\n`);

      // List directory
      const files = await fs.listDirectory();
      setResult(prev => prev + `Files found: ${files.map(f => f.name).join(', ')}\n`);

    } catch (err) {
      setResult(prev => prev + `Error: ${err.message}\n`);
    }
  };

  return html`
    <div class="simple-example">
      <h3>Simple useFS Example</h3>
      <p>This example demonstrates basic file operations using the useFS hook.</p>
      
      <button class="example-button" @click="${runExample}">
        Run Example
      </button>

      <div class="result">${result}</div>
    </div>
  `;
};

// OPFS specific example
const OPFSExample = (props, { useFS, useState, useStyle, html, css }) => {
  const fs = useFS({ opfs: true });
  const [files, setFiles] = useState([]);

  useStyle(css`
    .opfs-example {
      max-width: 600px;
      margin: 20px auto;
      padding: 20px;
      border: 1px solid #ddd;
      border-radius: 8px;
      background: #e3f2fd;
    }

    .opfs-button {
      background: #1976d2;
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 4px;
      cursor: pointer;
      margin: 5px;
    }

    .opfs-button:hover {
      background: #0d47a1;
    }

    .file-list {
      margin-top: 15px;
      padding: 10px;
      background: white;
      border-radius: 4px;
    }
  `);

  const createSampleFiles = async () => {
    try {
      await fs.writeFile('notes.txt', 'These are my private notes');
      await fs.writeFile('config.json', JSON.stringify({ theme: 'dark', version: '1.0' }, null, 2));
      await fs.writeFile('data.csv', 'name,value\nTest,123\nSample,456');
      
      const fileList = await fs.listDirectory();
      setFiles(fileList);
    } catch (err) {
      console.error('Failed to create sample files:', err);
    }
  };

  return html`
    <div class="opfs-example">
      <h3>🔒 OPFS Example</h3>
      <p>This example uses Origin Private File System exclusively. Files are private to this origin and persist across sessions.</p>
      
      <button class="opfs-button" @click="${createSampleFiles}">
        Create Sample Files
      </button>

      <div class="file-list">
        <h4>Files in OPFS:</h4>
        ${files.map(file => html`
          <div>📄 ${file.name}</div>
        `)}
      </div>
    </div>
  `;
};

// Encrypted File Manager Demo Component
const EncryptedFileManagerDemo = (props, { useState, useEffect, useStyle, useFS, useMemo, html, css, unsafeCSS }) => {
  const { opfs = false } = props;
  
  // Password management
  const [password, setPassword] = useState('demo-password-123');
  const [tempPassword, setTempPassword] = useState('demo-password-123');
  const [showPasswordInput, setShowPasswordInput] = useState(false);
  
  // Initialize useFS hook with encryption enabled
  const fs = useFS({ opfs, encrypt: true, encryptionPassword: password });
  
  // Local component state
  const [files, setFiles] = useState([]);
  const [currentPath, setCurrentPath] = useState('');
  const [newFileName, setNewFileName] = useState('secret.txt');
  const [newFileContent, setNewFileContent] = useState('This is encrypted content! 🔐');
  const [selectedFile, setSelectedFile] = useState('');
  const [fileContent, setFileContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [uploadResults, setUploadResults] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState('');
  const [newFolderName, setNewFolderName] = useState('');
  const [pathHistory, setPathHistory] = useState([]);

  // Static component styles
  useStyle(css`
    .encrypted-file-manager {
      max-width: 800px;
      margin: 20px auto;
      padding: 20px;
      border: 2px solid #ff6b6b;
      border-radius: 8px;
      background: linear-gradient(135deg, #fff5f5 0%, #ffe6e6 100%);
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }

    .encryption-status {
      background: #ff6b6b;
      color: white;
      padding: 10px;
      border-radius: 6px;
      text-align: center;
      margin-bottom: 20px;
      font-weight: bold;
    }

    .encryption-status.ready {
      background: #51cf66;
    }

    .encryption-info {
      background: #fff3cd;
      border: 1px solid #ffeaa7;
      padding: 15px;
      border-radius: 6px;
      margin-bottom: 20px;
    }

    .file-item {
      background: rgba(255, 107, 107, 0.1);
      border: 1px solid #ff6b6b;
      padding: 10px;
      margin: 5px 0;
      border-radius: 4px;
    }

    .encrypted-badge {
      background: #ff6b6b;
      color: white;
      padding: 2px 8px;
      border-radius: 12px;
      font-size: 12px;
      margin-left: 10px;
    }

    .btn-encrypt {
      background: #ff6b6b;
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 4px;
      cursor: pointer;
      margin: 5px;
    }

    .btn-encrypt:hover {
      background: #e63946;
    }

    .content-preview {
      background: #f8f9fa;
      border: 1px solid #dee2e6;
      padding: 15px;
      border-radius: 4px;
      font-family: monospace;
      white-space: pre-wrap;
      max-height: 200px;
      overflow-y: auto;
    }

    .password-display {
      background: #343a40;
      color: #f8f9fa;
      padding: 8px;
      border-radius: 4px;
      font-family: monospace;
      font-size: 14px;
    }

    .upload-zone {
      border: 2px dashed #ff6b6b;
      border-radius: 8px;
      padding: 20px;
      text-align: center;
      background: rgba(255, 107, 107, 0.05);
      transition: all 0.3s ease;
      cursor: pointer;
    }

    .upload-zone:hover {
      border-color: #e63946;
      background: rgba(255, 107, 107, 0.1);
    }

    .upload-zone.dragging {
      border-color: #e63946;
      background: rgba(255, 107, 107, 0.15);
      transform: scale(1.02);
    }

    .upload-input {
      display: none;
    }

    .upload-result {
      background: #f8f9fa;
      border: 1px solid #dee2e6;
      padding: 8px 12px;
      margin: 4px 0;
      border-radius: 4px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .upload-result.success {
      background: #d4edda;
      border-color: #c3e6cb;
      color: #155724;
    }

    .upload-result.error {
      background: #f8d7da;
      border-color: #f5c6cb;
      color: #721c24;
    }

    .file-info {
      font-size: 12px;
      color: #6c757d;
    }

    .edit-textarea {
      width: 100%;
      min-height: 200px;
      padding: 10px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-family: 'Courier New', monospace;
      font-size: 14px;
      resize: vertical;
      background: #f8f9fa;
    }

    .edit-actions {
      display: flex;
      gap: 10px;
      margin-top: 10px;
      justify-content: flex-end;
    }

    .btn-save {
      background: #28a745;
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 4px;
      cursor: pointer;
      font-weight: 500;
    }

    .btn-save:hover {
      background: #218838;
    }

    .btn-cancel {
      background: #6c757d;
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 4px;
      cursor: pointer;
      font-weight: 500;
    }

    .btn-cancel:hover {
      background: #5a6268;
    }

    .file-actions-row {
      display: flex;
      gap: 8px;
      margin-top: 10px;
      flex-wrap: wrap;
    }

    .btn-download {
      background: #17a2b8;
      color: white;
      border: none;
      padding: 6px 12px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 12px;
      font-weight: 500;
    }

    .btn-download:hover {
      background: #138496;
    }

    .btn-edit {
      background: #ffc107;
      color: #212529;
      border: none;
      padding: 6px 12px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 12px;
      font-weight: 500;
    }

    .btn-edit:hover {
      background: #e0a800;
    }

    .column-view {
      display: flex;
      gap: 1px;
      height: 400px;
      border: 1px solid #ddd;
      border-radius: 4px;
      overflow: hidden;
    }

    .column {
      flex: 1;
      min-width: 200px;
      background: white;
      border-right: 1px solid #ddd;
      display: flex;
      flex-direction: column;
    }

    .column:last-child {
      border-right: none;
    }

    .column-header {
      background: #f8f9fa;
      padding: 8px 12px;
      border-bottom: 1px solid #ddd;
      font-weight: 600;
      font-size: 12px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .column-content {
      flex: 1;
      overflow-y: auto;
    }

    .column-item {
      padding: 8px 12px;
      cursor: pointer;
      border-bottom: 1px solid #f0f0f0;
      display: flex;
      align-items: center;
      gap: 8px;
      transition: background 0.2s;
    }

    .column-item:hover {
      background: #f8f9fa;
    }

    .column-item.selected {
      background: #e3f2fd;
      color: #1976d2;
    }

    .column-item.directory {
      font-weight: 500;
    }

    .item-icon {
      font-size: 14px;
      width: 16px;
      text-align: center;
    }

    .item-name {
      flex: 1;
      font-size: 13px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .breadcrumb {
      background: #f8f9fa;
      padding: 8px 12px;
      border-bottom: 1px solid #ddd;
      font-size: 12px;
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .breadcrumb-item {
      cursor: pointer;
      color: #666;
      text-decoration: underline;
    }

    .breadcrumb-item:hover {
      color: #333;
    }

    .breadcrumb-separator {
      color: #999;
      margin: 0 4px;
    }

    .password-section {
      background: #fff3cd;
      border: 1px solid #ffeaa7;
      padding: 15px;
      border-radius: 6px;
      margin-bottom: 20px;
    }

    .password-input {
      width: 100%;
      padding: 8px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-family: monospace;
      margin: 8px 0;
    }
  `);

  // Load files when directory changes - inline the function to avoid dependency issues
  useEffect(() => {
    console.log('Encrypted file manager - Load files effect triggered - isReady:', fs.isReady, 'encryptionReady:', fs.encryptionReady);
    
    const loadFiles = async () => {
      if (!fs.isReady || !fs.encryptionReady || isLoading) return; // Wait for both FS and encryption to be ready
      
      // For FSA mode, don't try to load if no directory is selected
      if (fs.fsMode === 'fsa' && !fs.hasDirectoryAccess) {
        console.log('Encrypted file manager - Skipping initial load, no directory selected');
        setStatus('Please select a directory to start using encrypted file storage.');
        return;
      }
      
      try {
        setIsLoading(true);
        const entries = await fs.listDirectory(currentPath);
        setFiles(entries);
        setStatus(`Ready - Encryption enabled with ${fs.fsMode === 'opfs' ? 'OPFS' : 'File System Access API'}`);
      } catch (err) {
        console.log('Encrypted file list loading failed:', err.message);
        setFiles([]);
        // Don't show error for initial load if no directory selected
        if (!(fs.fsMode === 'fsa' && err.message.includes('No directory selected'))) {
          setStatus(`Failed to load files: ${err.message}`);
        }
      } finally {
        setIsLoading(false);
      }
    };

    // Add a small delay to prevent rapid fire calls
    const timeoutId = setTimeout(() => {
      loadFiles();
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [fs.isReady, fs.encryptionReady, currentPath, fs.hasDirectoryAccess]);

  // Update status when fs state changes
  useEffect(() => {
    if (fs.error) {
      setStatus(`Error: ${fs.error.message}`);
    } else if (!fs.isReady) {
      setStatus('File system not ready. Please wait for initialization.');
    } else if (!fs.encryptionReady) {
      setStatus('Initializing encryption...');
    } else if (fs.fsMode === 'fsa' && !fs.hasDirectoryAccess) {
      setStatus('Encryption ready! Please select a directory to start creating encrypted files.');
    } else {
      setStatus(`Ready - Encryption enabled with ${fs.fsMode === 'opfs' ? 'OPFS' : 'File System Access API'}`);
    }
  }, [fs.error, fs.isReady, fs.encryptionReady, fs.fsMode, fs.hasDirectoryAccess]);

  // Standalone loadFiles function for manual calls
  const loadFiles = async () => {
    if (!fs.isReady || !fs.encryptionReady) {
      setStatus('File system or encryption not ready. Please wait for initialization.');
      return;
    }
    
    // For FSA mode, check if we have a directory selected
    if (fs.fsMode === 'fsa' && !fs.hasDirectoryAccess) {
      setStatus('No directory selected. Please select a directory first.');
      // Try to select directory automatically
      try {
        const success = await fs.selectDirectory();
        if (success) {
          setStatus('Directory selected! Loading files...');
          // Now try to load files
          await loadFilesInternal();
        } else {
          setStatus('Directory selection cancelled. Please select a directory to continue.');
        }
      } catch (err) {
        setStatus(`Failed to select directory: ${err.message}`);
      }
      return;
    }
    
    // If we have permission or using OPFS, load files directly
    await loadFilesInternal();
  };

  const loadFilesInternal = async () => {
    try {
      setIsLoading(true);
      const entries = await fs.listDirectory(currentPath);
      setFiles(entries);
      setStatus(`Encrypted directory loaded successfully - ${entries.length} items found`);
    } catch (err) {
      setFiles([]);
      setStatus(`Failed to load encrypted files: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateEncryptedFile = async () => {
    if (!newFileName.trim()) {
      setStatus('Please enter a file name');
      return;
    }

    // Check if we have directory access for FSA mode
    if (fs.fsMode === 'fsa' && !fs.hasDirectoryAccess) {
      setStatus('Please select a directory first before creating files.');
      return;
    }

    try {
      setIsLoading(true);
      await fs.writeFile(newFileName, newFileContent || 'New encrypted file', currentPath);
      setStatus(`Encrypted file "${newFileName}" created successfully!`);
      setNewFileName('');
      setNewFileContent('');
      await loadFilesInternal();
    } catch (err) {
      setStatus(`Failed to create encrypted file: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReadEncryptedFile = async (fileName) => {
    try {
      setIsLoading(true);
      const content = await fs.readFile(fileName, currentPath);
      setSelectedFile(fileName);
      setFileContent(content);
      setEditContent(typeof content === 'string' ? content : '');
      setIsEditing(false);
      setStatus(`Encrypted file "${fileName}" decrypted and loaded successfully!`);
    } catch (err) {
      setStatus(`Failed to read encrypted file: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!selectedFile) return;
    
    try {
      setIsLoading(true);
      await fs.writeFile(selectedFile, editContent, currentPath);
      setFileContent(editContent);
      setIsEditing(false);
      setStatus(`File "${selectedFile}" saved successfully!`);
      await loadFiles(); // Refresh file list
    } catch (err) {
      setStatus(`Failed to save file: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditContent(typeof fileContent === 'string' ? fileContent : '');
    setIsEditing(false);
  };

  const handleDownloadFile = async (fileName) => {
    try {
      setIsLoading(true);
      const content = await fs.readFile(fileName, currentPath);
      
      let blob;
      let downloadFileName = fileName;
      
      if (typeof content === 'object' && content.type === 'binary') {
        // Handle binary files
        const binaryData = atob(content.data);
        const bytes = new Uint8Array(binaryData.length);
        for (let i = 0; i < binaryData.length; i++) {
          bytes[i] = binaryData.charCodeAt(i);
        }
        blob = new Blob([bytes], { type: content.mimeType });
      } else {
        // Handle text files
        const textContent = typeof content === 'string' ? content : JSON.stringify(content, null, 2);
        blob = new Blob([textContent], { type: 'text/plain' });
        // Add .txt extension if it's not already there and it's plain text
        if (!fileName.includes('.') && typeof content === 'string') {
          downloadFileName = fileName + '.txt';
        }
      }
      
      // Create download link
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = downloadFileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      setStatus(`File "${fileName}" downloaded successfully!`);
    } catch (err) {
      setStatus(`Failed to download file: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordChange = () => {
    setPassword(tempPassword);
    setShowPasswordInput(false);
    setFiles([]);
    setSelectedFile('');
    setFileContent('');
    setCurrentPath('');
    setPathHistory([]);
    setStatus('Password updated. Please reload files.');
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) {
      setStatus('Please enter a folder name');
      return;
    }

    // Check if we have directory access for FSA mode
    if (fs.fsMode === 'fsa' && !fs.hasDirectoryAccess) {
      setStatus('Please select a directory first before creating folders.');
      return;
    }

    try {
      setIsLoading(true);
      // Create an empty file to ensure the directory exists
      const markerPath = currentPath ? `${currentPath}/${newFolderName}/.folder` : `${newFolderName}/.folder`;
      await fs.writeFile('.folder', 'folder marker', currentPath ? `${currentPath}/${newFolderName}` : newFolderName);
      setStatus(`Folder "${newFolderName}" created successfully!`);
      setNewFolderName('');
      await loadFilesInternal();
    } catch (err) {
      setStatus(`Failed to create folder: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const navigateToPath = (newPath) => {
    // Add current path to history if navigating deeper
    if (newPath.startsWith(currentPath) && newPath !== currentPath) {
      setPathHistory([...pathHistory, currentPath]);
    }
    setCurrentPath(newPath);
    setSelectedFile('');
    setFileContent('');
  };

  const navigateUp = () => {
    if (pathHistory.length > 0) {
      const previousPath = pathHistory[pathHistory.length - 1];
      setPathHistory(pathHistory.slice(0, -1));
      setCurrentPath(previousPath);
    } else {
      const pathParts = currentPath.split('/').filter(Boolean);
      pathParts.pop();
      setCurrentPath(pathParts.join('/'));
    }
    setSelectedFile('');
    setFileContent('');
  };

  const navigateToBreadcrumb = (targetPath) => {
    setCurrentPath(targetPath);
    setSelectedFile('');
    setFileContent('');
    // Clear history since we're jumping to a specific path
    setPathHistory([]);
  };

  const getBreadcrumbs = () => {
    if (!currentPath) return [{ name: 'Root', path: '' }];
    
    const parts = currentPath.split('/').filter(Boolean);
    const breadcrumbs = [{ name: 'Root', path: '' }];
    
    let buildPath = '';
    parts.forEach(part => {
      buildPath = buildPath ? `${buildPath}/${part}` : part;
      breadcrumbs.push({ name: part, path: buildPath });
    });
    
    return breadcrumbs;
  };

  const handleSelectDirectory = async () => {
    try {
      setIsLoading(true);
      const success = await fs.selectDirectory();
      if (success) {
        setStatus('Directory selected for encrypted storage!');
        await loadFiles();
      } else {
        setStatus('Directory selection cancelled');
      }
    } catch (err) {
      setStatus(`Failed to select directory: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const createSampleEncryptedFiles = async () => {
    try {
      setIsLoading(true);
      
      // Create various encrypted files
      await fs.writeFile('secrets.txt', 'Top secret information that is encrypted! 🔐\n\nThis file contains sensitive data:\n- API Keys\n- Passwords\n- Personal notes', currentPath);
      await fs.writeFile('private-notes.md', '# Private Notes\n\nThese are my encrypted personal notes.\n\n## Ideas\n- Build encrypted file system\n- Protect user privacy\n- Use strong encryption\n\n## Passwords\n- GitHub: my-secret-token\n- Email: super-secure-pass', currentPath);
      await fs.writeFile('encrypted-config.json', JSON.stringify({
        apiKey: 'sk-1234567890abcdef',
        databaseUrl: 'postgresql://user:password@localhost/mydb',
        encryptionSettings: {
          algorithm: 'AES-GCM',
          keyLength: 256
        }
      }, null, 2), currentPath);
      
      setStatus('Sample encrypted files created successfully!');
      await loadFiles();
    } catch (err) {
      setStatus(`Failed to create sample encrypted files: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // File upload handlers
  const handleFileUpload = async (files) => {
    if (!files || files.length === 0) return;

    try {
      setIsLoading(true);
      setUploadResults([]);
      
      const fileArray = Array.from(files);
      const results = await fs.uploadFiles(fileArray, currentPath);
      
      setUploadResults(results);
      
      const successCount = results.filter(r => r.status === 'success').length;
      const errorCount = results.filter(r => r.status === 'error').length;
      
      if (errorCount === 0) {
        setStatus(`Successfully uploaded and encrypted ${successCount} file(s)!`);
      } else {
        setStatus(`Uploaded ${successCount} file(s), ${errorCount} failed. Check results below.`);
      }
      
      await loadFiles();
    } catch (err) {
      setStatus(`Failed to upload files: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const files = e.dataTransfer.files;
    handleFileUpload(files);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleFileInputChange = (e) => {
    const files = e.target.files;
    handleFileUpload(files);
    // Reset input so same file can be uploaded again
    e.target.value = '';
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return html`
    <div class="encrypted-file-manager">
      <div class="encryption-status ${fs.encryptionReady ? 'ready' : ''}">
        🔐 ENCRYPTED FILE SYSTEM ${fs.encryptionReady ? '(Ready)' : '(Initializing...)'}
      </div>

      <div class="password-section">
        <h4>🔑 Encryption Password</h4>
        <p><strong>Current:</strong> <span class="password-display">${password}</span></p>
        <button class="btn-encrypt" @click="${() => setShowPasswordInput(!showPasswordInput)}" style="margin: 5px 0;">
          ${showPasswordInput ? 'Cancel' : '🔑 Change Password'}
        </button>
        ${showPasswordInput ? html`
          <div>
            <input 
              type="password" 
              class="password-input"
              placeholder="Enter new password"
              .value="${tempPassword}"
              @input="${(e) => setTempPassword(e.target.value)}"
            />
            <button class="btn-encrypt" @click="${handlePasswordChange}">Update Password</button>
          </div>
        ` : ''}
        <p><strong>Storage:</strong> ${fs.fsMode === 'opfs' ? 'Origin Private File System' : 'File System Access API'}</p>
        <small><em>All files are automatically encrypted before being written to storage and decrypted when read.</em></small>
      </div>

      ${fs.fsMode === 'fsa' && !fs.hasDirectoryAccess ? html`
        <div class="file-item" style="background: #fff3cd; border: 2px solid #ffeaa7;">
          <h4>📁 Directory Selection Required</h4>
          <p>To use the encrypted file system with File System Access API, you need to select a directory first.</p>
          <button class="btn-encrypt" @click="${handleSelectDirectory}" ?disabled="${isLoading}" style="font-size: 16px; padding: 10px 20px;">
            📁 Select Directory for Encrypted Storage
          </button>
          <p style="margin-top: 10px; font-size: 12px; color: #856404;">
            <em>This will grant the app permission to read and write encrypted files in the selected directory.</em>
          </p>
        </div>
      ` : ''}

      ${fs.isReady && fs.encryptionReady ? html`
        <!-- Breadcrumb Navigation -->
        <div class="breadcrumb">
          ${getBreadcrumbs().map((crumb, index) => html`
            ${index > 0 ? html`<span class="breadcrumb-separator">></span>` : ''}
            <span class="breadcrumb-item" @click="${() => navigateToBreadcrumb(crumb.path)}">
              ${crumb.name}
            </span>
          `)}
        </div>

        <!-- Action Bar -->
        <div style="display: flex; gap: 10px; margin: 10px 0; align-items: center; flex-wrap: wrap;">
          <button class="btn-encrypt" @click="${() => loadFiles()}" ?disabled="${isLoading}">
            ${isLoading ? '🔄 Loading...' : fs.fsMode === 'fsa' && !fs.hasDirectoryAccess ? '📁 Select Directory' : '🔄 Refresh'}
          </button>
          
          <input 
            type="text" 
            placeholder="New folder name"
            .value="${newFolderName}"
            @input="${(e) => setNewFolderName(e.target.value)}"
            style="padding: 6px 10px; border: 1px solid #ddd; border-radius: 4px; font-size: 12px;"
            ?disabled="${fs.fsMode === 'fsa' && !fs.hasDirectoryAccess}"
          />
          <button class="btn-encrypt" @click="${handleCreateFolder}" ?disabled="${isLoading || !newFolderName.trim() || (fs.fsMode === 'fsa' && !fs.hasDirectoryAccess)}">
            📁 Create Folder
          </button>

          <input 
            type="text" 
            placeholder="New file name"
            .value="${newFileName}"
            @input="${(e) => setNewFileName(e.target.value)}"
            style="padding: 6px 10px; border: 1px solid #ddd; border-radius: 4px; font-size: 12px;"
            ?disabled="${fs.fsMode === 'fsa' && !fs.hasDirectoryAccess}"
          />
          <button class="btn-encrypt" @click="${handleCreateEncryptedFile}" ?disabled="${isLoading || !newFileName.trim() || (fs.fsMode === 'fsa' && !fs.hasDirectoryAccess)}">
            📄 Create File
          </button>

          <input 
            type="file" 
            multiple 
            class="upload-input" 
            id="fileUpload"
            @change="${handleFileInputChange}"
            ?disabled="${fs.fsMode === 'fsa' && !fs.hasDirectoryAccess}"
          />
          <button class="btn-download" @click="${(e) => {
            const input = e.target.parentElement.querySelector('#fileUpload');
            if (input) input.click();
          }}" ?disabled="${isLoading || (fs.fsMode === 'fsa' && !fs.hasDirectoryAccess)}">
            📤 Upload Files
          </button>
        </div>

        <!-- Column View File Browser -->
        <div class="column-view">
          <!-- File List Column -->
          <div class="column">
            <div class="column-header">
              📁 Files & Folders
              ${currentPath ? html`
                <button class="btn-secondary" @click="${navigateUp}" style="padding: 2px 6px; font-size: 10px;">
                  ⬆️ Up
                </button>
              ` : ''}
            </div>
            <div class="column-content">
              ${fs.fsMode === 'fsa' && !fs.hasDirectoryAccess ? html`
                <div style="padding: 40px 20px; text-align: center; color: #666;">
                  <div style="font-size: 48px; margin-bottom: 20px;">📁</div>
                  <p>No directory selected</p>
                  <p style="font-size: 12px; margin-top: 10px;">Click the "Select Directory" button above to get started</p>
                </div>
              ` : html`
              ${isLoading ? html`
                <div style="padding: 20px; text-align: center; color: #666;">
                  Loading...
                </div>
              ` : ''}
              
              ${files.map(file => html`
                <div 
                  class="column-item ${file.kind} ${selectedFile === file.name ? 'selected' : ''}"
                  @click="${() => {
                    if (file.kind === 'directory') {
                      navigateToPath(currentPath ? `${currentPath}/${file.name}` : file.name);
                    } else {
                      handleReadEncryptedFile(file.name);
                    }
                  }}"
                >
                  <span class="item-icon">${file.kind === 'directory' ? '📁' : '🔐'}</span>
                  <span class="item-name">${file.name}</span>
                  ${file.kind === 'file' ? html`
                    <button 
                      class="btn-download" 
                      @click="${(e) => {
                        e.stopPropagation();
                        handleDownloadFile(file.name);
                      }}" 
                      ?disabled="${isLoading}"
                      style="padding: 2px 6px; font-size: 10px;"
                    >
                      💾
                    </button>
                  ` : ''}
                </div>
              `)}

              ${!isLoading && files.length === 0 ? html`
                <div style="padding: 20px; text-align: center; color: #666; font-style: italic;">
                  No files or folders found
                </div>
              ` : ''}
              `}
            </div>
          </div>

          <!-- Content Preview Column -->
          ${selectedFile ? html`
            <div class="column">
              <div class="column-header">
                🔓 ${selectedFile}
                <div style="display: flex; gap: 4px;">
                  ${typeof fileContent === 'string' && !isEditing ? html`
                    <button class="btn-edit" @click="${() => setIsEditing(true)}" ?disabled="${isLoading}" style="padding: 2px 6px; font-size: 10px;">
                      ✏️
                    </button>
                  ` : ''}
                  <button class="btn-download" @click="${() => handleDownloadFile(selectedFile)}" ?disabled="${isLoading}" style="padding: 2px 6px; font-size: 10px;">
                    💾
                  </button>
                </div>
              </div>
              <div class="column-content">
                ${typeof fileContent === 'object' && fileContent.type === 'binary' ? html`
                  <div style="padding: 15px;">
                    <p><strong>Binary File:</strong> ${fileContent.mimeType}</p>
                    <p><strong>Size:</strong> ${formatFileSize(fileContent.size)}</p>
                    ${fileContent.mimeType.startsWith('image/') ? html`
                      <div style="margin-top: 15px;">
                        <img 
                          src="data:${fileContent.mimeType};base64,${fileContent.data}" 
                          style="max-width: 100%; max-height: 300px; border-radius: 4px;"
                          alt="Uploaded image"
                        />
                      </div>
                    ` : html`
                      <p><em>${fileContent.preview}</em></p>
                    `}
                  </div>
                ` : isEditing ? html`
                  <div style="padding: 10px; height: 100%; display: flex; flex-direction: column;">
                    <textarea 
                      class="edit-textarea"
                      .value="${editContent}"
                      @input="${(e) => setEditContent(e.target.value)}"
                      placeholder="Edit file content..."
                      style="flex: 1; min-height: 200px;"
                    ></textarea>
                    <div class="edit-actions">
                      <button class="btn-cancel" @click="${handleCancelEdit}" ?disabled="${isLoading}">
                        Cancel
                      </button>
                      <button class="btn-save" @click="${handleSaveEdit}" ?disabled="${isLoading}">
                        💾 Save
                      </button>
                    </div>
                  </div>
                ` : html`
                  <div style="padding: 15px;">
                    <pre style="white-space: pre-wrap; font-family: 'Courier New', monospace; font-size: 12px; margin: 0; overflow-wrap: break-word;">${fileContent}</pre>
                  </div>
                `}
              </div>
            </div>
          ` : ''}
        </div>

        <!-- Status and Upload Results -->
        <div style="margin-top: 15px;">
          <div style="padding: 10px; background: #f8f9fa; border-radius: 4px; font-size: 12px;">
            <strong>Status:</strong> ${status}
          </div>
          
          ${uploadResults.length > 0 ? html`
            <div style="margin-top: 10px;">
              <h5>Recent Upload Results:</h5>
              ${uploadResults.map(result => html`
                <div class="upload-result ${result.status}" style="font-size: 12px;">
                  <span>
                    ${result.status === 'success' ? '✅' : '❌'} ${result.fileName}
                    ${result.status === 'success' ? html`<span class="encrypted-badge">ENCRYPTED</span>` : ''}
                  </span>
                  <span class="file-info">
                    ${result.status === 'success' 
                      ? `${formatFileSize(result.size)} • ${result.type || 'Unknown type'}`
                      : result.error
                    }
                  </span>
                </div>
              `)}
            </div>
          ` : ''}
        </div>
      ` : ''}
    </div>
  `;
};

// Define components
define({ tag: 'file-manager-demo', component: FileManagerDemo });
define({ tag: 'simple-usefs-example', component: SimpleUSeFSExample });
define({ tag: 'opfs-example', component: OPFSExample });
define({ tag: 'encrypted-file-manager-demo', component: EncryptedFileManagerDemo });

export default {
  title: "Hooks/useFS",
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: `
# 🗂️ useFS Hook - File System Access

The \`useFS\` hook provides a unified interface for file system operations, supporting both the File System Access API and Origin Private File System (OPFS) as a fallback.

## 🚀 Features

- **File System Access API Support** - Access real directories on the user's device
- **OPFS Fallback** - Automatic fallback to Origin Private File System when FSA is unavailable
- **File Encryption** - Optional AES-GCM encryption for all file content  
- **Password Management** - Customizable encryption passwords with visual UI
- **Folder Creation** - Create and navigate nested folder structures
- **Column View Navigation** - macOS Finder-style column browsing
- **Binary File Support** - Handles both text and binary files (images, documents, etc.)
- **File Editing** - In-browser text file editing with save functionality
- **File Downloads** - Download any file type (text/binary) unencrypted to device
- **Smart Directory Selection** - Automatic prompts when directory access needed
- **Persistent State** - Remembers user preferences and permissions using useStore
- **Error Handling** - Graceful error handling with user-friendly messages and retry functionality
- **Mode Switching** - Ability to switch between FSA and OPFS modes

## 📝 Basic Usage

\`\`\`javascript
import { useFS } from '../hooks/useFS';

const MyComponent = (props, { useFS, html }) => {
  const { 
    listDirectory,
    removeFile,
    removeDirectory,
    selectDirectory, 
    readFile, 
    writeFile, 
    directoryPath,
    isReady,
    hasPermission 
  } = useFS({ opfs: false });

  const handleSelectDirectory = async () => {
    const selected = await selectDirectory();
    if (selected) {
      console.log('Directory selected:', directoryPath);
    }
  };

  const handleCreateFile = async () => {
    await writeFile('example.txt', 'Hello World!');
    console.log('File created successfully');
  };

  return html\`
    <div>
      <button @click="\${handleSelectDirectory}">
        \${hasPermission ? 'Change Directory' : 'Select Directory'}
      </button>
      
      \${isReady ? html\`
        <button @click="\${handleCreateFile}">Create File</button>
        <p>Current directory: \${directoryPath}</p>
      \` : html\`
        <p>Please select a directory first</p>
      \`}
    </div>
  \`;
};
\`\`\`

## 🔧 Configuration

### Force OPFS Mode

\`\`\`javascript
const fs = useFS({ opfs: true }); // Forces OPFS usage
\`\`\`

### Enable Encryption

\`\`\`javascript
// Basic encryption with default password
const fs = useFS({ encrypt: true });

// Encryption with custom password
const fs = useFS({ 
  encrypt: true, 
  encryptionPassword: 'my-secure-password-123' 
});

// Encrypted OPFS storage
const fs = useFS({ 
  opfs: true, 
  encrypt: true, 
  encryptionPassword: 'vault-password' 
});
\`\`\`

### File Upload Examples

\`\`\`javascript
// Single file upload (supports text and binary files)
const handleFileUpload = async (event) => {
  const file = event.target.files[0];
  if (file) {
    const result = await fs.uploadFile(file);
    console.log('Uploaded:', result);
  }
};

// Multiple file upload with drag & drop
const handleDrop = async (event) => {
  event.preventDefault();
  const files = Array.from(event.dataTransfer.files);
  const results = await fs.uploadFiles(files);
  
  results.forEach(result => {
    if (result.status === 'success') {
      console.log('✅ Uploaded:', result.fileName);
    } else {
      console.error('❌ Failed:', result.fileName, result.error);
    }
  });
};

// Upload with custom filename
await fs.uploadFile(file, 'my-secret-document.txt');

// Reading binary files returns metadata object
const content = await fs.readFile('image.jpg');
if (content.type === 'binary') {
  console.log('Binary file:', content.mimeType, 'Size:', content.size);
  // For images, you can create data URLs: 
  // data:\${content.mimeType};base64,\${content.data}
}
\`\`\`

### API Reference

| Method | Description |
|--------|-------------|
| \`selectDirectory()\` | Opens directory picker (FSA only) |
| \`requestPermission()\` | Checks/requests file system permission |
| \`listDirectory(path?)\` | Lists files and directories |
| \`readFile(fileName, path?)\` | Reads file content as text or binary metadata (auto-decrypts if encrypted) |
| \`writeFile(fileName, content, path?)\` | Writes content to file (auto-encrypts if enabled) |
| \`uploadFile(file, targetFileName?, path?)\` | Uploads a File object (text/binary) and encrypts it |
| \`uploadFiles(files, path?)\` | Uploads multiple File objects with batch processing |
| \`removeFile(fileName, path?)\` | Removes a file |
| \`removeDirectory(dirName, path?)\` | Removes a directory (recursive) |

### State Properties

| Property | Type | Description |
|----------|------|-------------|
| \`directoryPath\` | string | Current directory path/name |
| \`isReady\` | boolean | Whether the hook is ready for operations |
| \`fsMode\` | 'fsa' \\| 'opfs' | Current file system mode |
| \`hasPermission\` | boolean | Whether permission is granted |
| \`error\` | Error \\| null | Current error state |
| \`encryptionEnabled\` | boolean | Whether encryption is enabled |
| \`encryptionReady\` | boolean \\| null | Whether encryption is ready (null if disabled) |

## 🎯 Use Cases

- **Text Editor** - Save, edit, and download documents from user's filesystem
- **Data Import/Export** - Read, edit, and download CSV, JSON files from your computer
- **Project Management** - Work with project files and folders with inline editing
- **Note Taking** - Persistent notes with file system storage and in-browser editing
- **Development Tools** - Code editors, file managers with download capabilities
- **Media Management** - Photo galleries, document organizers with image previews and downloads
- **Secure Storage** - Encrypted storage for sensitive documents with download access
- **Password Manager** - Encrypted credential storage with secure download options
- **Private Journals** - Encrypted personal notes and diaries with editing capabilities

## 🔒 Security & Privacy

- **File System Access API** requires explicit user permission
- **OPFS** provides isolated storage that's private to your origin
- **AES-GCM Encryption** - Industry-standard encryption for file content
- **Password-based Security** - Custom passwords for different encryption contexts
- All operations are sandboxed and secure
- User has full control over directory access
- **Automatic Encryption/Decryption** - Transparent file protection
        `
      }
    }
  },
  tags: ["autodocs"],
};

export const FullDemo = {
  render: () => React.createElement('file-manager-demo'),
  name: "📁 Full File Manager Demo",
  parameters: {
    docs: {
      description: {
        story: "Complete file manager demonstrating all useFS features including directory selection, file operations, and mode switching."
      }
    }
  }
};

export const SimpleExample = {
  render: () => React.createElement('simple-usefs-example'),
  name: "⚡ Simple Example",
  parameters: {
    docs: {
      description: {
        story: "Basic example showing the essential useFS operations in a simple workflow."
      }
    }
  }
};

export const OPFSOnly = {
  render: () => React.createElement('opfs-example'),
  name: "🔒 OPFS Only",
  parameters: {
    docs: {
      description: {
        story: "Example using only Origin Private File System, demonstrating the fallback mode."
      }
    }
  }
};

export const ForcedOPFS = {
  render: () => React.createElement('file-manager-demo', { opfs: true }),
  name: "🔒 Forced OPFS Mode",
  parameters: {
    docs: {
      description: {
        story: "File manager demo with OPFS mode forced, showing how the hook behaves when File System Access API is disabled."
      }
    }
  }
};

export const EncryptedDemo = {
  render: () => React.createElement('encrypted-file-manager-demo'),
  name: "🔐 Encrypted File System",
  parameters: {
    docs: {
      description: {
        story: "Advanced encrypted file manager with password management, folder creation, and column-view navigation. Features include customizable encryption passwords, nested folder structures, and macOS Finder-style browsing. All files are automatically encrypted before storage and decrypted when read."
      }
    }
  }
};

export const EncryptedOPFS = {
  render: () => React.createElement('encrypted-file-manager-demo', { opfs: true }),
  name: "🔐 Encrypted OPFS",
  parameters: {
    docs: {
      description: {
        story: "Encrypted file system using OPFS exclusively with password management and folder navigation. Shows how encryption works with Origin Private File System storage without requiring directory permissions. Includes all advanced features like column view and folder creation."
      }
    }
  }
};