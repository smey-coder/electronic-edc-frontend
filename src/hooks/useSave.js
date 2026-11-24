import { useState } from 'react';
import { getErrorMessage } from '../api/studentApi';

// ហៅ request រួចបង្ហាញ saving / ok / error
export default function useSave(request) {
  const [state, setState] = useState({ saving: false, error: '', ok: false });

  const save = async (...args) => {
    setState({ saving: true, error: '', ok: false });
    try {
      const result = await request(...args);
      setState({ saving: false, error: '', ok: true });
      return result;
    } catch (e) {
      setState({ saving: false, error: getErrorMessage(e, 'Failed to save.'), ok: false });
      return undefined;
    }
  };

  return [state, save];
}