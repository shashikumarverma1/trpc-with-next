import { trpc } from '../utils/trpc';
import { NextPageWithLayout } from './_app';
import { inferProcedureInput } from '@trpc/server';
import Link from 'next/link';
import { Fragment, useEffect } from 'react';
import type { AppRouter } from '~/server/routers/_app';

const IndexPage: NextPageWithLayout = () => {
  const utils = trpc.useContext();
  const postsQuery = trpc.post.list.useInfiniteQuery(
    {
      limit: 5,
    },
    {
      getPreviousPageParam(lastPage) {
        return lastPage.nextCursor;
      },
    },
  );
  const addPost = trpc.post.add.useMutation({
    async onSuccess() {
      // refetches posts after a post is added
      await utils.post.list.invalidate();
    },
  });

  // prefetch all posts for instant navigation
  useEffect(() => {
    const allPosts = postsQuery.data?.pages.flatMap((page) => page.items) ?? [];
    for (const { id } of allPosts) {
      void utils.post.byId.prefetch({ id });
    }
  }, [postsQuery.data, utils]);

  return (
<div>
<Link className="text-gray-400" 
  style={{width:"100%" , color:'#FFFFF' , padding:20 , textDecoration:"underline"}}
  href={`/user`}>
                  users
                </Link>
                <div className="flex justify-between ">
  
 
  <div className="" style={{width:"50%"}}>
    <div className="flex flex-col"></div>
    <h2 className="text-3xl font-semibold">
      Latest Posts
      {postsQuery.status === 'loading' && '(loading)'}
    </h2>

    <button
      className="bg-gray-900 p-2 rounded-md font-semibold disabled:bg-gray-700 disabled:text-gray-400"
      onClick={() => postsQuery.fetchPreviousPage()}
      disabled={
        !postsQuery.hasPreviousPage || postsQuery.isFetchingPreviousPage
      }
    >
      {postsQuery.isFetchingPreviousPage
        ? 'Loading more...'
        : postsQuery.hasPreviousPage
        ? 'Load More'
        : 'Nothing more to load'}
    </button>

    {postsQuery.data?.pages.map((page, index) => (
      <Fragment key={page.items[0]?.id || index}>
        {page.items.map((item) => (
          <article key={item.id}>
            <h3 className="text-2xl font-semibold">{item.title}</h3>
            <Link className="text-gray-400" href={`/post/${item.id}`}>
              View more
            </Link>
          </article>
        ))}
      </Fragment>
    ))}
  </div>

  <hr />

  <div className="" style={{width:"50%"}}>
    <h2 className="text-3xl font-semibold pb-2">Add a Post</h2>

    <form
      className="py-2 w-4/6"
      onSubmit={async (e) => {
        /**
         * In a real app you probably don't want to use this manually
         * Checkout React Hook Form - it works great with tRPC
         * @see https://react-hook-form.com/
         * @see https://kitchen-sink.trpc.io/react-hook-form
         */
        e.preventDefault();
        const $form = e.currentTarget;
        const values = Object.fromEntries(new FormData($form));
        type Input = inferProcedureInput<AppRouter['post']['add']>;
        //    ^?
        const input: Input = {
          title: values.title as string,
          text: values.text as string,
        };
        try {
          await addPost.mutateAsync(input);

          $form.reset();
        } catch (cause) {
          console.error({ cause }, 'Failed to add post');
        }
      }}
    >
      <div className="flex flex-col gap-y-4 font-semibold">
        <input
          className="focus-visible:outline-dashed outline-offset-4 outline-2 outline-gray-700 rounded-xl px-4 py-3 bg-gray-900"
          id="title"
          name="title"
          type="text"
          placeholder="Title"
          disabled={addPost.isLoading}
        />
        <textarea
          className="resize-none focus-visible:outline-dashed outline-offset-4 outline-2 outline-gray-700 rounded-xl px-4 py-3 bg-gray-900"
          id="text"
          name="text"
          placeholder="Text"
          disabled={addPost.isLoading}
          rows={6}
        />

        <div className="flex justify-center">
          <input
            className="cursor-pointer bg-gray-900 p-2 rounded-md px-16"
            type="submit"
            disabled={addPost.isLoading}
          />
          {addPost.error && (
            <p style={{ color: 'red' }}>{addPost.error.message}</p>
          )}
        </div>
      </div>
    </form>
  </div>
</div>
</div>

 
  );
};

export default IndexPage;

