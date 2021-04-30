import Tippy from '@tippyjs/react'
import question from '../../assets/images/question.svg'

const Tooltip = ({ children }) => {
  return (
  <Tippy content={children} className="border-2 border-white rounded text-center text-xs font-normal p-2 bg-gray-900">
    <img src={question} alt="tooltip" />
  </Tippy>
  )
}

export default Tooltip
