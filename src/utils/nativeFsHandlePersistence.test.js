import {
  clearRootDirectoryHandle,
  loadRootDirectoryHandle,
  saveRootDirectoryHandle,
} from './nativeFsHandlePersistence.js';

describe('nativeFsHandlePersistence', () => {
  it('loadRootDirectoryHandle resolves without throwing', async () => {
    const result = await loadRootDirectoryHandle();
    expect(result === null || result?.kind === 'directory').toBe(true);
  });

  it('save and clear complete without throwing', async () => {
    const mockHandle = { kind: 'directory' };
    await expect(saveRootDirectoryHandle(mockHandle)).resolves.toBeUndefined();
    await expect(clearRootDirectoryHandle()).resolves.toBeUndefined();
  });
});
