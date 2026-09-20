export const DOMAIN_ERROR_KINDS = [
  'invalidArgument',
  'notFound',
  'conflict',
] as const;

export type DomainErrorKind = (typeof DOMAIN_ERROR_KINDS)[number];

export interface DomainErrorLike extends Error {
  readonly domainErrorKind: DomainErrorKind;
}

export const isDomainError = (error: unknown): error is DomainErrorLike =>
  error instanceof Error &&
  DOMAIN_ERROR_KINDS.includes(
    (error as Partial<DomainErrorLike>).domainErrorKind as DomainErrorKind,
  );
