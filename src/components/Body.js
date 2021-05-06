import Blocks from './Blocks'
import GlobalStats from './GlobalStats'
import StakeForm from './StakeForm'
import Claim from './Claim'
import Unlock from './Unlock'

const Body = () => {
  return (
    <div>
      <Blocks />
      <GlobalStats />
      <div className="border-2 border-gray-500 mb-6 py-8 px-4 gap-12 flex flex-col items-center justify-center">
        <div className="flex flex-col md:flex-row sm:items-end gap-8 whitespace-nowrap">
          <StakeForm />
          <Unlock />
        </div>
        <div className="w-full sm:w-1/2 mb-8 sm:mb-12 flex justify-center items-center md:block">
          <Claim />
        </div>
      </div>
    </div>
  )
}

export default Body
