import { useState } from 'react'
import { motion } from 'framer-motion'
import AIChatPanel from '../AIChatPanel'

const AIButton = () => {
  const [showAIChat, setShowAIChat] = useState(false)

  const toggleAIChat = () => setShowAIChat(!showAIChat)

  return (
    <>
      <motion.div
        className='cursor-pointer'
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={toggleAIChat}
      >
        <svg className='size-12' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'>
          <defs>
            <linearGradient id='gradientAI' x1='0%' y1='0%' x2='100%' y2='100%' gradientTransform='rotate(15)'>
              <stop offset='0%' stopColor='#8A2BE2'>
                <animate
                  attributeName='stop-color'
                  values='#8A2BE2; #00AAFF; #7B68EE; #FF3E9D; #8A2BE2'
                  dur='15s'
                  repeatCount='indefinite'
                />
              </stop>
              <stop offset='100%' stopColor='#FF3E9D'>
                <animate
                  attributeName='stop-color'
                  values='#FF3E9D; #8A2BE2; #00AAFF; #7B68EE; #FF3E9D'
                  dur='15s'
                  repeatCount='indefinite'
                />
              </stop>
              <animate
                attributeName='gradientTransform'
                values='rotate(15); rotate(375)'
                dur='20s'
                repeatCount='indefinite'
              />
            </linearGradient>

            <filter id='neonGlow' x='-30%' y='-30%' width='160%' height='160%'>
              <feGaussianBlur stdDeviation='6' result='blur' />
              <feComposite in='SourceGraphic' in2='blur' operator='over' />
            </filter>
          </defs>

          <circle cx='100' cy='100' r='60' fill='url(#gradientAI)' opacity='0.15'>
            <animate attributeName='r' values='60; 65; 60' dur='3s' repeatCount='indefinite' />
          </circle>

          <g filter='url(#neonGlow)'>
            <circle cx='100' cy='40' r='8' fill='url(#gradientAI)'>
              <animateTransform
                attributeName='transform'
                type='rotate'
                from='0 100 100'
                to='360 100 100'
                dur='8s'
                repeatCount='indefinite'
              />
            </circle>

            <circle cx='150' cy='100' r='6' fill='url(#gradientAI)'>
              <animateTransform
                attributeName='transform'
                type='rotate'
                from='90 100 100'
                to='450 100 100'
                dur='6s'
                repeatCount='indefinite'
              />
            </circle>

            <circle cx='100' cy='150' r='7' fill='url(#gradientAI)'>
              <animateTransform
                attributeName='transform'
                type='rotate'
                from='180 100 100'
                to='540 100 100'
                dur='10s'
                repeatCount='indefinite'
              />
            </circle>
          </g>

          <g
            fill='none'
            stroke='url(#gradientAI)'
            strokeWidth='2.5'
            strokeLinecap='round'
            strokeLinejoin='round'
            filter='url(#neonGlow)'
          >
            <path d='M 100,70 L 90,95 L 105,100 L 95,130' strokeWidth='3'>
              <animate
                attributeName='d'
                values='M 100,70 L 90,95 L 105,100 L 95,130;
                M 100,68 L 88,93 L 107,98 L 93,132;
                M 100,70 L 90,95 L 105,100 L 95,130'
                dur='3s'
                repeatCount='indefinite'
              />
              <animate attributeName='opacity' values='0.9;1;0.9' dur='1.5s' repeatCount='indefinite' />
            </path>

            <path d='M 80,75 L 85,95 L 75,105 L 85,120' strokeWidth='2'>
              <animate
                attributeName='d'
                values='M 80,75 L 85,95 L 75,105 L 85,120;
                M 78,73 L 83,97 L 72,107 L 83,123;
                M 80,75 L 85,95 L 75,105 L 85,120'
                dur='2.7s'
                repeatCount='indefinite'
              />
              <animate attributeName='opacity' values='0.7;1;0.7' dur='2s' repeatCount='indefinite' />
            </path>

            <path d='M 120,75 L 115,95 L 125,105 L 115,120' strokeWidth='2'>
              <animate
                attributeName='d'
                values='M 120,75 L 115,95 L 125,105 L 115,120;
                M 122,73 L 117,97 L 128,107 L 117,123;
                M 120,75 L 115,95 L 125,105 L 115,120'
                dur='2.5s'
                repeatCount='indefinite'
              />
              <animate attributeName='opacity' values='0.7;1;0.7' dur='1.8s' repeatCount='indefinite' />
            </path>

            <circle cx='100' cy='70' r='3' fill='url(#gradientAI)' stroke='none'>
              <animate attributeName='r' values='2; 4; 2' dur='1s' repeatCount='indefinite' />
            </circle>

            <circle cx='90' cy='95' r='3' fill='url(#gradientAI)' stroke='none'>
              <animate attributeName='r' values='2; 3; 2' dur='0.7s' repeatCount='indefinite' />
            </circle>

            <circle cx='105' cy='100' r='3' fill='url(#gradientAI)' stroke='none'>
              <animate attributeName='r' values='2; 4; 2' dur='0.8s' repeatCount='indefinite' />
            </circle>

            <circle cx='95' cy='130' r='3' fill='url(#gradientAI)' stroke='none'>
              <animate attributeName='r' values='2; 3; 2' dur='0.9s' repeatCount='indefinite' />
            </circle>

            <path d='M 97,85 L 92,83' strokeWidth='1.5'>
              <animate attributeName='opacity' values='0;1;0' dur='0.8s' repeatCount='indefinite' />
            </path>

            <path d='M 102,110 L 108,112' strokeWidth='1.5'>
              <animate attributeName='opacity' values='0;1;0' dur='0.7s' repeatCount='indefinite' />
            </path>

            <path d='M 80,105 L 73,103' strokeWidth='1.5'>
              <animate attributeName='opacity' values='0;1;0' dur='0.9s' repeatCount='indefinite' />
            </path>

            <path d='M 120,105 L 127,103' strokeWidth='1.5'>
              <animate attributeName='opacity' values='0;1;0' dur='0.75s' repeatCount='indefinite' />
            </path>
          </g>

          <circle cx='100' cy='100' r='40' fill='none' stroke='url(#gradientAI)' strokeWidth='1' opacity='0'>
            <animate attributeName='r' values='40; 80' dur='3s' repeatCount='indefinite' />
            <animate attributeName='opacity' values='0.8; 0' dur='3s' repeatCount='indefinite' />
          </circle>

          <circle cx='100' cy='100' r='2' fill='white'>
            <animate attributeName='cx' values='85; 80; 85; 100' dur='4s' repeatCount='indefinite' />
            <animate attributeName='cy' values='85; 100; 115; 100' dur='4s' repeatCount='indefinite' />
            <animate attributeName='opacity' values='0; 1; 1; 0' dur='4s' repeatCount='indefinite' />
          </circle>

          <circle cx='100' cy='100' r='2' fill='white'>
            <animate attributeName='cx' values='115; 120; 115; 100' dur='4s' begin='1s' repeatCount='indefinite' />
            <animate attributeName='cy' values='85; 100; 115; 100' dur='4s' begin='1s' repeatCount='indefinite' />
            <animate attributeName='opacity' values='0; 1; 1; 0' dur='4s' begin='1s' repeatCount='indefinite' />
          </circle>
        </svg>
      </motion.div>

      <AIChatPanel isOpen={showAIChat} onClose={() => setShowAIChat(false)} />
    </>
  )
}

export default AIButton
