import * as Prismic from '@prismicio/client';
import { PrismicDocument } from '@prismicio/types';

export function getPrismicClient(): Prismic.Client<
  PrismicDocument<Record<string, any>, string, string>
> {
  const prismic = Prismic.createClient(process.env.PRISMIC_ENDPOINT as string, {
    accessToken: process.env.PRISMIC_ACCESS_TOKEN,
  });
  return prismic;
}
