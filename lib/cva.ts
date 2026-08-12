/**
 * Class Variance Authority (CVA) implementation for typed component variants
 */
export type VariantConfig<T> = {
  variants?: T;
  compoundVariants?: Array<
    {
      [K in keyof T]?: keyof T[K] | boolean | string | number | Array<keyof T[K] | boolean | string | number>;
    } & { class?: string; className?: string }
  >;
  defaultVariants?: {
    [K in keyof T]?: keyof T[K] | boolean | string | number;
  };
};

export type VariantProps<T extends (...args: any) => any> = Parameters<T>[0];

export function cva<
  T extends Record<string, Record<string, string>>
>(base?: string, config?: VariantConfig<T>) {
  return function (
    props?: {
      [K in keyof T]?: keyof T[K] | boolean | number | string | undefined;
    } & { className?: string }
  ): string {
    const { className, ...variantProps } = props || {};
    const result: string[] = base ? [base] : [];

    const variants = config?.variants || ({} as T);
    const defaults = config?.defaultVariants || {};

    for (const variantName in variants) {
      const propVal =
        (variantProps as any)?.[variantName] ?? (defaults as any)?.[variantName];
      if (propVal !== undefined && propVal !== null) {
        const strVal = String(propVal);
        const variantMap = variants[variantName as keyof T];
        if (variantMap && (variantMap as any)[strVal]) {
          result.push((variantMap as any)[strVal]);
        }
      }
    }

    if (config?.compoundVariants) {
      for (const cv of config.compoundVariants) {
        const { class: cvClass, className: cvClassName, ...cvConditions } = cv as any;
        let matches = true;
        for (const key in cvConditions) {
          const conditionVal = cvConditions[key];
          const actualVal =
            (variantProps as any)?.[key] ?? (defaults as any)?.[key];
          if (Array.isArray(conditionVal)) {
            if (!conditionVal.includes(actualVal)) matches = false;
          } else if (actualVal !== conditionVal) {
            matches = false;
          }
        }
        if (matches) {
          if (cvClass) result.push(cvClass);
          if (cvClassName) result.push(cvClassName);
        }
      }
    }

    if (className) {
      result.push(className);
    }

    return result.filter(Boolean).join(" ");
  };
}
