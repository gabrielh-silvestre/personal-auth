export interface IMail {
  get id(): string;
  get from(): string;
  get to(): string;
  get cc(): string[];
  get subject(): string;
  get text(): string;
  get html(): string;
}
