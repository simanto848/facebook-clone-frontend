import { setLocale, type AnyObjectSchema, type ValidationError } from "yup";

function attributeLabel(field: string): string {
  return field
    .replaceAll(".", " ")
    .replaceAll("_", " ")
    .replace(/([a-z\d])([A-Z])/g, "$1 $2")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

/** One-time Laravel-style messages — forms never pass custom strings. */
setLocale({
  mixed: {
    required: ({ path }) => `The ${attributeLabel(path)} field is required.`,
    notType: ({ path }) => `The ${attributeLabel(path)} field is invalid.`,
  },
  string: {
    email: ({ path }) => `The ${attributeLabel(path)} field must be a valid email address.`,
    min: ({ path, min }) =>
      min === 1
        ? `The ${attributeLabel(path)} field is required.`
        : `The ${attributeLabel(path)} field must be at least ${min} characters.`,
    max: ({ path, max }) =>
      `The ${attributeLabel(path)} field must not be greater than ${max} characters.`,
    url: ({ path }) => `The ${attributeLabel(path)} field must be a valid URL.`,
  },
  number: {
    min: ({ path, min }) => `The ${attributeLabel(path)} field must be at least ${min}.`,
    max: ({ path, max }) =>
      `The ${attributeLabel(path)} field must not be greater than ${max}.`,
  },
  array: {
    min: ({ path, min }) =>
      `The ${attributeLabel(path)} field must have at least ${min} items.`,
  },
});

/** Flatten Yup errors to first message per field (Laravel bag style). */
export function yupToFieldErrors(
  schema: AnyObjectSchema,
  data: unknown
): Record<string, string> | null {
  try {
    schema.validateSync(data, { abortEarly: false });
    return null;
  } catch (error) {
    const validationError = error as ValidationError;
    if (!validationError.inner?.length && validationError.path && validationError.message) {
      return { [validationError.path]: validationError.message };
    }

    const errors: Record<string, string> = {};
    for (const issue of validationError.inner ?? []) {
      if (!issue.path || errors[issue.path]) continue;
      errors[issue.path] = issue.message;
    }
    return Object.keys(errors).length > 0 ? errors : null;
  }
}

/** Parse Laravel 422 `errors` object into a flat first-message bag. */
export function laravelErrorsFromBody(body: unknown): Record<string, string> {
  if (!body || typeof body !== "object") return {};

  const raw = (body as { errors?: unknown }).errors;
  if (!raw || typeof raw !== "object") return {};

  const bag: Record<string, string> = {};

  for (const [key, value] of Object.entries(raw as Record<string, unknown>)) {
    if (typeof value === "string" && value.trim()) {
      bag[key] = value;
      continue;
    }
    if (Array.isArray(value) && typeof value[0] === "string") {
      bag[key] = value[0];
    }
  }

  return bag;
}
