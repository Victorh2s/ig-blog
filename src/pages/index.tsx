/* eslint-disable testing-library/no-await-sync-query */
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { GetStaticProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useState } from 'react';
import { FiCalendar, FiUser } from 'react-icons/fi';
import { getPrismicClient } from '../services/prismic';

import styles from './home.module.scss';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({ postsPagination }: HomeProps): JSX.Element {
  const [post, setPost] = useState<PostPagination>(postsPagination);

  const morePosts = async (): Promise<void> => {
    const response = await fetch(postsPagination.next_page);
    const json = await response.json();
    console.log(json);

    const newPost: Post[] = json.results.map((PostMap: Post) => {
      return {
        uid: PostMap.uid,
        first_publication_date: format(
          new Date(PostMap.first_publication_date),
          'dd MMM yyyy',
          {
            locale: ptBR,
          }
        ),
        data: {
          title: PostMap.data.title,
          subtitle: PostMap.data.subtitle,
          author: PostMap.data.author,
        },
      };
    });

    setPost(state => {
      return {
        next_page: json.next_page,
        results: [...state.results, ...newPost],
      };
    });
  };

  // n pode px slugs iguais ou

  return (
    <>
      <Head>
        <title>Posts | Ignite-blog</title>
      </Head>
      <main className={styles.container}>
        <img src="/images/Logo.svg" alt="Logo" />
        <article className={styles.post}>
          {post.results.map((postResults: Post) => (
            <Link href={`/post/${postResults.uid}`} key={postResults.uid}>
              <h1>{postResults.data.title}</h1>
              <p>{postResults.data.subtitle}</p>
              <div>
                <span>
                  <FiCalendar />
                  {postResults.first_publication_date}
                </span>
                <span>
                  <FiUser />
                  {postResults.data.author}
                </span>
              </div>
            </Link>
          ))}
        </article>
        {post.next_page && (
          <button type="button" onClick={morePosts}>
            Carregar mais posts
          </button>
        )}
      </main>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const postsResponse = await getPrismicClient().getByType('blogpost', {
    pageSize: 2,
  });

  const results = postsResponse.results.map(post => {
    return {
      uid: post.uid,
      first_publication_date: format(
        new Date(post.first_publication_date),
        'dd MMM yyyy',
        {
          locale: ptBR,
        }
      ),
      data: {
        title: post.data.title,
        subtitle: post.data.subtitle,
        author: post.data.author,
      },
    };
  });

  return {
    props: {
      postsPagination: {
        results,
        next_page: postsResponse.next_page,
      },
    },
  };
};
