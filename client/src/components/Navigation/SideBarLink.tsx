import { Link } from 'react-router-dom'

export const SideBarLink = ({ Icon, text, path }) => {
  return (
    <Link to={path} className='text-[#d9d9d9] flex items-center justify-center xl:justify-start text-xl space-x-3 hoverAnimation'>
      <div>{Icon}</div>
      <span className="hidden xl:inline">{text}</span>
    </Link>
  )
}
