export class DomainError extends Error {
  readonly domainErrorKind = 'invalidArgument' as const;
}
