import { renderHook, waitFor, act } from '@testing-library/react';

// Shared mock fns (the `mock` prefix is required for jest.mock factory access).
const mockReadValue = jest.fn();
const mockWriteValue = jest.fn();
const mockEncrypt = jest.fn(async (v) => JSON.stringify({ encryptedData: 'x', iv: 'y', salt: 'z' }));
const mockDecrypt = jest.fn(async (v) => v);

jest.mock('../core/crypto-manager.js', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => ({
    encryptData: (...args) => mockEncrypt(...args),
    decryptData: (...args) => mockDecrypt(...args),
  })),
}));

jest.mock('../core/storage-manager.js', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => ({
    readValue: (...args) => mockReadValue(...args),
    writeValue: (...args) => mockWriteValue(...args),
  })),
}));

jest.mock('../core/mini-lit.js', () => ({
  debouncedDispatcher: jest.fn(),
}));

import { useDimStore } from './useDimStore';

const testPassword = 'test-password-123';
const wrongPassword = 'wrong-password';

let keyCounter = 0;
const uniqueKey = () => `test-key-${Date.now()}-${keyCounter++}`;

describe('useDimStore', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockEncrypt.mockImplementation(async () =>
      JSON.stringify({ encryptedData: 'x', iv: 'y', salt: 'z' })
    );
    mockDecrypt.mockImplementation(async (v) => v);
    mockWriteValue.mockResolvedValue('ok');
  });

  test('throws when no password is provided', () => {
    // Suppress the expected React error boundary noise.
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    expect(() =>
      renderHook(() => useDimStore({ key: uniqueKey(), defaultValue: '' }))
    ).toThrow(/explicit `password`/);
    spy.mockRestore();
  });

  test('returns the decrypted value when present', async () => {
    mockReadValue.mockResolvedValue({ value: 'stored value', newState: null });

    const { result } = renderHook(() =>
      useDimStore({ key: uniqueKey(), password: testPassword, defaultValue: '' })
    );

    await waitFor(() => expect(result.current[2]).toBe(false));
    expect(result.current[0]).toBe('stored value');
  });

  test('uses the default value when nothing is stored', async () => {
    mockReadValue.mockResolvedValue(null);

    const { result } = renderHook(() =>
      useDimStore({ key: uniqueKey(), password: testPassword, defaultValue: 'fallback' })
    );

    await waitFor(() => expect(result.current[2]).toBe(false));
    expect(result.current[0]).toBe('fallback');
  });

  test('falls back to default value when the password is wrong', async () => {
    mockReadValue.mockRejectedValue(new Error('Decryption failed: Incorrect password'));

    const { result } = renderHook(() =>
      useDimStore({ key: uniqueKey(), password: wrongPassword, defaultValue: '' })
    );

    await waitFor(() => expect(result.current[2]).toBe(false));
    expect(result.current[0]).toBe('');
  });

  test('never exposes the raw encrypted payload structure', async () => {
    mockReadValue.mockResolvedValue({ value: 'plain string', newState: null });

    const { result } = renderHook(() =>
      useDimStore({ key: uniqueKey(), password: testPassword, defaultValue: '' })
    );

    await waitFor(() => expect(result.current[2]).toBe(false));
    const value = result.current[0];
    expect(typeof value).toBe('string');
    expect(value).not.toHaveProperty('encryptedData');
    expect(value).not.toHaveProperty('iv');
  });

  test('sets and stores a new value (encrypted + persisted)', async () => {
    mockReadValue.mockResolvedValue(null);

    const { result } = renderHook(() =>
      useDimStore({ key: uniqueKey(), password: testPassword, defaultValue: '' })
    );

    await waitFor(() => expect(result.current[2]).toBe(false));

    await act(async () => {
      result.current[1]('new value');
    });

    await waitFor(() => expect(mockWriteValue).toHaveBeenCalled());
    expect(mockEncrypt).toHaveBeenCalledWith('new value');
    expect(result.current[0]).toBe('new value');
  });
});
