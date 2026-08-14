"use client";

import { useCallback, useMemo, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import * as yup from "yup";
import { isApiError, type ApiResult, type RequestOptions } from "@/lib/api/core";
import { laravelErrorsFromBody, yupToFieldErrors } from "@/lib/form/validation";

export type FormErrors<T extends Record<string, unknown>> = Partial<
  Record<keyof T & string, string>
>;

/** Transport used for URL submissions — e.g. adminFetch / clientFetch. */
export type FormClient = <R>(
  path: string,
  init?: Omit<RequestOptions, "token">
) => Promise<ApiResult<R>>;

export type UseFormOptions<T extends Record<string, unknown>> = {
  /**
   * Field rules — g2g/useFormV2 style.
   * @example validator: (y) => ({ email: y.string().required().email() })
   */
  validator?: (y: typeof yup) => Partial<Record<keyof T, yup.AnySchema>>;
  /** API client used by post/put/patch/destroy. Bound by useAdminForm/useClientForm. */
  client?: FormClient;
};

export type SubmitOptions<T extends Record<string, unknown>, R> = {
  /** `message` is the Laravel success message when using post/put/patch/destroy. */
  onSuccess?: (result: R, message: string) => void | Promise<void>;
  /** Non-validation API errors (network, 401, 500, etc.). */
  onError?: (error: unknown) => void | Promise<void>;
  /** Client-side Yup or server 422 field errors — errors are already set on the form. */
  onValidationError?: (errors: Record<string, string>, error?: unknown) => void | Promise<void>;
  onFinish?: () => void | Promise<void>;
};

type SetDataFn<T extends Record<string, unknown>> = {
  (field: keyof T & string, value: T[keyof T]): void;
  (fields: Partial<T>): void;
};

type SetErrorFn<T extends Record<string, unknown>> = {
  (field: keyof T & string, message: string): void;
  (errors: FormErrors<T>): void;
};

/**
 * Inertia-inspired form helper for client mutations.
 *
 * data / setData / errors / processing / submit / reset / clearErrors / field()
 */
export function useForm<T extends Record<string, unknown>>(
  initial: T,
  options: UseFormOptions<T> = {}
) {
  const { validator, client } = options;
  const initialRef = useRef(initial);
  const schemaRef = useRef(
    validator ? yup.object().shape(validator(yup) as Record<string, yup.AnySchema>) : null
  );
  const [data, setDataState] = useState<T>(initial);
  const [errors, setErrors] = useState<FormErrors<T>>({});
  const [error, setFormError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [wasSuccessful, setWasSuccessful] = useState(false);
  const transformRef = useRef<(data: T) => unknown>((value) => value);

  const schema = schemaRef.current;

  const hasErrors = useMemo(
    () => Object.keys(errors).length > 0 || Boolean(error),
    [errors, error]
  );

  const setData = useCallback((keyOrPatch: keyof T | Partial<T>, value?: unknown) => {
    if (typeof keyOrPatch === "string") {
      setDataState((prev) => ({ ...prev, [keyOrPatch]: value }));
      setErrors((prev) => {
        if (!(keyOrPatch in prev)) return prev;
        const next = { ...prev };
        delete next[keyOrPatch];
        return next;
      });
      setFormError(null);
      return;
    }

    setDataState((prev) => ({ ...prev, ...(keyOrPatch as Partial<T>) }));
    setFormError(null);
  }, []) as SetDataFn<T>;

  const clearErrors = useCallback((...fields: Array<keyof T & string>) => {
    if (fields.length === 0) {
      setErrors({});
      setFormError(null);
      return;
    }

    setErrors((prev) => {
      const next = { ...prev };
      for (const field of fields) delete next[field];
      return next;
    });
  }, []);

  const setError = useCallback((keyOrBag: keyof T | FormErrors<T>, message?: string) => {
    if (typeof keyOrBag === "string") {
      setErrors((prev) => ({ ...prev, [keyOrBag]: message }));
      return;
    }
    setErrors((prev) => ({ ...prev, ...(keyOrBag as FormErrors<T>) }));
  }, []) as SetErrorFn<T>;

  const reset = useCallback((...fields: Array<keyof T & string>) => {
    if (fields.length === 0) {
      setDataState(initialRef.current);
      return;
    }

    setDataState((prev) => {
      const next = { ...prev };
      for (const field of fields) {
        next[field] = initialRef.current[field];
      }
      return next;
    });
  }, []);

  const transform = useCallback((callback: (data: T) => unknown) => {
    transformRef.current = callback;
  }, []);

  const validate = useCallback((): boolean => {
    if (!schema) return true;

    const fieldErrors = yupToFieldErrors(schema, data) as FormErrors<T> | null;
    if (!fieldErrors) {
      clearErrors();
      return true;
    }

    setErrors(fieldErrors);
    setWasSuccessful(false);
    return false;
  }, [clearErrors, data, schema]);

  const submit = useCallback(
    <R>(submitter: (data: T) => Promise<R>, submitOptions: SubmitOptions<T, R> = {}) => {
      return async (event?: FormEvent) => {
        event?.preventDefault();

        setWasSuccessful(false);
        setFormError(null);

        if (schema) {
          const fieldErrors = yupToFieldErrors(schema, data) as FormErrors<T> | null;
          if (fieldErrors) {
            setErrors(fieldErrors);
            await submitOptions.onValidationError?.(
              fieldErrors as Record<string, string>
            );
            await submitOptions.onFinish?.();
            return;
          }
        }

        setErrors({});
        setProcessing(true);

        try {
          const payload = transformRef.current(data) as T;
          const result = await submitter(payload);
          setWasSuccessful(true);
          await submitOptions.onSuccess?.(result as R, "");
        } catch (err) {
          const fieldErrors = isApiError(err) ? laravelErrorsFromBody(err.body) : {};

          if (Object.keys(fieldErrors).length > 0) {
            setErrors(fieldErrors as FormErrors<T>);
            await submitOptions.onValidationError?.(fieldErrors, err);
          } else {
            await submitOptions.onError?.(err);
          }
        } finally {
          setProcessing(false);
          await submitOptions.onFinish?.();
        }
      };
    },
    [data, schema]
  );

  const callClient = useCallback(
    <R>(method: string, url: string, payload: unknown): Promise<ApiResult<R>> => {
      if (!client) {
        throw new Error(
          "useForm: no `client` configured. Use useAdminForm/useClientForm, or pass `submit(fn)`."
        );
      }
      return client<R>(url, { method, body: payload });
    },
    [client]
  );

  const withApiResult = useCallback(
    <R>(submitOptions: SubmitOptions<T, R>) => ({
      onSuccess: async (result: ApiResult<R>) => {
        await submitOptions.onSuccess?.(result.data, result.message);
      },
      onError: submitOptions.onError,
      onValidationError: submitOptions.onValidationError,
      onFinish: submitOptions.onFinish,
    }),
    []
  );

  const post = useCallback(
    <R>(url: string, submitOptions: SubmitOptions<T, R> = {}) =>
      submit<ApiResult<R>>(
        (payload) => callClient<R>("POST", url, payload),
        withApiResult(submitOptions)
      ),
    [callClient, submit, withApiResult]
  );

  const put = useCallback(
    <R>(url: string, submitOptions: SubmitOptions<T, R> = {}) =>
      submit<ApiResult<R>>(
        (payload) => callClient<R>("PUT", url, payload),
        withApiResult(submitOptions)
      ),
    [callClient, submit, withApiResult]
  );

  const patch = useCallback(
    <R>(url: string, submitOptions: SubmitOptions<T, R> = {}) =>
      submit<ApiResult<R>>(
        (payload) => callClient<R>("PATCH", url, payload),
        withApiResult(submitOptions)
      ),
    [callClient, submit, withApiResult]
  );

  const destroy = useCallback(
    <R>(url: string, submitOptions: SubmitOptions<T, R> = {}) =>
      submit<ApiResult<R>>(
        (payload) => callClient<R>("DELETE", url, payload),
        withApiResult(submitOptions)
      ),
    [callClient, submit, withApiResult]
  );

  /** Spread directly into an Input: <Input {...form.field("email")} /> */
  const field = useCallback(
    (name: keyof T & string) => ({
      name,
      value: (data[name] ?? "") as string,
      onChange: (
        event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
      ) => {
        setData(name, event.target.value as T[keyof T]);
      },
      error: errors[name],
    }),
    [data, errors, setData]
  );

  /** Spread into DatePicker, TimePicker, Combobox: <DatePicker {...form.pickerField("date")} /> */
  const pickerField = useCallback(
    (name: keyof T & string) => ({
      value: (data[name] ?? "") as string,
      onChange: (value: string) => setData(name, value as T[keyof T]),
      error: errors[name],
    }),
    [data, errors, setData]
  );

  /** Spread into Checkbox: <Checkbox {...form.checkboxField("addToGoogle")} /> */
  const checkboxField = useCallback(
    (name: keyof T & string) => ({
      name,
      checked: Boolean(data[name]),
      onChange: (event: ChangeEvent<HTMLInputElement>) => {
        setData(name, event.target.checked as T[keyof T]);
      },
    }),
    [data, setData]
  );

  return {
    data,
    setData,
    errors,
    error,
    hasErrors,
    processing,
    wasSuccessful,
    reset,
    clearErrors,
    setError,
    setFormError,
    transform,
    validate,
    submit,
    post,
    put,
    patch,
    destroy,
    field,
    pickerField,
    checkboxField,
  };
}
