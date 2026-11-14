export function useFS(options: {}, hooks: any): {
    listDirectory: (path?: string) => Promise<{
        name: any;
        kind: any;
        handle: any;
    }[]>;
    readFile: (fileName: any, path?: string) => Promise<any>;
    writeFile: (fileName: any, content: any, path?: string) => Promise<void>;
    removeFile: (fileName: any, path?: string) => Promise<void>;
    removeDirectory: (dirName: any, path?: string) => Promise<void>;
    uploadFile: (file: any, targetFileName?: any, path?: string) => Promise<{
        success: boolean;
        fileName: any;
        size: number;
        type: string;
    }>;
    uploadFiles: (files: any, path?: string) => Promise<({
        status: string;
        success: boolean;
        fileName: any;
        size: number;
        type: string;
        error?: undefined;
    } | {
        fileName: any;
        status: string;
        error: any;
        size: any;
        type: any;
    })[]>;
    requestPermission: () => Promise<any>;
    selectDirectory: () => Promise<boolean>;
    directoryPath: any;
    isReady: boolean;
    fsMode: any;
    hasPermission: any;
    hasDirectoryAccess: boolean;
    error: any;
    encryptionEnabled: any;
    encryptionReady: boolean;
    switchToOPFS: () => void;
    switchToFSA: () => void;
    pickLocalDirectory: () => Promise<boolean>;
    reconnectLocalDirectory: () => Promise<boolean>;
    pendingFolderReconnect: any;
    clearPendingFolderReconnect: () => void;
    clearError: () => any;
};
export default useFS;
//# sourceMappingURL=useFS.d.ts.map