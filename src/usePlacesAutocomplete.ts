/* eslint-disable react-hooks/exhaustive-deps */

import { useState, useCallback } from "react";

import _debounce from "./debounce";

export interface BaseHookArgs {
  debounce?: number;
  defaultValue?: string;
}
interface HookArgs extends BaseHookArgs {
  fetchPredictions: (value: string) => any;
  ready: boolean;
}

export interface ProviderProps<RequestOptions> extends BaseHookArgs {
  requestOptions?: RequestOptions;
}

interface Suggestions<Suggestion> {
  readonly loading: boolean;
  readonly status: string;
  readonly data: Suggestion[];
}
interface SetValue {
  (val: string, shouldFetchData?: boolean): void;
}
export interface HookReturn<Suggestion> {
  ready: boolean;
  value: string;
  suggestions: Suggestions<Suggestion>;
  setValue: SetValue;
  clearSuggestions: () => void;
}

const usePlacesAutocomplete = <Suggestion>({
  fetchPredictions,
  debounce = 200,
  defaultValue = "",
  ready,
}: HookArgs): HookReturn<Suggestion> => {
  const [value, setVal] = useState<string>(defaultValue);
  const [suggestions, setSuggestions] = useState<Suggestions<Suggestion>>({
    loading: false,
    status: "",
    data: [],
  });

  const clearSuggestions = useCallback(() => {
    setSuggestions({ loading: false, status: "", data: [] });
  }, []);

  const getPredictions = useCallback(
    _debounce(async (val: string) => {
      if (!val) {
        clearSuggestions();
        return;
      }

      // To keep the previous suggestions
      setSuggestions((prevState) => ({ ...prevState, loading: true }));

      const { data, status } = await fetchPredictions(val);
      setSuggestions({ loading: false, status, data: data || [] });
    }, debounce),
    [debounce, clearSuggestions, fetchPredictions]
  );

  const setValue: SetValue = useCallback(
    (val, shouldFetchData = true) => {
      setVal(val);
      if (shouldFetchData) getPredictions(val);
    },
    [getPredictions]
  );

  return { ready, value, suggestions, setValue, clearSuggestions };
};

export default usePlacesAutocomplete;
