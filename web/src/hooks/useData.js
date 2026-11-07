import { useEffect, useState } from 'react';
import { readData } from '../services/data.js';

export default function useData(file) {
  const [state, setState] = useState({ file, data: null, loading: true, error: null });
  useEffect(() => {
    const controller = new AbortController();
    setState({ file, data: null, loading: true, error: null });
    readData(file, controller.signal).then(
      (data) => {
        if (!controller.signal.aborted) setState({ file, data, loading: false, error: null });
      },
      (error) => {
        if (!controller.signal.aborted) setState({ file, data: null, loading: false, error });
      },
    );
    return () => controller.abort();
  }, [file]);
  return state.file === file ? state : { data: null, loading: true, error: null };
}
