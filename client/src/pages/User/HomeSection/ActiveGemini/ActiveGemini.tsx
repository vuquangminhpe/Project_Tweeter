/* eslint-disable @typescript-eslint/no-unused-vars */
import tweetsApi from '@/apis/tweets.api'
import { useMutation } from '@tanstack/react-query'
import { useState } from 'react'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
interface ActiveGeminiProps {
  setContentWithGenerateAi: React.Dispatch<React.SetStateAction<string>>
}
export default function ActiveGemini({ setContentWithGenerateAi }: ActiveGeminiProps) {
  const [content, setContent] = useState('')
  const generateTweetMutation = useMutation({
    mutationFn: () => tweetsApi.generateTweetWithAi(content)
  })
  const handleGenerate = async () => {
    await generateTweetMutation.mutateAsync(undefined, {
      onSuccess: (data) => {
        console.log(data)

        // setContentWithGenerateAi(data)
      },
      onError: (error: Error) => {
        console.log(error)
      }
    })

    return (
      <div className='p-4 cursor-pointer font-extrabold text-xl capitalize bg-gray-200 max-w-60 text-center rounded-xl shadow-sm mb-4'>
        <Accordion type='single' collapsible>
          <AccordionItem value='item-1'>
            <AccordionTrigger>Use Generate?</AccordionTrigger>
            <AccordionContent>
              <input type='text' value={content} onChange={(e) => setContent(e.target.value)} />
              <div
                onClick={handleGenerate}
                className='p-4 cursor-pointer text-center bg-gray-400 text-black dark:text-white max-w-52'
              >
                Generate Content
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    )
  }
}
