"use strict";(self.webpackChunkdim=self.webpackChunkdim||[]).push([[774],{"./src/stories/05-Hooks-useFS.stories.js":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{__webpack_require__.r(__webpack_exports__),__webpack_require__.d(__webpack_exports__,{EncryptedDemo:()=>EncryptedDemo,EncryptedOPFS:()=>EncryptedOPFS,ForcedOPFS:()=>ForcedOPFS,FullDemo:()=>FullDemo,OPFSOnly:()=>OPFSOnly,SimpleExample:()=>SimpleExample,__namedExportsOrder:()=>__namedExportsOrder,default:()=>__WEBPACK_DEFAULT_EXPORT__});var react__WEBPACK_IMPORTED_MODULE_0__=__webpack_require__("./node_modules/react/index.js"),_core_dim_ts__WEBPACK_IMPORTED_MODULE_1__=__webpack_require__("./src/core/dim.ts");(0,_core_dim_ts__WEBPACK_IMPORTED_MODULE_1__.E8)({tag:"file-manager-demo",component:(props,{useState,useEffect,useStyle,useFS,useMemo,html,css,unsafeCSS})=>{const{opfs=!1}=props,fs=useFS({opfs}),[files,setFiles]=useState([]),[currentPath,setCurrentPath]=useState(""),[newFileName,setNewFileName]=useState(""),[newFileContent,setNewFileContent]=useState("Hello World!"),[selectedFile,setSelectedFile]=useState(""),[fileContent,setFileContent]=useState(""),[isLoading,setIsLoading]=useState(!1),[status,setStatus]=useState(""),[isEditing,setIsEditing]=useState(!1),[editContent,setEditContent]=useState("");useStyle(css`
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
  `),useEffect((()=>{const timeoutId=setTimeout((()=>{(async()=>{if(fs.isReady&&!isLoading)try{setIsLoading(!0);const entries=await fs.listDirectory(currentPath);setFiles(entries),setStatus("Ready - Using "+("opfs"===fs.fsMode?"Origin Private File System":"File System Access API"))}catch(err){console.log("File list loading failed, this is expected initially:",err.message),setFiles([])}finally{setIsLoading(!1)}})()}),100);return()=>clearTimeout(timeoutId)}),[fs.isReady,currentPath]);const loadFiles=async()=>{if(fs.isReady)try{setIsLoading(!0);const entries=await fs.listDirectory(currentPath);setFiles(entries),setStatus(`Directory loaded successfully - ${entries.length} items found`)}catch(err){setFiles([]),setStatus(`Failed to load files: ${err.message}${"fsa"!==fs.fsMode||fs.hasPermission?"":" (Try selecting a directory first)"}`)}finally{setIsLoading(!1)}else setStatus("File system not ready. Please select a directory or wait for initialization.")};useEffect((()=>{fs.error?setStatus(`Error: ${fs.error.message}`):fs.isReady?setStatus("Ready - Using "+("opfs"===fs.fsMode?"Origin Private File System":"File System Access API")):setStatus("File system not ready. Please select a directory or wait for OPFS initialization.")}),[fs.error,fs.isReady,fs.fsMode]);const handleReadFile=async fileName=>{try{setIsLoading(!0);const content=await fs.readFile(fileName,currentPath);setSelectedFile(fileName),setFileContent(content),setEditContent("string"==typeof content?content:""),setIsEditing(!1),setStatus(`File "${fileName}" loaded successfully!`)}catch(err){setStatus(`Failed to read file: ${err.message}`)}finally{setIsLoading(!1)}},handleDownloadFile=async fileName=>{try{setIsLoading(!0);const content=await fs.readFile(fileName,currentPath);let blob,downloadFileName=fileName;if("object"==typeof content&&"binary"===content.type){const binaryData=atob(content.data),bytes=new Uint8Array(binaryData.length);for(let i=0;i<binaryData.length;i++)bytes[i]=binaryData.charCodeAt(i);blob=new Blob([bytes],{type:content.mimeType})}else{const textContent="string"==typeof content?content:JSON.stringify(content,null,2);blob=new Blob([textContent],{type:"text/plain"}),fileName.includes(".")||"string"!=typeof content||(downloadFileName=fileName+".txt")}const url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url,a.download=downloadFileName,document.body.appendChild(a),a.click(),document.body.removeChild(a),URL.revokeObjectURL(url),setStatus(`File "${fileName}" downloaded successfully!`)}catch(err){setStatus(`Failed to download file: ${err.message}`)}finally{setIsLoading(!1)}},navigateToDirectory=async dirName=>{setCurrentPath(currentPath?`${currentPath}/${dirName}`:dirName)};return html`
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

      <div class="fs-mode" style="background: ${"opfs"===fs.fsMode?"#e3f2fd":"#f3e5f5"}; color: ${"opfs"===fs.fsMode?"#1976d2":"#7b1fa2"};">
        ${"opfs"===fs.fsMode?"🔒 Origin Private File System (OPFS)":"📁 File System Access API"}
      </div>

      <div class="status ${fs.error?"error":fs.isReady?"success":"info"}">
        ${status}
      </div>

      ${opfs?"":html`
        <div class="mode-switcher">
          <button 
            class="btn-secondary"
            @click="${()=>fs.switchToOPFS()}"
            ?disabled="${isLoading}"
          >
            Switch to OPFS
          </button>
          <button 
            class="btn-secondary"
            @click="${()=>fs.switchToFSA()}"
            ?disabled="${isLoading||!window.showDirectoryPicker}"
          >
            Switch to File System Access
          </button>
        </div>
      `}

      <div class="controls">
        ${"fsa"===fs.fsMode?html`
          <div class="control-group">
            <h4>📁 Directory Selection</h4>
            <div class="button-group">
              <button 
                class="btn-primary"
                @click="${async()=>{try{setIsLoading(!0);await fs.selectDirectory()?(setStatus("Directory selected successfully!"),await loadFiles()):setStatus("Directory selection cancelled")}catch(err){setStatus(`Failed to select directory: ${err.message}`)}finally{setIsLoading(!1)}}}"
                ?disabled="${isLoading}"
              >
                ${fs.hasPermission?"Change Directory":"Select Directory"}
              </button>
            </div>
            <div class="path-display">
              Current: ${fs.directoryPath}
            </div>
          </div>
        `:html`
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

        ${fs.isReady?html`
          <div class="control-group">
            <h4>📄 File Operations</h4>
            <div class="button-group">
              <input 
                type="text" 
                placeholder="Enter file name (e.g., example.txt)"
                .value="${newFileName}"
                @input="${e=>setNewFileName(e.target.value)}"
              />
              <textarea 
                placeholder="File content..."
                .value="${newFileContent}"
                @input="${e=>setNewFileContent(e.target.value)}"
              ></textarea>
              <button 
                class="btn-success"
                @click="${async()=>{if(newFileName.trim())try{setIsLoading(!0),await fs.writeFile(newFileName,newFileContent,currentPath),setStatus(`File "${newFileName}" created successfully!`),setNewFileName(""),await loadFiles()}catch(err){setStatus(`Failed to create file: ${err.message}`)}finally{setIsLoading(!1)}else setStatus("Please enter a file name")}}"
                ?disabled="${isLoading||!newFileName.trim()}"
              >
                Create File
              </button>
            </div>
          </div>
        `:""}
      </div>

      ${fs.isReady?html`
        <div class="file-list">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
            <h4>📋 Directory Contents</h4>
            <button 
              class="btn-primary" 
              @click="${()=>loadFiles()}" 
              ?disabled="${isLoading}"
              style="padding: 6px 12px; font-size: 12px;"
            >
              ${isLoading?"🔄 Loading...":"🔄 Refresh"}
            </button>
          </div>
          
          ${currentPath?html`
            <div class="file-item">
              <div class="file-info">
                <span class="file-icon">⬆️</span>
                <span class="file-name" @click="${()=>{const pathParts=currentPath.split("/").filter(Boolean);pathParts.pop(),setCurrentPath(pathParts.join("/"))}}">..</span>
              </div>
            </div>
          `:""}

          ${isLoading?html`
            <div class="loading">Loading files...</div>
          `:""}

          ${files.map((file=>html`
            <div class="file-item">
              <div class="file-info">
                <span class="file-icon">${"directory"===file.kind?"📁":"📄"}</span>
                <span 
                  class="file-name" 
                  @click="${"directory"===file.kind?()=>navigateToDirectory(file.name):()=>handleReadFile(file.name)}"
                >
                  ${file.name}
                </span>
              </div>
              <div class="file-actions">
                ${"file"===file.kind?html`
                  <button 
                    class="btn-primary"
                    @click="${()=>handleReadFile(file.name)}"
                    ?disabled="${isLoading}"
                  >
                    Read
                  </button>
                  <button 
                    class="btn-secondary"
                    @click="${()=>handleDownloadFile(file.name)}"
                    ?disabled="${isLoading}"
                    style="font-size: 12px; padding: 4px 8px;"
                  >
                    💾 Download
                  </button>
                  <button 
                    class="btn-danger"
                    @click="${()=>(async fileName=>{if(confirm(`Are you sure you want to delete "${fileName}"?`))try{setIsLoading(!0),await fs.removeFile(fileName,currentPath),setStatus(`File "${fileName}" deleted successfully!`),await loadFiles(),selectedFile===fileName&&(setSelectedFile(""),setFileContent(""))}catch(err){setStatus(`Failed to delete file: ${err.message}`)}finally{setIsLoading(!1)}})(file.name)}"
                    ?disabled="${isLoading}"
                  >
                    Delete
                  </button>
                `:html`
                  <button 
                    class="btn-primary"
                    @click="${()=>navigateToDirectory(file.name)}"
                    ?disabled="${isLoading}"
                  >
                    Open
                  </button>
                `}
              </div>
            </div>
          `))}

          ${isLoading||0!==files.length?"":html`
            <div class="file-item">
              <div class="file-info">
                <span style="color: #666; font-style: italic;">No files found. Create a file to get started!</span>
              </div>
            </div>
          `}
        </div>

        ${selectedFile?html`
          <div class="control-group">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
              <h4>📖 File Content: ${selectedFile}</h4>
              <div class="file-actions-row">
                ${"string"!=typeof fileContent||isEditing?"":html`
                  <button class="btn-edit" @click="${()=>setIsEditing(!0)}" ?disabled="${isLoading}">
                    ✏️ Edit
                  </button>
                `}
                <button class="btn-download" @click="${()=>handleDownloadFile(selectedFile)}" ?disabled="${isLoading}">
                  💾 Download
                </button>
              </div>
            </div>
            
            ${"object"==typeof fileContent&&"binary"===fileContent.type?html`
              <div class="content-preview">
                <p><strong>Binary File:</strong> ${fileContent.mimeType}</p>
                <p><strong>Size:</strong> ${(bytes=>{if(0===bytes)return"0 Bytes";const i=Math.floor(Math.log(bytes)/Math.log(1024));return parseFloat((bytes/Math.pow(1024,i)).toFixed(2))+" "+["Bytes","KB","MB","GB"][i]})(fileContent.size)}</p>
                <p><em>${fileContent.preview}</em></p>
                ${fileContent.mimeType.startsWith("image/")?html`
                  <div style="margin-top: 10px;">
                    <img 
                      src="data:${fileContent.mimeType};base64,${fileContent.data}" 
                      style="max-width: 300px; max-height: 200px; border-radius: 4px;"
                      alt="Uploaded image"
                    />
                  </div>
                `:""}
              </div>
            `:isEditing?html`
              <div>
                <textarea 
                  class="edit-textarea"
                  .value="${editContent}"
                  @input="${e=>setEditContent(e.target.value)}"
                  placeholder="Edit file content..."
                ></textarea>
                <div class="edit-actions">
                  <button class="btn-cancel" @click="${()=>{setEditContent("string"==typeof fileContent?fileContent:""),setIsEditing(!1)}}" ?disabled="${isLoading}">
                    Cancel
                  </button>
                  <button class="btn-save" @click="${async()=>{if(selectedFile)try{setIsLoading(!0),await fs.writeFile(selectedFile,editContent,currentPath),setFileContent(editContent),setIsEditing(!1),setStatus(`File "${selectedFile}" saved successfully!`),await loadFiles()}catch(err){setStatus(`Failed to save file: ${err.message}`)}finally{setIsLoading(!1)}}}" ?disabled="${isLoading}">
                    💾 Save Changes
                  </button>
                </div>
              </div>
            `:html`
              <textarea 
                readonly
                .value="${fileContent}"
                style="min-height: 150px; width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; font-family: 'Courier New', monospace;"
              ></textarea>
            `}
          </div>
        `:""}
      `:""}
    </div>
  `}}),(0,_core_dim_ts__WEBPACK_IMPORTED_MODULE_1__.E8)({tag:"simple-usefs-example",component:(props,{useFS,useState,useStyle,html,css})=>{const fs=useFS(),[result,setResult]=useState("");useStyle(css`
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
  `);return html`
    <div class="simple-example">
      <h3>Simple useFS Example</h3>
      <p>This example demonstrates basic file operations using the useFS hook.</p>
      
      <button class="example-button" @click="${async()=>{try{setResult("Running example...\n");const hasPermission=await fs.requestPermission();if(setResult((prev=>prev+`Permission status: ${hasPermission}\n`)),!hasPermission&&"fsa"===fs.fsMode){if(!await fs.selectDirectory())return void setResult((prev=>prev+"No directory selected\n"))}setResult((prev=>prev+`Directory: ${fs.directoryPath}\n`)),await fs.writeFile("example.txt","Hello from useFS!"),setResult((prev=>prev+"Created example.txt\n"));const content=await fs.readFile("example.txt");setResult((prev=>prev+`File content: "${content}"\n`));const files=await fs.listDirectory();setResult((prev=>prev+`Files found: ${files.map((f=>f.name)).join(", ")}\n`))}catch(err){setResult((prev=>prev+`Error: ${err.message}\n`))}}}">
        Run Example
      </button>

      <div class="result">${result}</div>
    </div>
  `}}),(0,_core_dim_ts__WEBPACK_IMPORTED_MODULE_1__.E8)({tag:"opfs-example",component:(props,{useFS,useState,useStyle,html,css})=>{const fs=useFS({opfs:!0}),[files,setFiles]=useState([]);useStyle(css`
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
  `);return html`
    <div class="opfs-example">
      <h3>🔒 OPFS Example</h3>
      <p>This example uses Origin Private File System exclusively. Files are private to this origin and persist across sessions.</p>
      
      <button class="opfs-button" @click="${async()=>{try{await fs.writeFile("notes.txt","These are my private notes"),await fs.writeFile("config.json",JSON.stringify({theme:"dark",version:"1.0"},null,2)),await fs.writeFile("data.csv","name,value\nTest,123\nSample,456");const fileList=await fs.listDirectory();setFiles(fileList)}catch(err){console.error("Failed to create sample files:",err)}}}">
        Create Sample Files
      </button>

      <div class="file-list">
        <h4>Files in OPFS:</h4>
        ${files.map((file=>html`
          <div>📄 ${file.name}</div>
        `))}
      </div>
    </div>
  `}}),(0,_core_dim_ts__WEBPACK_IMPORTED_MODULE_1__.E8)({tag:"encrypted-file-manager-demo",component:(props,{useState,useEffect,useStyle,useFS,useMemo,html,css,unsafeCSS})=>{const{opfs=!1}=props,[password,setPassword]=useState("demo-password-123"),[tempPassword,setTempPassword]=useState("demo-password-123"),[showPasswordInput,setShowPasswordInput]=useState(!1),fs=useFS({opfs,encrypt:!0,encryptionPassword:password}),[files,setFiles]=useState([]),[currentPath,setCurrentPath]=useState(""),[newFileName,setNewFileName]=useState("secret.txt"),[newFileContent,setNewFileContent]=useState("This is encrypted content! 🔐"),[selectedFile,setSelectedFile]=useState(""),[fileContent,setFileContent]=useState(""),[isLoading,setIsLoading]=useState(!1),[status,setStatus]=useState(""),[uploadResults,setUploadResults]=useState([]),[isEditing,setIsEditing]=useState(!1),[editContent,setEditContent]=useState(""),[newFolderName,setNewFolderName]=useState(""),[pathHistory,setPathHistory]=useState([]);useStyle(css`
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
  `),useEffect((()=>{console.log("Encrypted file manager - Load files effect triggered - isReady:",fs.isReady,"encryptionReady:",fs.encryptionReady);const timeoutId=setTimeout((()=>{(async()=>{if(fs.isReady&&fs.encryptionReady&&!isLoading){if("fsa"===fs.fsMode&&!fs.hasDirectoryAccess)return console.log("Encrypted file manager - Skipping initial load, no directory selected"),void setStatus("Please select a directory to start using encrypted file storage.");try{setIsLoading(!0);const entries=await fs.listDirectory(currentPath);setFiles(entries),setStatus("Ready - Encryption enabled with "+("opfs"===fs.fsMode?"OPFS":"File System Access API"))}catch(err){console.log("Encrypted file list loading failed:",err.message),setFiles([]),"fsa"===fs.fsMode&&err.message.includes("No directory selected")||setStatus(`Failed to load files: ${err.message}`)}finally{setIsLoading(!1)}}})()}),100);return()=>clearTimeout(timeoutId)}),[fs.isReady,fs.encryptionReady,currentPath,fs.hasDirectoryAccess]),useEffect((()=>{fs.error?setStatus(`Error: ${fs.error.message}`):fs.isReady?fs.encryptionReady?"fsa"!==fs.fsMode||fs.hasDirectoryAccess?setStatus("Ready - Encryption enabled with "+("opfs"===fs.fsMode?"OPFS":"File System Access API")):setStatus("Encryption ready! Please select a directory to start creating encrypted files."):setStatus("Initializing encryption..."):setStatus("File system not ready. Please wait for initialization.")}),[fs.error,fs.isReady,fs.encryptionReady,fs.fsMode,fs.hasDirectoryAccess]);const loadFiles=async()=>{if(fs.isReady&&fs.encryptionReady)if("fsa"!==fs.fsMode||fs.hasDirectoryAccess)await loadFilesInternal();else{setStatus("No directory selected. Please select a directory first.");try{await fs.selectDirectory()?(setStatus("Directory selected! Loading files..."),await loadFilesInternal()):setStatus("Directory selection cancelled. Please select a directory to continue.")}catch(err){setStatus(`Failed to select directory: ${err.message}`)}}else setStatus("File system or encryption not ready. Please wait for initialization.")},loadFilesInternal=async()=>{try{setIsLoading(!0);const entries=await fs.listDirectory(currentPath);setFiles(entries),setStatus(`Encrypted directory loaded successfully - ${entries.length} items found`)}catch(err){setFiles([]),setStatus(`Failed to load encrypted files: ${err.message}`)}finally{setIsLoading(!1)}},handleDownloadFile=async fileName=>{try{setIsLoading(!0);const content=await fs.readFile(fileName,currentPath);let blob,downloadFileName=fileName;if("object"==typeof content&&"binary"===content.type){const binaryData=atob(content.data),bytes=new Uint8Array(binaryData.length);for(let i=0;i<binaryData.length;i++)bytes[i]=binaryData.charCodeAt(i);blob=new Blob([bytes],{type:content.mimeType})}else{const textContent="string"==typeof content?content:JSON.stringify(content,null,2);blob=new Blob([textContent],{type:"text/plain"}),fileName.includes(".")||"string"!=typeof content||(downloadFileName=fileName+".txt")}const url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url,a.download=downloadFileName,document.body.appendChild(a),a.click(),document.body.removeChild(a),URL.revokeObjectURL(url),setStatus(`File "${fileName}" downloaded successfully!`)}catch(err){setStatus(`Failed to download file: ${err.message}`)}finally{setIsLoading(!1)}},handleFileUpload=async files=>{if(files&&0!==files.length)try{setIsLoading(!0),setUploadResults([]);const fileArray=Array.from(files),results=await fs.uploadFiles(fileArray,currentPath);setUploadResults(results);const successCount=results.filter((r=>"success"===r.status)).length,errorCount=results.filter((r=>"error"===r.status)).length;setStatus(0===errorCount?`Successfully uploaded and encrypted ${successCount} file(s)!`:`Uploaded ${successCount} file(s), ${errorCount} failed. Check results below.`),await loadFiles()}catch(err){setStatus(`Failed to upload files: ${err.message}`)}finally{setIsLoading(!1)}},formatFileSize=bytes=>{if(0===bytes)return"0 Bytes";const i=Math.floor(Math.log(bytes)/Math.log(1024));return parseFloat((bytes/Math.pow(1024,i)).toFixed(2))+" "+["Bytes","KB","MB","GB"][i]};return html`
    <div class="encrypted-file-manager">
      <div class="encryption-status ${fs.encryptionReady?"ready":""}">
        🔐 ENCRYPTED FILE SYSTEM ${fs.encryptionReady?"(Ready)":"(Initializing...)"}
      </div>

      <div class="password-section">
        <h4>🔑 Encryption Password</h4>
        <p><strong>Current:</strong> <span class="password-display">${password}</span></p>
        <button class="btn-encrypt" @click="${()=>setShowPasswordInput(!showPasswordInput)}" style="margin: 5px 0;">
          ${showPasswordInput?"Cancel":"🔑 Change Password"}
        </button>
        ${showPasswordInput?html`
          <div>
            <input 
              type="password" 
              class="password-input"
              placeholder="Enter new password"
              .value="${tempPassword}"
              @input="${e=>setTempPassword(e.target.value)}"
            />
            <button class="btn-encrypt" @click="${()=>{setPassword(tempPassword),setShowPasswordInput(!1),setFiles([]),setSelectedFile(""),setFileContent(""),setCurrentPath(""),setPathHistory([]),setStatus("Password updated. Please reload files.")}}">Update Password</button>
          </div>
        `:""}
        <p><strong>Storage:</strong> ${"opfs"===fs.fsMode?"Origin Private File System":"File System Access API"}</p>
        <small><em>All files are automatically encrypted before being written to storage and decrypted when read.</em></small>
      </div>

      ${"fsa"!==fs.fsMode||fs.hasDirectoryAccess?"":html`
        <div class="file-item" style="background: #fff3cd; border: 2px solid #ffeaa7;">
          <h4>📁 Directory Selection Required</h4>
          <p>To use the encrypted file system with File System Access API, you need to select a directory first.</p>
          <button class="btn-encrypt" @click="${async()=>{try{setIsLoading(!0);await fs.selectDirectory()?(setStatus("Directory selected for encrypted storage!"),await loadFiles()):setStatus("Directory selection cancelled")}catch(err){setStatus(`Failed to select directory: ${err.message}`)}finally{setIsLoading(!1)}}}" ?disabled="${isLoading}" style="font-size: 16px; padding: 10px 20px;">
            📁 Select Directory for Encrypted Storage
          </button>
          <p style="margin-top: 10px; font-size: 12px; color: #856404;">
            <em>This will grant the app permission to read and write encrypted files in the selected directory.</em>
          </p>
        </div>
      `}

      ${fs.isReady&&fs.encryptionReady?html`
        <!-- Breadcrumb Navigation -->
        <div class="breadcrumb">
          ${(()=>{if(!currentPath)return[{name:"Root",path:""}];const parts=currentPath.split("/").filter(Boolean),breadcrumbs=[{name:"Root",path:""}];let buildPath="";return parts.forEach((part=>{buildPath=buildPath?`${buildPath}/${part}`:part,breadcrumbs.push({name:part,path:buildPath})})),breadcrumbs})().map(((crumb,index)=>html`
            ${index>0?html`<span class="breadcrumb-separator">></span>`:""}
            <span class="breadcrumb-item" @click="${()=>{return targetPath=crumb.path,setCurrentPath(targetPath),setSelectedFile(""),setFileContent(""),void setPathHistory([]);var targetPath}}">
              ${crumb.name}
            </span>
          `))}
        </div>

        <!-- Action Bar -->
        <div style="display: flex; gap: 10px; margin: 10px 0; align-items: center; flex-wrap: wrap;">
          <button class="btn-encrypt" @click="${()=>loadFiles()}" ?disabled="${isLoading}">
            ${isLoading?"🔄 Loading...":"fsa"!==fs.fsMode||fs.hasDirectoryAccess?"🔄 Refresh":"📁 Select Directory"}
          </button>
          
          <input 
            type="text" 
            placeholder="New folder name"
            .value="${newFolderName}"
            @input="${e=>setNewFolderName(e.target.value)}"
            style="padding: 6px 10px; border: 1px solid #ddd; border-radius: 4px; font-size: 12px;"
            ?disabled="${"fsa"===fs.fsMode&&!fs.hasDirectoryAccess}"
          />
          <button class="btn-encrypt" @click="${async()=>{if(newFolderName.trim())if("fsa"!==fs.fsMode||fs.hasDirectoryAccess)try{setIsLoading(!0);await fs.writeFile(".folder","folder marker",currentPath?`${currentPath}/${newFolderName}`:newFolderName),setStatus(`Folder "${newFolderName}" created successfully!`),setNewFolderName(""),await loadFilesInternal()}catch(err){setStatus(`Failed to create folder: ${err.message}`)}finally{setIsLoading(!1)}else setStatus("Please select a directory first before creating folders.");else setStatus("Please enter a folder name")}}" ?disabled="${isLoading||!newFolderName.trim()||"fsa"===fs.fsMode&&!fs.hasDirectoryAccess}">
            📁 Create Folder
          </button>

          <input 
            type="text" 
            placeholder="New file name"
            .value="${newFileName}"
            @input="${e=>setNewFileName(e.target.value)}"
            style="padding: 6px 10px; border: 1px solid #ddd; border-radius: 4px; font-size: 12px;"
            ?disabled="${"fsa"===fs.fsMode&&!fs.hasDirectoryAccess}"
          />
          <button class="btn-encrypt" @click="${async()=>{if(newFileName.trim())if("fsa"!==fs.fsMode||fs.hasDirectoryAccess)try{setIsLoading(!0),await fs.writeFile(newFileName,newFileContent||"New encrypted file",currentPath),setStatus(`Encrypted file "${newFileName}" created successfully!`),setNewFileName(""),setNewFileContent(""),await loadFilesInternal()}catch(err){setStatus(`Failed to create encrypted file: ${err.message}`)}finally{setIsLoading(!1)}else setStatus("Please select a directory first before creating files.");else setStatus("Please enter a file name")}}" ?disabled="${isLoading||!newFileName.trim()||"fsa"===fs.fsMode&&!fs.hasDirectoryAccess}">
            📄 Create File
          </button>

          <input 
            type="file" 
            multiple 
            class="upload-input" 
            id="fileUpload"
            @change="${e=>{const files=e.target.files;handleFileUpload(files),e.target.value=""}}"
            ?disabled="${"fsa"===fs.fsMode&&!fs.hasDirectoryAccess}"
          />
          <button class="btn-download" @click="${e=>{const input=e.target.parentElement.querySelector("#fileUpload");input&&input.click()}}" ?disabled="${isLoading||"fsa"===fs.fsMode&&!fs.hasDirectoryAccess}">
            📤 Upload Files
          </button>
        </div>

        <!-- Column View File Browser -->
        <div class="column-view">
          <!-- File List Column -->
          <div class="column">
            <div class="column-header">
              📁 Files & Folders
              ${currentPath?html`
                <button class="btn-secondary" @click="${()=>{if(pathHistory.length>0){const previousPath=pathHistory[pathHistory.length-1];setPathHistory(pathHistory.slice(0,-1)),setCurrentPath(previousPath)}else{const pathParts=currentPath.split("/").filter(Boolean);pathParts.pop(),setCurrentPath(pathParts.join("/"))}setSelectedFile(""),setFileContent("")}}" style="padding: 2px 6px; font-size: 10px;">
                  ⬆️ Up
                </button>
              `:""}
            </div>
            <div class="column-content">
              ${"fsa"!==fs.fsMode||fs.hasDirectoryAccess?html`
              ${isLoading?html`
                <div style="padding: 20px; text-align: center; color: #666;">
                  Loading...
                </div>
              `:""}
              
              ${files.map((file=>html`
                <div 
                  class="column-item ${file.kind} ${selectedFile===file.name?"selected":""}"
                  @click="${()=>{var newPath;"directory"===file.kind?((newPath=currentPath?`${currentPath}/${file.name}`:file.name).startsWith(currentPath)&&newPath!==currentPath&&setPathHistory([...pathHistory,currentPath]),setCurrentPath(newPath),setSelectedFile(""),setFileContent("")):(async fileName=>{try{setIsLoading(!0);const content=await fs.readFile(fileName,currentPath);setSelectedFile(fileName),setFileContent(content),setEditContent("string"==typeof content?content:""),setIsEditing(!1),setStatus(`Encrypted file "${fileName}" decrypted and loaded successfully!`)}catch(err){setStatus(`Failed to read encrypted file: ${err.message}`)}finally{setIsLoading(!1)}})(file.name)}}"
                >
                  <span class="item-icon">${"directory"===file.kind?"📁":"🔐"}</span>
                  <span class="item-name">${file.name}</span>
                  ${"file"===file.kind?html`
                    <button 
                      class="btn-download" 
                      @click="${e=>{e.stopPropagation(),handleDownloadFile(file.name)}}" 
                      ?disabled="${isLoading}"
                      style="padding: 2px 6px; font-size: 10px;"
                    >
                      💾
                    </button>
                  `:""}
                </div>
              `))}

              ${isLoading||0!==files.length?"":html`
                <div style="padding: 20px; text-align: center; color: #666; font-style: italic;">
                  No files or folders found
                </div>
              `}
              `:html`
                <div style="padding: 40px 20px; text-align: center; color: #666;">
                  <div style="font-size: 48px; margin-bottom: 20px;">📁</div>
                  <p>No directory selected</p>
                  <p style="font-size: 12px; margin-top: 10px;">Click the "Select Directory" button above to get started</p>
                </div>
              `}
            </div>
          </div>

          <!-- Content Preview Column -->
          ${selectedFile?html`
            <div class="column">
              <div class="column-header">
                🔓 ${selectedFile}
                <div style="display: flex; gap: 4px;">
                  ${"string"!=typeof fileContent||isEditing?"":html`
                    <button class="btn-edit" @click="${()=>setIsEditing(!0)}" ?disabled="${isLoading}" style="padding: 2px 6px; font-size: 10px;">
                      ✏️
                    </button>
                  `}
                  <button class="btn-download" @click="${()=>handleDownloadFile(selectedFile)}" ?disabled="${isLoading}" style="padding: 2px 6px; font-size: 10px;">
                    💾
                  </button>
                </div>
              </div>
              <div class="column-content">
                ${"object"==typeof fileContent&&"binary"===fileContent.type?html`
                  <div style="padding: 15px;">
                    <p><strong>Binary File:</strong> ${fileContent.mimeType}</p>
                    <p><strong>Size:</strong> ${formatFileSize(fileContent.size)}</p>
                    ${fileContent.mimeType.startsWith("image/")?html`
                      <div style="margin-top: 15px;">
                        <img 
                          src="data:${fileContent.mimeType};base64,${fileContent.data}" 
                          style="max-width: 100%; max-height: 300px; border-radius: 4px;"
                          alt="Uploaded image"
                        />
                      </div>
                    `:html`
                      <p><em>${fileContent.preview}</em></p>
                    `}
                  </div>
                `:isEditing?html`
                  <div style="padding: 10px; height: 100%; display: flex; flex-direction: column;">
                    <textarea 
                      class="edit-textarea"
                      .value="${editContent}"
                      @input="${e=>setEditContent(e.target.value)}"
                      placeholder="Edit file content..."
                      style="flex: 1; min-height: 200px;"
                    ></textarea>
                    <div class="edit-actions">
                      <button class="btn-cancel" @click="${()=>{setEditContent("string"==typeof fileContent?fileContent:""),setIsEditing(!1)}}" ?disabled="${isLoading}">
                        Cancel
                      </button>
                      <button class="btn-save" @click="${async()=>{if(selectedFile)try{setIsLoading(!0),await fs.writeFile(selectedFile,editContent,currentPath),setFileContent(editContent),setIsEditing(!1),setStatus(`File "${selectedFile}" saved successfully!`),await loadFiles()}catch(err){setStatus(`Failed to save file: ${err.message}`)}finally{setIsLoading(!1)}}}" ?disabled="${isLoading}">
                        💾 Save
                      </button>
                    </div>
                  </div>
                `:html`
                  <div style="padding: 15px;">
                    <pre style="white-space: pre-wrap; font-family: 'Courier New', monospace; font-size: 12px; margin: 0; overflow-wrap: break-word;">${fileContent}</pre>
                  </div>
                `}
              </div>
            </div>
          `:""}
        </div>

        <!-- Status and Upload Results -->
        <div style="margin-top: 15px;">
          <div style="padding: 10px; background: #f8f9fa; border-radius: 4px; font-size: 12px;">
            <strong>Status:</strong> ${status}
          </div>
          
          ${uploadResults.length>0?html`
            <div style="margin-top: 10px;">
              <h5>Recent Upload Results:</h5>
              ${uploadResults.map((result=>html`
                <div class="upload-result ${result.status}" style="font-size: 12px;">
                  <span>
                    ${"success"===result.status?"✅":"❌"} ${result.fileName}
                    ${"success"===result.status?html`<span class="encrypted-badge">ENCRYPTED</span>`:""}
                  </span>
                  <span class="file-info">
                    ${"success"===result.status?`${formatFileSize(result.size)} • ${result.type||"Unknown type"}`:result.error}
                  </span>
                </div>
              `))}
            </div>
          `:""}
        </div>
      `:""}
    </div>
  `}});const __WEBPACK_DEFAULT_EXPORT__={title:"useFS()",parameters:{layout:"fullscreen",docs:{description:{component:"\n# 🗂️ useFS Hook - File System Access\n\nThe `useFS` hook provides a unified interface for file system operations, supporting both the File System Access API and Origin Private File System (OPFS) as a fallback.\n\n## 🚀 Features\n\n- **File System Access API Support** - Access real directories on the user's device\n- **OPFS Fallback** - Automatic fallback to Origin Private File System when FSA is unavailable\n- **File Encryption** - Optional AES-GCM encryption for all file content  \n- **Password Management** - Customizable encryption passwords with visual UI\n- **Folder Creation** - Create and navigate nested folder structures\n- **Column View Navigation** - macOS Finder-style column browsing\n- **Binary File Support** - Handles both text and binary files (images, documents, etc.)\n- **File Editing** - In-browser text file editing with save functionality\n- **File Downloads** - Download any file type (text/binary) unencrypted to device\n- **Smart Directory Selection** - Automatic prompts when directory access needed\n- **Persistent State** - Remembers user preferences and permissions using useStore\n- **Error Handling** - Graceful error handling with user-friendly messages and retry functionality\n- **Mode Switching** - Ability to switch between FSA and OPFS modes\n\n## 📝 Basic Usage\n\n```javascript\nimport { useFS } from '../hooks/useFS';\n\nconst MyComponent = (props, { useFS, html }) => {\n  const { \n    listDirectory,\n    removeFile,\n    removeDirectory,\n    selectDirectory, \n    readFile, \n    writeFile, \n    directoryPath,\n    isReady,\n    hasPermission \n  } = useFS({ opfs: false });\n\n  const handleSelectDirectory = async () => {\n    const selected = await selectDirectory();\n    if (selected) {\n      console.log('Directory selected:', directoryPath);\n    }\n  };\n\n  const handleCreateFile = async () => {\n    await writeFile('example.txt', 'Hello World!');\n    console.log('File created successfully');\n  };\n\n  return html`\n    <div>\n      <button @click=\"${handleSelectDirectory}\">\n        ${hasPermission ? 'Change Directory' : 'Select Directory'}\n      </button>\n      \n      ${isReady ? html`\n        <button @click=\"${handleCreateFile}\">Create File</button>\n        <p>Current directory: ${directoryPath}</p>\n      ` : html`\n        <p>Please select a directory first</p>\n      `}\n    </div>\n  `;\n};\n```\n\n## 🔧 Configuration\n\n### Force OPFS Mode\n\n```javascript\nconst fs = useFS({ opfs: true }); // Forces OPFS usage\n```\n\n### Enable Encryption\n\n```javascript\n// Basic encryption with default password\nconst fs = useFS({ encrypt: true });\n\n// Encryption with custom password\nconst fs = useFS({ \n  encrypt: true, \n  encryptionPassword: 'my-secure-password-123' \n});\n\n// Encrypted OPFS storage\nconst fs = useFS({ \n  opfs: true, \n  encrypt: true, \n  encryptionPassword: 'vault-password' \n});\n```\n\n### File Upload Examples\n\n```javascript\n// Single file upload (supports text and binary files)\nconst handleFileUpload = async (event) => {\n  const file = event.target.files[0];\n  if (file) {\n    const result = await fs.uploadFile(file);\n    console.log('Uploaded:', result);\n  }\n};\n\n// Multiple file upload with drag & drop\nconst handleDrop = async (event) => {\n  event.preventDefault();\n  const files = Array.from(event.dataTransfer.files);\n  const results = await fs.uploadFiles(files);\n  \n  results.forEach(result => {\n    if (result.status === 'success') {\n      console.log('✅ Uploaded:', result.fileName);\n    } else {\n      console.error('❌ Failed:', result.fileName, result.error);\n    }\n  });\n};\n\n// Upload with custom filename\nawait fs.uploadFile(file, 'my-secret-document.txt');\n\n// Reading binary files returns metadata object\nconst content = await fs.readFile('image.jpg');\nif (content.type === 'binary') {\n  console.log('Binary file:', content.mimeType, 'Size:', content.size);\n  // For images, you can create data URLs: \n  // data:${content.mimeType};base64,${content.data}\n}\n```\n\n### API Reference\n\n| Method | Description |\n|--------|-------------|\n| `selectDirectory()` | Opens directory picker (FSA only) |\n| `requestPermission()` | Checks/requests file system permission |\n| `listDirectory(path?)` | Lists files and directories |\n| `readFile(fileName, path?)` | Reads file content as text or binary metadata (auto-decrypts if encrypted) |\n| `writeFile(fileName, content, path?)` | Writes content to file (auto-encrypts if enabled) |\n| `uploadFile(file, targetFileName?, path?)` | Uploads a File object (text/binary) and encrypts it |\n| `uploadFiles(files, path?)` | Uploads multiple File objects with batch processing |\n| `removeFile(fileName, path?)` | Removes a file |\n| `removeDirectory(dirName, path?)` | Removes a directory (recursive) |\n\n### State Properties\n\n| Property | Type | Description |\n|----------|------|-------------|\n| `directoryPath` | string | Current directory path/name |\n| `isReady` | boolean | Whether the hook is ready for operations |\n| `fsMode` | 'fsa' \\| 'opfs' | Current file system mode |\n| `hasPermission` | boolean | Whether permission is granted |\n| `error` | Error \\| null | Current error state |\n| `encryptionEnabled` | boolean | Whether encryption is enabled |\n| `encryptionReady` | boolean \\| null | Whether encryption is ready (null if disabled) |\n\n## 🎯 Use Cases\n\n- **Text Editor** - Save, edit, and download documents from user's filesystem\n- **Data Import/Export** - Read, edit, and download CSV, JSON files from your computer\n- **Project Management** - Work with project files and folders with inline editing\n- **Note Taking** - Persistent notes with file system storage and in-browser editing\n- **Development Tools** - Code editors, file managers with download capabilities\n- **Media Management** - Photo galleries, document organizers with image previews and downloads\n- **Secure Storage** - Encrypted storage for sensitive documents with download access\n- **Password Manager** - Encrypted credential storage with secure download options\n- **Private Journals** - Encrypted personal notes and diaries with editing capabilities\n\n## 🔒 Security & Privacy\n\n- **File System Access API** requires explicit user permission\n- **OPFS** provides isolated storage that's private to your origin\n- **AES-GCM Encryption** - Industry-standard encryption for file content\n- **Password-based Security** - Custom passwords for different encryption contexts\n- All operations are sandboxed and secure\n- User has full control over directory access\n- **Automatic Encryption/Decryption** - Transparent file protection\n        "}}},tags:["autodocs"]},FullDemo={render:()=>react__WEBPACK_IMPORTED_MODULE_0__.createElement("file-manager-demo"),name:"📁 Full File Manager Demo",parameters:{docs:{description:{story:"Complete file manager demonstrating all useFS features including directory selection, file operations, and mode switching."}}}},SimpleExample={render:()=>react__WEBPACK_IMPORTED_MODULE_0__.createElement("simple-usefs-example"),name:"⚡ Simple Example",parameters:{docs:{description:{story:"Basic example showing the essential useFS operations in a simple workflow."}}}},OPFSOnly={render:()=>react__WEBPACK_IMPORTED_MODULE_0__.createElement("opfs-example"),name:"🔒 OPFS Only",parameters:{docs:{description:{story:"Example using only Origin Private File System, demonstrating the fallback mode."}}}},ForcedOPFS={render:()=>react__WEBPACK_IMPORTED_MODULE_0__.createElement("file-manager-demo",{opfs:!0}),name:"🔒 Forced OPFS Mode",parameters:{docs:{description:{story:"File manager demo with OPFS mode forced, showing how the hook behaves when File System Access API is disabled."}}}},EncryptedDemo={render:()=>react__WEBPACK_IMPORTED_MODULE_0__.createElement("encrypted-file-manager-demo"),name:"🔐 Encrypted File System",parameters:{docs:{description:{story:"Advanced encrypted file manager with password management, folder creation, and column-view navigation. Features include customizable encryption passwords, nested folder structures, and macOS Finder-style browsing. All files are automatically encrypted before storage and decrypted when read."}}}},EncryptedOPFS={render:()=>react__WEBPACK_IMPORTED_MODULE_0__.createElement("encrypted-file-manager-demo",{opfs:!0}),name:"🔐 Encrypted OPFS",parameters:{docs:{description:{story:"Encrypted file system using OPFS exclusively with password management and folder navigation. Shows how encryption works with Origin Private File System storage without requiring directory permissions. Includes all advanced features like column view and folder creation."}}}},__namedExportsOrder=["FullDemo","SimpleExample","OPFSOnly","ForcedOPFS","EncryptedDemo","EncryptedOPFS"];FullDemo.parameters={...FullDemo.parameters,docs:{...FullDemo.parameters?.docs,source:{originalSource:'{\n  render: () => React.createElement(\'file-manager-demo\'),\n  name: "📁 Full File Manager Demo",\n  parameters: {\n    docs: {\n      description: {\n        story: "Complete file manager demonstrating all useFS features including directory selection, file operations, and mode switching."\n      }\n    }\n  }\n}',...FullDemo.parameters?.docs?.source}}},SimpleExample.parameters={...SimpleExample.parameters,docs:{...SimpleExample.parameters?.docs,source:{originalSource:'{\n  render: () => React.createElement(\'simple-usefs-example\'),\n  name: "⚡ Simple Example",\n  parameters: {\n    docs: {\n      description: {\n        story: "Basic example showing the essential useFS operations in a simple workflow."\n      }\n    }\n  }\n}',...SimpleExample.parameters?.docs?.source}}},OPFSOnly.parameters={...OPFSOnly.parameters,docs:{...OPFSOnly.parameters?.docs,source:{originalSource:'{\n  render: () => React.createElement(\'opfs-example\'),\n  name: "🔒 OPFS Only",\n  parameters: {\n    docs: {\n      description: {\n        story: "Example using only Origin Private File System, demonstrating the fallback mode."\n      }\n    }\n  }\n}',...OPFSOnly.parameters?.docs?.source}}},ForcedOPFS.parameters={...ForcedOPFS.parameters,docs:{...ForcedOPFS.parameters?.docs,source:{originalSource:'{\n  render: () => React.createElement(\'file-manager-demo\', {\n    opfs: true\n  }),\n  name: "🔒 Forced OPFS Mode",\n  parameters: {\n    docs: {\n      description: {\n        story: "File manager demo with OPFS mode forced, showing how the hook behaves when File System Access API is disabled."\n      }\n    }\n  }\n}',...ForcedOPFS.parameters?.docs?.source}}},EncryptedDemo.parameters={...EncryptedDemo.parameters,docs:{...EncryptedDemo.parameters?.docs,source:{originalSource:'{\n  render: () => React.createElement(\'encrypted-file-manager-demo\'),\n  name: "🔐 Encrypted File System",\n  parameters: {\n    docs: {\n      description: {\n        story: "Advanced encrypted file manager with password management, folder creation, and column-view navigation. Features include customizable encryption passwords, nested folder structures, and macOS Finder-style browsing. All files are automatically encrypted before storage and decrypted when read."\n      }\n    }\n  }\n}',...EncryptedDemo.parameters?.docs?.source}}},EncryptedOPFS.parameters={...EncryptedOPFS.parameters,docs:{...EncryptedOPFS.parameters?.docs,source:{originalSource:'{\n  render: () => React.createElement(\'encrypted-file-manager-demo\', {\n    opfs: true\n  }),\n  name: "🔐 Encrypted OPFS",\n  parameters: {\n    docs: {\n      description: {\n        story: "Encrypted file system using OPFS exclusively with password management and folder navigation. Shows how encryption works with Origin Private File System storage without requiring directory permissions. Includes all advanced features like column view and folder creation."\n      }\n    }\n  }\n}',...EncryptedOPFS.parameters?.docs?.source}}}}}]);
//# sourceMappingURL=stories-05-Hooks-useFS-stories.8f321ceb.iframe.bundle.js.map