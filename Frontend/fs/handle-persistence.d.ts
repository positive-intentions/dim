/** Saves the root directory handle for native (FSA) file storage. */
export function saveRootDirectoryHandle(handle: any): Promise<void>;
/** Loads a previously saved root handle, or null if none / unsupported / error. */
export function loadRootDirectoryHandle(): Promise<any>;
/** Removes the saved root handle (e.g. when switching back to OPFS). */
export function clearRootDirectoryHandle(): Promise<void>;
//# sourceMappingURL=handle-persistence.d.ts.map