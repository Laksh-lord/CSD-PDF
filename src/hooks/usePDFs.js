import { useState, useEffect, useCallback } from 'react';
import { supabase, hasSupabaseConfig } from '../supabase';

const MAX_SIZE_BYTES = 20 * 1024 * 1024;
const STORAGE_BUCKET = import.meta.env.VITE_SUPABASE_BUCKET || 'pdfs';
const ENABLE_SUPABASE = import.meta.env.VITE_USE_SUPABASE !== 'false';
const LOCAL_DB_NAME = 'pdfvault-local';
const LOCAL_DB_VERSION = 1;
const LOCAL_STORE = 'pdfs';
const localObjectUrls = new Set();

function makeId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function openLocalDb() {
  if (typeof indexedDB === 'undefined') {
    return Promise.reject(new Error('Local storage is unavailable in this browser.'));
  }

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(LOCAL_DB_NAME, LOCAL_DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(LOCAL_STORE)) {
        db.createObjectStore(LOCAL_STORE, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error('Failed to open local storage.'));
  });
}

async function readLocalPdfs() {
  const db = await openLocalDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(LOCAL_STORE, 'readonly');
    const store = tx.objectStore(LOCAL_STORE);
    const request = store.getAll();

    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error || new Error('Failed to read local files.'));
    tx.oncomplete = () => db.close();
    tx.onerror = () => db.close();
  });
}

async function saveLocalPdf(record) {
  const db = await openLocalDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(LOCAL_STORE, 'readwrite');
    tx.objectStore(LOCAL_STORE).put(record);
    tx.oncomplete = () => {
      db.close();
      resolve(record);
    };
    tx.onerror = () => {
      const error = tx.error || new Error('Failed to save local file.');
      db.close();
      reject(error);
    };
  });
}

async function deleteLocalPdf(id) {
  const db = await openLocalDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(LOCAL_STORE, 'readwrite');
    tx.objectStore(LOCAL_STORE).delete(id);
    tx.oncomplete = () => {
      db.close();
      resolve();
    };
    tx.onerror = () => {
      const error = tx.error || new Error('Failed to delete local file.');
      db.close();
      reject(error);
    };
  });
}

function clearLocalObjectUrls() {
  for (const url of localObjectUrls) {
    URL.revokeObjectURL(url);
  }
  localObjectUrls.clear();
}

function getApiBaseUrl() {
  const configuredBase = import.meta.env.VITE_API_BASE_URL?.trim();
  if (configuredBase) return configuredBase.replace(/\/+$/, '');

  if (typeof window !== 'undefined') {
    const { hostname, origin } = window.location;
    if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1') {
      return 'http://127.0.0.1:8787';
    }

    return origin;
  }

  return 'http://127.0.0.1:8787';
}

const API_BASE = getApiBaseUrl();

