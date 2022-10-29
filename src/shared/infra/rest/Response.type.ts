export type ResponseLinkSection = {
  self: {
    href: string;
  };
};

export interface RestResponseCreateUser<T> {
  _links: ResponseLinkSection;
  _embedded?: {
    _links: ResponseLinkSection[];
  };
  data: T;
}
