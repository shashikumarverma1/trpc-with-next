
import { inferProcedureInput } from '@trpc/server';
import Link from 'next/link';
import { Fragment, useEffect, useState } from 'react';
import type { AppRouter } from '~/server/routers/_app';
import { NextPageWithLayout } from '../_app';
import { trpc } from '~/utils/trpc';


const IndexPage: NextPageWithLayout = () => {
  const [name , setname]=useState('')
  const [lastName , setlasttName]=useState('') 
  const utils = trpc.useContext();
  console.log(name , lastName)
      const addUser = trpc.user.add.useMutation({
        async onSuccess() {
          // refetches posts after a post is added
          await utils.user.list.invalidate();
        },
      });
    const users = trpc.user.list.useInfiniteQuery(
        {
          // limit: 5,
        },
        {
          getPreviousPageParam(lastPage) {
            return lastPage.nextCursor;
          },
        },
      );
    console.log('users' , users.data?.pages[0]?.items)

return <>
 <div>
  <Link className="text-gray-400" 
  style={{width:"100%" , color:'#FFFFF' , padding:20 , textDecoration:"underline"}}
  href={`/`}>
                  home {users.data?.pages[0]?.items.length}
                </Link>
                <div style={{display:'flex' , justifyContent:'space-between'}}>
                   <div>
                    {
                        users.data?.pages[0]?.items.map((e,i)=>{
                            return <div>
                                <h4>{i+1}. {e.title} {e.text}</h4>
                            </div>
                        })
                    }
                   </div>
                   <div>
                    <form onSubmit={async(e)=>{
                        e.preventDefault()
                        type Input = inferProcedureInput<AppRouter['user']['add']>;
                        const input: Input = {
                          title: name as string,
                          text: lastName as string,
                        };
                        try {
                          await addUser.mutateAsync(input);
                
                          
                        } catch (cause) {
                          console.error({ cause }, 'Failed to add post');
                        }
                          
                    }}>
                        <input type='text' placeholder='name' onChange={(e)=>setname(e.target.value)} style={{margin:3 , padding:10 , color:'grey'}} /><br/>
                        <input type='text' placeholder='lastName' onChange={(e)=>setlasttName(e.target.value)} style={{margin:3 , padding:10 , color:'grey'}}/><br/>
                        <button type='submit' style={{margin:3 , padding:10 , backgroundColor:'aqua'}}>submit</button><br/>
                    </form>
                   </div>
                </div>
 </div>
</>
};

export default IndexPage;