function resolveApiUrl(path) {
  if (!path) return API_BASE;
  if (/^https?:\/\//.test(path)) return path;
  return `${API_BASE}${path.startsWith('/') ? path : `/${path}`}`;
}

function normalizeApiPdf(pdf) {
  const openURL = pdf.openURL?.startsWith('http')
    ? pdf.openURL
    : resolveApiUrl(pdf.openURL || '');
  const downloadURL = pdf.downloadURL?.startsWith('http')
    ? pdf.downloadURL
    : resolveApiUrl(pdf.downloadURL || '');

  return {
    id: String(pdf.id),
    fileName: pdf.fileName,
    fileSize: pdf.fileSize,
    storagePath: pdf.storagePath,
    createdAt: pdf.createdAt ? new Date(pdf.createdAt) : new Date(),
    openURL,
    downloadURL,
  };
}

function normalizeSupabasePdf(row) {
  return {
    id: String(row.id),
    fileName: row.file_name,
    fileSize: row.file_size,
    storagePath: row.storage_path,
    createdAt: row.created_at ? new Date(row.created_at) : new Date(),
    openURL: row.download_url,
    downloadURL: row.download_url,
  };
}

function normalizeLocalPdf(row) {
  const objectUrl = URL.createObjectURL(row.blob);
  localObjectUrls.add(objectUrl);
  return {
    id: String(row.id),
    fileName: row.fileName,
    fileSize: row.fileSize,
    storagePath: row.storagePath || `local:${row.id}`,
    createdAt: row.createdAt ? new Date(row.createdAt) : new Date(),
    openURL: objectUrl,
    downloadURL: objectUrl,
  };
}

export function usePDFs() {
  const useSupabase = ENABLE_SUPABASE && hasSupabaseConfig;
  const [pdfs, setPdfs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploadProgress, setUploadProgress] = useState(null);

  const fetchLocal = useCallback(async () => {
    const res = await fetch(resolveApiUrl('/api/pdfs'));
    if (!res.ok) throw new Error('Failed to fetch files from backend.');
    const items = await res.json();
    return items.map(normalizeApiPdf);
  }, []);

  const fetchSupabase = useCallback(async () => {
    if (!supabase) throw new Error('Supabase is not configured.');
    const { data, error } = await supabase
      .from('pdfs')
      .select('id,file_name,file_size,storage_path,download_url,created_at')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []).map(normalizeSupabasePdf);
  }, []);

  const fetchLocalPdfs = useCallback(async () => {
    const rows = await readLocalPdfs();
    clearLocalObjectUrls();
    return rows.map(normalizeLocalPdf);
  }, []);

  useEffect(() => {
    setLoading(true);

    const run = async () => {
      try {
        let items = [];
        if (useSupabase) {
          try {
            items = await fetchSupabase();
          } catch (error) {
            console.warn('Supabase fetch failed, falling back to local browser storage.', error);
            items = await fetchLocalPdfs();
          }
        } else {
          items = await fetchLocalPdfs();
        }
        setPdfs(items);
      } catch (err) {
        console.error(err);
        setPdfs([]);
      } finally {
        setLoading(false);
      }
    };

    run();
    return () => {
      clearLocalObjectUrls();
    };
  }, [useSupabase, fetchLocalPdfs, fetchSupabase]);

  const uploadPDF = useCallback(
    (file) => {
      return new Promise((resolve, reject) => {
        if (file.type !== 'application/pdf') {
          reject(new Error('Only PDF files are allowed.'));
          return;
        }

        if (file.size > MAX_SIZE_BYTES) {
          reject(new Error('File size exceeds the 20MB limit.'));
          return;
        }

        setUploadProgress(0);

        if (useSupabase) {
          (async () => {
            try {
              if (!supabase) throw new Error('Supabase is not configured.');

              const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
              const storagePath = `${Date.now()}_${safeName}`;

              const { error: uploadError } = await supabase.storage
                .from(STORAGE_BUCKET)
                .upload(storagePath, file, {
                  contentType: 'application/pdf',
                  upsert: false,
                });

              if (uploadError) throw uploadError;

              const { data: publicData } = supabase.storage
                .from(STORAGE_BUCKET)
                .getPublicUrl(storagePath);

              const downloadURL = publicData.publicUrl;

              const { data: inserted, error: insertError } = await supabase
                .from('pdfs')
                .insert({
                  file_name: file.name,
                  file_size: file.size,
                  storage_path: storagePath,
                  download_url: downloadURL,
                })
                .select('id,file_name,file_size,storage_path,download_url,created_at')
                .single();

              if (insertError) throw insertError;

              const normalized = normalizeSupabasePdf(inserted);
              setPdfs((prev) => [normalized, ...prev]);
              setUploadProgress(null);
              resolve(normalized.downloadURL);
            } catch (err) {
              setUploadProgress(null);
              reject(err);
            }
          })();
          return;
        }

        (async () => {
          try {
            const record = {
              id: makeId(),
              fileName: file.name,
              fileSize: file.size,
              createdAt: new Date().toISOString(),
              blob: file,
            };
            await saveLocalPdf(record);
            const normalized = normalizeLocalPdf(record);
            setPdfs((prev) => [normalized, ...prev]);
            setUploadProgress(null);
            resolve(normalized.downloadURL);
          } catch (error) {
            setUploadProgress(null);
            reject(error);
          }
        })();
      });
    },
    [useSupabase]
  );

  const deletePDF = useCallback(
    async (pdf) => {
      if (useSupabase) {
        if (!supabase) throw new Error('Supabase is not configured.');

        const { error: storageError } = await supabase.storage
          .from(STORAGE_BUCKET)
          .remove([pdf.storagePath]);
        if (storageError) throw storageError;

        const { error: rowError } = await supabase
          .from('pdfs')
          .delete()
          .eq('id', Number(pdf.id));
        if (rowError) throw rowError;

        setPdfs((prev) => prev.filter((item) => item.id !== pdf.id));
        return;
      }

      await deleteLocalPdf(pdf.id);
      if (pdf.openURL?.startsWith('blob:')) URL.revokeObjectURL(pdf.openURL);
      setPdfs((prev) => prev.filter((item) => item.id !== pdf.id));
    },
    [useSupabase]
  );

  return {
    pdfs,
    loading,
    uploadProgress,
    uploadPDF,
    deletePDF,
  };
}
