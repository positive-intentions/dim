/**
 * useFS Hook - File System Access with OPFS fallback
 * 
 * Provides unified interface for file system operations using either:
 * - File System Access API (with user permission)
 * - Origin Private File System (OPFS) as fallback
 * 
 * @param {Object} options - Configuration options
 * @param {boolean} options.opfs - Force OPFS usage instead of trying File System Access API
 * @param {boolean} options.encrypt - Enable encryption for file content
 * @param {string} options.encryptionPassword - Password for encryption (uses default if not provided)
 * @param {Object} hooks - Hook dependencies (useState, useEffect, useStore)
 * @returns {Object} File system interface
 */
export function useFS(options = {}, hooks) {
  const { opfs = false, encrypt = false, encryptionPassword = 'useFS-default-password' } = options;
  const { useState, useEffect, useStore } = hooks;

  // Initialize crypto manager if encryption is enabled
  const [cryptoManager, setCryptoManager] = useState(null);
  
  useEffect(() => {
    if (encrypt) {
      // Dynamically import CryptoManager to avoid circular dependencies
      import('../core/crypto-manager.js').then(({ default: CryptoManager }) => {
        const crypto = new CryptoManager(encryptionPassword);
        setCryptoManager(crypto);
      });
    }
  }, [encrypt, encryptionPassword]);

  // Internal state for the hook
  const [isInitialized, setIsInitialized] = useState(false);
  const [fsMode, setFsMode] = useState(null); // 'fsa' or 'opfs'
  const [directoryHandle, setDirectoryHandle] = useState(null);
  const [error, setError] = useState(null);
  
  // Persistent state using useStore
  const store = useStore({
    selectedDirectoryName: useState(''),
    hasPermission: useState(false),
    preferredMode: useState(opfs ? 'opfs' : 'fsa'),
  });

  const [selectedDirectoryName, setSelectedDirectoryName] = store.selectedDirectoryName;
  const [hasPermission, setHasPermission] = store.hasPermission;
  const [preferredMode, setPreferredMode] = store.preferredMode;

  // Check if File System Access API is supported
  const isFileSystemAccessSupported = () => {
    return 'showDirectoryPicker' in window;
  };

  // Initialize the file system based on mode and stored state
  useEffect(() => {
    const initializeFS = async () => {
      try {
        setError(null);
        
        if (opfs || preferredMode === 'opfs' || !isFileSystemAccessSupported()) {
          // Use OPFS
          setFsMode('opfs');
          setIsInitialized(true);
          console.log('useFS: Initialized with OPFS');
        } else {
          // Try to restore previous directory handle if we have permission
          if (hasPermission && selectedDirectoryName) {
            // File System Access API doesn't provide a way to restore handles
            // User will need to re-select directory after page reload
            console.log('useFS: Previous directory access lost, user needs to re-select');
            setHasPermission(false);
            setSelectedDirectoryName('');
          }
          setFsMode('fsa');
          setIsInitialized(true);
          console.log('useFS: Initialized with File System Access API');
        }
      } catch (err) {
        console.error('useFS: Initialization failed:', err);
        setError(err);
        // Fallback to OPFS on initialization failure
        setFsMode('opfs');
        setIsInitialized(true);
      }
    };

    if (!isInitialized) {
      initializeFS();
    }
  }, [isInitialized, opfs, preferredMode]);

  // Request permission to access file system (FSA only)
  const requestPermission = async () => {
    if (fsMode === 'opfs') {
      // OPFS doesn't require explicit permission
      return true;
    }

    try {
      if (!isFileSystemAccessSupported()) {
        throw new Error('File System Access API not supported');
      }

      // For FSA, permission is granted through directory selection
      // This is a placeholder that indicates user should call selectDirectory
      return hasPermission;
    } catch (err) {
      console.error('useFS: Permission request failed:', err);
      setError(err);
      return false;
    }
  };

  // Select a directory (FSA only, OPFS uses root)
  const selectDirectory = async () => {
    if (fsMode === 'opfs') {
      // OPFS doesn't have directory selection, use root
      const root = await navigator.storage.getDirectory();
      setDirectoryHandle(root);
      setSelectedDirectoryName('OPFS Root');
      setHasPermission(true);
      return true;
    }

    try {
      if (!isFileSystemAccessSupported()) {
        throw new Error('File System Access API not supported');
      }

      const handle = await window.showDirectoryPicker({
        mode: 'readwrite'
      });
      
      // Verify we have write permissions by requesting them explicitly
      const permissionStatus = await handle.requestPermission({ mode: 'readwrite' });
      if (permissionStatus !== 'granted') {
        throw new Error('Write permission denied');
      }
      
      setDirectoryHandle(handle);
      setSelectedDirectoryName(handle.name);
      setHasPermission(true);
      setError(null);
      console.log('useFS: Directory selected with write permissions:', handle.name);
      return true;
    } catch (err) {
      if (err.name === 'AbortError') {
        console.log('useFS: Directory selection cancelled');
        return false;
      }
      console.error('useFS: Directory selection failed:', err);
      setError(err);
      return false;
    }
  };

  // Get the current directory handle
  const getCurrentDirectoryHandle = async () => {
    if (directoryHandle) {
      return directoryHandle;
    }

    if (fsMode === 'opfs') {
      const root = await navigator.storage.getDirectory();
      setDirectoryHandle(root);
      return root;
    }

    throw new Error('No directory selected. Call selectDirectory() first.');
  };

  // List files and directories
  const listDirectory = async (path = '') => {
    try {
      const dirHandle = await getCurrentDirectoryHandle();
      let targetHandle = dirHandle;

      // Navigate to subdirectory if path is provided
      if (path) {
        const pathParts = path.split('/').filter(Boolean);
        for (const part of pathParts) {
          targetHandle = await targetHandle.getDirectoryHandle(part);
        }
      }

      const entries = [];
      for await (const [name, handle] of targetHandle.entries()) {
        entries.push({
          name,
          kind: handle.kind, // 'file' or 'directory'
          handle
        });
      }

      return entries.sort((a, b) => {
        // Directories first, then files, both alphabetically
        if (a.kind !== b.kind) {
          return a.kind === 'directory' ? -1 : 1;
        }
        return a.name.localeCompare(b.name);
      });
    } catch (err) {
      console.error('useFS: Failed to list directory:', err);
      setError(err);
      throw err;
    }
  };

  // Read file content
  const readFile = async (fileName, path = '') => {
    try {
      const dirHandle = await getCurrentDirectoryHandle();
      let targetHandle = dirHandle;

      // Navigate to subdirectory if path is provided
      if (path) {
        const pathParts = path.split('/').filter(Boolean);
        for (const part of pathParts) {
          targetHandle = await targetHandle.getDirectoryHandle(part);
        }
      }

      const fileHandle = await targetHandle.getFileHandle(fileName);
      const file = await fileHandle.getFile();
      let content = await file.text();

      // Decrypt content if encryption is enabled
      if (encrypt && cryptoManager && content) {
        try {
          // Check if content appears to be encrypted (JSON with encryptedData and iv)
          const parsed = JSON.parse(content);
          if (parsed.encryptedData && parsed.iv) {
            content = await cryptoManager.decryptData(content);
          }
        } catch (decryptErr) {
          // If decryption fails or content is not encrypted JSON, return as-is
          console.warn('useFS: Failed to decrypt file content, returning as plain text:', decryptErr.message);
        }
      }

      // Check if this is a binary file stored in our format
      try {
        const parsed = JSON.parse(content);
        if (parsed.type === 'binary' && parsed.data && parsed.mimeType) {
          // Return metadata about binary file rather than raw data
          return {
            type: 'binary',
            mimeType: parsed.mimeType,
            size: Math.ceil(parsed.data.length * 3 / 4), // Approximate original size
            data: parsed.data, // Base64 data
            preview: `Binary file (${parsed.mimeType})`
          };
        }
      } catch (e) {
        // Not JSON or not our binary format, return as text
      }

      return content;
    } catch (err) {
      console.error('useFS: Failed to read file:', err);
      setError(err);
      throw err;
    }
  };

  // Write file content
  const writeFile = async (fileName, content, path = '') => {
    try {
      const dirHandle = await getCurrentDirectoryHandle();
      
      // Check write permissions for FSA mode
      if (fsMode === 'fsa') {
        const permissionStatus = await dirHandle.requestPermission({ mode: 'readwrite' });
        if (permissionStatus !== 'granted') {
          throw new Error('Write permission required. Please re-select the directory and grant write access.');
        }
      }
      
      let targetHandle = dirHandle;

      // Navigate to subdirectory if path is provided, create if needed
      if (path) {
        const pathParts = path.split('/').filter(Boolean);
        for (const part of pathParts) {
          try {
            targetHandle = await targetHandle.getDirectoryHandle(part);
          } catch (err) {
            if (err.name === 'NotFoundError') {
              targetHandle = await targetHandle.getDirectoryHandle(part, { create: true });
            } else {
              throw err;
            }
          }
        }
      }

      // Encrypt content if encryption is enabled
      let finalContent = content;
      if (encrypt && cryptoManager) {
        try {
          finalContent = await cryptoManager.encryptData(content);
        } catch (encryptErr) {
          console.error('useFS: Failed to encrypt file content:', encryptErr);
          throw new Error(`Encryption failed: ${encryptErr.message}`);
        }
      }

      const fileHandle = await targetHandle.getFileHandle(fileName, { create: true });
      const writable = await fileHandle.createWritable();
      await writable.write(finalContent);
      await writable.close();
      
      console.log('useFS: File written successfully' + (encrypt ? ' (encrypted)' : '') + ':', fileName);
    } catch (err) {
      console.error('useFS: Failed to write file:', err);
      setError(err);
      throw err;
    }
  };

  // Remove file
  const removeFile = async (fileName, path = '') => {
    try {
      const dirHandle = await getCurrentDirectoryHandle();
      let targetHandle = dirHandle;

      // Navigate to subdirectory if path is provided
      if (path) {
        const pathParts = path.split('/').filter(Boolean);
        for (const part of pathParts) {
          targetHandle = await targetHandle.getDirectoryHandle(part);
        }
      }

      await targetHandle.removeEntry(fileName);
      console.log('useFS: File removed successfully:', fileName);
    } catch (err) {
      console.error('useFS: Failed to remove file:', err);
      setError(err);
      throw err;
    }
  };

  // Remove directory
  const removeDirectory = async (dirName, path = '') => {
    try {
      const dirHandle = await getCurrentDirectoryHandle();
      let targetHandle = dirHandle;

      // Navigate to parent directory if path is provided
      if (path) {
        const pathParts = path.split('/').filter(Boolean);
        for (const part of pathParts) {
          targetHandle = await targetHandle.getDirectoryHandle(part);
        }
      }

      await targetHandle.removeEntry(dirName, { recursive: true });
      console.log('useFS: Directory removed successfully:', dirName);
    } catch (err) {
      console.error('useFS: Failed to remove directory:', err);
      setError(err);
      throw err;
    }
  };

  // Upload file from user's device
  const uploadFile = async (file, targetFileName = null, path = '') => {
    try {
      if (!file || !(file instanceof File)) {
        throw new Error('Invalid file provided. Expected a File object.');
      }

      const fileName = targetFileName || file.name;
      
      // For binary files, convert to base64, for text files use text content
      let content;
      if (file.type.startsWith('text/') || 
          file.type === 'application/json' ||
          file.type === 'application/javascript' ||
          file.name.match(/\.(txt|md|json|js|ts|css|html|xml|csv)$/i)) {
        // Read as text for text-based files
        content = await file.text();
      } else {
        // Read as base64 for binary files (images, etc.)
        const arrayBuffer = await file.arrayBuffer();
        const bytes = new Uint8Array(arrayBuffer);
        let binaryString = '';
        const chunkSize = 8192;
        
        for (let i = 0; i < bytes.length; i += chunkSize) {
          const chunk = bytes.subarray(i, i + chunkSize);
          binaryString += String.fromCharCode.apply(null, chunk);
        }
        
        content = JSON.stringify({
          type: 'binary',
          mimeType: file.type,
          data: btoa(binaryString)
        });
      }
      
      // Use the existing writeFile method which handles encryption automatically
      await writeFile(fileName, content, path);
      
      console.log('useFS: File uploaded successfully' + (encrypt ? ' (encrypted)' : '') + ':', fileName);
      return { success: true, fileName, size: file.size, type: file.type };
    } catch (err) {
      console.error('useFS: Failed to upload file:', err);
      setError(err);
      throw err;
    }
  };

  // Upload multiple files
  const uploadFiles = async (files, path = '') => {
    try {
      if (!files || !Array.isArray(files)) {
        throw new Error('Invalid files provided. Expected an array of File objects.');
      }

      const results = [];
      for (const file of files) {
        try {
          const result = await uploadFile(file, null, path);
          results.push({ ...result, status: 'success' });
        } catch (err) {
          results.push({ 
            fileName: file.name, 
            status: 'error', 
            error: err.message,
            size: file.size,
            type: file.type
          });
        }
      }

      return results;
    } catch (err) {
      console.error('useFS: Failed to upload files:', err);
      setError(err);
      throw err;
    }
  };

  // Get current directory path (for display purposes)
  const directoryPath = selectedDirectoryName || (fsMode === 'opfs' ? 'OPFS Root' : 'No directory selected');

  // Check if we're ready to use the file system
  const isReady = isInitialized && (fsMode === 'opfs' || (fsMode === 'fsa' && directoryHandle !== null));
  
  // Check if we actually have directory access
  const hasDirectoryAccess = fsMode === 'opfs' || (fsMode === 'fsa' && directoryHandle !== null);

  return {
    // Core operations
    listDirectory,
    readFile,
    writeFile,
    removeFile,
    removeDirectory,
    uploadFile,
    uploadFiles,
    
    // Permission and setup
    requestPermission,
    selectDirectory,
    
    // State
    directoryPath,
    isReady,
    fsMode,
    hasPermission,
    hasDirectoryAccess,
    error,
    
    // Encryption
    encryptionEnabled: encrypt,
    encryptionReady: encrypt ? !!cryptoManager : null,
    
    // Mode switching
    switchToOPFS: () => {
      setPreferredMode('opfs');
      setIsInitialized(false);
      setDirectoryHandle(null);
      setHasPermission(false);
      setSelectedDirectoryName('');
    },
    
    switchToFSA: () => {
      if (isFileSystemAccessSupported()) {
        setPreferredMode('fsa');
        setIsInitialized(false);
        setDirectoryHandle(null);
        setHasPermission(false);
        setSelectedDirectoryName('');
      } else {
        throw new Error('File System Access API not supported');
      }
    },
    
    // Clear error
    clearError: () => setError(null)
  };
}

export default useFS;