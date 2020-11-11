/* eslint-disable react-hooks/exhaustive-deps */

import { useState, useRef, useCallback, useEffect } from "react";
import useLatest from "../useLatest";
import usePlacesAutocomplete, {
  ProviderProps,
  HookReturn,
} from "../usePlacesAutocomplete";

export const loadApiErr =
  "💡 use-places-autocomplete: Google Maps Places API library must be loaded. See: https://github.com/wellyshen/use-places-autocomplete#load-the-library";

type Suggestion = google.maps.places.AutocompletePrediction;
type RequestOptions = Omit<google.maps.places.AutocompletionRequest, "input">;
export interface AutocompleteOptions extends ProviderProps<RequestOptions> {
  googleMaps?: any;
  callbackName?: string;
}

export type AutocompleteReturn = HookReturn<Suggestion>;

const useGoogleAutocomplete = ({
  requestOptions,
  googleMaps,
  callbackName,
  ...hookOptions
}: AutocompleteOptions = {}): AutocompleteReturn => {
  const [ready, setReady] = useState<boolean>(false);
  const googleMapsRef = useLatest(googleMaps);

  const asRef = useRef(null);
  const requestOptionsRef = useLatest(requestOptions);

  const init = useCallback(() => {
    const { google } = window;
    const { current: gMaps } = googleMapsRef;
    const placesLib = gMaps?.places || google?.maps?.places;

    if (!placesLib) {
      console.error(loadApiErr);
      return;
    }

    asRef.current = new placesLib.AutocompleteService();
    setReady(true);
  }, []);

  const fetchPredictions = useCallback(
    (val: string) =>
      // eslint-disable-next-line compat/compat
      new Promise((resolve) => {
        // @ts-expect-error
        asRef.current.getPlacePredictions(
          { ...requestOptionsRef.current, input: val },
          (data: Suggestion[] | null = [], status: string) => {
            resolve({ data, status });
          }
        );
      }),
    []
  );

  useEffect(() => {
    const { google } = window;

    if (!googleMapsRef.current && !google?.maps && callbackName) {
      (window as any)[callbackName] = init;
    } else {
      init();
    }

    return () => {
      // @ts-expect-error
      if ((window as any)[callbackName]) delete (window as any)[callbackName];
    };
  }, [callbackName, init]);

  return usePlacesAutocomplete({ ...hookOptions, fetchPredictions, ready });
};

export default useGoogleAutocomplete;
