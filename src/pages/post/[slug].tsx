/* eslint-disable prettier/prettier */
/* eslint-disable react/no-danger */
import {useRouter} from 'next/router';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { GetStaticPaths, GetStaticProps } from 'next';
import { RichText } from 'prismic-dom';
import { FiCalendar, FiUser, FiClock } from 'react-icons/fi';
import Header from '../../components/Header';
import { getPrismicClient } from '../../services/prismic';
import styles from './post.module.scss';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

interface ContentProps {
    heading: string;
    body: {
      text: string;
    }[];
}

export default function Post({post}:PostProps): JSX.Element {
  const router = useRouter()

  if(router.isFallback) {
    return <div>Carregando...</div>
  }

  const calculatingReadingTime = ( content : ContentProps[] ) : string => {

      const headingTime = content.reduce((acc, currentValue) => {
        return currentValue.heading.split(/\s+/).length + acc;
      }, 0)

      const bodyTime = content.reduce((acc, currentValue) => {
        return  RichText.asText(currentValue.body).split(/\s+/).length + acc;
      },0 )

      const wordsPerMinutes = Math.ceil(
        headingTime + bodyTime / 200
      )

      if(wordsPerMinutes < 1){
        return 'Leitura rápida'
      }

      if(wordsPerMinutes < 60) {
        return `${wordsPerMinutes} min`
      }

      return `${wordsPerMinutes} min`

   }

  return (
    <>
      <Header />

      <main className={styles.container}>
        <img src={post.data.banner.url} alt="banner"  />
        <article>
            <h1>{post.data.title}</h1>
            <div>
                    <span>
                      <FiCalendar />
                    {post.first_publication_date}
                    </span>
                    <span>
                      <FiUser />
                    {post.data.author}
                    </span>
                    <span>
                      <FiClock />
                      {calculatingReadingTime(post.data.content)}
                    </span>
            </div>


              {post.data.content.map((cont) => (
                <>
                <h3>{cont.heading}</h3>
                <div className={styles.postContent} dangerouslySetInnerHTML={{__html: RichText.asHtml(cont.body)}}/>
                </>
              ))}
        </article>
      </main>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const posts =  prismic.getByType('blogpost',{fetch:['blogpost.slug']})
  const response = await posts
  const params = response.results.map((post) => ({
    params :{
      slug: post.uid
    }
  }))

  return {
      paths: params,
      fallback: 'blocking'
  }
}

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const slug= params?.slug

  const prismic = getPrismicClient();
  const getItens =  prismic.getByUID('blogpost',String(slug), {});
  const response = await getItens;


  const post: Post = {
    first_publication_date: format(new Date(response.first_publication_date),'dd, MMM yyyy', {
      locale: ptBR
    }),
    data:{
      title: response.data.title,
      banner:{
        url: response.data.banner.url ?? '',
      },
      author: response.data.author,
      content: response.data.content.map((item) => ({
        heading: item.heading,
        body: item.body,
      }))
    }
  }


  return {
    props:{
      post,
    },
    revalidate: 60 * 30

}

};
